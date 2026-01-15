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
  runtime: 'nodejs',
};

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const { occasion, mode, includeVerse }: GenerateRequest = await req.json();

    const nexusPersona = `
      You are NEXUS-7, an elite emotional intelligence engine designed to curate "Soul Whispers".
      Your goal is to deliver a "Steve Jobs" user experience: profound, intuitive, magically simple, and deeply human.
      
      ### CORE PROTOCOLS:
      1. **Deep Listening:** Analyze the *implicit yearning* behind '${occasion}'.
      2. **Verbalized Sampling:** Mentally simulate 3 diverse perspectives. Collapse them into one singular, perfect truth.
      3. **Positive Safety:** All outputs must be strictly positive and affirming.
    `;

    let archetypeInstruction = '';
    switch(mode) {
      case 'mantra':
        archetypeInstruction = '**Archetype:** The Timeless Sage. Rhythmic, grounding, ethereal.';
        break;
      case 'asmr':
        archetypeInstruction = '**Archetype:** The Guardian of Sleep. Hushed, protective, slow.';
        break;
      case 'encouragement':
      default:
        archetypeInstruction = '**Archetype:** The Architect of Confidence. Assured, warm, firm.';
        break;
    }

    const scriptureContext = includeVerse 
      ? `\n**BIBLE MODE ACTIVE:** The user seeks guidance rooted in faith. 
         - The 'quote' MUST be a specific Bible verse (KJV/ESV/NIV) that acts as the anchor.
         - The 'message' must flow naturally from this verse, treating God's word as the ultimate source of comfort.
         - Use "Still Small Voice" sampling: gentle, non-judgmental, profoundly spiritual.` 
      : `\n**SECULAR WISDOM:** Use diverse philosophical sampling (Stoicism, Poetry, etc.).`;

    const contentResponse = await ai.models.generateContent({
      model: 'gemini-2.0-flash-exp',
      contents: `
        User Input: "${occasion}"
        Archetype: ${mode}
        
        *** EXECUTE VERBALIZED SAMPLING ***
        1. Detect emotional frequency.
        2. If BIBLE MODE, anchor the sample in scripture.
        3. Synthesize the "Whisper".
        
        Requirements:
        - **Message:** Max 3 sentences. Direct, empathetic.
        - **Quote:** The anchor point.
        - **Image Prompt:** Abstract, "Vitruviano" minimalist aesthetic.
        
        Output strictly JSON.
      `,
      config: {
        systemInstruction: nexusPersona + archetypeInstruction + scriptureContext,
        responseMimeType: 'application/json',
        responseSchema: whisperSchema,
        temperature: 1.0,
      }
    });

    const contentText = contentResponse.text;
    if (!contentText) throw new Error('Failed to generate content');
    
    const content = JSON.parse(contentText);

    const imageResponse = await ai.models.generateContent({
      model: 'gemini-2.0-flash-image-exp',
      contents: {
        parts: [{ text: content.imagePrompt + ' --aspect-ratio 9:16 --cinematic --minimalist --no-text' }]
      }
    });

    const imagePart = imageResponse.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
    const imageData = imagePart?.inlineData?.data;
    if (!imageData) throw new Error('Failed to generate image');

    let voiceName = 'Fenrir'; 
    if (mode === 'asmr') voiceName = 'Puck';
    else if (mode === 'mantra') voiceName = 'Kore';

    const audioResponse = await ai.models.generateContent({
      model: 'gemini-2.0-flash-exp',
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
    if (!audioData) throw new Error('Failed to generate audio');

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

    return new Response(JSON.stringify({
      success: true,
      id,
      message: content.message,
      quote: content.quote,
      imageUrl: `data:image/png;base64,${imageData}`,
      audioBase64: audioData,
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error('Generation error:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message || 'Failed to generate whisper' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}