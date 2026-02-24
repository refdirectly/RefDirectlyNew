# Enhanced Escrow & Payment System Documentation

## Overview
Complete escrow system with fraud detection, dispute handling, admin approval, and 70/30 payment split.

---

## System Architecture

```
Candidate Requests Referral
         ↓
   Payment Locked in Escrow
         ↓
   Fraud Detection Check
         ↓
   [CLEAN] → Locked
   [SUSPICIOUS/FLAGGED] → Pending Admin Approval
         ↓
   Referrer Accepts
         ↓
   Referral Process
         ↓
   Status = Completed
         ↓
   Admin Approval (if flagged)
         ↓
   Release Payment (70/30 Split)
         ↓
   70% → Referrer Wallet
   30% → Platform Fee
```

---

## Payment Split

### On Release:
- **70%** goes to Referrer Wallet
- **30%** Platform Fee

### Example:
```
Referral Fee: ₹999
├── Referrer Gets: ₹699 (70%)
└── Platform Fee: ₹300 (30%)

Referral Fee: ₹499
├── Referrer Gets: ₹349 (70%)
└── Platform Fee: ₹150 (30%)

Referral Fee: ₹99
├── Referrer Gets: ₹69 (70%)
└── Platform Fee: ₹30 (30%)
```

---

## Fraud Detection System

### Fraud Score Calculation (0-100)

#### Factors:
1. **Account Age** (0-30 points)
   - < 1 day: +30 points, Flag: `NEW_ACCOUNT`
   - < 7 days: +15 points, Flag: `RECENT_ACCOUNT`

2. **Transaction Amount** (0-10 points)
   - > ₹500: +10 points, Flag: `HIGH_AMOUNT`

3. **Transaction Frequency** (0-25 points)
   - > 5 in 24h: +25 points, Flag: `MULTIPLE_TRANSACTIONS`
   - > 3 in 24h: +15 points, Flag: `FREQUENT_TRANSACTIONS`

4. **IP Address** (0-20 points)
   - > 10 transactions from same IP in 7 days: +20 points, Flag: `SHARED_IP`

### Fraud Status:
- **CLEAN**: Score 0-25 → Auto-approved
- **SUSPICIOUS**: Score 26-50 → Monitored
- **FLAGGED**: Score > 50 → Requires admin approval

---

## Escrow Status Flow

```
LOCKED → PENDING_APPROVAL → APPROVED → RELEASED
   ↓            ↓              ↓           ↓
REFUNDED    DISPUTED      DISPUTED    COMPLETED
```

### Status Definitions:

1. **LOCKED**: Funds locked, awaiting referrer action
2. **PENDING_APPROVAL**: Flagged transaction, needs admin review
3. **APPROVED**: Admin approved, ready for release
4. **RELEASED**: Payment split and credited
5. **REFUNDED**: Returned to seeker
6. **DISPUTED**: Under dispute investigation

---

## API Endpoints

### User Endpoints

#### 1. Get My Escrows
```
GET /api/escrow/my-escrows?role=seeker|referrer
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "count": 5,
  "escrows": [
    {
      "_id": "...",
      "referralId": "...",
      "amount": 999,
      "platformFee": 300,
      "referrerAmount": 699,
      "status": "LOCKED",
      "fraudCheck": {
        "score": 15,
        "flags": ["RECENT_ACCOUNT"],
        "status": "CLEAN"
      },
      "seekerId": {...},
      "referrerId": {...}
    }
  ]
}
```

#### 2. Get Escrow Details
```
GET /api/escrow/:referralId
Authorization: Bearer <token>
```

#### 3. File Dispute
```
POST /api/escrow/:referralId/dispute
Authorization: Bearer <token>

Body:
{
  "reason": "Referrer not responding"
}
```

#### 4. Request Withdrawal
```
POST /api/withdrawals/request
Authorization: Bearer <token>

Body:
{
  "amount": 500,
  "method": "upi",
  "accountDetails": {
    "upiId": "user@paytm"
  }
}
```

#### 5. Get My Withdrawals
```
GET /api/withdrawals/my-withdrawals
Authorization: Bearer <token>
```

---

### Admin Endpoints

