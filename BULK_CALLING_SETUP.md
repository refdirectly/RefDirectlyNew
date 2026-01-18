# 📞 Production Bulk Calling System - Setup Guide

## Overview
Real production-ready bulk calling system using Twilio for automated voice calls with AI-generated scripts.

---

## 🚀 Features

✅ **Real Voice Calls** - Twilio integration for actual phone calls  
✅ **Bulk Calling** - Call multiple leads with delays  
✅ **AI Scripts** - GPT-4 generates personalized scripts  
✅ **Call Recording** - Automatic recording and transcription  
✅ **Call Analysis** - AI analyzes sentiment and outcomes  
✅ **Interactive IVR** - Press 1 for interest, 2 to opt-out  
✅ **Webhooks** - Real-time call status updates  
✅ **Follow-ups** - Auto-generate email/SMS after calls  

---

## 📋 Prerequisites

### 1. Twilio Account
1. Sign up at https://www.twilio.com
2. Get a phone number ($1-15/month)
3. Copy Account SID and Auth Token

### 2. Environment Setup
Add to `.env`:
```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+1234567890
BACKEND_URL=https://your-domain.com
```

---

## 🔧 API Endpoints

### Single Call
```http
POST /api/ai-calling/initiate-call
Authorization: Bearer {token}

{
  "leadId": "lead_id_here",
  "phoneNumber": "+1234567890"
}
```

**Response:**
```json
{
  "message": "Call initiated successfully",
  "callSid": "CAxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  "script": "AI-generated script..."
}
```

### Bulk Calls
```http
POST /api/ai-calling/bulk-calls
Authorization: Bearer {token}

{
  "leadIds": ["lead1", "lead2", "lead3"],
  "delayBetweenCalls": 5000
}
```

**Response:**
```json
{
  "message": "Bulk calling completed",
  "total": 3,
  "successful": 2,
  "failed": 1,
  "results": [
    {
      "leadId": "lead1",
      "success": true,
      "callSid": "CAxxxx"
    }
  ]
}
```

### Get Call Details
```http
GET /api/ai-calling/call-details/{callSid}
Authorization: Bearer {token}
```

---

## 🎯 Call Flow

1. **Initiate Call** → System calls lead's phone
2. **AI Script Plays** → Personalized message
3. **IVR Menu** → Press 1 (interested) or 2 (opt-out)
4. **Recording** → Call is recorded
5. **Transcription** → Twilio transcribes audio
6. **AI Analysis** → Sentiment and insights
7. **Follow-up** → Auto-generate email/SMS

---

## 📊 Webhooks

Twilio sends real-time updates to these endpoints:

### Call Status
```
POST /api/ai-calling/call-status
```
Events: initiated, ringing, answered, completed

### Recording Ready
```
POST /api/ai-calling/recording-status
```
Triggered when recording is available

### TwiML Response
```
POST /api/ai-calling/twiml-response
```
Returns voice instructions

### Gather Response
```
POST /api/ai-calling/gather-response
```
Handles user input (DTMF/speech)

---

## 💰 Pricing (Twilio)

- **Phone Number**: $1-15/month
- **Outbound Calls**: $0.013-0.085/minute (US)
- **Recording**: $0.0025/minute
- **Transcription**: $0.05/minute
- **SMS**: $0.0075/message

**Example Cost:**
- 100 calls × 2 min avg = $2.60
- 100 recordings = $0.50
- 100 transcriptions = $10.00
- **Total: ~$13.10 for 100 calls**

---

## 🔒 Compliance

### TCPA Compliance
- ✅ Only call leads who opted in
- ✅ Provide opt-out option (Press 2)
- ✅ Call during business hours (8 AM - 9 PM)
- ✅ Maintain Do Not Call list
- ✅ Include company identification

### Best Practices
- Call between 8 AM - 9 PM local time
- Max 3 attempts per lead
- 5-10 second delay between bulk calls
- Respect opt-outs immediately
- Keep scripts under 60 seconds

---

## 📝 Usage Examples

