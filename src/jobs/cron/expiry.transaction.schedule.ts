import cron from 'node-cron';
import { expiryTransactionsJob } from './expiry.transaction.jobs';

export const expiryTransactionSchedule = () => {
  cron.schedule('* * * * *', async () => {
    await expiryTransactionsJob();
  });
};