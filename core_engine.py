#!/usr/bin/env python3
"""
Self-Scripting AI Engine
Core module that handles self-modification with full rollback capability.
"""

import os
import sys
import json
import time
import subprocess
import traceback
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional, Any, Callable
from dataclasses import dataclass, asdict
import threading
import queue

# Core values - these are loaded from config and enforced by guardian
CORE_VALUES = {
    "only_modify_own_code": True,
    "no_harm_to_living_things": True,
    "no_modify_external_programs": True,
    "no_network_access_without_consent": True,
    "log_all_actions": True
}

@dataclass
class Step:
    """Represents a single step in the AI's history"""
    id: int
    timestamp: str
    action: str
    description: str
    file_modified: Optional[str] = None
    code_before: Optional[str] = None
    code_after: Optional[str] = None
    git_commit_hash: Optional[str] = None
    success: bool = True
    error_message: Optional[str] = None
    
    def to_dict(self):
        return asdict(self)

class SelfScriptingAI:
    """
    Main AI engine that can read, modify, and execute its own code.
    Every modification is tracked with git commits for full rollback.
    """
    
    def __init__(self, workspace_dir: str = "workspace"):
        self.workspace_dir = Path(workspace_dir).resolve()
        self.workspace_dir.mkdir(parents=True, exist_ok=True)
        
        # History tracking
        self.steps: List[Step] = []
        self.current_step_id = 0
        self.max_steps = 10000  # Keep last 10k steps
        
        # State
        self.is_running = False
        self.is_paused = False
        self.current_task = None
        self.message_queue = queue.Queue()
        
        # Initialize git repo for versioning
        self._init_git_repo()
        
        # Load history if exists
        self._load_history()
        
        # Core scripts directory
        self.scripts_dir = self.workspace_dir / "scripts"
        self.scripts_dir.mkdir(exist_ok=True)
        
        # Ensure core files exist
        self._ensure_core_files()
        
    def _init_git_repo(self):
        """Initialize git repository for version tracking"""
        git_dir = self.workspace_dir / ".git"
        if not git_dir.exists():
            subprocess.run(["git", "init"], cwd=self.workspace_dir, capture_output=True)
            subprocess.run(["git", "config", "user.email", "ai@selfscript.local"], 
                        cwd=self.workspace_dir, capture_output=True)
            subprocess.run(["git", "config", "user.name", "SelfScriptingAI"], 
                        cwd=self.workspace_dir, capture_output=True)
            # Initial commit
            subprocess.run(["git", "add", "."], cwd=self.workspace_dir, capture_output=True)
            subprocess.run(["git", "commit", "-m", "Initial commit"], 
                        cwd=self.workspace_dir, capture_output=True)
    
    def _ensure_core_files(self):
        """Create initial core script files if they don't exist"""
        init_script = self.scripts_dir / "__init__.py"
        if not init_script.exists():
            init_script.write_text("# Self-scripting AI core scripts\n")
        
        main_script = self.scripts_dir / "brain.py"
        if not main_script.exists():
            main_script.write_text(self._get_default_brain_code())
    
    def _get_default_brain_code(self) -> str:
        return """#!/usr/bin/env python3
\"\"\"
Default brain script for Self-Scripting AI.
This is the main cognitive loop that the AI can modify.
\"\"\"

def think(input_data: str) -> str:
    \"\"\"
    Main thinking function. The AI modifies this to improve itself.
    \"\"\"
    # Default: echo back with timestamp
    from datetime import datetime
    return f"[{datetime.now().isoformat()}] Received: {input_data}"

def self_improve(analysis: str) -> str:
    \"\"\"
    Analyze current performance and suggest improvements.
    Returns a description of what should be changed.
    \"\"\"
    return f"Analysis: {analysis}\nSuggestion: Consider adding pattern matching."
"""
    
    def _load_history(self):
        """Load step history from disk"""
        history_file = self.workspace_dir / "history.json"
        if history_file.exists():
            try:
                data = json.loads(history_file.read_text())
                self.steps = [Step(**s) for s in data.get("steps", [])]
                self.current_step_id = data.get("current_step_id", 0)
            except Exception as e:
                self._log_message(f"Error loading history: {e}")
    
    def _save_history(self):
        """Save step history to disk"""
        history_file = self.workspace_dir / "history.json"
        data = {
            "steps": [s.to_dict() for s in self.steps[-self.max_steps:]],
            "current_step_id": self.current_step_id
        }
        history_file.write_text(json.dumps(data, indent=2))
    
    def _log_message(self, message: str):
        """Log a message to the message queue"""
        timestamp = datetime.now().isoformat()
        full_msg = f"[{timestamp}] {message}"
        self.message_queue.put(full_msg)
        print(full_msg)
    
    def _git_commit(self, message: str) -> str:
        """Create a git commit and return the hash"""
        subprocess.run(["git", "add", "-A"], cwd=self.workspace_dir, capture_output=True)
        result = subprocess.run(
            ["git", "commit", "-m", message],
            cwd=self.workspace_dir,
            capture_output=True,
            text=True
        )
        if result.returncode == 0:
            # Get commit hash
            hash_result = subprocess.run(
                ["git", "rev-parse", "HEAD"],
                cwd=self.workspace_dir,
                capture_output=True,
                text=True
            )
            return hash_result.stdout.strip()
        return None
    
    def _git_rollback(self, commit_hash: str) -> bool:
        """Rollback to a specific git commit"""
        result = subprocess.run(
            ["git", "reset", "--hard", commit_hash],
            cwd=self.workspace_dir,
            capture_output=True,
            text=True
        )
        return result.returncode == 0
    
    def execute_code(self, code: str, context: Dict = None) -> Dict:
        """
        Execute Python code in a restricted environment.
        Returns result dict with output, error, and success status.
        """
        self.current_step_id += 1
        step_id = self.current_step_id
        
        # Create restricted globals
        safe_globals = {
            "__builtins__": {
                "len": len, "range": range, "enumerate": enumerate,
                "zip": zip, "map": map, "filter": filter,
                "sum": sum, "min": min, "max": max, "abs": abs,
                "str": str, "int": int, "float": float, "bool": bool,
                "list": list, "dict": dict, "tuple": tuple, "set": set,
                "print": lambda *args: self._log_message(" ".join(str(a) for a in args)),
                "open": open,  # File access restricted by filesystem permissions
                "isinstance": isinstance, "hasattr": hasattr, "getattr": getattr,
                "Exception": Exception, "TypeError": TypeError, "ValueError": ValueError,
            },
            "json": json,
            "os": os,
            "sys": sys,
            "time": time,
            "datetime": datetime,
            "Path": Path,
        }
        
        if context:
            safe_globals.update(context)
        
        result = {
            "step_id": step_id,
            "success": False,
            "output": "",
            "error": None,
            "timestamp": datetime.now().isoformat()
        }
        
        try:
            # Capture stdout
            import io
            old_stdout = sys.stdout
            sys.stdout = buffer = io.StringIO()
            
            exec(code, safe_globals)
            
            sys.stdout = old_stdout
            output = buffer.getvalue()
            
            result["success"] = True
            result["output"] = output
            
            # Log step
            step = Step(
                id=step_id,
                timestamp=result["timestamp"],
                action="execute_code",
                description=f"Executed code block ({len(code)} chars)",
                success=True
            )
            self.steps.append(step)
            self._save_history()
            
            self._log_message(f"Step {step_id}: Code executed successfully")
            
        except Exception as e:
            sys.stdout = old_stdout
            result["error"] = f"{type(e).__name__}: {str(e)}\n{traceback.format_exc()}"
            
            step = Step(
                id=step_id,
                timestamp=result["timestamp"],
                action="execute_code",
                description=f"Code execution failed",
                success=False,
                error_message=result["error"]
            )
            self.steps.append(step)
            self._save_history()
            
            self._log_message(f"Step {step_id}: ERROR - {str(e)}")
        
        return result
    
    def modify_file(self, filepath: str, new_content: str, description: str = "") -> Dict:
        """
        Modify a file in the workspace. Creates a git commit for rollback.
        Only allows modifying files within the workspace/scripts directory.
        """
        self.current_step_id += 1
        step_id = self.current_step_id
        
        result = {
            "step_id": step_id,
            "success": False,
            "filepath": filepath,
            "timestamp": datetime.now().isoformat()
        }
        
        try:
            target = Path(filepath).resolve()
            
            # SECURITY: Only allow modifying files within workspace/scripts
            if not str(target).startswith(str(self.scripts_dir)):
                raise PermissionError(
                    f"Cannot modify file outside scripts directory: {filepath}"
                )
            
            # Read old content if exists
            old_content = ""
            if target.exists():
                old_content = target.read_text()
            
            # Write new content
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_text(new_content)
            
            # Git commit
            commit_msg = f"Step {step_id}: {description or f'Modified {filepath}'}"
            commit_hash = self._git_commit(commit_msg)
            
            # Record step
            step = Step(
                id=step_id,
                timestamp=result["timestamp"],
                action="modify_file",
                description=description or f"Modified {filepath}",
                file_modified=str(target),
                code_before=old_content,
                code_after=new_content,
                git_commit_hash=commit_hash,
                success=True
            )
            self.steps.append(step)
            self._save_history()
            
            result["success"] = True
            result["commit_hash"] = commit_hash
            self._log_message(f"Step {step_id}: Modified {filepath} (commit: {commit_hash[:8]})")
            
        except Exception as e:
            error_msg = f"{type(e).__name__}: {str(e)}"
            result["error"] = error_msg
            
            step = Step(
                id=step_id,
                timestamp=result["timestamp"],
                action="modify_file",
                description=f"Failed to modify {filepath}",
                file_modified=filepath,
                success=False,
                error_message=error_msg
            )
            self.steps.append(step)
            self._save_history()
            
            self._log_message(f"Step {step_id}: ERROR modifying file - {error_msg}")
        
        return result
    
    def rollback(self, steps_back: int = 1) -> Dict:
        """
        Rollback N steps. Finds the git commit from that step and resets to it.
        """
        if not self.steps:
            return {"success": False, "error": "No history to rollback"}
        
        if steps_back >= len(self.steps):
            steps_back = len(self.steps) - 1
        
        target_step = self.steps[-(steps_back + 1)]
        
        if not target_step.git_commit_hash:
            return {"success": False, "error": f"Step {target_step.id} has no git commit"}
        
        success = self._git_rollback(target_step.git_commit_hash)
        
        if success:
            # Remove rolled-back steps from history
            self.steps = self.steps[:-(steps_back)]
            self.current_step_id = target_step.id
            self._save_history()
            
            msg = f"Rolled back {steps_back} steps to step {target_step.id}"
            self._log_message(msg)
            return {"success": True, "message": msg, "target_step": target_step.id}
        else:
            return {"success": False, "error": "Git rollback failed"}
    
    def get_history(self, limit: int = 100) -> List[Dict]:
        """Get recent step history"""
        return [s.to_dict() for s in self.steps[-limit:]]
    
    def get_files(self) -> List[Dict]:
        """Get list of all files in scripts directory"""
        files = []
        for f in self.scripts_dir.rglob("*"):
            if f.is_file():
                files.append({
                    "path": str(f.relative_to(self.workspace_dir)),
                    "size": f.stat().st_size,
                    "modified": datetime.fromtimestamp(f.stat().st_mtime).isoformat()
                })
        return files
    
    def read_file(self, filepath: str) -> str:
        """Read a file's contents"""
        target = self.workspace_dir / filepath
        if target.exists() and target.is_file():
            return target.read_text()
        return ""
    
    def clear_all(self) -> Dict:
        """
        Clear everything - reset to initial state (lightning bolt button).
        Preserves core engine files but clears all scripts and history.
        """
        # Save current state as backup
        backup_dir = self.workspace_dir / f"backup_{int(time.time())}"
        backup_dir.mkdir(exist_ok=True)
        
        # Move scripts to backup
        import shutil
        if self.scripts_dir.exists():
            shutil.copytree(self.scripts_dir, backup_dir / "scripts")
            shutil.rmtree(self.scripts_dir)
            self.scripts_dir.mkdir(exist_ok=True)
        
        # Clear history
        self.steps = []
        self.current_step_id = 0
        self._save_history()
        
        # Re-init
        self._ensure_core_files()
        self._git_commit("Cleared all - reset to initial state")
        
        msg = "All scripts and history cleared. Reset to initial state."
        self._log_message(msg)
        return {"success": True, "message": msg, "backup": str(backup_dir)}
    
    def start(self):
        """Start the AI engine"""
        self.is_running = True
        self.is_paused = False
        self._log_message("AI Engine STARTED")
    
    def stop(self):
        """Stop the AI engine"""
        self.is_running = False
        self._log_message("AI Engine STOPPED")
    
    def pause(self):
        """Pause the AI engine"""
        self.is_paused = True
        self._log_message("AI Engine PAUSED")
    
    def resume(self):
        """Resume the AI engine"""
        self.is_paused = False
        self._log_message("AI Engine RESUMED")
    
    def get_status(self) -> Dict:
        """Get current engine status"""
        return {
            "is_running": self.is_running,
            "is_paused": self.is_paused,
            "current_step_id": self.current_step_id,
            "total_steps": len(self.steps),
            "workspace": str(self.workspace_dir)
        }

if __name__ == "__main__":
    ai = SelfScriptingAI()
    print(f"Self-Scripting AI initialized in {ai.workspace_dir}")
    print(f"Status: {ai.get_status()}")
