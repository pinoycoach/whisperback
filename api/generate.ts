import { GoogleGenAI, Type, Modality } from '@google/genai';
import { Redis } from '@upstash/redis';

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY || '' });
const redis = Redis.fromEnv();

interface GenerateRequest {
  occasion: string;
  mode: 'encouragement' | 'mantra' | 'asmr';
  includeVerse: boolean;
}

const whisperSchema = {
  type: Type.OBJECT,
  properties: {
    message: { type: Type.STRING, description: 'The core spoken message. Minimal, profound, punchy.' },
    quote: { type: Type.STRING, description: 'A relevant short quote or bible verse.' },
    imagePrompt: { type: Type.STRING, description: 'Cinematic, minimalist image prompt.' },
  },
  required: ['message', 'quote', 'imagePrompt']
};

export const config = {
  maxDuration: 300,
  runtime: 'nodejs',
};

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { occasion, mode, includeVerse }: GenerateRequest = req.body;

    const nexusPersona = `
      You are NEXUS-7, an elite emotional intelligence engine.
      Create profound, comforting messages.
      
      Rules:
      1. Analyze the emotional need behind: '${occasion}'
      2. Be positive and affirming
      3. Keep it concise
    `;

    let archetypeInstruction = '';
    switch(mode) {
      case 'mantra':
        archetypeInstruction = 'Style: Rhythmic, grounding, spiritual.';
        break;
      case 'asmr':
        archetypeInstruction = 'Style: Soft, slow, protective.';
        break;
      case 'encouragement':
      default:
        archetypeInstruction = 'Style: Confident, warm, encouraging.';
        break;
    }

    const scriptureContext = includeVerse 
      ? 'Include a specific Bible verse (KJV/ESV/NIV) in the quote field.' 
      : 'Use philosophical wisdom for the quote.';

    const contentResponse = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `
        User needs: "${occasion}"
        Style: ${mode}
        ${scriptureContext}
        
        Create a whisper with:
        - message: 2-3 empathetic sentences
        - quote: An inspiring quote or verse
        - imagePrompt: Minimalist visual description for AI image
        
        Output as JSON only.
      `,
      config: {
        systemInstruction: nexusPersona + ' ' + archetypeInstruction,
        responseMimeType: 'application/json',
        responseSchema: whisperSchema,
        temperature: 1.0,
      }
    });

    const contentText = contentResponse.text;
    if (!contentText) throw new Error('No content generated');
    
    const content = JSON.parse(contentText);

    const imageResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: content.imagePrompt + ' cinematic minimalist 9:16 aspect ratio no text' }]
      }
    });

    const imagePart = imageResponse.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
    const imageData = imagePart?.inlineData?.data;
    if (!imageData) throw new Error('No image generated');

    let voiceName = 'Fenrir'; 
    if (mode === 'asmr') voiceName = 'Puck';
    else if (mode === 'mantra') voiceName = 'Kore';

    const audioResponse = await ai.models.generateContent({
      model: 'gemini-2.5-pro-preview-tts',
      contents: {
        parts: [{ text: content.message }]
      },
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName }
          }
        }
      }
    });

    const audioData = audioResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!audioData) throw new Error('No audio generated');

    const id = crypto.randomUUID();
    const whisperData = {
      id,
      occasion,
      mode,
      includeVerse,
      message: content.message,
      quote: content.quote,
      imageData,
      audioData,
      isPaid: false,
      createdAt: Date.now()
    };

    await redis.set(`whisper:${id}`, JSON.stringify(whisperData), { ex: 604800 });

    return res.status(200).json({
      success: true,
      id,
      message: content.message,
      quote: content.quote,
      imageUrl: `data:image/png;base64,${imageData}`,
      audioBase64: audioData,
    });

  } catch (error: any) {
    console.error('Generation error:', error);
    return res.status(500).json({ 
      success: false,
      error: error.message || 'Generation failed' 
    });
  }
}