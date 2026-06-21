🚀 QUICK START — Get Your URL in 5 Minutes

What You Have
All code is ready. You just need to deploy it to get a live URL.

Fastest Path to Your URL (Render.com — FREE)
Step 1: Get the code on your machine
# Create a folder
mkdir self-scripting-ai && cd self-scripting-ai

# Create these files with the code I provided:
# core/engine.py
# guardian/guardian.py
# web/backend.py
# web/static/index.html
# deploy/Dockerfile
# deploy/requirements.txt
Step 2: Push to GitHub
git init
git add .
git commit -m "Initial commit"
# Create a repo on github.com, then:
git remote add origin https://github.com/YOURNAME/self-scripting-ai.git
git push -u origin main
Step 3: Deploy (Get your URL)
Go to https://render.com
Sign up with GitHub
Click "New +" → "Web Service"
Connect your GitHub repo
Settings:
Runtime: Python 3
Build Command: pip install -r deploy/requirements.txt
Start Command: python -m web.backend
Plan: Free
Click Deploy
Render gives you a URL like:

https://self-scripting-ai-abc123.onrender.com
That's your URL. Open it on your iPad Air or Android phone.

Even Faster: Local Test (No URL, but instant)
pip install fastapi uvicorn websockets python-multipart
cd self-scripting-ai
python -m web.backend
Then open: http://localhost:8000

Your Files Are Ready

Download as CSV

Download as Image
File	Purpose
core/engine.py	Self-modifying AI brain + git rollback
guardian/guardian.py	Immutable safety layer
web/backend.py	FastAPI server + WebSockets
web/static/index.html	Full control interface (iPad + Android ready)
deploy/Dockerfile	Docker container config
deploy/requirements.txt	Python dependencies
deploy/README.md	Full documentation
What the Interface Looks Like
When you open your URL, you'll see:

🤖 Animated avatar in the background
📁 File browser (left) — click any file to edit
📝 Code editor (center) — modify AI code live
📋 Command output (right) — see what the AI is doing
🎤 Speech button — talk to it
🔇 Mute button — silence it
▶️ Start / ⏸️ Pause / ⏹️ Stop — control execution
⏪ Rollback — go back 1/10/100/1000 steps
⚡ Clear All — lightning bolt reset
🔌 Shutdown — emergency stop
Core Values (Cannot Be Changed by AI)
✅ Only modify its own code
✅ No harm to living things
✅ No touching external programs
✅ No network access without consent
✅ Log everything
Need Help?
If you get stuck deploying, tell me:

What platform you chose (Render/Railway/Docker/local)
What error you see
I'll troubleshoot with you.