import { kv } from '@vercel/kv';

export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
  if (req.method !== 'GET') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const url = new URL(req.url);
    const id = url.pathname.split('/').pop();

    if (!id) {
      return new Response(JSON.stringify({ error: 'Whisper ID required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const whisperData = await kv.get(`whisper:${id}`) as any;

    if (!whisperData) {
      return new Response(JSON.stringify({ error: 'Whisper not found or expired' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Return data (including audio only if paid)
    return new Response(JSON.stringify({
      id: whisperData.id,
      message: whisperData.message,
      quote: whisperData.quote,
      imageUrl: `data:image/png;base64,${whisperData.imageData}`,
      audioBase64: whisperData.isPaid ? whisperData.audioData : null,
      isPaid: whisperData.isPaid,
      mode: whisperData.mode
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error('Fetch error:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Failed to fetch whisper' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
