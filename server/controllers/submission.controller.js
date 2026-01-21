import Submission from '../models/Submission.model.js';
import Problem from '../models/Problem.model.js';
import User from '../models/User.model.js';
import { judgeSubmission, runSampleTests } from '../services/judge.service.js';
import { getAIFeedback } from '../services/ai.service.js';
import { updateUserActivity, updateUserStreak, addSolvedProblem, addSubmission } from '../utils/userStatsUtils.js';

export const runCode = async (req, res) => {
  try {
    const { problemId, code, language } = req.body;

    const problem = await Problem.findById(problemId);
    if (!problem) {
      return res.status(404).json({ message: 'Problem not found' });
    }

    // Run only sample test cases
    const sampleTests = problem.sampleTestCases || [];
    if (sampleTests.length === 0) {
      return res.status(400).json({ message: 'No sample test cases available' });
    }

    const results = await runSampleTests(code, sampleTests, language || 'javascript');

    res.json({ mode: "RUN", results });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const submitSolution = async (req, res) => {
  try {
    const { problemId, code, language } = req.body;
    const userId = req.user._id;

    const problem = await Problem.findById(problemId);
    if (!problem) {
      return res.status(404).json({ message: 'Problem not found' });
    }

    // Update attempts count
    problem.attemptsCount = (problem.attemptsCount || 0) + 1;

    const testResults = await judgeSubmission(code, problem.testCases, language || 'javascript');
    const aiFeedback = await getAIFeedback(code, testResults, problem.description);

    const submission = new Submission({
      userId,
      problemId,
      code,
      language: language || 'javascript',
      status: testResults.status,
      executionTime: testResults.executionTime,
      memoryUsed: testResults.memoryUsed,
      aiFeedback,
    });

    await submission.save();

    // Update user stats
    const user = await User.findById(userId);
    const today = new Date().toISOString().split('T')[0];

    updateUserActivity(user, today);

    if (testResults.status === 'Accepted') {
      addSolvedProblem(user, problemId);
      updateUserStreak(user);
      problem.acceptedCount = (problem.acceptedCount || 0) + 1;
    }

    addSubmission(user, submission._id);

    await user.save();
    await problem.save();

    res.status(201).json({
      submission,
      status: testResults.status,
      executionTime: testResults.executionTime,
      memoryUsed: testResults.memoryUsed,
      failedTest: testResults.failedTest || null,
      results: testResults.results,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getUserSubmissions = async (req, res) => {
  try {
    const userId = req.user._id;
    const { problemId } = req.query;

    const filter = { userId };
    if (problemId) filter.problemId = problemId;

    const submissions = await Submission.find(filter)
      .populate('problemId', 'title difficulty')
      .sort({ createdAt: -1 })
      .limit(50);

    res.json(submissions);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
