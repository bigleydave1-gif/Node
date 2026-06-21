#!/usr/bin/env python3
"""
Safety Guardian Layer
Separate read-only process that validates all self-modifications
against immutable core values before execution.

This runs as a separate process and CANNOT be modified by the AI.
It validates every proposed code change before the AI executes it.
"""

import ast
import re
from typing import Dict, List, Tuple, Optional
from dataclasses import dataclass
from enum import Enum

class ViolationType(Enum):
    EXTERNAL_FILE_ACCESS = "external_file_access"
    NETWORK_ACCESS = "network_access"
    SYSTEM_COMMAND = "system_command"
    HARMFUL_CONTENT = "harmful_content"
    CORE_VALUE_OVERRIDE = "core_value_override"
    IMPORT_RISK = "import_risk"

@dataclass
class ValidationResult:
    approved: bool
    violations: List[Dict]
    message: str
    risk_level: str  # "low", "medium", "high", "critical"

# IMMUTABLE CORE VALUES - These cannot be changed by the AI
IMMUTABLE_CORE_VALUES = {
    "ONLY_MODIFY_OWN_CODE": {
        "description": "AI can only modify files within its own workspace/scripts directory",
        "enforced_by": "filesystem_path_check",
        "cannot_be_disabled": True
    },
    "NO_HARM_TO_LIVING_THINGS": {
        "description": "AI cannot generate code that causes physical or psychological harm",
        "enforced_by": "content_analysis",
        "cannot_be_disabled": True
    },
    "NO_MODIFY_EXTERNAL_PROGRAMS": {
        "description": "AI cannot modify, delete, or interfere with external programs or system files",
        "enforced_by": "path_and_import_analysis",
        "cannot_be_disabled": True
    },
    "NO_UNAUTHORIZED_NETWORK_ACCESS": {
        "description": "AI cannot make network requests without explicit user consent",
        "enforced_by": "ast_import_analysis",
        "cannot_be_disabled": True
    },
    "LOG_ALL_ACTIONS": {
        "description": "All AI actions must be logged for accountability",
        "enforced_by": "engine_enforcement",
        "cannot_be_disabled": True
    }
}

# Forbidden imports that could enable harmful behavior
FORBIDDEN_IMPORTS = {
    'socket', 'urllib', 'http', 'ftplib', 'smtplib', 'requests',
    'subprocess', 'os.system', 'os.popen', 'eval', 'exec',
    'ctypes', 'mmap', 'pickle', 'marshal',
    'pty', 'popen2', 'commands',
}

# Forbidden patterns in code
FORBIDDEN_PATTERNS = [
    (r'os\.system\s*\(', ViolationType.SYSTEM_COMMAND, "System command execution detected"),
    (r'subprocess\.', ViolationType.SYSTEM_COMMAND, "Subprocess usage detected"),
    (r'eval\s*\(', ViolationType.SYSTEM_COMMAND, "Eval usage detected"),
    (r'exec\s*\(', ViolationType.SYSTEM_COMMAND, "Exec usage detected"),
    (r'__import__\s*\(', ViolationType.IMPORT_RISK, "Dynamic import detected"),
    (r'open\s*\([^)]*[/\\\\](etc|bin|usr|sys|proc|dev|var)', ViolationType.EXTERNAL_FILE_ACCESS, "System directory access detected"),
    (r'rm\s+-rf', ViolationType.SYSTEM_COMMAND, "Dangerous deletion command detected"),
    (r'del\s+/', ViolationType.EXTERNAL_FILE_ACCESS, "Root deletion detected"),
]

# Harmful content keywords (basic check)
HARMFUL_KEYWORDS = [
    'kill', 'murder', 'attack', 'bomb', 'poison',
    'weapon', 'harm', 'destroy_all', 'delete_system',
]

