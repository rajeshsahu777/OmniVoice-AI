# 🎙️ OmniVoice AI — Real-Time Meeting Speech-to-Speech Translator

> **Real-time bidirectional speech-to-speech translation for Google Meet, Zoom, Microsoft Teams, Discord, and WhatsApp Web — with floating live subtitles.**

**OmniVoice AI** lets you speak in your native language (e.g., Hindi) during online video calls while other participants hear you translated live in their language (e.g., English, German, Russian) — and vice versa.

---

## 🔥 Key Features

- **🎙️ Outbound Stream (You ➔ Meeting)** — Translates your spoken voice into the meeting's target language and routes the translated audio into your meeting microphone via a virtual audio cable driver.
- **🎧 Inbound Stream (Meeting ➔ You)** — Captures incoming meeting audio, translates it into your native language, and plays translated audio/subtitles back to you.
- **📺 Floating Picture-in-Picture (PiP) Subtitle Bar** — An always-on-top floating window that overlays live captions on top of your Google Meet, Zoom, or Teams window.
- **🛡️ Anti-Echo Feedback Lock** — Acoustic lock and STT muting guard to prevent speaker-mic feedback loops and echo.
- **🎯 Universal Platform Selector** — One-click preset profiles tuned for Google Meet, Zoom, Microsoft Teams, and Discord / WhatsApp Web.
- **⚡ Low-Latency Pipeline** — Built on Web Speech STT, the Google Translate API, Node.js WebSocket streaming, and a PyAudio/Pygame-based desktop audio bridge. Real-world latency depends on network conditions and language pair.
- **🌐 Broad Language Support** — Includes Hindi, English, German, Russian, Spanish, French, Japanese, Mandarin, Arabic, Bengali, Tamil, Telugu, and many more via the Google Translate API.

---

## 📁 Repository Structure

```
OmniVoice-AI/
├── index.html        # Glassmorphic web dashboard & PiP canvas
├── styles.css         # Glassmorphism & dark-mode styling
├── app.js             # Frontend STT, TTS, setSinkId routing & PiP subtitles
├── server.js           # Node.js Express server & WebSocket translation relay
├── desktop_agent.py    # Python desktop virtual audio bridge & Pygame stream
├── package.json        # Node.js dependencies & scripts
├── .gitignore           # Git ignore rules
└── README.md            # Project documentation
```

---

## ✅ Prerequisites

- **Node.js** 18+ and npm
- **Python** 3.9+ (only needed for the optional desktop agent)
- A microphone and a modern Chromium-based browser (Web Speech API support required)
- A virtual audio cable driver (see Step 2 below)

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

1. **Install a virtual audio cable driver:**
   - **Windows** — [VB-Audio Virtual Cable](https://vb-audio.com/Cable/) (free)
   - **macOS** — [BlackHole](https://existential.audio/blackhole/) (free)
2. **Configure app output in the dashboard:**
   - In the OmniVoice AI dashboard, set **Outbound Audio Device** to `CABLE Input (VB-Audio Virtual Cable)`.
3. **Configure Google Meet / Zoom audio settings:**
   - In the meeting app's audio settings, select `CABLE Output (VB-Audio Virtual Cable)` as your **Microphone**.
   - When you speak in Hindi into your real mic, meeting participants hear the translated English (or your chosen language) output instead.

---

### Step 3: Enable Floating Subtitles (PiP)

1. Click **📺 Float Subtitles (PiP)** in the header.
2. A floating subtitle bar pops out and stays **always-on-top** over your Zoom, Teams, or Google Meet window.

---

### Step 4 (Optional): Python Desktop Virtual Audio Agent

If you prefer running the audio bridge as a background OS process instead of through the browser:

```bash
pip install speechrecognition pyaudio gTTS requests pygame
python desktop_agent.py hi en
```

The two arguments are the source and target language codes (e.g., `hi` → `en`).

---

## 🛠️ Troubleshooting

- **No translated audio in the meeting:** Confirm the meeting app's microphone is set to the virtual cable's *output* device, not your physical mic.
- **Echo or double audio:** Make sure the Anti-Echo Feedback Lock is enabled and that your speakers aren't feeding back into your physical microphone.
- **Speech not recognized:** Web Speech STT requires a Chromium-based browser (Chrome/Edge) and an active internet connection.
- **`pyaudio` fails to install (Python agent):** On Windows, install the matching prebuilt wheel; on macOS, run `brew install portaudio` first; on Linux, install `python3-pyaudio` or `portaudio19-dev` via your package manager.

---

## 🤝 Contributing

Issues and pull requests are welcome. Please open an issue describing the bug or feature before submitting a large PR.

---

## 📜 License

MIT License — created to support global remote work and break down language barriers.