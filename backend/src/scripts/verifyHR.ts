import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User';

dotenv.config();

async function verifyHRAccount() {
  try {
    await mongoose.connect(process.env.MONGO_URI!);
    console.log('✅ Connected to MongoDB\n');

    const email = process.argv[2];
    
    if (!email) {
      console.log('Usage: npx ts-node src/scripts/verifyHR.ts <email>');
      console.log('Example: npx ts-node src/scripts/verifyHR.ts 20bec043@iiitdwd.ac.in\n');
      
      // Show all unverified HR accounts
      const unverifiedHRs = await User.find({ 
        role: 'company_hr', 
        verified: false 
      }).select('name email company currentTitle experience createdAt');
      
      if (unverifiedHRs.length > 0) {
        console.log('📋 Unverified HR Accounts:\n');
        unverifiedHRs.forEach((hr, idx) => {
          console.log(`${idx + 1}. ${hr.name}`);
          console.log(`   Email: ${hr.email}`);
          console.log(`   Company: ${hr.company}`);
          console.log(`   Title: ${hr.currentTitle}`);
          console.log(`   Experience: ${hr.experience} years`);
          console.log(`   Registered: ${hr.createdAt.toLocaleDateString()}\n`);
        });
      } else {
        console.log('✅ No unverified HR accounts found\n');
      }
      
      process.exit(0);
    }

    const hr = await User.findOne({ 
      email: email.toLowerCase(), 
      role: 'company_hr' 
    });

    if (!hr) {
      console.log(`❌ HR account not found with email: ${email}\n`);
      process.exit(1);
    }

    if (hr.verified) {
      console.log(`✅ ${hr.name} is already verified\n`);
      process.exit(0);
    }

    hr.verified = true;
    await hr.save();

    console.log('✅ HR Account Verified Successfully!\n');
    console.log(`Name: ${hr.name}`);
    console.log(`Email: ${hr.email}`);
    console.log(`Company: ${hr.company}`);
    console.log(`Title: ${hr.currentTitle}`);
    console.log(`Experience: ${hr.experience} years`);
    console.log(`\n🎉 This HR expert is now visible on the career experts page!\n`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

verifyHRAccount();
