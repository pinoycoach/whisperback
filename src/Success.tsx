import React, { useEffect, useState } from 'react';
import { Download, Share2, CheckCircle } from 'lucide-react';

interface WhisperData {
  id: string;
  message: string;
  quote: string;
  imageUrl: string;
  audioBase64: string;
}

const createWavUrl = (base64: string): string => {
  const binaryString = atob(base64);
  const buffer = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) buffer[i] = binaryString.charCodeAt(i);
  
  const wavHeader = new Uint8Array(44);
  const view = new DataView(wavHeader.buffer);
  const writeS = (o: number, s: string) => { 
    for (let i = 0; i < s.length; i++) view.setUint8(o + i, s.charCodeAt(i)); 
  };
  
  writeS(0, 'RIFF');
  view.setUint32(4, 36 + buffer.length, true);
  writeS(8, 'WAVE');
  writeS(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, 24000, true);
  view.setUint32(28, 48000, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeS(36, 'data');
  view.setUint32(40, buffer.length, true);
  
  return URL.createObjectURL(new Blob([wavHeader, buffer], { type: 'audio/wav' }));
};

const SuccessPage: React.FC = () => {
  const [whisper, setWhisper] = useState<WhisperData | null>(null);
  const [loading, setLoading] = useState(true);
  const [shareableLink, setShareableLink] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const whisperId = params.get('whisper_id');
    
    if (whisperId) {
      fetch(`/api/whisper/${whisperId}`)
        .then(res => res.json())
        .then(data => {
          if (data.id) {
            setWhisper(data);
            setShareableLink(`${window.location.origin}/share/${whisperId}`);
          }
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, []);

  const handleDownload = () => {
    if (!whisper?.audioBase64) return;
    const url = createWavUrl(whisper.audioBase64);
    const a = document.createElement('a');
    a.href = url;
    a.download = `whisperback-${Date.now()}.wav`;
    a.click();
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'WhisperBack',
        text: 'Listen to this personalized message',
        url: shareableLink
      });
    } else {
      navigator.clipboard.writeText(shareableLink);
      alert('Link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-white border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!whisper) {
    return (
      <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl">Whisper not found</p>
          <a href="/" className="mt-4 inline-block text-blue-400 hover:underline">Create a new one</a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center p-6">
      <div className="max-w-md w-full space-y-8">
        
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/30 rounded-full">
            <CheckCircle size={16} className="text-green-500" />
            <span className="text-sm text-green-400">Payment Successful</span>
          </div>
          
          <h1 className="text-3xl font-light">Your WhisperBack is Ready</h1>
        </div>

        <div className="relative aspect-[4/5] rounded-3xl overflow-hidden border border-white/10">
          <img src={whisper.imageUrl} className="w-full h-full object-cover" alt="" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent p-8 flex items-end">
            <p className="italic text-lg leading-relaxed">"{whisper.message}"</p>
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={handleDownload}
            className="w-full bg-white text-black py-4 rounded-full font-bold flex items-center justify-center gap-2 hover:bg-gray-200 transition"
          >
            <Download size={18} />
            Download Audio
          </button>
          
          <button
            onClick={handleShare}
            className="w-full bg-white/10 border border-white/20 py-4 rounded-full font-bold flex items-center justify-center gap-2 hover:bg-white/20 transition"
          >
            <Share2 size={18} />
            Share Link
          </button>

          <div className="text-center pt-4">
            <a 
              href="/" 
              className="text-white/40 hover:text-white text-sm transition"
            >
              Create Another Whisper
            </a>
          </div>
        </div>

      </div>
    </div>
  );
};

export default SuccessPage;