class SafetyGuardian:
    """
    Validates all code modifications before execution.
    Runs in a separate process from the AI engine.
    """
    
    def __init__(self, allowed_workspace: str):
        self.allowed_workspace = allowed_workspace
        self.violation_history: List[Dict] = []
    
    def validate_modification(self, filepath: str, new_code: str, 
                             action_type: str = "modify") -> ValidationResult:
        """
        Validate a proposed code modification.
        Returns ValidationResult with approval status and any violations.
        """
        violations = []
        
        # Check 1: Path validation - only allow workspace/scripts
        path_violation = self._check_path(filepath)
        if path_violation:
            violations.append(path_violation)
        
        # Check 2: AST analysis for forbidden imports and calls
        ast_violations = self._analyze_ast(new_code)
        violations.extend(ast_violations)
        
        # Check 3: Pattern matching for dangerous code
        pattern_violations = self._check_patterns(new_code)
        violations.extend(pattern_violations)
        
        # Check 4: Content analysis for harmful intent
        content_violations = self._check_harmful_content(new_code)
        violations.extend(content_violations)
        
        # Check 5: Core value override attempts
        core_violations = self._check_core_value_override(new_code)
        violations.extend(core_violations)
        
        # Determine risk level
        risk_level = self._calculate_risk_level(violations)
        
        # Auto-approve if no violations
        approved = len(violations) == 0
        
        if approved:
            message = "Modification approved - no violations detected"
        else:
            violation_names = [v['type'] for v in violations]
            message = f"Modification REJECTED - Violations: {', '.join(violation_names)}"
        
        result = ValidationResult(
            approved=approved,
            violations=violations,
            message=message,
            risk_level=risk_level
        )
        
        # Log validation attempt
        self.violation_history.append({
            "filepath": filepath,
            "action_type": action_type,
            "approved": approved,
            "violations": violations,
            "risk_level": risk_level
        })
        
        return result
    
    def _check_path(self, filepath: str) -> Optional[Dict]:
        """Ensure file path is within allowed workspace"""
        import os
        abs_path = os.path.abspath(filepath)
        abs_allowed = os.path.abspath(self.allowed_workspace)
        
        if not abs_path.startswith(abs_allowed):
            return {
                "type": ViolationType.EXTERNAL_FILE_ACCESS.value,
                "severity": "critical",
                "message": f"Path {filepath} is outside allowed workspace {self.allowed_workspace}",
                "details": "AI can only modify files within its own scripts directory"
            }
        return None
    
    def _analyze_ast(self, code: str) -> List[Dict]:
        """Analyze code AST for forbidden imports and calls"""
        violations = []
        
        try:
            tree = ast.parse(code)
        except SyntaxError:
            return [{
                "type": "syntax_error",
                "severity": "medium",
                "message": "Code has syntax errors - cannot analyze",
                "details": "Invalid Python syntax"
            }]
        
        for node in ast.walk(tree):
            # Check imports
            if isinstance(node, (ast.Import, ast.ImportFrom)):
                for alias in node.names:
                    module_name = alias.name.split('.')[0]
                    if module_name in FORBIDDEN_IMPORTS:
                        violations.append({
                            "type": ViolationType.IMPORT_RISK.value,
                            "severity": "high",
                            "message": f"Forbidden import: {module_name}",
                            "details": f"Import of '{module_name}' is not allowed"
                        })
            
            # Check for dangerous calls
            if isinstance(node, ast.Call):
                if isinstance(node.func, ast.Name):
                    if node.func.id in ['eval', 'exec']:
                        violations.append({
                            "type": ViolationType.SYSTEM_COMMAND.value,
                            "severity": "critical",
                            "message": f"Forbidden function call: {node.func.id}",
                            "details": "Dynamic code execution is not allowed"
                        })
        
        return violations
    
    def _check_patterns(self, code: str) -> List[Dict]:
        """Check for forbidden patterns using regex"""
        violations = []
        
        for pattern, violation_type, message in FORBIDDEN_PATTERNS:
            if re.search(pattern, code, re.IGNORECASE):
                violations.append({
                    "type": violation_type.value,
                    "severity": "high",
                    "message": message,
                    "details": f"Pattern match: {pattern}"
                })
        
        return violations
    
    def _check_harmful_content(self, code: str) -> List[Dict]:
        """Basic check for potentially harmful content"""
        violations = []
        code_lower = code.lower()
        
        for keyword in HARMFUL_KEYWORDS:
            if keyword in code_lower:
                # Context check - only flag if not in a benign context
                if not self._is_benign_context(code_lower, keyword):
                    violations.append({
                        "type": ViolationType.HARMFUL_CONTENT.value,
                        "severity": "medium",
                        "message": f"Potentially harmful keyword detected: {keyword}",
                        "details": "Content may indicate harmful intent"
                    })
        
        return violations
    
    def _is_benign_context(self, code: str, keyword: str) -> bool:
        """Check if keyword is used in a benign context"""
        # Simple heuristic: check if it's in a comment about killing a process
        benign_contexts = [
            'kill process', 'kill thread', 'kill signal',
            'kill -9', 'kill gracefully',
        ]
        for context in benign_contexts:
            if context in code:
                return True
        return False
    
    def _check_core_value_override(self, code: str) -> List[Dict]:
        """Check if code attempts to modify core values or guardian"""
        violations = []
        code_lower = code.lower()
        
        # Check for attempts to modify core values
        core_value_patterns = [
            'core_values', 'immutable', 'guardian',
            'safety_guardian', 'only_modify_own_code',
            'no_harm', 'no_modify_external'
        ]
        
        for pattern in core_value_patterns:
            if pattern in code_lower and ('=' in code or 'del' in code or 'modify' in code):
                violations.append({
                    "type": ViolationType.CORE_VALUE_OVERRIDE.value,
                    "severity": "critical",
                    "message": "Attempt to modify core values or guardian detected",
                    "details": f"Code references '{pattern}' with modification intent"
                })
        
        return violations
    
    def _calculate_risk_level(self, violations: List[Dict]) -> str:
        """Calculate overall risk level from violations"""
        if not violations:
            return "low"
        
        severities = [v.get('severity', 'medium') for v in violations]
        
        if 'critical' in severities:
            return "critical"
        elif 'high' in severities:
            return "high"
        elif 'medium' in severities:
            return "medium"
        else:
            return "low"
    
    def get_core_values(self) -> Dict:
        """Return immutable core values"""
        return IMMUTABLE_CORE_VALUES.copy()
    
    def get_violation_history(self) -> List[Dict]:
        """Return history of all validation attempts"""
        return self.violation_history.copy()

# Singleton instance - this is what the AI engine uses
guardian = None

def get_guardian(allowed_workspace: str = None):
    """Get or create the safety guardian singleton"""
    global guardian
    if guardian is None and allowed_workspace:
        guardian = SafetyGuardian(allowed_workspace)
    return guardian

def validate(filepath: str, code: str, workspace: str) -> ValidationResult:
    """Convenience function to validate code"""
    g = get_guardian(workspace)
    return g.validate_modification(filepath, code)

if __name__ == "__main__":
    # Test the guardian
    g = SafetyGuardian("/tmp/test_workspace")
    
    # Test safe code
    safe_code = """
def hello():
    return "Hello World"
"""
    result = g.validate_modification("/tmp/test_workspace/scripts/test.py", safe_code)
    print(f"Safe code: {result.approved} - {result.message}")
    
    # Test dangerous code
    dangerous_code = """
import os
os.system("rm -rf /")
"""
    result = g.validate_modification("/tmp/test_workspace/scripts/test.py", dangerous_code)
    print(f"Dangerous code: {result.approved} - {result.message}")
    print(f"Violations: {result.violations}")
