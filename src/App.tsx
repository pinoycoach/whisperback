import React, { useState, useRef, useEffect } from 'react';
import { WhisperGift } from './types';
import { LOADING_MESSAGES, GIFT_MODES, GiftMode } from './constants';
import {
  Sparkles, Play, Pause, Volume2, Stars, BookOpen, Download, ShieldCheck
} from 'lucide-react';

const SAMPLE_RATE = 24000;

const decodeAudioData = (base64: string): Float32Array => {
  const binaryString = atob(base64);
  const dataInt16 = new Int16Array(new Uint8Array(Array.from(binaryString, c => c.charCodeAt(0))).buffer);
  const float32 = new Float32Array(dataInt16.length);
  for (let i = 0; i < dataInt16.length; i++) float32[i] = dataInt16[i] / 32768.0;
  return float32;
};

const createWavUrl = (base64: string): string => {
  const binaryString = atob(base64);
  const buffer = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) buffer[i] = binaryString.charCodeAt(i);
  
  const wavHeader = new Uint8Array(44);
  const view = new DataView(wavHeader.buffer);
  const writeS = (o: number, s: string) => { for (let i = 0; i < s.length; i++) view.setUint8(o + i, s.charCodeAt(i)); };
  
  writeS(0, 'RIFF');
  view.setUint32(4, 36 + buffer.length, true);
  writeS(8, 'WAVE');
  writeS(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, SAMPLE_RATE, true);
  view.setUint32(28, SAMPLE_RATE * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeS(36, 'data');
  view.setUint32(40, buffer.length, true);
  
  return URL.createObjectURL(new Blob([wavHeader, buffer], { type: 'audio/wav' }));
};

