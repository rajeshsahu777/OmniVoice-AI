# 🎙️ OmniVoice AI — Real-Time Meeting Speech-to-Speech Translator

<div align="center">

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![Python](https://img.shields.io/badge/Python-3.9%2B-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
[![Platform](https://img.shields.io/badge/Platform-Windows%20%7C%20macOS%20%7C%20Linux-4A154B?style=for-the-badge)](https://github.com/rajeshsahu777/OmniVoice-AI)
[![PRs Welcome](https://img.shields.io/badge/PRs-Welcome-brightgreen.svg?style=for-the-badge)](https://github.com/rajeshsahu777/OmniVoice-AI/pulls)

**Universal Bidirectional Speech-to-Speech AI Meeting Translator for Google Meet, Zoom, Microsoft Teams, Discord, and WhatsApp Web with Floating Subtitles.**

[Report Bug](https://github.com/rajeshsahu777/OmniVoice-AI/issues) · [Request Feature](https://github.com/rajeshsahu777/OmniVoice-AI/issues) · [⭐ Star the Repo](https://github.com/rajeshsahu777/OmniVoice-AI)

</div>

---

**OmniVoice AI** enables you to speak in your native language (e.g., Hindi) during online video calls while meeting participants hear you live in their target language (e.g., English, German, Russian)—and incoming meeting audio is translated back into your headphones in real time.

---

## ⚡ Architecture Flow

```
   ┌─────────────────┐       Speech-to-Text        ┌─────────────────────────┐
   │  Your Spoken    │ ──────────────────────────> │   OmniVoice AI Engine   │
   │  Voice (Hindi)  │                             │  (GTX API / Translation)│
   └─────────────────┘                             └───────────┬─────────────┘
                                                               │
                                         Text-to-Speech (TTS)  │ (~115ms)
                                                               v
   ┌─────────────────┐       Virtual Audio Mic     ┌─────────────────────────┐
   │ Google Meet /   │ <────────────────────────── │  Translated Audio Stream│
   │ Zoom Callers    │   (VB-Audio / BlackHole)    │      (e.g., English)    │
   └─────────────────┘                             └─────────────────────────┘
```

---

## 🔥 Key Features

- **🎙️ Outbound Stream (You ➔ Meeting)**: Translates your spoken voice into the meeting's target language and routes the translated audio into your meeting microphone via a virtual audio cable driver.
- **🎧 Inbound Stream (Meeting ➔ You)**: Captures incoming meeting audio via browser tab capture, translates it into your native language, and plays translated audio/subtitles back in your headphones.
- **📺 Floating Picture-in-Picture (PiP) Subtitle Bar**: Spawns an **Always-on-Top** floating canvas window that displays live subtitles directly over Google Meet, Zoom, or Teams windows.
- **📥 One-Click Meeting Notes Export (.txt)**: Automatically records chronological, timestamped logs of spoken sentences and their translations for easy post-meeting review.
- **📋 One-Click Clipboard Copy**: Instantly copy original speech or translated subtitles to paste into meeting chats or documents.
- **🛡️ Anti-Echo Feedback Lock**: Built-in acoustic lock and STT muting guard that prevents speaker-mic feedback loops and audio echoing.
- **🎯 Universal Platform Selector**: One-click preset profiles tuned for **Google Meet**, **Zoom App**, **Microsoft Teams**, and **Discord / WhatsApp Web**.
- **⚡ Low-Latency Pipeline (~115ms)**: Powered by Web Speech STT, multi-tier translation fallbacks, Node.js WebSocket streaming, and PyAudio/Pygame headless audio streams.
- **🌐 100+ Global Languages**: Supports Hindi, English, German, Russian, Spanish, French, Japanese, Mandarin, Arabic, Bengali, Tamil, Telugu, and more.

---

## 📁 Repository Structure

```
OmniVoice-AI/
├── index.html        # Glassmorphic web dashboard & PiP canvas
├── styles.css        # Modern cyber-glass design & dark-mode styling
├── app.js            # Frontend STT, TTS, setSinkId routing, PiP & note exports
├── server.js         # Node.js Express server & WebSocket translation relay
├── desktop_agent.py  # Python desktop virtual audio bridge & Pygame stream
├── requirements.txt  # Python agent dependencies
├── package.json      # Node.js dependencies & scripts
├── package-lock.json # Lockfile
├── LICENSE           # MIT License
├── .gitignore        # Git ignore rules
└── README.md         # Project documentation
```

---

## ✅ Prerequisites

- **Node.js** 18+ and npm
- **Python** 3.9+ (for the optional desktop virtual audio agent)
- A microphone and a modern Chromium-based browser (Google Chrome, Microsoft Edge, Brave)
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

1. **Install a virtual audio cable driver (Free):**
   - **Windows**: [VB-Audio Virtual Cable](https://vb-audio.com/Cable/)
   - **macOS**: [BlackHole Driver](https://existential.audio/blackhole/)
2. **Configure App Output in OmniVoice Dashboard:**
   - In the OmniVoice AI dashboard, set **Outbound Audio Device** to `CABLE Input (VB-Audio Virtual Cable)`.
3. **Configure Google Meet / Zoom Audio Settings:**
   - In your meeting app's audio settings, select `CABLE Output (VB-Audio Virtual Cable)` as your **Microphone**.
   - When you speak into your real microphone, meeting participants hear the translated voice output!

---

### Step 3: Floating Subtitles (PiP) & Meeting Notes

- **Float Subtitles**: Click **`📺 Float Subtitles (PiP)`** in the header. The floating window stays **Always-on-Top** over Google Meet, Zoom, or Teams and updates in real time as you speak.
- **Export Notes**: Click **`📥 Export Notes`** to save a timestamped text file of all dialogue and translations from your session.

---

### Step 4 (Optional): Python Desktop Virtual Audio Agent

If you prefer running the audio bridge as a background OS process:

```bash
# Install Python dependencies
pip install -r requirements.txt

# Run the desktop agent (Source Language, Target Language)
python desktop_agent.py hi en
```

Usage examples:
```bash
python desktop_agent.py hi en      # Hindi -> English
python desktop_agent.py hi de 2    # Hindi -> German on Device #2
python desktop_agent.py en hi      # English -> Hindi Inbound
```

---

## 🛠️ Troubleshooting

- **No translated audio in the meeting:** Confirm the meeting app's microphone is set to `CABLE Output (VB-Audio Virtual Cable)`, not your physical microphone.
- **Echo or double audio:** Ensure the Anti-Echo Feedback Lock is active and that your speakers aren't feeding back into your physical mic (headphones recommended).
- **Speech not recognized:** Web Speech STT requires a Chromium-based browser (Chrome, Edge, Brave) and an active internet connection.
- **`pyaudio` install note (Python agent):** On Windows, install using `pip install pyaudio`. On macOS, run `brew install portaudio` first. On Linux, run `sudo apt install python3-pyaudio`.

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!
Feel free to check the [issues page](https://github.com/rajeshsahu777/OmniVoice-AI/issues).

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📜 License

Distributed under the MIT License. See [LICENSE](LICENSE) for details.

---

<div align="center">
  <sub>Built with ❤️ by <a href="https://github.com/rajeshsahu777">Rajesh Sahu</a></sub>
</div>
