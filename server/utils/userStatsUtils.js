export const updateUserActivity = (user, date) => {
  const activityIndex = user.activityByDate.findIndex(
    (a) => a.date === date
  );
  if (activityIndex >= 0) {
    user.activityByDate[activityIndex].count += 1;
  } else {
    user.activityByDate.push({ date, count: 1 });
  }
};

export const updateUserStreak = (user) => {
  const lastSolvedDate = user.streak.lastSolvedDate;
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  if (!lastSolvedDate) {
    user.streak.current = 1;
    user.streak.lastSolvedDate = now;
  } else {
    const lastDate = new Date(lastSolvedDate);
    lastDate.setHours(0, 0, 0, 0);
    const daysDiff = Math.floor((now - lastDate) / (1000 * 60 * 60 * 24));

    if (daysDiff === 0) {
      // Same day, no change
    } else if (daysDiff === 1) {
      // Consecutive day
      user.streak.current += 1;
      user.streak.lastSolvedDate = now;
    } else {
      // Streak broken
      user.streak.current = 1;
      user.streak.lastSolvedDate = now;
    }
  }

  // Update longest streak
  if (user.streak.current > user.streak.longest) {
    user.streak.longest = user.streak.current;
  }
};

export const addSolvedProblem = (user, problemId) => {
  const alreadySolved = user.solvedProblems.some(
    (p) => p.problemId.toString() === problemId
  );
  if (!alreadySolved) {
    user.solvedProblems.push({ problemId });
  }
};

export const addSubmission = (user, submissionId) => {
  user.submissions.push({
    submissionId,
    date: new Date(),
  });
};