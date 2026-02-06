# Referral Verification System

## Overview
Production-level AI-powered referral verification system with admin dashboard, evidence management, dispute handling, and automated payment processing.

## Features

### 🎯 Core Features
- **AI-Powered Verification**: Automated analysis with confidence scoring and fraud detection
- **Evidence Management**: Upload and track multiple evidence types (screenshots, emails, offer letters, etc.)
- **Admin Dashboard**: Comprehensive stats and manual review capabilities
- **Dispute System**: Users can raise disputes with admin resolution
- **Payment Processing**: Automated payment with 10% platform fee
- **Timeline Tracking**: Complete audit trail of all verification stages
- **Real-time Updates**: Live status updates and notifications

### 👥 User Roles
- **Seeker**: Submit evidence, track verification status, raise disputes
- **Referrer**: Submit evidence, track payment status
- **Admin**: Manual review, approve/reject verifications, view analytics

## API Endpoints

### User Endpoints
```
GET    /api/verification/user/all          - Get user's verifications
GET    /api/verification/:id               - Get verification details
POST   /api/verification/create            - Create new verification
POST   /api/verification/:id/evidence      - Submit evidence
PUT    /api/verification/:id/stage         - Update verification stage
POST   /api/verification/:id/verify-and-pay - Request payment processing
POST   /api/verification/:id/dispute       - Raise dispute
```

### Admin Endpoints
```
GET    /api/verification/admin/stats       - Get verification statistics
POST   /api/verification/:id/manual-review - Approve/reject verification
```

## Data Models

### Verification Status
- `pending` - Initial state
- `under_review` - Evidence submitted, awaiting review
- `verified` - Approved by AI or admin
- `rejected` - Rejected by admin
- `disputed` - Dispute raised

### Verification Stages
- `referral_sent` - Referral submitted
- `interview_scheduled` - Interview confirmed
- `offer_received` - Offer letter received
- `joined` - Candidate joined company
- `completed` - Probation completed

### Evidence Types
- `screenshot` - Application/email screenshots
- `email` - Email confirmations
- `offer_letter` - Official offer letter
- `joining_letter` - Joining confirmation
- `payslip` - Salary proof
- `other` - Other supporting documents

## AI Analysis

### Confidence Scoring
- **85%+**: Auto-verified (low fraud risk)
- **50-84%**: Manual review required
- **<50%**: High fraud risk, manual review required

### Fraud Risk Levels
- **Low**: High confidence, minimal red flags
- **Medium**: Some concerns, needs review
- **High**: Multiple red flags, requires investigation

### Evidence Quality
- **Excellent**: Complete documentation, verified sources
- **Good**: Sufficient documentation
- **Fair**: Minimal documentation
- **Poor**: Insufficient or questionable evidence

## Payment Processing

### Fee Structure
- Total Reward: Set by referrer
- Platform Fee: 10% of total
- Referrer Receives: 90% of total

### Payment Status
- `pending` - Awaiting verification
- `processing` - Payment in progress
- `completed` - Payment successful
- `failed` - Payment failed

## Setup & Testing

### 1. Seed Test Data
```bash
cd backend
npx ts-node src/scripts/seedVerifications.ts
```

### 2. Access Dashboard
- **User**: `/admin/verification` or `/seeker/verification`
- **Admin**: Login with admin credentials

### 3. Test Workflow
1. Create verification for a referral
2. Submit evidence (multiple types)
3. AI analyzes evidence automatically
4. Admin reviews if needed
5. Process payment on approval

## Admin Dashboard Features

### Statistics Cards
- **Total Verifications**: All-time count
- **Pending**: Awaiting review
- **Verified**: Approved cases
- **Total Paid**: Payment amount

### Search & Filters
- Search by company, role, or name
- Filter by status (pending, verified, etc.)
- Filter by stage (referral sent, joined, etc.)
- Clear filters option

### Verification Cards
- Status badges with color coding
- AI confidence progress bar
- Evidence count
- Payment amount
- Auto-verified indicator
- Manual review indicator
- Dispute indicator

### Detail Modal
- Complete verification information
- AI analysis with recommendations
- Payment breakdown
- Evidence list with view links
- Timeline with audit trail
- Admin notes
- Dispute information
- Action buttons (review, payment, dispute)

## Security Features

- ✅ JWT authentication required
- ✅ Role-based access control
- ✅ User verification (only seeker/referrer can access their verifications)
- ✅ Admin-only endpoints protected
- ✅ Evidence URL validation
- ✅ Payment transaction tracking

## Error Handling

### Common Errors
- `404` - Verification not found
- `403` - Unauthorized access
- `400` - Invalid data or missing required fields
- `500` - Server error

### User-Friendly Messages
- Evidence submission success/failure
- Payment processing status
- Dispute raised confirmation
- Manual review decision

## Best Practices

### For Users
1. Submit multiple evidence types
2. Ensure evidence URLs are accessible
3. Provide clear documentation
4. Raise disputes with detailed reasons

### For Admins
1. Review AI recommendations
2. Check all evidence before approval
3. Add detailed admin notes
4. Investigate disputed cases thoroughly

## Performance Optimizations

- Indexed database queries
- Pagination for large datasets
- Lazy loading of evidence
- Cached statistics
- Debounced search
- Optimized re-renders

## Future Enhancements

- [ ] File upload (not just URLs)
- [ ] Email notifications
- [ ] Bulk actions
- [ ] Export to CSV/PDF
- [ ] Advanced analytics
- [ ] Automated reminders
- [ ] Integration with payment gateways
- [ ] Mobile app support

## Support

For issues or questions:
1. Check API endpoint responses
2. Review browser console for errors
3. Verify authentication token
4. Contact development team

---

**Version**: 1.0.0  
**Last Updated**: December 2024  
**Status**: Production Ready ✅
