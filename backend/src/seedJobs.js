// scripts/seedJobs.js
import prisma from './config/db.js';

async function seedJobs() {
  const companyId = 'cmb6pxghf0001vvkck7n1p20f';

//   const workflows = [
//     {
//       id: 'default',
//       companyId,
//       name: 'Workflow par défaut',
//       stages: [
//         { id: '1', name: 'Applied', type: 'applied', order: 0, dueDays: 7 },
//         { id: '2', name: 'Review', type: 'review', order: 1, dueDays: 14 },
//         { id: '3', name: 'Interview', type: 'interview', order: 2, dueDays: 21 },
//         { id: '4', name: 'Offer', type: 'offer', order: 3, dueDays: 28 },
//       ],
//     },
//   ];

//   for (const workflow of workflows) {
//     await prisma.workflow.upsert({
//       where: { id: workflow.id },
//       update: {},
//       create: workflow,
//     });
//   }

  const jobs = [
    {
      companyId,
      title: 'Développeur Full Stack',
      description: 'Développer des applications web innovantes.',
      requiredSkills: ['JavaScript', 'React'],
      preferredSkills: ['Node.js'],
      location: 'Paris, France',
      jobType: 'full-time',
      workType: 'hybrid',
      minYearsExperience: 3,
      salaryRange: '45000-65000 EUR annual',
      department: 'Information Technology',
      jobCode: 'DEV-2025-01',
      status: 'DRAFT',
      applicationFields: {
        name: { required: true },
        email: { required: true },
        phone: { required: false },
        resume: { required: true },
        coverLetter: { required: false },
      },
      customQuestions: [],
      hiringTeam: [],
      workflowId: 'default',
      jobBoards: [],
    },
  ];

  for (const job of jobs) {
    await prisma.job.upsert({
      where: { title_companyId: { title: job.title, companyId } },
      update: {},
      create: job,
    });
  }

  console.log('Jobs and workflows seeded successfully.');
}

seedJobs()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });