import cron from 'node-cron';

export const startScheduler = () => {
  // Run every hour to check for expired referrals
  cron.schedule('0 * * * *', async () => {
    console.log('Running expired referrals check...');
    // TODO: Implement expired referrals check
  });
  
  console.log('Scheduler started - checking expired referrals every hour');
};
