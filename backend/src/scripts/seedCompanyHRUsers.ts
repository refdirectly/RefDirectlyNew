import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from '../models/User';

dotenv.config();

const testCompanies = [
  { name: 'Google', email: 'hr@google.com' },
  { name: 'Amazon', email: 'hr@amazon.com' },
  { name: 'Microsoft', email: 'hr@microsoft.com' },
  { name: 'Meta', email: 'hr@meta.com' },
  { name: 'Apple', email: 'hr@apple.com' },
  { name: 'Netflix', email: 'hr@netflix.com' },
  { name: 'Tesla', email: 'hr@tesla.com' },
  { name: 'Uber', email: 'hr@uber.com' },
  { name: 'Airbnb', email: 'hr@airbnb.com' },
  { name: 'Spotify', email: 'hr@spotify.com' }
];

async function seedCompanyHRUsers() {
  try {
    await mongoose.connect(process.env.MONGO_URI!);
    console.log('✅ Connected to MongoDB');

    const password = 'hr123456'; // Default password for all test HRs
    const hashedPassword = await bcrypt.hash(password, 10);

    for (const company of testCompanies) {
      // Check if HR already exists
      const existingHR = await User.findOne({ 
        email: company.email,
        role: 'company_hr'
      });

      if (existingHR) {
        console.log(`⏭️  HR for ${company.name} already exists`);
        continue;
      }

      // Create new HR user
      const hr = new User({
        name: `${company.name} HR`,
        displayName: `${company.name} HR Team`,
        email: company.email,
        passwordHash: hashedPassword,
        role: 'company_hr',
        company: company.name,
        currentCompany: company.name,
        currentTitle: 'HR Manager',
        isActive: true,
        verified: true,
        bio: `Official HR representative for ${company.name}. Here to help candidates through the interview process.`,
        avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(company.name)}&background=8B5CF6&color=fff&size=200`
      });

      await hr.save();
      console.log(`✅ Created HR for ${company.name} (${company.email})`);
    }

    console.log('\n🎉 All company HR users created successfully!');
    console.log('\n📝 Login Credentials:');
    console.log('Email: hr@[company].com (e.g., hr@google.com)');
    console.log(`Password: ${password}`);
    console.log('\n🔐 Remember to change passwords in production!');

  } catch (error) {
    console.error('❌ Error seeding HR users:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 Disconnected from MongoDB');
  }
}

// Run the script
seedCompanyHRUsers();
