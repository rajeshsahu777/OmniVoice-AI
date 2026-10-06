/**
 * OmniVoice AI - Comprehensive Integration Test Suite
 */

const http = require('http');

async function runTests() {
  console.log('==================================================');
  console.log('🧪 OmniVoice AI - Running Integration Test Suite');
  console.log('==================================================\n');

  // Launch server in-process for testing
  const server = require('./server.js');
  await new Promise(resolve => setTimeout(resolve, 800));

  let totalTests = 0;
  let passedTests = 0;

  async function assertTest(name, fn) {
    totalTests++;
    process.stdout.write(`[Test ${totalTests}] ${name} ... `);
    try {
      await fn();
      console.log('✅ PASSED');
      passedTests++;
    } catch (err) {
      console.log('❌ FAILED:', err.message);
    }
  }

  // Test 1: Health check endpoint
  await assertTest('GET /api/health returns healthy status', async () => {
    const res = await fetch('http://localhost:3000/api/health');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (data.status !== 'healthy') throw new Error(`Unexpected status: ${data.status}`);
    if (typeof data.supportedLanguagesCount !== 'number' || data.supportedLanguagesCount < 50) {
      throw new Error(`Invalid languages count: ${data.supportedLanguagesCount}`);
    }
  });

  // Test 2: Languages catalog endpoint
  await assertTest('GET /api/languages returns 70+ languages', async () => {
    const res = await fetch('http://localhost:3000/api/languages');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!data.languages || data.languages.length < 50) {
      throw new Error(`Expected at least 50 languages, got ${data.languages?.length}`);
    }
    const hasHindi = data.languages.some(l => l.code === 'hi');
    const hasEnglish = data.languages.some(l => l.code === 'en');
    if (!hasHindi || !hasEnglish) throw new Error('Hindi or English missing from catalog');
  });

  // Test 3: Translation Endpoint (Hindi -> English)
  await assertTest('POST /api/translate handles Hindi to English', async () => {
    const res = await fetch('http://localhost:3000/api/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: 'नमस्ते दुनिया',
        sourceLang: 'hi',
        targetLang: 'en'
      })
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!data.translatedText || !data.translatedText.toLowerCase().includes('world')) {
      throw new Error(`Unexpected translation output: ${data.translatedText}`);
    }
  });

  // Test 4: Translation Endpoint (English -> Spanish)
  await assertTest('POST /api/translate handles English to Spanish', async () => {
    const res = await fetch('http://localhost:3000/api/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: 'Good morning, how are you?',
        sourceLang: 'en',
        targetLang: 'es'
      })
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!data.translatedText || (!data.translatedText.toLowerCase().includes('buenos') && !data.translatedText.toLowerCase().includes('cómo'))) {
      throw new Error(`Unexpected translation output: ${data.translatedText}`);
    }
  });

  // Test 5: AI Meeting Summary Generator
  await assertTest('POST /api/summarize extracts meeting minutes & action items', async () => {
    const res = await fetch('http://localhost:3000/api/summarize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        entries: [
          { channel: 'outbound', text: 'नमस्ते, क्या आप मेरी आवाज़ सुन सकते हैं?', translated: 'Hello, can you hear my voice?' },
          { channel: 'inbound', text: 'Yes, we hear you loud and clear. Welcome to the call.', translated: 'हाँ, हम आपको साफ़ सुन सकते हैं। कॉल में स्वागत है।' },
          { channel: 'outbound', text: 'I will deliver the release by Friday.', translated: 'मैं शुक्रवार तक रिलीज़ वितरित करूँगा।' }
        ]
      })
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!data.success || !data.summary.includes('Meeting Summary') || !data.summary.includes('Action Items')) {
      throw new Error('Summary payload malformed');
    }
  });

  // Test 6: TTS Audio Endpoint
  await assertTest('GET /api/tts returns valid audio/mpeg stream', async () => {
    const res = await fetch('http://localhost:3000/api/tts?text=OmniVoice%20AI&lang=en');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const contentType = res.headers.get('content-type');
    if (!contentType || !contentType.includes('audio')) {
      throw new Error(`Expected audio content-type, got ${contentType}`);
    }
    const buffer = await res.arrayBuffer();
    if (buffer.byteLength < 50) {
      throw new Error(`Audio buffer too small: ${buffer.byteLength} bytes`);
    }
  });

  console.log('\n==================================================');
  console.log(`🎉 Results: ${passedTests}/${totalTests} tests passed!`);
  console.log('==================================================\n');

  if (passedTests === totalTests) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Test suite runner error:', err);
  process.exit(1);
});
