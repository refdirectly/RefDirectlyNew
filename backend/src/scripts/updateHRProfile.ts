import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User';

dotenv.config();

async function updateHRProfile() {
  try {
    await mongoose.connect(process.env.MONGO_URI!);
    console.log('✅ Connected to MongoDB\n');

    const email = '20bec043@iiitdwd.ac.in';
    
    const hr = await User.findOne({ 
      email: email.toLowerCase(), 
      role: 'company_hr' 
    });

    if (!hr) {
      console.log(`❌ HR account not found\n`);
      process.exit(1);
    }

    // Update missing fields
    hr.company = hr.company || hr.currentCompany || 'Tech Company';
    hr.bio = hr.bio || `${hr.experience}+ years of experience in technical recruitment. Specialized in helping candidates navigate the interview process.`;
    hr.rating = hr.rating || 4.5;
    hr.pricePerSession = hr.pricePerSession || 199;
    
    await hr.save();

    console.log('✅ HR Profile Updated!\n');
    console.log(`Name: ${hr.name}`);
    console.log(`Email: ${hr.email}`);
    console.log(`Company: ${hr.company}`);
    console.log(`Title: ${hr.currentTitle}`);
    console.log(`Experience: ${hr.experience} years`);
    console.log(`Rating: ${hr.rating}`);
    console.log(`Price: ₹${hr.pricePerSession}`);
    console.log(`Bio: ${hr.bio}\n`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

updateHRProfile();
