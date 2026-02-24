import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const fixSkills = async () => {
  await mongoose.connect(process.env.MONGO_URI!);
  
  const db = mongoose.connection.db;
  const profiles = db.collection('profiles');
  
  const result = await profiles.updateMany(
    { $or: [
      { skills: { $type: 'array' } },
      { skills: { $type: 'string' } },
      { 'skills.technical': { $exists: false } }
    ]},
    [{ $set: { 
      skills: { 
        technical: { $cond: [{ $isArray: '$skills' }, '$skills', []] },
        soft: [],
        certifications: []
      }
    }}]
  );
  
  console.log(`Fixed ${result.modifiedCount} profiles`);
  await mongoose.disconnect();
};

fixSkills();
