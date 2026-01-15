# 🚀 WhisperBack Production Deployment Guide

**72-HOUR SHIP PLAN**

This is the secure, production-ready version of WhisperBack that:
- Hides all API keys (no theft possible)
- Accepts payments via Stripe ($2.99)
- Stores whispers in Vercel KV
- Generates shareable links

---

## 📋 PRE-FLIGHT CHECKLIST

### 1. Get Your API Keys

#### Google Gemini API Key
1. Go to https://aistudio.google.com/apikey
2. Click "Create API Key"
3. Copy the key (starts with `AIza...`)

#### Stripe Keys
1. Go to https://dashboard.stripe.com/register
2. Complete account setup
3. Go to Developers → API Keys
4. Copy both:
   - **Publishable key** (starts with `pk_test...`)
   - **Secret key** (starts with `sk_test...`)
5. Create a product:
   - Go to Products → Add Product
   - Name: "WhisperBack - Keep Forever"
   - Price: $2.99
   - Click Create

---

## 🏗️ STEP 1: SETUP GITHUB

```bash
# Navigate to project folder
cd whisperback-prod

# Initialize git
git init

# Add all files
git add .

# Make first commit
git commit -m "Initial production deployment"

# Create repo on GitHub (go to github.com/new)
# Then connect it:
git remote add origin https://github.com/YOUR_USERNAME/whisperback.git
git branch -M main
git push -u origin main
```

---

## 🌐 STEP 2: DEPLOY TO VERCEL

1. Go to https://vercel.com/signup
2. Sign up with your GitHub account
3. Click "Add New Project"
4. Import your `whisperback` repository
5. Configure Project:
   - Framework Preset: **Vite**
   - Build Command: `npm run build`
   - Output Directory: `dist`

### Add Environment Variables

In the "Environment Variables" section, add these:

| Name | Value |
|------|-------|
| `GOOGLE_API_KEY` | Your Gemini API key from Step 1 |
| `STRIPE_SECRET_KEY` | Your Stripe secret key |

6. Click **Deploy**

**Your site will be live in ~2 minutes at: `your-project.vercel.app`**

---

## 💳 STEP 3: SETUP STRIPE WEBHOOKS

Stripe needs to tell your app when payments succeed.

1. Go to https://dashboard.stripe.com/webhooks
2. Click "Add Endpoint"
3. Endpoint URL: `https://your-project.vercel.app/api/webhook`
4. Events to send:
   - Select `checkout.session.completed`
5. Click "Add Endpoint"
6. Click "Reveal" on "Signing secret"
7. Copy the webhook secret (starts with `whsec_...`)
8. Go back to Vercel → Your Project → Settings → Environment Variables
9. Add:
   - Name: `STRIPE_WEBHOOK_SECRET`
   - Value: [paste the webhook secret]
10. Redeploy (Vercel → Deployments → ... → Redeploy)

---

## 🔗 STEP 4: SETUP VERCEL KV (DATABASE)

Vercel KV stores the whispers.

1. In Vercel Dashboard → Your Project
2. Click "Storage" tab
3. Click "Create Database"
4. Select "KV"
5. Name it "whisperback-kv"
6. Click "Create"
7. Click "Connect" to connect it to your project

**Environment variables are automatically added!**

---

## ✅ STEP 5: TEST THE FLOW

1. Open your live URL: `https://your-project.vercel.app`
2. Create a whisper
3. Click "Keep Forever - $2.99"
4. Use Stripe test card:
   - Card: `4242 4242 4242 4242`
   - Expiry: Any future date
   - CVC: Any 3 digits
5. Complete payment
6. You should be redirected to success page

### Check Stripe Dashboard
- Go to https://dashboard.stripe.com/test/payments
- You should see the $2.99 payment

---

## 🎯 GOING LIVE (REAL PAYMENTS)

Once you've tested:

1. Go to Stripe Dashboard
2. Toggle from "Test Mode" to "Live Mode" (top right)
3. Get your **LIVE** API keys:
   - Go to Developers → API Keys
   - Copy the LIVE secret key (starts with `sk_live...`)
4. Update Vercel Environment Variables:
   - Go to Vercel → Settings → Environment Variables
   - Update `STRIPE_SECRET_KEY` with your LIVE key
5. Redeploy

**You're now accepting real money!**

---

## 📊 MONITORING

### Check Payments
- Stripe Dashboard: https://dashboard.stripe.com

### Check Whispers Stored
- Vercel Dashboard → Storage → whisperback-kv → Data

### Check Errors
- Vercel Dashboard → Your Project → Logs

---

## 🚨 TROUBLESHOOTING

### "Failed to generate whisper"
- Check Vercel Logs for errors
- Verify GOOGLE_API_KEY is set correctly
- Make sure Gemini API is enabled

### "Checkout failed"
- Verify STRIPE_SECRET_KEY is correct
- Check it's the right mode (test vs live)

### "Webhook not firing"
- Verify webhook URL matches your Vercel URL
- Check STRIPE_WEBHOOK_SECRET is set
- Test webhook in Stripe Dashboard

---

## 🎬 DEMO FOR YOUR FRIEND

1. Send them the live URL
2. Have them create a whisper
3. Show them the payment works
4. Show them the shareable link

**Key Selling Points:**
- Works end-to-end RIGHT NOW
- Secure (all keys hidden)
- Takes real money
- Professional UI
- Ready to scale

---

## 📈 NEXT STEPS (AFTER 72 HOURS)

Once your friend validates:

1. **Add Analytics**: Google Analytics or Plausible
2. **Custom Domain**: Connect `whisperback.com`
3. **Email Receipts**: Stripe handles this automatically
4. **Marketing Site**: Add landing page
5. **Social Sharing**: Auto-generate OG images

---

## 💡 PRICING NOTES

Current: $2.99 per whisper

**Why $2.99 works:**
- Coffee money (impulse buy)
- Covers API costs (~$0.05 per whisper)
- 60x markup = healthy margins
- Feels premium, not cheap

**Alternative models:**
- Subscription: $9.99/month unlimited
- Tiered: Free preview, $2.99 keep, $4.99 video
- Bundle: 5 for $12 (save 20%)

Test with current pricing first.

---

## 📞 NEED HELP?

If something breaks:
1. Check Vercel Logs
2. Check Stripe Logs  
3. Check Browser Console
4. Google the error message

You got this, Cash. Time to ship. 🚀