#### 1. Get Pending Approvals
```
GET /api/escrow/admin/pending
Authorization: Bearer <admin_token>
```

Returns all escrows with status `PENDING_APPROVAL`.

#### 2. Get Flagged Transactions
```
GET /api/escrow/admin/flagged
Authorization: Bearer <admin_token>
```

Returns all transactions with fraud status `SUSPICIOUS` or `FLAGGED`.

#### 3. Approve Escrow
```
POST /api/escrow/:referralId/approve
Authorization: Bearer <admin_token>
```

Approves a flagged transaction.

#### 4. Get Disputes
```
GET /api/escrow/admin/disputes?status=OPEN|INVESTIGATING|RESOLVED
Authorization: Bearer <admin_token>
```

#### 5. Resolve Dispute
```
POST /api/escrow/:referralId/resolve-dispute
Authorization: Bearer <admin_token>

Body:
{
  "resolution": "Refunding due to non-response",
  "action": "refund" // or "release"
}
```

#### 6. Get Escrow Statistics
```
GET /api/escrow/admin/stats
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "success": true,
  "stats": {
    "byStatus": [
      { "_id": "LOCKED", "count": 45, "totalAmount": 25000, "platformFees": 7500 },
      { "_id": "RELEASED", "count": 120, "totalAmount": 80000, "platformFees": 24000 }
    ],
    "byFraudStatus": [
      { "_id": "CLEAN", "count": 150 },
      { "_id": "SUSPICIOUS", "count": 10 },
      { "_id": "FLAGGED", "count": 5 }
    ]
  }
}
```

#### 7. Get Pending Withdrawals
```
GET /api/withdrawals/admin/pending
Authorization: Bearer <admin_token>
```

#### 8. Approve Withdrawal
```
POST /api/withdrawals/:withdrawalId/approve
Authorization: Bearer <admin_token>
```

#### 9. Complete Withdrawal
```
POST /api/withdrawals/:withdrawalId/complete
Authorization: Bearer <admin_token>

Body:
{
  "transactionId": "TXN123456789"
}
```

#### 10. Reject Withdrawal
```
POST /api/withdrawals/:withdrawalId/reject
Authorization: Bearer <admin_token>

Body:
{
  "reason": "Invalid bank details"
}
```

---

## Withdrawal System

### Minimum Withdrawal: ₹100

### Withdrawal Methods:
1. **Bank Transfer**
   ```json
   {
     "method": "bank_transfer",
     "accountDetails": {
       "accountNumber": "1234567890",
       "ifscCode": "SBIN0001234",
       "accountHolderName": "John Doe"
     }
   }
   ```

2. **UPI**
   ```json
   {
     "method": "upi",
     "accountDetails": {
       "upiId": "john@paytm"
     }
   }
   ```

3. **PayPal**
   ```json
   {
     "method": "paypal",
     "accountDetails": {
       "paypalEmail": "john@example.com"
     }
   }
   ```

### Withdrawal Status Flow:
```
PENDING → APPROVED → PROCESSING → COMPLETED
   ↓
REJECTED
```

---

## Dispute Handling

### Dispute Status:
- **OPEN**: Just filed
- **INVESTIGATING**: Admin reviewing
- **RESOLVED**: Dispute resolved
- **REJECTED**: Dispute rejected

### Dispute Resolution Actions:
1. **Release**: Release funds to referrer
2. **Refund**: Refund to seeker

### Example Dispute Flow:
```
1. User files dispute
   POST /api/escrow/:referralId/dispute
   
2. Admin investigates
   GET /api/escrow/admin/disputes
   
3. Admin resolves
   POST /api/escrow/:referralId/resolve-dispute
   Body: { "action": "refund", "resolution": "..." }
```

---

## Security Features

### 1. Transaction Security
- MongoDB transactions for atomic operations
- Balance integrity checks
- Double-spending prevention

### 2. Fraud Detection
- Real-time scoring
- Automatic flagging
- Admin review for high-risk

### 3. Audit Trail
- All transactions logged
- Metadata captured (IP, device, user agent)
- Timestamps for all actions

### 4. Admin Controls
- Manual approval for flagged transactions
- Dispute resolution system
- Withdrawal approval workflow

