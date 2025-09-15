const findTodaysTasksByUserId = async (userId) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  return db.task.findMany({
    where: {
      userId,
      dueDate: {
        gte: today,
        lt: tomorrow,
      },
      status: { not: 'COMPLETED' }
    }
  });
};
export default { findTodaysTasksByUserId };