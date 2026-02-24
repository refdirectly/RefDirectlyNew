const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
  console.log('Connected to MongoDB');
  const result = await mongoose.connection.db.collection('profiles').deleteMany({});
  console.log(`Deleted ${result.deletedCount} corrupted profiles`);
  process.exit(0);
}).catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
