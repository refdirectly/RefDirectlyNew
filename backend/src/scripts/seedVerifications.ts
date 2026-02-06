import mongoose from 'mongoose';
import ReferralVerification from '../models/ReferralVerification';
import Referral from '../models/Referral';
import User from '../models/User';
import dotenv from 'dotenv';

dotenv.config();

const seedVerifications = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || '');
    console.log('Connected to MongoDB');

    // Get sample users and referrals
    const seekers = await User.find({ role: 'seeker' }).limit(5);
    const referrers = await User.find({ role: 'referrer' }).limit(5);
    const referrals = await Referral.find().limit(10);

    if (seekers.length === 0 || referrers.length === 0 || referrals.length === 0) {
      console.log('Not enough data. Please create users and referrals first.');
      process.exit(1);
    }

    // Clear existing verifications
    await ReferralVerification.deleteMany({});

    const verifications = [];
    const statuses = ['pending', 'under_review', 'verified', 'rejected', 'disputed'];
    const stages = ['referral_sent', 'interview_scheduled', 'offer_received', 'joined', 'completed'];
    const evidenceTypes = ['screenshot', 'email', 'offer_letter', 'joining_letter', 'payslip'];

    for (let i = 0; i < Math.min(10, referrals.length); i++) {
      const referral = referrals[i];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const stage = stages[Math.floor(Math.random() * stages.length)];
      const reward = 5000 + Math.floor(Math.random() * 15000);
      
      const verification = {
        referralId: referral._id,
        seekerId: referral.seekerId || seekers[i % seekers.length]._id,
        referrerId: referral.referrerId || referrers[i % referrers.length]._id,
        verificationStatus: status,
        verificationStage: stage,
        evidence: Array.from({ length: Math.floor(Math.random() * 4) + 1 }, (_, j) => ({
          type: evidenceTypes[Math.floor(Math.random() * evidenceTypes.length)],
          url: `https://example.com/evidence-${i}-${j}.pdf`,
          uploadedBy: Math.random() > 0.5 ? 'seeker' : 'referrer',
          uploadedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
          verified: Math.random() > 0.3
        })),
        aiAnalysis: {
          confidenceScore: Math.floor(Math.random() * 40) + 60,
          fraudRisk: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
          evidenceQuality: ['poor', 'fair', 'good', 'excellent'][Math.floor(Math.random() * 4)],
          recommendations: [
            'Request additional documentation',
            'Verify employment dates',
            'Cross-check with company records'
          ].slice(0, Math.floor(Math.random() * 3) + 1),
          analyzedAt: new Date()
        },
        payment: {
          totalAmount: reward,
          platformFee: reward * 0.1,
          referrerAmount: reward * 0.9,
          status: status === 'verified' ? (Math.random() > 0.5 ? 'completed' : 'pending') : 'pending',
          transactionId: status === 'verified' && Math.random() > 0.5 ? `TXN${Date.now()}${i}` : undefined,
          paidAt: status === 'verified' && Math.random() > 0.5 ? new Date() : undefined
        },
        timeline: [
          {
            stage: 'created',
            status: 'pending',
            date: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000),
            notes: 'Verification created',
            verifiedBy: 'system'
          },
          {
            stage: 'evidence_submitted',
            status: 'pending',
            date: new Date(Date.now() - Math.random() * 45 * 24 * 60 * 60 * 1000),
            notes: 'Initial evidence submitted',
            verifiedBy: 'user'
          }
        ],
        autoVerified: Math.random() > 0.7,
        manualReviewRequired: status === 'under_review' || status === 'disputed',
        adminNotes: status === 'rejected' ? 'Insufficient evidence provided' : undefined,
        dispute: status === 'disputed' ? {
          raised: true,
          raisedBy: Math.random() > 0.5 ? 'seeker' : 'referrer',
          reason: 'Payment not received as promised',
          raisedAt: new Date(Date.now() - Math.random() * 10 * 24 * 60 * 60 * 1000)
        } : undefined
      };

      verifications.push(verification);
    }

    await ReferralVerification.insertMany(verifications);
    console.log(`✅ Created ${verifications.length} verification records`);

    process.exit(0);
  } catch (error) {
    console.error('Error seeding verifications:', error);
    process.exit(1);
  }
};

seedVerifications();