---

## Database Models

### EscrowTransaction
```typescript
{
  referralId: ObjectId,
  seekerId: ObjectId,
  referrerId: ObjectId,
  amount: Number,
  platformFee: Number,
  referrerAmount: Number,
  status: String,
  fraudCheck: {
    score: Number,
    flags: [String],
    status: String
  },
  dispute: {
    reason: String,
    filedBy: ObjectId,
    status: String,
    resolution: String
  },
  metadata: {
    ipAddress: String,
    userAgent: String,
    deviceId: String
  }
}
```

### Withdrawal
```typescript
{
  userId: ObjectId,
  amount: Number,
  method: String,
  accountDetails: Object,
  status: String,
  approvedBy: ObjectId,
  transactionId: String
}
```

---

## Integration Example

### Complete Referral Flow:

```typescript
// 1. Candidate requests referral
POST /api/referrals
Body: { company, role, reward: 999 }

// 2. Referrer accepts (auto-locks funds)
PATCH /api/referrals/:id/status
Body: { status: "accepted" }
// → Funds locked in escrow
// → Fraud check performed
// → If flagged, admin notified

// 3. Admin approves (if flagged)
POST /api/escrow/:referralId/approve

// 4. Referral completed
PATCH /api/referrals/:id/status
Body: { status: "completed" }
// → Funds released (70/30 split)
// → ₹699 to referrer wallet
// → ₹300 platform fee

// 5. Referrer withdraws
POST /api/withdrawals/request
Body: { amount: 500, method: "upi", accountDetails: {...} }

// 6. Admin approves withdrawal
POST /api/withdrawals/:id/approve

// 7. Admin completes withdrawal
POST /api/withdrawals/:id/complete
Body: { transactionId: "TXN123" }
```

---

## Error Handling

### Common Errors:

1. **Insufficient Balance**
   ```json
   {
     "success": false,
     "message": "Insufficient balance. Required: ₹999, Available: ₹500"
   }
   ```

2. **Already Released**
   ```json
   {
     "success": false,
     "message": "Funds already released"
   }
   ```

3. **Pending Withdrawal**
   ```json
   {
     "success": false,
     "message": "You have a pending withdrawal. Please wait for it to complete."
   }
   ```

4. **Admin Approval Required**
   ```json
   {
     "success": false,
     "message": "Admin approval required before release"
   }
   ```

---

## Monitoring & Logs

### Log Examples:

```
✅ Escrow created: ₹999 locked (Referrer: ₹699, Platform: ₹300)
✅ Funds released: ₹699 to referrer, ₹300 platform fee
✅ Refund processed: ₹999 returned to seeker
⚠️ Dispute filed for referral 60d5ec49f1b2c8b1f8e4e1a1
✅ Escrow approved by admin 60d5ec49f1b2c8b1f8e4e1a2
📤 Withdrawal requested: ₹500 by user 60d5ec49f1b2c8b1f8e4e1a3
✅ Withdrawal approved: 60d5ec49f1b2c8b1f8e4e1a4
✅ Withdrawal completed: 60d5ec49f1b2c8b1f8e4e1a4
❌ Withdrawal rejected: 60d5ec49f1b2c8b1f8e4e1a5
```

---

## Testing Scenarios

### 1. Normal Flow
```bash
# Create referral → Accept → Complete → Withdraw
```

### 2. Flagged Transaction
```bash
# New account + high amount → Flagged → Admin approves → Release
```

### 3. Dispute Flow
```bash
# Accept → Dispute filed → Admin investigates → Refund
```

### 4. Withdrawal Flow
```bash
# Request → Admin approves → Process payment → Complete
```

---

## Summary

✅ **Secure Escrow**: Funds locked until completion  
✅ **70/30 Split**: Fair revenue sharing  
✅ **Fraud Detection**: Automatic risk scoring  
✅ **Admin Approval**: Manual review for high-risk  
✅ **Dispute System**: Fair resolution process  
✅ **Withdrawal System**: Multiple payment methods  
✅ **Audit Trail**: Complete transaction history  
✅ **Atomic Operations**: Database transaction safety  

The system is production-ready with comprehensive security and fraud prevention! 🔒
