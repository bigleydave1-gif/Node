Self-Scripting AI - Deployment Guide

Quick Deploy Options
Option 1: Render.com (Free Tier - RECOMMENDED)
Create a free account at https://render.com
Create a new Web Service
Connect your GitHub repo or use "Deploy from Git"
Configure:
Build Command: pip install -r deploy/requirements.txt
Start Command: python -m web.backend
Environment Variables:
AI_WORKSPACE: /app/workspace
PORT: 10000 (Render assigns this automatically)
Plan: Free
Deploy — Render gives you a URL like https://your-app.onrender.com
Option 2: Railway (Free Tier)
Create a free account at https://railway.app
New Project → Deploy from GitHub repo
Add variables:
AI_WORKSPACE: /app/workspace
Deploy — Railway auto-detects Python and gives you a URL
Option 3: Docker (Local or Any Host)
# Build
docker build -f deploy/Dockerfile -t self-scripting-ai .

# Run
docker run -p 8000:8000 -v $(pwd)/workspace:/app/workspace self-scripting-ai

# Access
open http://localhost:8000
Option 4: Python Direct (Local)
# Install dependencies
pip install -r deploy/requirements.txt

# Run
python -m web.backend

# Access
open http://localhost:8000
Accessing from Mobile
Once deployed, your URL works on:

iPad Air — Open Safari, enter your URL
Android Phone — Open Chrome, enter your URL
Any device with a browser — The interface is fully responsive
Features
✅ Self-modifying AI engine with git versioning
✅ Full rollback (1/10/100/1000+ steps)
✅ Safety guardian with immutable core values
✅ Real-time WebSocket communication
✅ Code editor with live modification
✅ Command window with execution output
✅ File browser
✅ Start/Stop/Pause/Shutdown controls
⚡ Lightning bolt clear-all button
🎤 Speech recognition and text-to-speech
🔇 Mute toggle
🤖 Interactive avatar background
📱 Mobile responsive (iPad + Android)
Architecture
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Web Browser   │────▶│  FastAPI Server │────▶│  AI Engine      │
│  (iPad/Android) │◀────│  (WebSockets)   │◀────│  (Self-Modify)  │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                              │
                              ▼
                        ┌─────────────────┐
                        │ Safety Guardian │
                        │ (Read-Only)     │
                        └─────────────────┘
Core Values (Immutable)
Only modify own code — Cannot touch external programs
No harm to living things — Cannot generate harmful code
No modify external programs — Cannot touch system files
No unauthorized network access — Cannot make network calls without consent
Log all actions — Everything is tracked
File Structure
self_scripting_ai/
├── core/
│   └── engine.py          # AI engine with self-modification
├── guardian/
│   └── guardian.py        # Safety validation layer
├── web/
│   ├── backend.py          # FastAPI server
│   └── static/
│       └── index.html      # Control interface
├── deploy/
│   ├── Dockerfile
│   ├── requirements.txt
│   └── README.md
└── workspace/              # AI's working directory (created at runtime)
    ├── scripts/           # AI's code files
    └── .git/              # Version history
API Endpoints

Download as CSV

Download as Image
Endpoint	Method	Description
/	GET	Main control interface
/ws	WebSocket	Real-time communication
/api/status	GET	Engine status
/api/start	POST	Start engine
/api/stop	POST	Stop engine
/api/pause	POST	Pause engine
/api/execute	POST	Execute code
/api/modify	POST	Modify file
/api/rollback	POST	Rollback N steps
/api/clear	POST	Clear all (⚡)
/api/files	GET	List files
/api/file/{path}	GET	Read file
/api/history	GET	Step history
/api/core-values	GET	Immutable core values
