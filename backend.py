#!/usr/bin/env python3
"""
FastAPI Web Backend with WebSockets
Real-time command/code/stdout streaming for the Self-Scripting AI.
"""

import os
import sys
import json
import asyncio
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional, Set
from contextlib import asynccontextmanager

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

# Add parent to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))
from core.engine import SelfScriptingAI
from guardian.guardian import get_guardian, validate

# Global state
ai_engine: Optional[SelfScriptingAI] = None
connected_clients: Set[WebSocket] = set()
message_buffer: asyncio.Queue = asyncio.Queue()

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan - initialize AI engine"""
    global ai_engine
    workspace = os.environ.get("AI_WORKSPACE", "workspace")
    ai_engine = SelfScriptingAI(workspace)
    
    # Initialize guardian
    guardian = get_guardian(str(ai_engine.scripts_dir))
    
    # Start background message broadcaster
    asyncio.create_task(broadcast_messages())
    
    yield
    
    # Cleanup
    if ai_engine:
        ai_engine.stop()

app = FastAPI(title="Self-Scripting AI Control Interface", lifespan=lifespan)

# CORS for mobile access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve static files
static_dir = Path(__file__).parent / "static"
if static_dir.exists():
    app.mount("/static", StaticFiles(directory=str(static_dir)), name="static")

async def broadcast_messages():
    """Background task to broadcast AI messages to all connected clients"""
    while True:
        try:
            # Check for messages from AI engine
            if ai_engine and not ai_engine.message_queue.empty():
                msg = ai_engine.message_queue.get_nowait()
                await broadcast({
                    "type": "log",
                    "message": msg,
                    "timestamp": datetime.now().isoformat()
                })
            
            # Also check our async buffer
            try:
                msg = message_buffer.get_nowait()
                await broadcast(msg)
            except asyncio.QueueEmpty:
                pass
                
            await asyncio.sleep(0.1)
        except Exception as e:
            print(f"Broadcast error: {e}")
            await asyncio.sleep(1)

async def broadcast(data: dict):
    """Send message to all connected WebSocket clients"""
    disconnected = set()
    for client in connected_clients:
        try:
            await client.send_json(data)
        except:
            disconnected.add(client)
    
    # Remove disconnected clients
    for client in disconnected:
        connected_clients.discard(client)

@app.get("/", response_class=HTMLResponse)
async def get_interface():
    """Serve the main control interface"""
    index_file = static_dir / "index.html"
    if index_file.exists():
        return HTMLResponse(content=index_file.read_text())
    return HTMLResponse(content="<h1>Self-Scripting AI</h1><p>Interface loading...</p>")

# REST API Endpoints
@app.get("/api/status")
async def get_status():
    """Get current AI engine status"""
    if not ai_engine:
        raise HTTPException(status_code=503, detail="AI engine not initialized")
    return ai_engine.get_status()

@app.post("/api/start")
async def start_engine():
    """Start the AI engine"""
    if not ai_engine:
        raise HTTPException(status_code=503, detail="AI engine not initialized")
    ai_engine.start()
    await broadcast({
        "type": "control",
        "action": "start",
        "status": ai_engine.get_status()
    })
    return {"success": True, "status": ai_engine.get_status()}

@app.post("/api/stop")
async def stop_engine():
    """Stop the AI engine"""
    if not ai_engine:
        raise HTTPException(status_code=503, detail="AI engine not initialized")
    ai_engine.stop()
    await broadcast({
        "type": "control",
        "action": "stop",
        "status": ai_engine.get_status()
    })
    return {"success": True, "status": ai_engine.get_status()}

@app.post("/api/pause")
async def pause_engine():
    """Pause the AI engine"""
    if not ai_engine:
        raise HTTPException(status_code=503, detail="AI engine not initialized")
    ai_engine.pause()
    await broadcast({
        "type": "control",
        "action": "pause",
        "status": ai_engine.get_status()
    })
    return {"success": True, "status": ai_engine.get_status()}

@app.post("/api/resume")
async def resume_engine():
    """Resume the AI engine"""
    if not ai_engine:
        raise HTTPException(status_code=503, detail="AI engine not initialized")
    ai_engine.resume()
    await broadcast({
        "type": "control",
        "action": "resume",
        "status": ai_engine.get_status()
    })
    return {"success": True, "status": ai_engine.get_status()}

@app.post("/api/execute")
async def execute_code(request: dict):
    """Execute Python code"""
    if not ai_engine:
        raise HTTPException(status_code=503, detail="AI engine not initialized")
    
    code = request.get("code", "")
    if not code:
        raise HTTPException(status_code=400, detail="No code provided")
    
    # Validate with guardian
    validation = validate(
        str(ai_engine.scripts_dir / "temp_execute.py"),
        code,
        str(ai_engine.scripts_dir)
    )
    
    if not validation.approved:
        await broadcast({
            "type": "error",
            "message": f"Code validation failed: {validation.message}",
            "violations": validation.violations
        })
        return {
            "success": False,
            "error": validation.message,
            "violations": validation.violations,
            "risk_level": validation.risk_level
        }
    
    result = ai_engine.execute_code(code)
    await broadcast({
        "type": "execution",
        "result": result
    })
    return result

@app.post("/api/modify")
async def modify_file(request: dict):
    """Modify a file in the workspace"""
    if not ai_engine:
        raise HTTPException(status_code=503, detail="AI engine not initialized")
    
    filepath = request.get("filepath", "")
    content = request.get("content", "")
    description = request.get("description", "")
    
    if not filepath:
        raise HTTPException(status_code=400, detail="No filepath provided")
    
    # Validate with guardian
    validation = validate(
        filepath,
        content,
        str(ai_engine.scripts_dir)
    )
    
    if not validation.approved:
        await broadcast({
            "type": "error",
            "message": f"File modification rejected: {validation.message}",
            "violations": validation.violations
        })
        return {
            "success": False,
            "error": validation.message,
            "violations": validation.violations,
            "risk_level": validation.risk_level
        }
    
    result = ai_engine.modify_file(filepath, content, description)
    await broadcast({
        "type": "file_modified",
        "result": result
    })
    return result

@app.post("/api/rollback")
async def rollback(request: dict):
    """Rollback N steps"""
    if not ai_engine:
        raise HTTPException(status_code=503, detail="AI engine not initialized")
    
    steps = request.get("steps", 1)
    result = ai_engine.rollback(steps)
    await broadcast({
        "type": "rollback",
        "result": result
    })
    return result

@app.post("/api/clear")
async def clear_all():
    """Clear all - lightning bolt reset"""
    if not ai_engine:
        raise HTTPException(status_code=503, detail="AI engine not initialized")
    
    result = ai_engine.clear_all()
    await broadcast({
        "type": "clear",
        "result": result
    })
    return result

@app.get("/api/files")
async def get_files():
    """Get list of all files"""
    if not ai_engine:
        raise HTTPException(status_code=503, detail="AI engine not initialized")
    return {"files": ai_engine.get_files()}

@app.get("/api/file/{filepath:path}")
async def read_file(filepath: str):
    """Read a specific file"""
    if not ai_engine:
        raise HTTPException(status_code=503, detail="AI engine not initialized")
    
    content = ai_engine.read_file(filepath)
    return {"filepath": filepath, "content": content}

@app.get("/api/history")
async def get_history(limit: int = 100):
    """Get step history"""
    if not ai_engine:
        raise HTTPException(status_code=503, detail="AI engine not initialized")
    return {"history": ai_engine.get_history(limit)}

@app.get("/api/core-values")
async def get_core_values():
    """Get immutable core values"""
    guardian = get_guardian()
    if guardian:
        return {"core_values": guardian.get_core_values()}
    return {"core_values": {}}

# WebSocket endpoint for real-time communication
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    connected_clients.add(websocket)
    
    try:
        # Send initial status
        if ai_engine:
            await websocket.send_json({
                "type": "status",
                "data": ai_engine.get_status()
            })
        
        while True:
            # Receive commands from client
            data = await websocket.receive_json()
            command = data.get("command", "")
            
            if command == "ping":
                await websocket.send_json({"type": "pong"})
            
            elif command == "get_status":
                if ai_engine:
                    await websocket.send_json({
                        "type": "status",
                        "data": ai_engine.get_status()
                    })
            
            elif command == "get_files":
                if ai_engine:
                    await websocket.send_json({
                        "type": "files",
                        "data": ai_engine.get_files()
                    })
            
            elif command == "get_history":
                if ai_engine:
                    limit = data.get("limit", 100)
                    await websocket.send_json({
                        "type": "history",
                        "data": ai_engine.get_history(limit)
                    })
            
            elif command == "subscribe_logs":
                # Client wants to receive log stream
                await websocket.send_json({
                    "type": "info",
                    "message": "Subscribed to log stream"
                })
            
            else:
                await websocket.send_json({
                    "type": "error",
                    "message": f"Unknown command: {command}"
                })
                
    except WebSocketDisconnect:
        connected_clients.discard(websocket)
    except Exception as e:
        print(f"WebSocket error: {e}")
        connected_clients.discard(websocket)

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    host = os.environ.get("HOST", "0.0.0.0")
    uvicorn.run(app, host=host, port=port)
