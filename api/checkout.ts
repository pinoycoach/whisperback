import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-02-24.acacia'
});

export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const { whisperId } = await req.json();

    if (!whisperId) {
      return new Response(JSON.stringify({ error: 'Whisper ID required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const origin = new URL(req.url).origin;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'WhisperBack - Keep Forever',
              description: 'Download your personalized audio message and shareable link',
            },
            unit_amount: 299,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}&whisper_id=${whisperId}`,
      cancel_url: `${origin}/?canceled=true`,
      metadata: {
        whisperId
      },
    });

    return new Response(JSON.stringify({ 
      url: session.url 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error('Checkout error:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Failed to create checkout' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}