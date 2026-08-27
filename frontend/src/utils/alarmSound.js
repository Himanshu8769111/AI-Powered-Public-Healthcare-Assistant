// Web Audio API Alarm Sound Synthesizer
// Works 100% offline, cross-browser, requiring no external MP3/audio files.

let alarmInterval = null;
let audioCtx = null;

export function startAlarmSound() {
  stopAlarmSound(); // Stop any running alarm sound loop
  
  const playPulse = () => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      
      if (!audioCtx || audioCtx.state === 'closed') {
        audioCtx = new AudioContext();
      }
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }

      const now = audioCtx.currentTime;

      // Tone 1: High beep (880 Hz - A5)
      const osc1 = audioCtx.createOscillator();
      const gain1 = audioCtx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(880, now);
      gain1.gain.setValueAtTime(0.4, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc1.connect(gain1);
      gain1.connect(audioCtx.destination);
      osc1.start(now);
      osc1.stop(now + 0.25);

      // Tone 2: Higher chime (1046.5 Hz - C6)
      const osc2 = audioCtx.createOscillator();
      const gain2 = audioCtx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(1046.5, now + 0.3);
      gain2.gain.setValueAtTime(0.4, now + 0.3);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
      osc2.connect(gain2);
      gain2.connect(audioCtx.destination);
      osc2.start(now + 0.3);
      osc2.stop(now + 0.55);

      // Tone 3: Harmonic chime (1318.5 Hz - E6)
      const osc3 = audioCtx.createOscillator();
      const gain3 = audioCtx.createGain();
      osc3.type = 'triangle';
      osc3.frequency.setValueAtTime(1318.5, now + 0.6);
      gain3.gain.setValueAtTime(0.5, now + 0.6);
      gain3.gain.exponentialRampToValueAtTime(0.001, now + 1.0);
      osc3.connect(gain3);
      gain3.connect(audioCtx.destination);
      osc3.start(now + 0.6);
      osc3.stop(now + 1.0);

    } catch (e) {
      console.error("Web Audio error:", e);
    }
  };

  playPulse();
  alarmInterval = setInterval(playPulse, 2200);
}

export function stopAlarmSound() {
  if (alarmInterval) {
    clearInterval(alarmInterval);
    alarmInterval = null;
  }
  if (audioCtx && audioCtx.state !== 'closed') {
    try {
      audioCtx.close();
    } catch(e) {}
    audioCtx = null;
  }
}

export function testAlarmSound() {
  startAlarmSound();
  setTimeout(() => {
    stopAlarmSound();
  }, 3500);
}
