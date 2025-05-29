// // src/workers/deployWorker.ts
// import { Worker } from 'bullmq';
// import { redis } from '../lib/redis';
// import { processDeployJob } from '../services/deployService';

// export const deployWorker = new Worker(
//   'deployCampaign',
//   async job => {
//     return await processDeployJob(job.data);
//   },
//   { connection: redis }
// );

// deployWorker.on('error', err => {
//   console.error('Worker error', err);
// });
