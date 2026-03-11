import type { SinType } from "@shared/gameTypes";
import React, { useEffect, useRef } from 'react';

interface SinDroneProps {
  sin: SinType;
  volume: number;
  isActive: boolean;
}

const SinDrone: React.FC<SinDroneProps> = ({ sin, volume, isActive }) => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const nodesRef = useRef<{
    oscillators: OscillatorNode[];
    gainNodes: GainNode[];
    filterNodes: BiquadFilterNode[];
    delayNodes: DelayNode[];
    masterGain: GainNode | null;
    lfoOscillators: OscillatorNode[];
    lfoGains: GainNode[];
    noiseBuffer: AudioBuffer | null;
    noiseSource: AudioBufferSourceNode | null;
  }>({
    oscillators: [],
    gainNodes: [],
    filterNodes: [],
    delayNodes: [],
    masterGain: null,
    lfoOscillators: [],
    lfoGains: [],
    noiseBuffer: null,
    noiseSource: null
  });
  const currentSinRef = useRef<string>('');

  const createNoiseBuffer = (audioContext: AudioContext): AudioBuffer => {
    const bufferSize = audioContext.sampleRate * 2;
    const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    return buffer;
  };

  const cleanupNodes = () => {
    const nodes = nodesRef.current;
    
    nodes.oscillators.forEach(osc => {
      try {
        osc.stop();
        osc.disconnect();
      } catch (e) {}
    });
    
    nodes.lfoOscillators.forEach(lfo => {
      try {
        lfo.stop();
        lfo.disconnect();
      } catch (e) {}
    });
    
    if (nodes.noiseSource) {
      try {
        nodes.noiseSource.stop();
        nodes.noiseSource.disconnect();
      } catch (e) {}
    }
    
    nodes.gainNodes.forEach(gain => gain.disconnect());
    nodes.filterNodes.forEach(filter => filter.disconnect());
    nodes.delayNodes.forEach(delay => delay.disconnect());
    nodes.lfoGains.forEach(gain => gain.disconnect());
    
    if (nodes.masterGain) {
      nodes.masterGain.disconnect();
    }
    
    nodesRef.current = {
      oscillators: [],
      gainNodes: [],
      filterNodes: [],
      delayNodes: [],
      masterGain: null,
      lfoOscillators: [],
      lfoGains: [],
      noiseBuffer: nodes.noiseBuffer,
      noiseSource: null
    };
  };

  const createWrathDrone = (audioContext: AudioContext) => {
    const masterGain = audioContext.createGain();
    masterGain.gain.setValueAtTime(0, audioContext.currentTime);
    masterGain.connect(audioContext.destination);
    
    const osc1 = audioContext.createOscillator();
    const osc2 = audioContext.createOscillator();
    const gain1 = audioContext.createGain();
    const gain2 = audioContext.createGain();
    const filter = audioContext.createBiquadFilter();
    const lfo = audioContext.createOscillator();
    const lfoGain = audioContext.createGain();
    
    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(40, audioContext.currentTime);
    osc2.type = 'sawtooth';
    osc2.frequency.setValueAtTime(80, audioContext.currentTime);
    
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(0.5, audioContext.currentTime);
    lfoGain.gain.setValueAtTime(0.3, audioContext.currentTime);
    
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(200, audioContext.currentTime);
    filter.Q.setValueAtTime(2, audioContext.currentTime);
    
    gain1.gain.setValueAtTime(0.4, audioContext.currentTime);
    gain2.gain.setValueAtTime(0.3, audioContext.currentTime);
    
    osc1.connect(gain1);
    osc2.connect(gain2);
    gain1.connect(filter);
    gain2.connect(filter);
    filter.connect(masterGain);
    
    lfo.connect(lfoGain);
    lfoGain.connect(masterGain.gain);
    
    osc1.start();
    osc2.start();
    lfo.start();
    
    nodesRef.current = {
      ...nodesRef.current,
      oscillators: [osc1, osc2],
      gainNodes: [gain1, gain2],
      filterNodes: [filter],
      masterGain,
      lfoOscillators: [lfo],
      lfoGains: [lfoGain]
    };
  };

  const createSlothDrone = (audioContext: AudioContext) => {
    const masterGain = audioContext.createGain();
    masterGain.gain.setValueAtTime(0, audioContext.currentTime);
    masterGain.connect(audioContext.destination);
    
    const delay = audioContext.createDelay(1);
    const delayGain = audioContext.createGain();
    const delayFeedback = audioContext.createGain();
    
    delay.delayTime.setValueAtTime(0.3, audioContext.currentTime);
    delayGain.gain.setValueAtTime(0.4, audioContext.currentTime);
    delayFeedback.gain.setValueAtTime(0.2, audioContext.currentTime);
    
    const frequencies = [220, 275, 330];
    const oscillators: OscillatorNode[] = [];
    const gains: GainNode[] = [];
    const lfo = audioContext.createOscillator();
    const lfoGain = audioContext.createGain();
    
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(0.2, audioContext.currentTime);
    lfoGain.gain.setValueAtTime(0.1, audioContext.currentTime);
    
    frequencies.forEach(freq => {
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, audioContext.currentTime);
      gain.gain.setValueAtTime(0.2, audioContext.currentTime);
      
      osc.connect(gain);
      gain.connect(delay);
      gain.connect(masterGain);
      
      osc.start();
      oscillators.push(osc);
      gains.push(gain);
    });
    
    delay.connect(delayGain);
    delayGain.connect(delayFeedback);
    delayFeedback.connect(delay);
    delayGain.connect(masterGain);
    
    lfo.connect(lfoGain);
    lfoGain.connect(masterGain.gain);
    lfo.start();
    
    nodesRef.current = {
      ...nodesRef.current,
      oscillators,
      gainNodes: [...gains, delayGain, delayFeedback],
      delayNodes: [delay],
      masterGain,
      lfoOscillators: [lfo],
      lfoGains: [lfoGain]
    };
  };

  const createGreedDrone = (audioContext: AudioContext) => {
    if (!nodesRef.current.noiseBuffer) {
      nodesRef.current.noiseBuffer = createNoiseBuffer(audioContext);
    }
    
    const masterGain = audioContext.createGain();
    masterGain.gain.setValueAtTime(0, audioContext.currentTime);
    masterGain.connect(audioContext.destination);
    
    const filter1 = audioContext.createBiquadFilter();
    const filter2 = audioContext.createBiquadFilter();
    const gain1 = audioContext.createGain();
    const delay = audioContext.createDelay(1);
    const delayGain = audioContext.createGain();
    const lfo = audioContext.createOscillator();
    const lfoGain = audioContext.createGain();
    
    filter1.type = 'bandpass';
    filter1.frequency.setValueAtTime(4000, audioContext.currentTime);
    filter1.Q.setValueAtTime(10, audioContext.currentTime);
    
    filter2.type = 'highpass';
    filter2.frequency.setValueAtTime(2000, audioContext.currentTime);
    
    delay.delayTime.setValueAtTime(0.1, audioContext.currentTime);
    delayGain.gain.setValueAtTime(0.3, audioContext.currentTime);
    gain1.gain.setValueAtTime(0.1, audioContext.currentTime);
    
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(3, audioContext.currentTime);
    lfoGain.gain.setValueAtTime(0.5, audioContext.currentTime);
    
    const noiseSource = audioContext.createBufferSource();
    noiseSource.buffer = nodesRef.current.noiseBuffer;
    noiseSource.loop = true;
    
    noiseSource.connect(filter1);
    filter1.connect(filter2);
    filter2.connect(gain1);
    gain1.connect(delay);
    gain1.connect(masterGain);
    delay.connect(delayGain);
    delayGain.connect(masterGain);
    
    lfo.connect(lfoGain);
    lfoGain.connect(gain1.gain);
    
    noiseSource.start();
    lfo.start();
    
    nodesRef.current = {
      ...nodesRef.current,
      gainNodes: [gain1, delayGain],
      filterNodes: [filter1, filter2],
      delayNodes: [delay],
      masterGain,
      lfoOscillators: [lfo],
      lfoGains: [lfoGain],
      noiseSource
    };
  };

  const createEnvyDrone = (audioContext: AudioContext) => {
    const masterGain = audioContext.createGain();
    masterGain.gain.setValueAtTime(0, audioContext.currentTime);
    masterGain.connect(audioContext.destination);
    
    const osc1 = audioContext.createOscillator();
    const osc2 = audioContext.createOscillator();
    const gain1 = audioContext.createGain();
    const gain2 = audioContext.createGain();
    const filter = audioContext.createBiquadFilter();
    
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(300, audioContext.currentTime);
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(303, audioContext.currentTime);
    
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, audioContext.currentTime);
    filter.Q.setValueAtTime(1, audioContext.currentTime);
    
    gain1.gain.setValueAtTime(0.3, audioContext.currentTime);
    gain2.gain.setValueAtTime(0.3, audioContext.currentTime);
    
    osc1.connect(gain1);
    osc2.connect(gain2);
    gain1.connect(filter);
    gain2.connect(filter);
    filter.connect(masterGain);
    
    osc1.start();
    osc2.start();
    
    nodesRef.current = {
      ...nodesRef.current,
      oscillators: [osc1, osc2],
      gainNodes: [gain1, gain2],
      filterNodes: [filter],
      masterGain
    };
  };

  const createDrone = (sin: string) => {
    if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
      audioContextRef.current = new AudioContext();
    }
    
    const audioContext = audioContextRef.current;
    
    if (audioContext.state === 'suspended') {
      audioContext.resume();
    }
    
    cleanupNodes();
    
    switch (sin) {
      case 'wrath':
        createWrathDrone(audioContext);
        break;
      case 'sloth':
        createSlothDrone(audioContext);
        break;
      case 'greed':
        createGreedDrone(audioContext);
        break;
      case 'envy':
        createEnvyDrone(audioContext);
        break;
      case 'pride':
        createWrathDrone(audioContext); // Reuse wrath drone with different character
        break;
      case 'lust':
        createSlothDrone(audioContext); // Reuse sloth drone - similar ethereal feel
        break;
      case 'gluttony':
        createGreedDrone(audioContext); // Reuse greed drone - similar rumbling feel
        break;
    }
    
    currentSinRef.current = sin;
  };

  useEffect(() => {
    if (isActive && sin !== currentSinRef.current) {
      createDrone(sin);
    }
    
    if (nodesRef.current.masterGain && audioContextRef.current) {
      const targetVolume = isActive ? volume * 0.3 : 0;
      const currentTime = audioContextRef.current.currentTime;
      
      nodesRef.current.masterGain.gain.cancelScheduledValues(currentTime);
      nodesRef.current.masterGain.gain.setValueAtTime(
        nodesRef.current.masterGain.gain.value,
        currentTime
      );
      nodesRef.current.masterGain.gain.linearRampToValueAtTime(
        targetVolume,
        currentTime + 0.5
      );
    }
  }, [sin, volume, isActive]);

  useEffect(() => {
    return () => {
      cleanupNodes();
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
    };
  }, []);

  return null;
};

export default SinDrone;
