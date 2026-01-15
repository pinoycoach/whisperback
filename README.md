# WhisperBack - Production Ready

AI-powered emotional support through personalized voice messages.

## What This Is

A production-ready web app that:
- Generates personalized encouragement messages using Google Gemini
- Creates beautiful visual cards
- Synthesizes human-like voice audio
- Accepts payments via Stripe ($2.99)
- Stores whispers securely in Vercel KV
- Provides shareable links

## Tech Stack

- **Frontend**: React + TypeScript + Vite + Tailwind
- **Backend**: Vercel Edge Functions
- **AI**: Google Gemini 2.5 (Text, Image, Audio)
- **Payments**: Stripe Checkout
- **Database**: Vercel KV
- **Hosting**: Vercel

## Quick Start

See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete deployment instructions.

### Local Development

```bash
# Install dependencies
npm install

# Create .env file (copy from .env.example)
cp .env.example .env

# Add your API keys to .env

# Run development server
npm run dev
```

## Project Structure

```
whisperback-prod/
├── api/                    # Serverless API endpoints
│   ├── generate.ts        # Generate whisper (Gemini)
│   ├── checkout.ts        # Create Stripe session
│   ├── webhook.ts         # Handle Stripe payments
│   └── whisper/[id].ts    # Fetch whisper data
├── src/
│   ├── App.tsx            # Main application
│   ├── Success.tsx        # Success page after payment
│   ├── types.ts           # TypeScript types
│   └── constants.ts       # App constants
├── package.json
├── vite.config.ts
├── tsconfig.json
├── vercel.json            # Vercel deployment config
└── DEPLOYMENT.md          # Deployment guide
```

## Environment Variables

Required:
- `GOOGLE_API_KEY` - Google Gemini API key
- `STRIPE_SECRET_KEY` - Stripe secret key
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook secret

Auto-provided by Vercel:
- `KV_REST_API_URL`
- `KV_REST_API_TOKEN`

## Features

### Current
- ✅ Three modes: Encouragement, Mantra, Goodnight
- ✅ Optional Bible verse integration
- ✅ AI-generated visuals
- ✅ High-quality voice synthesis
- ✅ Stripe payments
- ✅ Secure API key management
- ✅ Shareable links
- ✅ Download as WAV

### Planned
- 📋 Analytics integration
- 📋 Custom domains
- 📋 Social sharing cards
- 📋 Subscription plans
- 📋 Video avatars (HeyGen integration)

## Cost Analysis

Per whisper:
- Gemini API: ~$0.003 (text)
- Gemini Image: ~$0.02
- Gemini Audio: ~$0.02
- **Total cost: ~$0.045**

At $2.99 per whisper:
- **Gross margin: 98.5%**
- **Net profit: $2.945**

## License

Proprietary - All rights reserved