const App: React.FC = () => {
  const [view, setView] = useState<'input' | 'generating' | 'preview'>('input');
  const [input, setInput] = useState("");
  const [selectedMode, setSelectedMode] = useState<GiftMode>('encouragement');
  const [includeVerse, setIncludeVerse] = useState(false);
  const [gift, setGift] = useState<WhisperGift | null>(null);
  const [loadingMsg, setLoadingMsg] = useState(LOADING_MESSAGES[0]);
  
  const handleDraft = async () => {
    if (!input.trim()) return;
    setView('generating');
    setLoadingMsg("Deep listening...");
    
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          occasion: input,
          mode: selectedMode,
          includeVerse
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setGift({
          id: data.id,
          occasion: input,
          message: data.message,
          quote: data.quote,
          imageUrl: data.imageUrl,
          audioBase64: data.audioBase64,
          imagePrompt: ''
        });
        setView('preview');
      } else {
        throw new Error(data.error || 'Generation failed');
      }
    } catch (e) {
      console.error('Generation failed:', e);
      setView('input');
      alert('Failed to generate whisper. Please try again.');
    }
  };

  const handlePurchase = async () => {
    if (!gift?.id) return;
    
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ whisperId: gift.id })
      });
      
      const data = await response.json();
      
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (e) {
      console.error('Checkout failed:', e);
      alert('Failed to initiate checkout. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-['Lato'] flex flex-col items-center justify-center overflow-hidden relative selection:bg-amber-500/30">
      
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute -top-1/4 -left-1/4 w-[70%] h-[70%] rounded-full blur-[160px] transition-all duration-[2000ms] opacity-20 ${includeVerse ? 'bg-amber-600' : selectedMode === 'encouragement' ? 'bg-blue-900' : selectedMode === 'mantra' ? 'bg-indigo-900' : 'bg-purple-900'}`}></div>
      </div>

      <div className="relative z-10 w-full max-w-md px-6 flex flex-col h-[92vh] justify-between py-10">
        <div className="flex items-center justify-center gap-3 opacity-30">
          <Stars size={12} />
          <h1 className="font-['Cinzel'] text-[9px] tracking-[0.6em] font-bold uppercase">WhisperBack</h1>
        </div>

        {view === 'input' && (
          <div className="flex-1 flex flex-col justify-center space-y-12">
            <h2 className="text-4xl font-light tracking-tight leading-[1.2] text-center">
              What do you need to hear?
            </h2>

            <div className="grid grid-cols-3 gap-2">
              {GIFT_MODES.map(mode => (
                <button
                  key={mode.id}
                  onClick={() => setSelectedMode(mode.id)}
                  className={`flex flex-col items-center p-4 rounded-[2rem] border transition-all duration-700 ${selectedMode === mode.id ? 'bg-white/5 border-white/20' : 'bg-transparent border-transparent opacity-40 hover:opacity-70'}`}
                >
                  <span className="text-2xl mb-1">{mode.icon}</span>
                  <span className="text-[8px] uppercase tracking-widest font-black">{mode.label}</span>
                </button>
              ))}
            </div>

            <div className="space-y-10">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Share your heart..."
                className="w-full bg-transparent text-2xl font-light text-center border-b border-white/5 py-4 focus:border-white/20 outline-none placeholder:text-white/5 transition-all"
              />

              <div className="flex flex-col items-center gap-6">
                <button 
                  onClick={() => setIncludeVerse(!includeVerse)}
                  className={`group flex items-center gap-3 px-6 py-3 rounded-full border transition-all duration-1000 ${includeVerse ? 'bg-amber-900/20 border-amber-500/40 text-amber-100 shadow-[0_0_50px_rgba(245,158,11,0.1)] scale-105' : 'bg-white/5 border-white/5 text-white/20 hover:text-white/40'}`}
                >
                  <BookOpen size={12} className={includeVerse ? "animate-pulse" : ""} />
                  <span className="text-[9px] uppercase tracking-[0.3em] font-bold">Still Small Voice</span>
                  {includeVerse && <div className="w-1 h-1 bg-amber-400 rounded-full animate-ping"></div>}
                </button>

                <button
                  onClick={handleDraft}
                  disabled={!input.trim()}
                  className="w-full group bg-white text-black font-bold py-6 rounded-full transition-all hover:scale-[1.01] active:scale-95 disabled:opacity-20 flex items-center justify-center gap-3"
                >
                  <Sparkles size={16} />
                  <span className="uppercase tracking-[0.4em] text-[9px]">Begin</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {view === 'generating' && (
          <div className="flex-1 flex flex-col items-center justify-center space-y-12">
            <div className="relative w-12 h-12 flex items-center justify-center">
               <div className="absolute inset-0 border-t border-white/40 rounded-full animate-spin"></div>
               <Stars className="text-white/10 animate-pulse" size={20} />
            </div>
            <p className="text-[9px] uppercase tracking-[0.5em] font-light text-white/30">{loadingMsg}</p>
          </div>
        )}

        {view === 'preview' && gift && (
          <div className="flex-1 flex flex-col items-center space-y-8">
            <div className="w-full aspect-[4/5] rounded-[2.5rem] overflow-hidden border border-white/5 relative shadow-2xl bg-[#0a0a0a]">
              <img src={gift.imageUrl} className="w-full h-full object-cover opacity-50" alt="" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent p-10 flex items-end">
                <p className="italic text-2xl leading-relaxed text-white/80">"{gift.message}"</p>
              </div>
            </div>
            
            <div className="w-full space-y-4">
              <button 
                onClick={handlePurchase}
                className="w-full bg-white text-black py-6 rounded-full uppercase tracking-[0.4em] text-[9px] font-bold hover:bg-zinc-200 transition-all flex items-center justify-center gap-3 shadow-xl active:scale-95"
              >
                <Download size={16} /> Keep Forever - $2.99
              </button>
              <button 
                onClick={() => setView('input')}
                className="w-full bg-zinc-900/50 border border-white/5 py-4 rounded-full uppercase tracking-[0.4em] text-[9px] font-bold hover:bg-zinc-800 transition-all text-white/40 hover:text-white/70"
              >
                Create Another
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
