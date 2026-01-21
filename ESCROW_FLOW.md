# 🔐 Wallet & Escrow Payment Flow - Trust-First Model

## 📋 Complete User Journey

### **Step 1: Seeker Adds Money to Wallet**
```
Action: Seeker clicks "Add Funds" → Enters amount → Completes payment
Result: Money added to FREE BALANCE (100% withdrawable)
API: POST /api/wallet/add-funds
Database: Wallet.freeBalance += amount
UI Message: "✓ ₹{amount} added to your wallet. Fully withdrawable until a referrer accepts."
```

### **Step 2: Referral Request Sent**
```
Action: Seeker finds referrer → Clicks "Request Referral"
Result: Referral created with status='pending', NO MONEY LOCKED
API: POST /api/referrals
Database: Referral { status: 'pending', seekerId, company, role, reward }
Wallet: NO CHANGE - Money stays in FREE BALANCE
UI Message: "Request sent! Your wallet balance remains withdrawable."
```

### **Step 3: Referrer ACCEPTS Referral** 🔒
```
Action: Referrer clicks "Accept" on referral request
Result: ESCROW CREATED & MONEY LOCKED
API: PATCH /api/referrals/:id/accept
Database Operations (Transactional):
  1. Referral.status = 'accepted'
  2. Wallet.freeBalance -= reward
  3. Wallet.lockedBalance += reward
  4. Escrow.create({ referralId, amount: reward, status: 'LOCKED' })
  5. Transaction.create({ type: 'LOCK', amount: reward })
Notifications:
  - Seeker: "🎉 Referral Accepted! ₹{reward} locked in escrow."
  - Referrer: "Payment secured in escrow ✔"
UI Update: 
  - Seeker wallet shows: Free Balance ↓, Locked Balance ↑
  - Referrer sees: "Payment secured: ₹{reward}"
```

### **Step 4: Referral COMPLETED** 💸
```
Action: Seeker marks referral as "Completed"
Result: ESCROW RELEASED to referrer
API: PATCH /api/referrals/:id/complete
Database Operations (Transactional):
  1. Referral.status = 'completed'
  2. Seeker Wallet:
     - totalBalance -= reward
     - lockedBalance -= reward
  3. Referrer Wallet:
     - totalBalance += reward
     - freeBalance += reward
  4. Escrow.status = 'RELEASED'
  5. Transactions created for both parties
Notifications:
  - Seeker: "Referral completed. Payment released to referrer."
  - Referrer: "💰 ₹{reward} credited to your wallet!"
UI Update:
  - Seeker: Locked Balance ↓
  - Referrer: Free Balance ↑ (can withdraw immediately)
```

### **Step 5: Referral REJECTED / EXPIRED**
```
Action: Referrer clicks "Reject" OR referral expires (24-48 hours)
Result: Money returns to FREE BALANCE (if was locked) OR stays FREE (if never locked)
API: PATCH /api/referrals/:id/reject OR Auto-expire cron job
Database Operations (Transactional):
  1. Referral.status = 'rejected' / 'expired'
  2. IF Escrow exists:
     - Wallet.lockedBalance -= reward
     - Wallet.freeBalance += reward
     - Escrow.status = 'REFUNDED'
     - Transaction.create({ type: 'REFUND', amount: reward })
  3. ELSE: No wallet changes (money was never locked)
Notifications:
  - Seeker: "Request declined. No charges applied. Balance fully withdrawable."
UI Update:
  - Seeker: Locked Balance ↓, Free Balance ↑ (if was locked)
  - Message: "100% refund - no platform fees"
```

---

## 🎯 Key Business Rules

### ✅ **Trust-First Principles**
1. **Money NEVER locked on request creation** - Only on acceptance
2. **One-click withdrawal** - No approval needed for free balance
3. **Zero charges if not accepted** - 100% refund guarantee
4. **Transparent balance display** - Clear separation of free vs locked
5. **Instant refunds** - Automatic on rejection/expiry

### 🔒 **Escrow States**
```
LOCKED    → Money held securely, referral in progress
RELEASED  → Money transferred to referrer (completed)
REFUNDED  → Money returned to seeker (rejected/expired)
```

### 💰 **Wallet Balance Types**
```
totalBalance   = freeBalance + lockedBalance
freeBalance    = Withdrawable anytime (no restrictions)
lockedBalance  = In escrow, released on completion
```

---

## 🔄 State Transition Diagram

```
┌─────────────────┐
│  Seeker Wallet  │
│  FREE BALANCE   │
└────────┬────────┘
         │
         │ 1. Add Funds
         ▼
┌─────────────────┐
│  ₹5000 FREE     │ ◄─── Fully Withdrawable
└────────┬────────┘
         │
         │ 2. Request Referral (NO LOCK)
         ▼
┌─────────────────┐
│  ₹5000 FREE     │ ◄─── Still Withdrawable
│  Status: PENDING│
└────────┬────────┘
         │
         │ 3. Referrer ACCEPTS
         ▼
┌─────────────────┐
│  ₹0 FREE        │
│  ₹5000 LOCKED   │ ◄─── Escrow Created 🔒
│  Status: ACCEPTED│
└────────┬────────┘
         │
         ├─── 4a. COMPLETED ───────┐
         │                         ▼
         │                  ┌──────────────┐
         │                  │ Referrer Gets│
         │                  │  ₹5000 FREE  │ ✓
         │                  └──────────────┘
         │
         └─── 4b. REJECTED/EXPIRED ─┐
                                     ▼
                              ┌─────────────┐
                              │ ₹5000 FREE  │
                              │ (Refunded)  │ ✓
                              └─────────────┘
```