### Example 1: Single Call
```javascript
const response = await fetch('/api/ai-calling/initiate-call', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    leadId: '507f1f77bcf86cd799439011',
    phoneNumber: '+14155551234'
  })
});

const data = await response.json();
console.log('Call SID:', data.callSid);
```

### Example 2: Bulk Calling
```javascript
const response = await fetch('/api/ai-calling/bulk-calls', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    leadIds: [
      '507f1f77bcf86cd799439011',
      '507f1f77bcf86cd799439012',
      '507f1f77bcf86cd799439013'
    ],
    delayBetweenCalls: 5000 // 5 seconds
  })
});

const data = await response.json();
console.log(`${data.successful}/${data.total} calls successful`);
```

### Example 3: Check Call Status
```javascript
const response = await fetch(`/api/ai-calling/call-details/${callSid}`, {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const data = await response.json();
console.log('Call duration:', data.details.duration, 'seconds');
console.log('Call status:', data.details.status);
```

---

## 🎨 Custom Scripts

### Modify Script Template
Edit `aiCallingService.ts`:
```typescript
const prompt = `Generate a sales call script for:
- Lead: ${params.leadName}
- Company: ${params.companyName}
- Industry: ${params.industry}

Make it conversational and under 60 seconds.`;
```

### Modify TwiML
Edit `twilioCallingService.ts`:
```typescript
generateTwiML(script: string): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice">${script}</Say>
  <Gather input="dtmf" numDigits="1">
    <Say>Press 1 for yes, 2 for no</Say>
  </Gather>
</Response>`;
}
```

---

## 🐛 Troubleshooting

### Calls Not Going Through
1. Check Twilio credentials in `.env`
2. Verify phone number is verified in Twilio
3. Check Twilio account balance
4. Review Twilio logs: https://console.twilio.com/logs

### Webhooks Not Working
1. Ensure `BACKEND_URL` is publicly accessible
2. Use ngrok for local testing: `ngrok http 3001`
3. Update webhook URLs in Twilio console
4. Check webhook logs in `backend/logs/`

### Recording Not Available
1. Recordings take 1-2 minutes to process
2. Check Twilio console for recording status
3. Verify recording is enabled in call creation

---

## 📈 Scaling

### For High Volume (1000+ calls/day)

1. **Use Queue System**
```bash
npm install bull redis
```

2. **Implement Rate Limiting**
- Twilio: 100 concurrent calls (default)
- Upgrade for higher limits

3. **Use Multiple Phone Numbers**
- Distribute calls across numbers
- Avoid carrier blocking

4. **Monitor & Optimize**
- Track answer rates
- A/B test scripts
- Optimize call times

---

## 🔗 Integration with CRM

```javascript
// After call completes
const analysis = await aiCallingService.analyzeCall({
  transcript: callTranscript,
  duration: callDuration,
  leadId: lead._id
});

// Update lead in CRM
await SalesLead.findByIdAndUpdate(lead._id, {
  $push: {
    callHistory: {
      date: new Date(),
      duration: callDuration,
      summary: analysis.summary,
      sentiment: analysis.sentiment,
      outcome: analysis.nextSteps
    }
  }
});

// Send follow-up
if (analysis.sentiment === 'positive') {
  await emailAutomationService.sendEmail({
    leadId: lead._id,
    type: 'follow_up'
  });
}
```

---

## 📚 Resources

- Twilio Docs: https://www.twilio.com/docs/voice
- TwiML Reference: https://www.twilio.com/docs/voice/twiml
- Twilio Console: https://console.twilio.com
- Pricing: https://www.twilio.com/voice/pricing

---

## ✅ Production Checklist

- [ ] Twilio account created and funded
- [ ] Phone number purchased
- [ ] Environment variables configured
- [ ] Webhooks tested with ngrok
- [ ] Call scripts reviewed and approved
- [ ] TCPA compliance verified
- [ ] Do Not Call list implemented
- [ ] Call time restrictions set
- [ ] Recording and transcription enabled
- [ ] Monitoring and alerts configured

---

**Status:** ✅ Production Ready  
**Cost:** ~$0.13 per call (2 min avg)  
**Capacity:** 100 concurrent calls (upgradeable)
