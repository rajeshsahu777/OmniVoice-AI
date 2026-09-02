"""
OmniVoice AI - Universal Python Desktop Virtual Microphone Bridge & Agent
-----------------------------------------------------------------------------
This script enables direct OS-level virtual microphone piping for Google Meet,
Microsoft Teams, and Zoom meetings on Windows & macOS supporting ALL global languages.
"""

import sys
import os
import subprocess
import time
import tempfile

# Force UTF-8 stdout encoding on Windows command prompt
if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

# Auto-install missing Python dependencies gracefully
REQUIRED_PACKAGES = {
    "speech_recognition": "SpeechRecognition",
    "gtts": "gTTS",
    "requests": "requests",
    "pyaudio": "PyAudio",
    "pygame": "pygame"
}

def ensure_dependencies():
    for module_name, package_name in REQUIRED_PACKAGES.items():
        try:
            __import__(module_name)
        except ImportError:
            print(f"[Package Manager] Installing missing package '{package_name}'...")
            try:
                subprocess.check_call([sys.executable, "-m", "pip", "install", package_name])
            except Exception as err:
                print(f"[Warning] Failed auto-installing {package_name}: {err}")

ensure_dependencies()

import requests
import speech_recognition as sr
from gtts import gTTS
import pygame

# Server API Endpoint
SERVER_URL = "http://localhost:3000/api/translate"

# Universal Language Codes Dictionary
LANG_CODES = {
    "hi": "hi-IN",  # Hindi
    "en": "en-US",  # English
    "ne": "ne-NP",  # Nepali
    "de": "de-DE",  # German
    "ru": "ru-RU",  # Russian
    "es": "es-ES",  # Spanish
    "fr": "fr-FR",  # French
    "it": "it-IT",  # Italian
    "ja": "ja-JP",  # Japanese
    "ko": "ko-KR",  # Korean
    "zh": "zh-CN",  # Mandarin Chinese
    "ar": "ar-SA",  # Arabic
    "bn": "bn-IN",  # Bengali
    "ta": "ta-IN",  # Tamil
    "te": "te-IN",  # Telugu
    "mr": "mr-IN",  # Marathi
    "gu": "gu-IN",  # Gujarati
    "pa": "pa-IN",  # Punjabi
    "tr": "tr-TR",  # Turkish
    "nl": "nl-NL",  # Dutch
    "vi": "vi-VN",  # Vietnamese
    "th": "th-TH"   # Thai
}

def list_audio_devices():
    """Lists available input microphone and output speaker devices."""
    print("\n[Audio Devices Detected on System]:")
    try:
        mics = sr.Microphone.list_microphone_names()
        for idx, name in enumerate(mics):
            tag = ""
            if "cable" in name.lower() or "vb-audio" in name.lower():
                tag = " 🌟 [VB-Audio Cable - Virtual Mic for Google Meet]"
            elif "stereo mix" in name.lower():
                tag = " 🎧 [Stereo Mix - Meeting Inbound Audio]"
            print(f"  [{idx}] {name}{tag}")
    except Exception as e:
        print(f"  [Warning] Could not list audio devices: {e}")

def play_audio_headlessly(file_path, target_device=None):
    """Plays synthesized audio silently in background without launching GUI popups."""
    try:
        if not pygame.mixer.get_init():
            if target_device:
                try:
                    pygame.mixer.init(devicename=target_device)
                except Exception:
                    pygame.mixer.init()
            else:
                pygame.mixer.init()

        pygame.mixer.music.load(file_path)
        pygame.mixer.music.play()
        while pygame.mixer.music.get_busy():
            time.sleep(0.05)
        pygame.mixer.music.unload()
    except Exception as err:
        # Fallback to silent OS audio player
        if sys.platform == "win32":
            subprocess.call(f'powershell -c "$p = New-Object System.Media.SoundPlayer \'{file_path}\'; $p.PlaySync()"', shell=True)
        else:
            os.system(f'afplay "{file_path}"')

def main():
    source_lang = sys.argv[1] if len(sys.argv) > 1 else "hi"
    target_lang = sys.argv[2] if len(sys.argv) > 2 else "en"  # Default Hindi -> English
    device_index = int(sys.argv[3]) if len(sys.argv) > 3 and sys.argv[3].isdigit() else None

    speech_lang_code = LANG_CODES.get(source_lang, f"{source_lang}-{source_lang.upper()}")

    print("==================================================")
    print(" OmniVoice AI - Universal Desktop Agent")
    print("==================================================")
    print(f" Listening Language: {source_lang.upper()} ({speech_lang_code})")
    print(f" Output Meeting Language: {target_lang.upper()}")
    print("==================================================")
    print(" Usage example for any language pair:")
    print("   python desktop_agent.py hi en      (Hindi -> English)")
    print("   python desktop_agent.py hi de 2    (Hindi -> German on Device #2)")
    print("   python desktop_agent.py en hi      (English -> Hindi Inbound)")
    print("==================================================")
    print(" TIP: For Google Meet, set input mic in Meet to 'CABLE Output (VB-Audio Cable)'\n")

    list_audio_devices()
    print("\n==================================================")

    recognizer = sr.Recognizer()
    
    try:
        if device_index is not None:
            microphone = sr.Microphone(device_index=device_index)
            print(f"[Mic] Using device index #{device_index}")
        else:
            microphone = sr.Microphone()
            print("[Mic] Using default system microphone")
    except Exception as e:
        print(f"[Error] Microphone initialization error: {e}")
        print("Please check that your microphone is plugged in and permissions are enabled.")
        return

    print(" Calibrating ambient noise levels... Please wait 1 second.")
    try:
        with microphone as source:
            recognizer.adjust_for_ambient_noise(source, duration=1.0)
    except Exception as err:
        print(f"[Warning] Microphone calibration warning: {err}")

    print(f"\n[Ready] Speak into your microphone in {source_lang.upper()} (Ctrl+C to stop)...\n")

    while True:
        try:
            with microphone as source:
                print("Listening...")
                audio = recognizer.listen(source, phrase_time_limit=5)

            print("Transcribing speech...")
            speech_text = recognizer.recognize_google(audio, language=speech_lang_code)
            print(f"You Said ({source_lang.upper()}): {speech_text}")

            # Send to OmniVoice AI Translation API
            print("Translating...")
            try:
                response = requests.post(SERVER_URL, json={
                    "text": speech_text,
                    "sourceLang": source_lang,
                    "targetLang": target_lang
                }, timeout=5)

                if response.status_code == 200:
                    data = response.json()
                    translated_text = data.get("translatedText", "")
                    print(f"Translated ({target_lang.upper()}): {translated_text}")

                    # Generate Audio & Play headlessly into output stream
                    tts = gTTS(text=translated_text, lang=target_lang)
                    with tempfile.NamedTemporaryFile(delete=False, suffix=".mp3") as fp:
                        temp_file = fp.name
                        tts.save(temp_file)

                    # Stream audio headlessly (no popups)
                    play_audio_headlessly(temp_file)

                    try:
                        os.remove(temp_file)
                    except Exception:
                        pass
            except Exception as api_err:
                print(f"[Error] Translation API error: {api_err}")

        except sr.UnknownValueError:
            pass  # Silent retry when no speech is detected
        except sr.RequestError as e:
            print(f"[Error] Speech Recognition service error: {e}")
        except KeyboardInterrupt:
            print("\nStopping OmniVoice AI Agent...")
            break
        except Exception as ex:
            print(f"[Error]: {ex}")

if __name__ == "__main__":
    main()