---

## 🛡️ Security & Integrity

### **Transactional Operations**
```typescript
// All wallet operations use MongoDB transactions
const session = await mongoose.startSession();
session.startTransaction();
try {
  // Multiple operations here
  await session.commitTransaction();
} catch (error) {
  await session.abortTransaction();
  throw error;
}
```

### **Idempotency**
- Duplicate escrow creation prevented
- Same referral can't be accepted twice
- Balance integrity checks on every save

### **Audit Trail**
- Every transaction logged with timestamp
- Type: ADD, WITHDRAW, LOCK, UNLOCK, RELEASE, REFUND
- Linked to referralId and escrowId

---

## 📱 UI/UX Requirements

### **Seeker Wallet Page**
```
┌─────────────────────────────────────┐
│ 💰 Your Money, Your Control         │
│ Your wallet balance is fully        │
│ withdrawable until a referrer       │
│ accepts your request.               │
└─────────────────────────────────────┘

┌──────────┬──────────┬──────────┐
│  Total   │   Free   │  Locked  │
│  ₹5000   │  ₹3000   │  ₹2000   │
│          │ ✓ Withdraw│ 🔒 Escrow│
└──────────┴──────────┴──────────┘

[Add Funds]  [Withdraw]
```

### **Referrer Dashboard**
```
When viewing accepted referral:
┌─────────────────────────────────────┐
│ Payment secured in escrow ✔         │
│ ₹5000 will be released on completion│
└─────────────────────────────────────┘
```

### **Trust Messages**
- Before payment: "Pay only when a referrer accepts"
- After adding funds: "Fully withdrawable until acceptance"
- After acceptance: "Payment secured in escrow"
- After rejection: "No charges applied - 100% refund"

---

## 🚀 API Endpoints

### **Wallet Management**
```
GET    /api/wallet              → Get wallet details
POST   /api/wallet/add-funds    → Add money (FREE BALANCE)
POST   /api/wallet/withdraw     → Withdraw from FREE BALANCE
GET    /api/wallet/transactions → Transaction history
```

### **Referral Flow**
```
POST   /api/referrals           → Create request (NO LOCK)
PATCH  /api/referrals/:id/accept → Accept (LOCK ESCROW)
PATCH  /api/referrals/:id/reject → Reject (REFUND if locked)
PATCH  /api/referrals/:id/complete → Complete (RELEASE)
```

### **Escrow Operations**
```
GET    /api/escrow/:referralId  → Get escrow details
POST   /api/escrow/lock         → Lock funds (internal)
POST   /api/escrow/release      → Release funds (internal)
POST   /api/escrow/refund       → Refund funds (internal)
```

---

## ⏰ Auto-Expiry System

### **Cron Job Configuration**
```typescript
// Runs every hour
cron.schedule('0 * * * *', async () => {
  const expiredReferrals = await Referral.find({
    status: 'pending',
    createdAt: { $lt: new Date(Date.now() - 48 * 60 * 60 * 1000) }
  });
  
  for (const referral of expiredReferrals) {
    referral.status = 'expired';
    await referral.save();
    // No escrow to refund - money was never locked!
  }
});
```

---

## 📊 Database Schema

### **Wallet Model**
```typescript
{
  userId: ObjectId,
  totalBalance: Number,
  freeBalance: Number,      // Withdrawable
  lockedBalance: Number,    // In escrow
  transactions: [{
    type: 'ADD' | 'WITHDRAW' | 'LOCK' | 'RELEASE' | 'REFUND',
    amount: Number,
    description: String,
    referralId: ObjectId,
    escrowId: ObjectId,
    status: 'COMPLETED',
    createdAt: Date
  }]
}
```

### **Escrow Model**
```typescript
{
  referralId: ObjectId,     // Unique
  seekerId: ObjectId,
  referrerId: ObjectId,
  amount: Number,
  status: 'LOCKED' | 'RELEASED' | 'REFUNDED',
  lockedAt: Date,
  releasedAt: Date
}
```

### **Referral Model**
```typescript
{
  seekerId: ObjectId,
  referrerId: ObjectId,
  company: String,
  role: String,
  reward: Number,
  status: 'pending' | 'accepted' | 'rejected' | 'completed' | 'expired',
  createdAt: Date
}
```

---

## ✅ Testing Checklist

- [ ] Add funds → Verify FREE BALANCE increases
- [ ] Create referral → Verify NO LOCK occurs
- [ ] Accept referral → Verify ESCROW created & LOCK happens
- [ ] Complete referral → Verify RELEASE to referrer
- [ ] Reject referral → Verify REFUND to seeker
- [ ] Withdraw from FREE → Verify instant withdrawal
- [ ] Try withdraw from LOCKED → Verify error
- [ ] Check balance integrity → totalBalance = free + locked
- [ ] Test concurrent operations → Verify no race conditions
- [ ] Test duplicate acceptance → Verify idempotency

---

## 🎯 Success Metrics

1. **Trust Score**: % of users who successfully withdraw
2. **Escrow Efficiency**: Time from lock to release
3. **Refund Rate**: % of referrals that get refunded
4. **Withdrawal Speed**: Average time for withdrawal
5. **Balance Accuracy**: Zero discrepancies in audits

---

**Status**: ✅ Production Ready
**Last Updated**: December 2024
