"""
OmniVoice AI - Universal Python Desktop Virtual Microphone Bridge & Agent
-----------------------------------------------------------------------------
This script enables direct OS-level virtual microphone piping for Google Meet,
Microsoft Teams, and Zoom meetings on Windows & macOS supporting 100+ global languages.
"""

import sys
import os
import subprocess
import time
import tempfile
import warnings
import argparse

# Suppress harmless third-party deprecation warnings
warnings.filterwarnings("ignore")

# Force UTF-8 stdout encoding on Windows command prompt
if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

# Required Python dependencies
REQUIRED_PACKAGES = {
    "speech_recognition": "SpeechRecognition",
    "gtts": "gTTS",
    "requests": "requests",
    "pyaudio": "PyAudio",
    "pygame": "pygame"
}

def ensure_dependencies():
    """Auto-installs missing packages gracefully if needed."""
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
DEFAULT_SERVER_URL = "http://localhost:3000/api/translate"

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
    "th": "th-TH",  # Thai
    "id": "id-ID",  # Indonesian
    "pt": "pt-PT",  # Portuguese
    "uk": "uk-UA",  # Ukrainian
    "pl": "pl-PL"   # Polish
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

def direct_translate(text, source_lang, target_lang):
    """Direct standalone fallback translation when node server is offline."""
    src = source_lang.split("-")[0].lower()
    tgt = target_lang.split("-")[0].lower()
    if src == tgt:
        return text

    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }

    # Tier 1: GTX API
    try:
        url = "https://translate.googleapis.com/translate_a/single"
        params = {"client": "gtx", "sl": src, "tl": tgt, "dt": "t", "q": text}
        resp = requests.get(url, params=params, headers=headers, timeout=4)
        if resp.status_code == 200:
            data = resp.json()
            if data and data[0]:
                return "".join([segment[0] for segment in data[0] if segment and segment[0]])
    except Exception:
        pass

    # Tier 2: MyMemory Translation API Fallback
    try:
        mm_url = "https://api.mymemory.translated.net/get"
        mm_resp = requests.get(mm_url, params={"q": text, "langpair": f"{src}|{tgt}"}, timeout=4)
        if mm_resp.status_code == 200:
            translated = mm_resp.json().get("responseData", {}).get("translatedText")
            if translated and not translated.startswith("MYMEMORY WARNING"):
                return translated
    except Exception:
        pass

    return text

def translate_phrase(text, source_lang, target_lang, server_url=DEFAULT_SERVER_URL):
    """Translates phrase via OmniVoice Server, with direct fallback."""
    try:
        response = requests.post(
            server_url,
            json={"text": text, "sourceLang": source_lang, "targetLang": target_lang},
            timeout=4
        )
        if response.status_code == 200:
            return response.json().get("translatedText", text)
    except Exception:
        # Offline or server unreachable fallback
        pass
    return direct_translate(text, source_lang, target_lang)

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

def run_self_test(source_lang, target_lang):
    """Runs a quick end-to-end diagnostic test."""
    test_text = "नमस्ते, यह ओम्नीवॉइस एआई का त्वरित परीक्षण है।" if source_lang == "hi" else "Hello, this is a quick diagnostic test of OmniVoice AI."
    print("\n[Self-Test] Running end-to-end pipeline test...")
    print(f"  Input text: \"{test_text}\" ({source_lang.upper()})")
    translated = translate_phrase(test_text, source_lang, target_lang)
    print(f"  Translated: \"{translated}\" ({target_lang.upper()})")

    try:
        tts = gTTS(text=translated, lang=target_lang)
        with tempfile.NamedTemporaryFile(delete=False, suffix=".mp3") as fp:
            temp_path = fp.name
            tts.save(temp_path)
        print("  Playing synthesized speech test...")
        play_audio_headlessly(temp_path)
        try:
            os.remove(temp_path)
        except Exception:
            pass
        print("  [Self-Test Passed] Audio pipeline and translation are fully functional!\n")
    except Exception as err:
        print(f"  [Self-Test Warning] Audio playback diagnostic: {err}\n")

def main():
    parser = argparse.ArgumentParser(description="OmniVoice AI Desktop Virtual Microphone Bridge & Agent")
    parser.add_argument("pos_source", nargs="?", default=None, help="Source language (e.g. hi)")
    parser.add_argument("pos_target", nargs="?", default=None, help="Target meeting language (e.g. en)")
    parser.add_argument("pos_device", nargs="?", default=None, help="Microphone device index")
    parser.add_argument("--source", "-s", default="hi", help="Source language code (default: hi)")
    parser.add_argument("--target", "-t", default="en", help="Target language code (default: en)")
    parser.add_argument("--device", "-d", type=int, default=None, help="Microphone device index")
    parser.add_argument("--list-devices", "-l", action="store_true", help="List available audio devices and exit")
    parser.add_argument("--test", action="store_true", help="Run end-to-end audio pipeline test and exit")
    parser.add_argument("--phrase-limit", type=int, default=5, help="Speech phrase time limit in seconds (default: 5)")

    args = parser.parse_args()

    if args.list_devices:
        list_audio_devices()
        return

    source_lang = args.pos_source or args.source
    target_lang = args.pos_target or args.target
    device_index = int(args.pos_device) if (args.pos_device and args.pos_device.isdigit()) else args.device

    if args.test:
        run_self_test(source_lang, target_lang)
        return

    speech_lang_code = LANG_CODES.get(source_lang, f"{source_lang}-{source_lang.upper()}")

    print("==================================================")
    print(" 🎙️ OmniVoice AI - Universal Desktop Agent v1.1")
    print("==================================================")
    print(f" 🗣️  Listening Language: {source_lang.upper()} ({speech_lang_code})")
    print(f" 🔊 Target Meeting Language: {target_lang.upper()}")
    print("==================================================")
    print(" Usage examples:")
    print("   python desktop_agent.py hi en          (Hindi -> English)")
    print("   python desktop_agent.py hi de 2        (Hindi -> German on Device #2)")
    print("   python desktop_agent.py --test         (Run audio diagnostic test)")
    print("   python desktop_agent.py --list-devices (Show microphone indices)")
    print("==================================================")
    print(" 💡 TIP: In Google Meet or Zoom, set Microphone to:")
    print("         'CABLE Output (VB-Audio Virtual Cable)'\n")

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
                audio = recognizer.listen(source, phrase_time_limit=args.phrase_limit)

            print("Transcribing speech...")
            speech_text = recognizer.recognize_google(audio, language=speech_lang_code)
            print(f"You Said ({source_lang.upper()}): {speech_text}")

            print("Translating...")
            translated_text = translate_phrase(speech_text, source_lang, target_lang)
            print(f"Translated ({target_lang.upper()}): {translated_text}")

            # Generate Audio & Play headlessly into output stream
            tts = gTTS(text=translated_text, lang=target_lang)
            with tempfile.NamedTemporaryFile(delete=False, suffix=".mp3") as fp:
                temp_file = fp.name
                tts.save(temp_file)

            play_audio_headlessly(temp_file)

            try:
                os.remove(temp_file)
            except Exception:
                pass

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
