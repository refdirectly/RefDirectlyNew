import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const listProfiles = async () => {
  await mongoose.connect(process.env.MONGO_URI!);
  
  const db = mongoose.connection.db;
  const profiles = db.collection('profiles');
  
  const allProfiles = await profiles.find({}).toArray();
  console.log(`Found ${allProfiles.length} profiles`);
  allProfiles.forEach(p => {
    console.log(`\nProfile ID: ${p._id}`);
    console.log(`User ID: ${p.userId}`);
    console.log(`Skills type: ${typeof p.skills}`);
    console.log(`Skills value:`, JSON.stringify(p.skills, null, 2));
  });
  
  await mongoose.disconnect();
};

listProfiles();
