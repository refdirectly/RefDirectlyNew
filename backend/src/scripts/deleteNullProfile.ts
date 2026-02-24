import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const deleteNullProfile = async () => {
  await mongoose.connect(process.env.MONGO_URI!);
  
  const db = mongoose.connection.db;
  const profiles = db.collection('profiles');
  
  const result = await profiles.deleteMany({ userId: null });
  console.log(`Deleted ${result.deletedCount} profile(s) with null userId`);
  
  await mongoose.disconnect();
};

deleteNullProfile();
