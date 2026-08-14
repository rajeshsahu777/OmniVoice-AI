# 🎙️ OmniVoice AI — Real-Time Meeting Speech-to-Speech Translator

> **Real-Time Bidirectional Speech-to-Speech AI Translator for Google Meet, Zoom, Microsoft Teams, Discord, and WhatsApp Web with Floating Subtitles.**

**OmniVoice AI** enables users to speak in their native language (e.g., Hindi) during online video calls while meeting participants hear them translated live in target languages (e.g., English, German, Russian)—and vice versa!

---

## 🔥 Key Features

- **🎙️ Outbound Stream (You ➔ Meeting)**: Translates your spoken voice into the meeting's native language and pipes translated audio directly into the meeting microphone using Virtual Audio Cable drivers.
- **🎧 Inbound Stream (Meeting ➔ You)**: Captures incoming meeting audio, translates it into your native language, and plays translated subtitles/audio in your headphones.
- **📺 Floating Picture-in-Picture (PiP) Subtitle Bar**: Spawns an Always-on-Top floating canvas window that displays live captions directly over Google Meet or Zoom windows.
- **🛡️ Anti-Echo Feedback Lock**: Built-in acoustic lock and STT muting guard that prevents speaker-mic feedback loops and audio echoing.
- **🎯 Universal Platform Selector**: One-click preset profiles tuned for **Google Meet**, **Zoom App**, **Microsoft Teams**, and **Discord / WhatsApp Web**.
- **⚡ Ultra-Low Latency (~140ms)**: Powered by Web Speech STT, Google Translate API, Node.js WebSocket streaming, and PyAudio/Pygame headless audio streams.
- **🌐 100+ Global Languages**: Supports Hindi, English, German, Russian, Spanish, French, Japanese, Mandarin, Arabic, Bengali, Tamil, Telugu, and more.

---

## 📁 Repository Structure

```
OmniVoice-AI/
├── index.html        # Glassmorphic Web Dashboard & PiP Canvas
├── styles.css        # Modern glassmorphism & dark-mode styling
├── app.js            # Frontend STT, TTS, setSinkId routing & PiP subtitles
├── server.js         # Node.js Express server & WebSocket translation relay
├── desktop_agent.py  # Python desktop virtual audio bridge & Pygame stream
├── package.json      # Node.js dependencies & scripts
├── .gitignore        # Git ignore rules
└── README.md         # Project documentation
```

---

## 🚀 Quick Start Guide

### Step 1: Install Dependencies & Launch Server

```bash
# Clone the repository
git clone https://github.com/rajeshsahu777/OmniVoice-AI.git
cd OmniVoice-AI

# Install Node.js dependencies
npm install

# Start the OmniVoice AI server
npm start
```

Open your browser and navigate to: **`http://localhost:3000`**

---

### Step 2: Virtual Audio Cable Setup for Google Meet / Zoom

To pipe translated AI voice directly into Google Meet or Zoom as your microphone input:

1. **Install Virtual Audio Cable (Free)**:
   - **Windows**: Download [VB-Audio Virtual Cable](https://vb-audio.com/Cable/)
   - **macOS**: Download [BlackHole Driver](https://existential.audio/blackhole/)
2. **Configure App Output in Dashboard**:
   - In OmniVoice AI dashboard, set **Outbound Audio Device** to **`CABLE Input (VB-Audio Virtual Cable)`**.
3. **Configure Google Meet / Zoom Audio Settings**:
   - In Google Meet audio settings, select **`CABLE Output (VB-Audio Virtual Cable)`** as your **Microphone**.
   - When you speak in Hindi into your mic, Google Meet participants hear translated English voice output!

---

### Step 3: Enable Floating Subtitles (PiP)

1. Click **`📺 Float Subtitles (PiP)`** in the header.
2. A floating subtitle bar will pop out and stay **Always-on-Top** over your Zoom, Teams, or Google Meet video call!

---

### Step 4: (Optional) Python Desktop Virtual Audio Agent

If you prefer running an OS background Python audio bridge:

```bash
pip install speechrecognition pyaudio gTTS requests pygame
python desktop_agent.py hi en
```

---

## 📜 License
MIT License — Created for global remote work & breaking language barriers.
