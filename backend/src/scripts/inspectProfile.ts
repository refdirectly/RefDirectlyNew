import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const inspect = async () => {
  await mongoose.connect(process.env.MONGO_URI!);
  
  const db = mongoose.connection.db;
  const profiles = db.collection('profiles');
  
  const profile = await profiles.findOne({ userId: new mongoose.Types.ObjectId('69164ccbcd1b121684f6171b') });
  console.log('Profile found:', JSON.stringify(profile, null, 2));
  
  await mongoose.disconnect();
};

inspect();
