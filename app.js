/**
 * OmniVoice AI - Real-Time Speech Translator Frontend Logic
 */

document.addEventListener('DOMContentLoaded', () => {
  // UI Elements
  const myLanguageSelect = document.getElementById('myLanguageSelect');
  const targetLanguageSelect = document.getElementById('targetLanguageSelect');
  const swapLangBtn = document.getElementById('swapLangBtn');
  const toggleLiveBtn = document.getElementById('toggleLiveBtn');
  const btnIcon = document.getElementById('btnIcon');
  const btnText = document.getElementById('btnText');
  const latencyDisplay = document.getElementById('latencyDisplay');

  // Input & Audio Buttons
  const manualTextInput = document.getElementById('manualTextInput');
  const translateNowBtn = document.getElementById('translateNowBtn');
  const inboundTextInput = document.getElementById('inboundTextInput');
  const translateInboundBtn = document.getElementById('translateInboundBtn');
  
  const playOutboundAudioBtn = document.getElementById('playOutboundAudioBtn');
  const playOutboundLocalAudioBtn = document.getElementById('playOutboundLocalAudioBtn');
  const playInboundAudioBtn = document.getElementById('playInboundAudioBtn');
  const alsoHearHeadphonesCheckbox = document.getElementById('alsoHearHeadphonesCheckbox');
  const inboundAudioStatus = document.getElementById('inboundAudioStatus');
  const inboundStatusText = document.getElementById('inboundStatusText');

  // Meeting Control & Tuning Elements
  const toggleMuteBtn = document.getElementById('toggleMuteBtn');
  const muteIcon = document.getElementById('muteIcon');
  const muteText = document.getElementById('muteText');
  const pttModeCheckbox = document.getElementById('pttModeCheckbox');
  const voiceSpeedSelect = document.getElementById('voiceSpeedSelect');
  const chimeToggleCheckbox = document.getElementById('chimeToggleCheckbox');
  const transcriptSearchInput = document.getElementById('transcriptSearchInput');

  // AI Meeting Minutes & Summary Modal Elements
  const generateSummaryBtn = document.getElementById('generateSummaryBtn');
  const summaryModal = document.getElementById('summaryModal');
  const closeSummaryModalBtn = document.getElementById('closeSummaryModalBtn');
  const summaryContentArea = document.getElementById('summaryContentArea');
  const copySummaryBtn = document.getElementById('copySummaryBtn');
  const downloadSummaryBtn = document.getElementById('downloadSummaryBtn');
  const summaryMetaText = document.getElementById('summaryMetaText');

  // Multi-Format Export Elements
  const exportNotesBtn = document.getElementById('exportNotesBtn');
  const exportMenu = document.getElementById('exportMenu');
  const exportOptionBtns = document.querySelectorAll('.export-option-btn');

  // Productivity Buttons & Elements
  const clearTranscriptsBtn = document.getElementById('clearTranscriptsBtn');
  const copyOutboundOrigBtn = document.getElementById('copyOutboundOrigBtn');
  const copyOutboundTransBtn = document.getElementById('copyOutboundTransBtn');
  const copyInboundOrigBtn = document.getElementById('copyInboundOrigBtn');
  const copyInboundTransBtn = document.getElementById('copyInboundTransBtn');
  const toastNotification = document.getElementById('toastNotification');

  // Floating Picture-in-Picture (PiP) Subtitle Elements
  const togglePipBtn = document.getElementById('togglePipBtn');
  const pipCanvas = document.getElementById('pipCanvas');
  const pipVideo = document.getElementById('pipVideo');
  const pipCtx = pipCanvas ? pipCanvas.getContext('2d') : null;

  // Session Transcript History Log
  const sessionTranscriptHistory = [];
  let isMuted = false;

  // Toast Notification System
  function showToast(message, duration = 2500) {
    if (!toastNotification) return;
    toastNotification.innerHTML = message;
    toastNotification.style.display = 'flex';
    clearTimeout(toastNotification._timer);
    toastNotification._timer = setTimeout(() => {
      toastNotification.style.display = 'none';
    }, duration);
  }

  // Helper for displaying live audio transmission status
  function showTransmissionStatus(channel, isActive, message = '') {
    if (channel === 'outbound') {
      if (!outboundAudioStatus) return;
      if (isActive) {
        outboundAudioStatus.style.display = 'flex';
        if (outboundStatusText) outboundStatusText.textContent = message || '🟢 Transmitting English Audio to Google Meet Mic...';
      } else {
        outboundAudioStatus.style.display = 'none';
      }
    } else {
      if (!inboundAudioStatus) return;
      if (isActive) {
        inboundAudioStatus.style.display = 'flex';
        if (inboundStatusText) inboundStatusText.textContent = message || '🎧 Playing Hindi Voice into Headphones...';
      } else {
        inboundAudioStatus.style.display = 'none';
      }
    }
  }

  // Stream Labels
  const outboundTag = document.getElementById('outboundTag');
  const inboundTag = document.getElementById('inboundTag');
  const outboundSourceLangLabel = document.getElementById('outboundSourceLangLabel');
  const outboundTargetLangLabel = document.getElementById('outboundTargetLangLabel');
  const inboundSourceLangLabel = document.getElementById('inboundSourceLangLabel');
  const inboundTargetLangLabel = document.getElementById('inboundTargetLangLabel');

  // Transcript Boxes
  const outboundOriginalText = document.getElementById('outboundOriginalText');
  const outboundTranslatedText = document.getElementById('outboundTranslatedText');
  const inboundOriginalText = document.getElementById('inboundOriginalText');
  const inboundTranslatedText = document.getElementById('inboundTranslatedText');

  // Modals
  const setupModal = document.getElementById('setupModal');
  const guideBtn = document.getElementById('guideBtn');
  const openWizardBtn = document.getElementById('openWizardBtn');
  const closeModalBtn = document.getElementById('closeModalBtn');
  const confirmWizardBtn = document.getElementById('confirmWizardBtn');

  // Canvases
  const outboundCanvas = document.getElementById('outboundCanvas');
  const inboundCanvas = document.getElementById('inboundCanvas');

  // Universal Language display map
  const LANG_NAMES = {
    'hi-IN': 'Hindi', 'en-US': 'English', 'ne-NP': 'Nepali', 'de-DE': 'German',
    'ru-RU': 'Russian', 'es-ES': 'Spanish', 'fr-FR': 'French', 'it-IT': 'Italian',
    'pt-PT': 'Portuguese', 'ja-JP': 'Japanese', 'ko-KR': 'Korean', 'zh-CN': 'Mandarin',
    'ar-SA': 'Arabic', 'bn-IN': 'Bengali', 'ta-IN': 'Tamil', 'te-IN': 'Telugu',
    'mr-IN': 'Marathi', 'gu-IN': 'Gujarati', 'pa-IN': 'Punjabi', 'tr-TR': 'Turkish',
    'nl-NL': 'Dutch', 'vi-VN': 'Vietnamese', 'th-TH': 'Thai', 'id-ID': 'Indonesian',
    'uk-UA': 'Ukrainian', 'pl-PL': 'Polish'
  };

  // Audio Routing & Tab Capture Elements
  const audioOutputSelect = document.getElementById('audioOutputSelect');
  const captureTabAudioBtn = document.getElementById('captureTabAudioBtn');

  // Application State
  let isLive = false;
  let isInboundActive = false;
  let ws = null;
  let recognition = null;
  let micStream = null;
  let audioCtx = null;
  let micAnalyser = null;
  let dataArray = null;
  let translationDebounceTimer = null;
  let lastOutboundTranslatedText = '';
  let lastInboundTranslatedText = '';
  let selectedOutputDeviceId = 'default';
  let tabMediaStream = null;

  // Pre-load Web Speech Synthesis voices
  let availableVoices = [];
  function loadVoices() {
    if ('speechSynthesis' in window) {
      availableVoices = window.speechSynthesis.getVoices();
    }
  }
  loadVoices();
  if ('speechSynthesis' in window) {
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }

  // Populate Audio Output Devices (setSinkId support for VB-Audio Cable routing)
  async function populateAudioDevices() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) return;
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const audioOutputs = devices.filter(d => d.kind === 'audiooutput');

      if (audioOutputSelect) {
        audioOutputSelect.innerHTML = '';
        if (audioOutputs.length === 0) {
          const opt = document.createElement('option');
          opt.value = 'default';
          opt.textContent = 'Default System Audio Output';
          audioOutputSelect.appendChild(opt);
        } else {
          audioOutputs.forEach(device => {
            const opt = document.createElement('option');
            opt.value = device.deviceId;
            let label = device.label || `Audio Output (${device.deviceId.slice(0, 6)})`;
            if (label.toLowerCase().includes('cable input') || label.toLowerCase().includes('vb-audio')) {
              label = `⭐ ${label} (Virtual Mic for Google Meet)`;
            }
            opt.textContent = label;
            audioOutputSelect.appendChild(opt);
          });
        }
      }
    } catch (err) {
      console.warn('Could not enumerate audio output devices:', err);
    }
  }

  if (audioOutputSelect) {
    audioOutputSelect.addEventListener('change', () => {
      selectedOutputDeviceId = audioOutputSelect.value;
      console.log('Selected audio output device:', selectedOutputDeviceId);
    });
  }

  // Initialize WebSockets
  function initWebSocket() {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}`;
    
    try {
      ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log('⚡ WebSocket connected to OmniVoice Server');
      };

      ws.onmessage = (event) => {
        try {
          const packet = JSON.parse(event.data);
          if (packet.type === 'TRANSLATED_PACKET') {
            handleIncomingPacket(packet);
          }
        } catch (err) {
          console.error('Error parsing WS message:', err);
        }
      };

      ws.onerror = (err) => {
        console.warn('WS Error (falling back to direct browser engine):', err);
      };
    } catch (e) {
      console.warn('WS connection unavailable, relying on browser Speech API.');
    }
  }

  // Update Tags and Labels
  function updateLanguageLabels() {
    const myLang = myLanguageSelect.value;
    const targetLang = targetLanguageSelect.value;

    const myLangName = LANG_NAMES[myLang] || myLang;
    const targetLangName = LANG_NAMES[targetLang] || targetLang;

    outboundTag.textContent = `${myLangName} ➔ ${targetLangName}`;
    inboundTag.textContent = `${targetLangName} ➔ ${myLangName}`;

    outboundSourceLangLabel.textContent = myLangName;
    outboundTargetLangLabel.textContent = targetLangName;

    inboundSourceLangLabel.textContent = targetLangName;
    inboundTargetLangLabel.textContent = myLangName;
  }

  myLanguageSelect.addEventListener('change', updateLanguageLabels);
  targetLanguageSelect.addEventListener('change', updateLanguageLabels);

  swapLangBtn.addEventListener('click', () => {
    const temp = myLanguageSelect.value;
    myLanguageSelect.value = targetLanguageSelect.value;
    targetLanguageSelect.value = temp;
    updateLanguageLabels();
  });

  // Real Mic Waveform Visualizer
  function setupCanvas(canvas) {
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight;
    return ctx;
  }

  function drawWaveform(canvas, ctx, isActive, color = '#818cf8') {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const width = canvas.width;
    const height = canvas.height;
    const centerY = height / 2;

    ctx.beginPath();
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = color;

    const bars = 40;
    const barWidth = width / bars;
    const time = Date.now() * 0.005;

    for (let i = 0; i < bars; i++) {
      const x = i * barWidth;
      let amplitude = 0;
      if (isActive) {
        const freqVal = (dataArray && dataArray[i % 32]) ? dataArray[i % 32] / 255 : 0.25;
        amplitude = Math.sin(i * 0.4 + time) * (12 + freqVal * 35);
      } else {
        amplitude = Math.sin(i * 0.3 + time) * 3;
      }
      if (!isActive) amplitude = Math.max(2, amplitude);

      ctx.lineTo(x, centerY + amplitude);
    }

    ctx.stroke();
  }

  function startVisualizers() {
    const outboundCtx = setupCanvas(outboundCanvas);
    const inboundCtx = setupCanvas(inboundCanvas);

    function animate() {
      drawWaveform(outboundCanvas, outboundCtx, isLive, '#8b5cf6');
      drawWaveform(inboundCanvas, inboundCtx, isInboundActive, '#06b6d4');
      requestAnimationFrame(animate);
    }

    animate();
  }

  // Anti-Echo & Speech Recognition State Flags
  let isSpeakingTTS = false;
  let ttsMuteTimer = null;

  function setTTSActive(active, durationMs = 0) {
    isSpeakingTTS = active;
    if (active) {
      clearTimeout(ttsMuteTimer);
      if (durationMs > 0) {
        ttsMuteTimer = setTimeout(() => {
          isSpeakingTTS = false;
        }, durationMs + 400);
      }
    }
  }

  // Initialize Speech Recognition (STT)
  function initSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech Recognition is not supported by your browser. Please use Google Chrome, Microsoft Edge, or Brave.');
      return null;
    }

    const rec = new SpeechRecognition();
    rec.continuous = true;
    rec.interimResults = true;

    rec.onresult = (event) => {
      // ANTI-ECHO GUARD & MUTE GUARD: Ignore mic input while TTS is playing or when muted
      if (isSpeakingTTS || isMuted) {
        return;
      }

      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }

      const activeText = finalTranscript || interimTranscript;
      if (activeText.trim().length > 0) {
        outboundOriginalText.textContent = activeText;
        updatePiPSubtitles(activeText, lastInboundTranslatedText);
      }

      // Smooth translation trigger: translate complete final sentences, or debounce interim speech by 700ms
      if (finalTranscript.trim().length > 0) {
        clearTimeout(translationDebounceTimer);
        const textToTranslate = finalTranscript.trim();
        processTranslation(textToTranslate, 'outbound');
      } else if (interimTranscript.trim().length > 8) {
        clearTimeout(translationDebounceTimer);
        translationDebounceTimer = setTimeout(() => {
          if (!isSpeakingTTS && interimTranscript.trim().length > 0) {
            processTranslation(interimTranscript.trim(), 'outbound');
          }
        }, 700);
      }
    };

    rec.onerror = (event) => {
      console.warn('Speech recognition status:', event.error);
    };

    rec.onend = () => {
      if (isLive) {
        try { rec.start(); } catch (e) {}
      }
    };

    return rec;
  }

  // Process Universal Translation and Speak (TTS)
  async function processTranslation(text, channel = 'outbound') {
    if (!text || !text.trim()) return;

    const srcVal = channel === 'outbound' ? myLanguageSelect.value : targetLanguageSelect.value;
    const tgtVal = channel === 'outbound' ? targetLanguageSelect.value : myLanguageSelect.value;

    const sourceLang = srcVal.split('-')[0];
    const targetLang = tgtVal.split('-')[0];

    const startTime = Date.now();

    if (channel === 'inbound') {
      isInboundActive = true;
      setTimeout(() => { isInboundActive = false; }, 4000);
    }

    let translatedResult = '';

    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, sourceLang, targetLang })
      });

      if (response.ok) {
        const data = await response.json();
        translatedResult = data.translatedText;
      }
    } catch (e) {
      console.warn('Backend translation endpoint unreachable, using client direct translation:', e);
    }

    // Direct browser fallback if server API is unreachable or returned untranslated text
    if (!translatedResult || translatedResult.includes('[') && translatedResult.includes('Translation]:')) {
      try {
        const directUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
        const res = await fetch(directUrl);
        if (res.ok) {
          const gdata = await res.json();
          if (gdata && gdata[0] && Array.isArray(gdata[0])) {
            const segs = gdata[0].map(item => item[0]).filter(Boolean);
            if (segs.length > 0) translatedResult = segs.join('');
          }
        }
      } catch (err) {
        console.warn('Direct GTX fallback failed:', err);
      }
    }

    if (!translatedResult) {
      translatedResult = text;
    }

    const latency = Date.now() - startTime;
    if (latencyDisplay) latencyDisplay.textContent = `${latency}ms`;

    if (channel === 'outbound') {
      lastOutboundTranslatedText = translatedResult;
      outboundTranslatedText.textContent = translatedResult;
      speakText(translatedResult, tgtVal, 'outbound');
      updatePiPSubtitles(translatedResult, lastInboundTranslatedText);

      sessionTranscriptHistory.push({
        time: new Date().toLocaleTimeString(),
        speaker: 'You (Outbound)',
        original: text,
        translated: translatedResult,
        pair: `${LANG_NAMES[srcVal] || srcVal} ➔ ${LANG_NAMES[tgtVal] || tgtVal}`
      });
      
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
          type: 'OUTBOUND_SPEECH',
          text: text,
          sourceLang: sourceLang,
          targetLang: targetLang
        }));
      }
    } else {
      lastInboundTranslatedText = translatedResult;
      inboundTranslatedText.textContent = translatedResult;
      speakText(translatedResult, tgtVal, 'inbound');
      updatePiPSubtitles(lastOutboundTranslatedText, translatedResult);

      sessionTranscriptHistory.push({
        time: new Date().toLocaleTimeString(),
        speaker: 'Meeting (Inbound)',
        original: text,
        translated: translatedResult,
        pair: `${LANG_NAMES[srcVal] || srcVal} ➔ ${LANG_NAMES[tgtVal] || tgtVal}`
      });
    }
  }

  // Subtle audio cue feedback on successful transmission
  function playTransmissionChime() {
    if (!chimeToggleCheckbox || !chimeToggleCheckbox.checked) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      const now = ctx.currentTime;
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.1); // A5
      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
      osc.start(now);
      osc.stop(now + 0.21);
    } catch (e) {}
  }

  // Reliable Text-to-Speech (TTS) Output Engine with Anti-Echo Lock
  async function speakText(text, langCode, channel = 'outbound', forceDefaultOutput = false) {
    if (!text || !text.trim()) return;

    // Lock STT mic during TTS playback to kill speaker feedback echo
    setTTSActive(true);

    const speed = voiceSpeedSelect ? (parseFloat(voiceSpeedSelect.value) || 1.0) : 1.0;

    try {
      const audioUrl = `/api/tts?text=${encodeURIComponent(text)}&lang=${encodeURIComponent(langCode)}`;
      const audio = new Audio(audioUrl);
      audio.playbackRate = speed;

      const unlockMic = () => {
        setTTSActive(false);
        showTransmissionStatus(channel, false);
        playTransmissionChime();
      };

      audio.onended = unlockMic;
      audio.onerror = unlockMic;

      // Show live transmission status indicator
      const isVirtualDevice = !forceDefaultOutput && channel === 'outbound' && selectedOutputDeviceId && selectedOutputDeviceId !== 'default';
      if (channel === 'outbound') {
        const msg = isVirtualDevice
          ? '🟢 Transmitting English Audio to Google Meet Mic (VB-Cable)...'
          : '🟢 Playing English Audio Output...';
        showTransmissionStatus('outbound', true, msg);
      } else {
        showTransmissionStatus('inbound', true, '🎧 Playing Hindi Voice into Headphones...');
      }

      // Route outbound translated voice directly into Virtual Audio Cable for Google Meet Mic input!
      if (isVirtualDevice && typeof audio.setSinkId === 'function') {
        try {
          await audio.setSinkId(selectedOutputDeviceId);
          console.log(`Piped translated TTS audio to output sink: ${selectedOutputDeviceId}`);
        } catch (sinkErr) {
          console.warn('setSinkId warning:', sinkErr);
        }
      }

      await audio.play();
      setTTSActive(true, Math.max(1200, (text.length * 80) / speed));

      // ONLY play local preview audio if audio is routed to Virtual Cable AND user explicitly checked headphone preview
      if (isVirtualDevice && alsoHearHeadphonesCheckbox && alsoHearHeadphonesCheckbox.checked) {
        try {
          const previewAudio = new Audio(audioUrl);
          previewAudio.playbackRate = speed;
          previewAudio.volume = 0.5;
          await previewAudio.play();
        } catch (e) {
          console.warn('Preview audio note:', e);
        }
      }

    } catch (err) {
      console.warn('API Audio TTS error, falling back to Web Speech Synthesis:', err);
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = langCode;
        utterance.rate = speed;
        utterance.pitch = 1.0;

        utterance.onend = () => {
          setTTSActive(false);
          playTransmissionChime();
        };
        utterance.onerror = () => setTTSActive(false);

        if (availableVoices.length === 0) {
          availableVoices = window.speechSynthesis.getVoices();
        }

        const prefix = langCode.split('-')[0].toLowerCase();
        const matchedVoice = availableVoices.find(v => v.lang.toLowerCase().startsWith(prefix));
        if (matchedVoice) {
          utterance.voice = matchedVoice;
        }

        setTTSActive(true, Math.max(1200, (text.length * 80) / speed));
        window.speechSynthesis.speak(utterance);
      } else {
        setTTSActive(false);
      }
    }
  }

  // Audio Playback Button Handlers
  if (playOutboundAudioBtn) {
    playOutboundAudioBtn.addEventListener('click', () => {
      const text = lastOutboundTranslatedText || outboundTranslatedText.textContent;
      if (text && !text.includes('Translated voice output will stream')) {
        speakText(text, targetLanguageSelect.value, 'outbound', false);
      }
    });
  }

  if (playOutboundLocalAudioBtn) {
    playOutboundLocalAudioBtn.addEventListener('click', () => {
      const text = lastOutboundTranslatedText || outboundTranslatedText.textContent;
      if (text && !text.includes('Translated voice output will stream')) {
        speakText(text, targetLanguageSelect.value, 'outbound', true);
      } else {
        // If empty, play a quick test sample
        speakText('Hello! This is a test of your translated English voice preview.', targetLanguageSelect.value, 'outbound', true);
      }
    });
  }

  if (playInboundAudioBtn) {
    playInboundAudioBtn.addEventListener('click', () => {
      const text = lastInboundTranslatedText || inboundTranslatedText.textContent;
      if (text && !text.includes('Live translated audio')) {
        speakText(text, myLanguageSelect.value, 'inbound', true);
      } else {
        // If empty, play a quick test sample in Hindi
        speakText('नमस्ते! यह आपके इनबाउंड ट्रांसलेशन की आवाज़ का टेस्ट है।', myLanguageSelect.value, 'inbound', true);
      }
    });
  }

  // Copy to Clipboard Utility
  function copyTextToClipboard(element, label) {
    if (!element) return;
    const text = element.textContent.trim();
    if (!text || text.includes('Click "Start Live Mic Translator"') || text.includes('Listening for') || text.includes('Translated voice output will stream') || text.includes('Live translated audio')) {
      showToast('⚠️ No text to copy yet', 2000);
      return;
    }
    navigator.clipboard.writeText(text).then(() => {
      showToast(`📋 Copied ${label} to clipboard!`, 2200);
    }).catch(err => {
      showToast('❌ Copy failed: ' + err.message, 2500);
    });
  }

  if (copyOutboundOrigBtn) {
    copyOutboundOrigBtn.addEventListener('click', () => copyTextToClipboard(outboundOriginalText, 'your input speech'));
  }
  if (copyOutboundTransBtn) {
    copyOutboundTransBtn.addEventListener('click', () => copyTextToClipboard(outboundTranslatedText, 'translated speech'));
  }
  if (copyInboundOrigBtn) {
    copyInboundOrigBtn.addEventListener('click', () => copyTextToClipboard(inboundOriginalText, 'incoming meeting speech'));
  }
  if (copyInboundTransBtn) {
    copyInboundTransBtn.addEventListener('click', () => copyTextToClipboard(inboundTranslatedText, 'meeting subtitles'));
  }

  // Clear Transcripts & Session Log Handler
  if (clearTranscriptsBtn) {
    clearTranscriptsBtn.addEventListener('click', () => {
      outboundOriginalText.innerHTML = '<span class="placeholder">Click "Start Live Mic Translator" and speak into your mic, or type above and click Translate!</span>';
      outboundTranslatedText.innerHTML = '<span class="placeholder">Translated voice output will stream to Google Meet / Teams here...</span>';
      inboundOriginalText.innerHTML = '<span class="placeholder">Listening for incoming meeting speech...</span>';
      inboundTranslatedText.innerHTML = '<span class="placeholder">Live translated audio and subtitles for your ears...</span>';
      manualTextInput.value = '';
      if (inboundTextInput) inboundTextInput.value = '';
      lastOutboundTranslatedText = '';
      lastInboundTranslatedText = '';
      sessionTranscriptHistory.length = 0;
      updatePiPSubtitles();
      showToast('🧹 Transcripts and session log cleared', 2500);
    });
  }

  // Multi-Format Meeting Notes Export
  function exportTranscriptNotes(format = 'txt') {
    if (sessionTranscriptHistory.length === 0) {
      const outOrig = outboundOriginalText.textContent.trim();
      const outTrans = outboundTranslatedText.textContent.trim();
      const inOrig = inboundOriginalText.textContent.trim();
      const inTrans = inboundTranslatedText.textContent.trim();

      const hasOut = outOrig && !outOrig.includes('Click "Start Live Mic') && !outOrig.includes('Translator stopped');
      const hasIn = inOrig && !inOrig.includes('Listening for');

      if (!hasOut && !hasIn) {
        showToast('⚠️ No meeting notes to export yet. Translate or speak first!', 3000);
        return;
      }

      if (hasOut) {
        sessionTranscriptHistory.push({
          time: new Date().toLocaleTimeString(),
          speaker: 'You (Outbound)',
          original: outOrig,
          translated: outTrans,
          pair: `${LANG_NAMES[myLanguageSelect.value] || myLanguageSelect.value} ➔ ${LANG_NAMES[targetLanguageSelect.value] || targetLanguageSelect.value}`
        });
      }
      if (hasIn) {
        sessionTranscriptHistory.push({
          time: new Date().toLocaleTimeString(),
          speaker: 'Meeting (Inbound)',
          original: inOrig,
          translated: inTrans,
          pair: `${LANG_NAMES[targetLanguageSelect.value] || targetLanguageSelect.value} ➔ ${LANG_NAMES[myLanguageSelect.value] || myLanguageSelect.value}`
        });
      }
    }

    const dateStr = new Date().toISOString().split('T')[0];
    const filename = `OmniVoice_Meeting_${dateStr}.${format}`;
    let content = '';
    let mimeType = 'text/plain;charset=utf-8';

    if (format === 'md') {
      mimeType = 'text/markdown;charset=utf-8';
      content = `# 🎙️ OmniVoice AI — Meeting Minutes & Transcript\n\n`;
      content += `- **Date**: ${new Date().toLocaleString()}\n`;
      content += `- **Languages**: ${LANG_NAMES[myLanguageSelect.value] || myLanguageSelect.value} ⇄ ${LANG_NAMES[targetLanguageSelect.value] || targetLanguageSelect.value}\n`;
      content += `- **Platform**: ${document.getElementById('meetStatus')?.textContent || 'Universal Meeting'}\n`;
      content += `- **Total Exchanged Lines**: ${sessionTranscriptHistory.length}\n\n`;
      content += `## 📝 Chronological Dialogue Log\n\n`;
      content += `| Time | Speaker | Language Flow | Original Speech | Translated Speech |\n`;
      content += `| :--- | :--- | :--- | :--- | :--- |\n`;
      sessionTranscriptHistory.forEach(item => {
        content += `| ${item.time} | **${item.speaker}** | \`${item.pair}\` | ${item.original.replace(/\|/g, '\\|')} | ${item.translated.replace(/\|/g, '\\|')} |\n`;
      });
      content += `\n---\n*Exported via [OmniVoice AI](https://github.com/rajeshsahu777/OmniVoice-AI)*\n`;
    } else if (format === 'srt') {
      sessionTranscriptHistory.forEach((item, idx) => {
        const startSec = idx * 4;
        const endSec = startSec + 3;
        const fmtTime = (s) => {
          const hh = String(Math.floor(s / 3600)).padStart(2, '0');
          const mm = String(Math.floor((s % 3600) / 60)).padStart(2, '0');
          const ss = String(s % 60).padStart(2, '0');
          return `${hh}:${mm}:${ss},000`;
        };
        content += `${idx + 1}\n${fmtTime(startSec)} --> ${fmtTime(endSec)}\n[${item.speaker}] ${item.translated}\n\n`;
      });
    } else if (format === 'json') {
      mimeType = 'application/json;charset=utf-8';
      content = JSON.stringify({
        exportDate: new Date().toISOString(),
        platform: document.getElementById('meetStatus')?.textContent || 'Universal Meeting',
        entries: sessionTranscriptHistory
      }, null, 2);
    } else {
      content = `========================================================\r\n`;
      content += `  OMNIVOICE AI - MEETING TRANSCRIPT & TRANSLATION NOTES  \r\n`;
      content += `========================================================\r\n`;
      content += `Date: ${new Date().toLocaleString()}\r\n`;
      content += `Languages: ${LANG_NAMES[myLanguageSelect.value] || myLanguageSelect.value} <==> ${LANG_NAMES[targetLanguageSelect.value] || targetLanguageSelect.value}\r\n`;
      content += `Platform: ${document.getElementById('meetStatus')?.textContent || 'Google Meet'}\r\n`;
      content += `Total Entries: ${sessionTranscriptHistory.length}\r\n`;
      content += `========================================================\r\n\r\n`;

      sessionTranscriptHistory.forEach((item, idx) => {
        content += `[#${idx + 1} | ${item.time}] ${item.speaker} (${item.pair})\r\n`;
        content += `  Original:   "${item.original}"\r\n`;
        content += `  Translated: "${item.translated}"\r\n\r\n`;
      });

      content += `========================================================\r\n`;
      content += `Generated with OmniVoice AI (https://github.com/rajeshsahu777/OmniVoice-AI)\r\n`;
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast(`📥 Exported notes as ${format.toUpperCase()}!`, 2500);
  }

  // Export Menu Dropdown Toggle
  if (exportNotesBtn && exportMenu) {
    exportNotesBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      exportMenu.style.display = exportMenu.style.display === 'block' ? 'none' : 'block';
    });

    document.addEventListener('click', () => {
      if (exportMenu) exportMenu.style.display = 'none';
    });
  }

  if (exportOptionBtns) {
    exportOptionBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const fmt = btn.dataset.format || 'txt';
        if (exportMenu) exportMenu.style.display = 'none';
        exportTranscriptNotes(fmt);
      });
    });
  }

  // AI Meeting Minutes & Summary Generator Logic
  let currentSummaryMarkdown = '';
  async function generateMeetingSummary() {
    if (sessionTranscriptHistory.length === 0) {
      showToast('⚠️ No meeting dialogue yet to summarize. Have a conversation first!', 3000);
      return;
    }
    if (summaryModal) summaryModal.classList.add('open');
    if (summaryContentArea) summaryContentArea.textContent = '⏳ Analyzing transcript and extracting action items via OmniVoice AI...';

    try {
      const formattedEntries = sessionTranscriptHistory.map(item => ({
        channel: item.speaker.includes('Outbound') ? 'outbound' : 'inbound',
        text: item.original,
        translated: item.translated
      }));

      const res = await fetch('/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entries: formattedEntries })
      });

      if (res.ok) {
        const data = await res.json();
        currentSummaryMarkdown = data.summary;
        if (summaryContentArea) summaryContentArea.textContent = data.summary;
        if (summaryMetaText) summaryMetaText.textContent = `Analyzed ${data.totalEntries} entries at ${new Date().toLocaleTimeString()}`;
      } else {
        if (summaryContentArea) summaryContentArea.textContent = 'Could not generate summary from server API.';
      }
    } catch (err) {
      if (summaryContentArea) summaryContentArea.textContent = 'Summary generation error: ' + err.message;
    }
  }

  if (generateSummaryBtn) {
    generateSummaryBtn.addEventListener('click', generateMeetingSummary);
  }

  if (closeSummaryModalBtn && summaryModal) {
    closeSummaryModalBtn.addEventListener('click', () => {
      summaryModal.classList.remove('open');
    });
  }

  if (copySummaryBtn) {
    copySummaryBtn.addEventListener('click', async () => {
      if (summaryContentArea && summaryContentArea.textContent) {
        await navigator.clipboard.writeText(summaryContentArea.textContent);
        showToast('📋 AI Meeting Summary copied to clipboard!', 2500);
      }
    });
  }

  if (downloadSummaryBtn) {
    downloadSummaryBtn.addEventListener('click', () => {
      const text = currentSummaryMarkdown || summaryContentArea?.textContent;
      if (!text) return;
      const dateStr = new Date().toISOString().split('T')[0];
      const blob = new Blob([text], { type: 'text/markdown;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `OmniVoice_Meeting_Summary_${dateStr}.md`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('📥 Summary downloaded as .md!', 2500);
    });
  }

  // Microphone Mute Toggle & Push-To-Talk Logic
  function setMuteState(muted) {
    isMuted = muted;
    if (toggleMuteBtn) {
      if (isMuted) {
        toggleMuteBtn.classList.add('muted');
        if (muteIcon) muteIcon.textContent = '🔴';
        if (muteText) muteText.textContent = 'Mic Muted';
        showToast('🔴 Microphone Muted', 1500);
      } else {
        toggleMuteBtn.classList.remove('muted');
        if (muteIcon) muteIcon.textContent = '🎙️';
        if (muteText) muteText.textContent = 'Mic Live';
        showToast('🎙️ Microphone Live', 1500);
      }
    }
  }

  if (toggleMuteBtn) {
    toggleMuteBtn.addEventListener('click', () => {
      setMuteState(!isMuted);
    });
  }

  // Push-to-Talk (Spacebar) handling & Global Shortcuts
  window.addEventListener('keydown', (e) => {
    const activeTag = document.activeElement ? document.activeElement.tagName.toLowerCase() : '';
    if (activeTag === 'input' || activeTag === 'textarea' || activeTag === 'select') {
      return;
    }

    // Spacebar PTT
    if (e.code === 'Space' && pttModeCheckbox && pttModeCheckbox.checked) {
      if (isMuted) {
        setMuteState(false);
      }
      e.preventDefault();
    }

    // Ctrl + M: Toggle Mute
    if (e.ctrlKey && (e.key === 'm' || e.key === 'M')) {
      e.preventDefault();
      setMuteState(!isMuted);
    }

    // Ctrl + Shift + P: Float PiP Subtitles
    if (e.ctrlKey && e.shiftKey && (e.key === 'p' || e.key === 'P')) {
      e.preventDefault();
      if (togglePipBtn) togglePipBtn.click();
    }

    // Ctrl + Shift + E: Export Notes
    if (e.ctrlKey && e.shiftKey && (e.key === 'e' || e.key === 'E')) {
      e.preventDefault();
      exportTranscriptNotes('md');
    }
  });

  window.addEventListener('keyup', (e) => {
    const activeTag = document.activeElement ? document.activeElement.tagName.toLowerCase() : '';
    if (activeTag === 'input' || activeTag === 'textarea' || activeTag === 'select') {
      return;
    }

    if (e.code === 'Space' && pttModeCheckbox && pttModeCheckbox.checked) {
      setMuteState(true);
      e.preventDefault();
    }
  });

  if (pttModeCheckbox) {
    pttModeCheckbox.addEventListener('change', () => {
      if (pttModeCheckbox.checked) {
        setMuteState(true);
        showToast('🔘 Push-To-Talk active! Hold Spacebar to speak.', 3000);
      } else {
        setMuteState(false);
      }
    });
  }

  // Real-Time Transcript Search Filter
  if (transcriptSearchInput) {
    transcriptSearchInput.addEventListener('input', () => {
      const query = transcriptSearchInput.value.trim().toLowerCase();
      const highlight = (elem) => {
        if (!elem) return;
        if (!query) {
          elem.style.background = '';
          return;
        }
        if (elem.textContent.toLowerCase().includes(query)) {
          elem.style.background = 'rgba(139, 92, 246, 0.25)';
          elem.style.borderRadius = '8px';
        } else {
          elem.style.background = '';
        }
      };
      highlight(outboundOriginalText);
      highlight(outboundTranslatedText);
      highlight(inboundOriginalText);
      highlight(inboundTranslatedText);
    });
  }

  // Google Meet Tab Audio Capture Handler (Inbound Stream)
  if (captureTabAudioBtn) {
    captureTabAudioBtn.addEventListener('click', async () => {
      if (tabMediaStream) {
        tabMediaStream.getTracks().forEach(t => t.stop());
        tabMediaStream = null;
        captureTabAudioBtn.textContent = '📡 Capture Tab Audio';
        captureTabAudioBtn.style.background = '';
        inboundOriginalText.textContent = 'Tab audio capture stopped.';
        return;
      }

      try {
        tabMediaStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            googleAutoGainControl: true
          }
        });

        const audioTracks = tabMediaStream.getAudioTracks();
        if (audioTracks.length === 0) {
          alert('No audio track selected! Please check "Share tab audio" when picking your Google Meet tab.');
          tabMediaStream.getTracks().forEach(t => t.stop());
          tabMediaStream = null;
          return;
        }

        captureTabAudioBtn.textContent = '⏹ Stop Tab Capture';
        captureTabAudioBtn.style.background = 'rgba(239, 68, 68, 0.3)';
        inboundOriginalText.textContent = '📡 Capturing Google Meet tab audio live... Waiting for participant speech.';

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
          const inboundRec = new SpeechRecognition();
          inboundRec.continuous = true;
          inboundRec.interimResults = true;
          inboundRec.lang = targetLanguageSelect.value;

          inboundRec.onresult = (event) => {
            let finalStr = '';
            let interimStr = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
              if (event.results[i].isFinal) finalStr += event.results[i][0].transcript;
              else interimStr += event.results[i][0].transcript;
            }
            const txt = finalStr || interimStr;
            if (txt.trim().length > 0) {
              inboundOriginalText.textContent = txt;
              clearTimeout(translationDebounceTimer);
              translationDebounceTimer = setTimeout(() => {
                processTranslation(txt.trim(), 'inbound');
              }, 400);
            }
          };

          inboundRec.start();

          tabMediaStream.getVideoTracks()[0].onended = () => {
            try { inboundRec.stop(); } catch(e) {}
            tabMediaStream = null;
            captureTabAudioBtn.textContent = '📡 Capture Tab Audio';
            captureTabAudioBtn.style.background = '';
          };
        }

      } catch (err) {
        console.error('Tab capture error:', err);
      }
    });
  }

  // Handle Incoming Speech Packets
  function handleIncomingPacket(packet) {
    if (packet.channel === 'outbound') {
      outboundTranslatedText.textContent = packet.translatedText;
    } else {
      inboundOriginalText.textContent = packet.originalText;
      inboundTranslatedText.textContent = packet.translatedText;
      speakText(packet.translatedText, myLanguageSelect.value);
    }
  }

  // Manual Translate Button Click Handler (Outbound)
  function handleManualTranslation() {
    const text = manualTextInput.value.trim();
    if (text.length > 0) {
      outboundOriginalText.textContent = text;
      processTranslation(text, 'outbound');
    }
  }

  // Inbound Simulation Handler
  function handleInboundSimulation() {
    const text = inboundTextInput.value.trim();
    if (text.length > 0) {
      inboundOriginalText.textContent = text;
      processTranslation(text, 'inbound');
    }
  }

  translateNowBtn.addEventListener('click', handleManualTranslation);
  manualTextInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleManualTranslation();
  });

  if (translateInboundBtn) {
    translateInboundBtn.addEventListener('click', handleInboundSimulation);
  }
  if (inboundTextInput) {
    inboundTextInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') handleInboundSimulation();
    });
  }

  // Toggle Live Translator
  toggleLiveBtn.addEventListener('click', async () => {
    if (!isLive) {
      try {
        micStream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          }
        });
        
        // Setup AudioContext for live Mic volume visualizer
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const source = audioCtx.createMediaStreamSource(micStream);
        micAnalyser = audioCtx.createAnalyser();
        micAnalyser.fftSize = 64;
        dataArray = new Uint8Array(micAnalyser.frequencyBinCount);
        source.connect(micAnalyser);

      } catch (err) {
        alert('Microphone permission required for OmniVoice AI.');
        return;
      }

      if (!recognition) {
        recognition = initSpeechRecognition();
      }

      if (recognition) {
        recognition.lang = myLanguageSelect.value;
        try {
          recognition.start();
        } catch (e) {}
      }

      isLive = true;
      toggleLiveBtn.classList.add('active');
      btnIcon.textContent = '⏹';
      btnText.textContent = 'Stop Live Mic Translator';
      outboundOriginalText.textContent = `Listening to your voice in ${LANG_NAMES[myLanguageSelect.value] || 'your language'}... Speak into your mic!`;

    } else {
      isLive = false;
      if (recognition) {
        try { recognition.stop(); } catch (e) {}
      }
      if (micStream) {
        micStream.getTracks().forEach(track => track.stop());
      }
      if (audioCtx) {
        try { audioCtx.close(); } catch(e) {}
      }
      toggleLiveBtn.classList.remove('active');
      btnIcon.textContent = '▶';
      btnText.textContent = 'Start Live Mic Translator';
      outboundOriginalText.innerHTML = '<span class="placeholder">Translator stopped. Click Start to resume.</span>';
    }
  });

  // Modal Control Logic
  function openModal() { setupModal.classList.add('open'); }
  function closeModal() { setupModal.classList.remove('open'); }

  guideBtn.addEventListener('click', openModal);
  openWizardBtn.addEventListener('click', openModal);
  closeModalBtn.addEventListener('click', closeModal);
  confirmWizardBtn.addEventListener('click', closeModal);

  // Floating Picture-in-Picture (PiP) Subtitle Overlay Logic

  function updatePiPSubtitles(outboundText = '', inboundText = '') {
    if (!pipCtx) return;

    // Draw dark semi-transparent glass background
    pipCtx.fillStyle = '#070913';
    pipCtx.fillRect(0, 0, pipCanvas.width, pipCanvas.height);

    // Border glow
    pipCtx.strokeStyle = '#8b5cf6';
    pipCtx.lineWidth = 4;
    pipCtx.strokeRect(0, 0, pipCanvas.width, pipCanvas.height);

    // Title / Status line
    pipCtx.fillStyle = '#c4b5fd';
    pipCtx.font = 'bold 15px Outfit, sans-serif';
    pipCtx.fillText('🎙️ OmniVoice AI — Live Subtitle Float (Always-on-Top)', 15, 30);

    // Outbound subtitle (Your Spoken Speech)
    pipCtx.fillStyle = '#67e8f9';
    pipCtx.font = '600 13px Inter, sans-serif';
    const outDisplay = outboundText || lastOutboundTranslatedText || 'Listening for your voice...';
    pipCtx.fillText('YOU: ' + (outDisplay.length > 55 ? outDisplay.slice(0, 52) + '...' : outDisplay), 15, 75);

    // Inbound subtitle (Meeting Member's Speech)
    pipCtx.fillStyle = '#f472b6';
    pipCtx.font = '600 13px Inter, sans-serif';
    const inDisplay = inboundText || lastInboundTranslatedText || 'Waiting for meeting speech...';
    pipCtx.fillText('MEETING: ' + (inDisplay.length > 55 ? inDisplay.slice(0, 52) + '...' : inDisplay), 15, 120);
  }

  if (togglePipBtn && pipCanvas && pipVideo) {
    updatePiPSubtitles();

    togglePipBtn.addEventListener('click', async () => {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture().catch(() => {});
        togglePipBtn.textContent = '📺 Float Subtitles (PiP)';
        return;
      }

      try {
        const stream = pipCanvas.captureStream(30);
        pipVideo.srcObject = stream;

        await new Promise((resolve) => {
          pipVideo.onloadedmetadata = () => resolve();
          if (pipVideo.readyState >= 1) resolve();
          setTimeout(resolve, 300);
        });

        await pipVideo.play();
        await pipVideo.requestPictureInPicture();
        togglePipBtn.textContent = '⏹ Close Subtitle Float';

        pipVideo.addEventListener('leavepictureinpicture', () => {
          togglePipBtn.textContent = '📺 Float Subtitles (PiP)';
        }, { once: true });
      } catch (err) {
        alert('Picture-in-Picture Floating Overlay requires user interaction or browser PiP permissions.');
        console.warn('PiP Error:', err);
      }
    });
  }

  // Platform Selector Presets
  const platformChips = document.querySelectorAll('.platform-chip');
  const platformGuideHint = document.getElementById('platformGuideHint');

  const PLATFORM_PRESETS = {
    meet: {
      status: 'Google Meet Ready',
      hint: 'Google Meet: Captures Tab Audio + Virtual Cable Mic Outbound'
    },
    zoom: {
      status: 'Zoom App Ready',
      hint: 'Zoom: System Loopback / Desktop Mic + Virtual Cable Audio'
    },
    teams: {
      status: 'MS Teams Ready',
      hint: 'MS Teams: Browser Tab / System Audio Bridge + Virtual Cable'
    },
    discord: {
      status: 'Discord / WhatsApp Ready',
      hint: 'Discord / WhatsApp: High Quality Direct Mic & Audio Cable Routing'
    }
  };

  platformChips.forEach(chip => {
    chip.addEventListener('click', () => {
      platformChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');

      const platKey = chip.dataset.platform;
      const preset = PLATFORM_PRESETS[platKey] || PLATFORM_PRESETS.meet;

      const statusElem = document.getElementById('meetStatus');
      if (statusElem) statusElem.textContent = preset.status;
      if (platformGuideHint) platformGuideHint.textContent = preset.hint;
    });
  });

  // Global Preset Runner Function
  window.runPreset = function(srcLang, tgtLang, text, channel = 'outbound') {
    myLanguageSelect.value = srcLang;
    targetLanguageSelect.value = tgtLang;
    updateLanguageLabels();

    if (channel === 'outbound') {
      manualTextInput.value = text;
      outboundOriginalText.textContent = text;
      processTranslation(text, 'outbound');
    } else {
      inboundTextInput.value = text;
      inboundOriginalText.textContent = text;
      processTranslation(text, 'inbound');
    }
  };

  // Run initialization
  updateLanguageLabels();
  initWebSocket();
  startVisualizers();
  populateAudioDevices();
});
