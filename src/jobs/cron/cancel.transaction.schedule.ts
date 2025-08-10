import cron from 'node-cron';
import { cancelTransactionsJob } from './cancel.transaction.jobs';

export const cancelTransactionSchedule = () => {
  cron.schedule('0 0 * * *', async () => {
    await cancelTransactionsJob();
  });
};