import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const deleteProfile = async () => {
  await mongoose.connect(process.env.MONGO_URI!);
  
  const db = mongoose.connection.db;
  const profiles = db.collection('profiles');
  
  const result = await profiles.deleteOne({ userId: new mongoose.Types.ObjectId('69164ccbcd1b121684f6171b') });
  console.log(`Deleted ${result.deletedCount} profile(s)`);
  
  await mongoose.disconnect();
};

deleteProfile();
