import User from '../models/User.model.js';
import Submission from '../models/Submission.model.js';
import SubmissionHistory from '../models/SubmissionHistory.model.js';
import Problem from '../models/Problem.model.js';
import { validatePlatform, getDefaultProfile, validateProfileData } from '../utils/profileUtils.js';

/* ---------------- PROFILE ---------------- */

export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password')
      .populate('solvedProblems.problemId', 'title difficulty topics');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/* ---------------- ANALYTICS ---------------- */

export const getAnalytics = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get solved problem IDs
    const solvedIds = user.solvedProblems.map(p => p.problemId);

    const solvedProblems = await Problem.find({
      _id: { $in: solvedIds },
    });

    // Build topic distribution (not category)
    const topicCount = {};

    solvedProblems.forEach(problem => {
      if (Array.isArray(problem.topics)) {
        problem.topics.forEach(topic => {
          topicCount[topic] = (topicCount[topic] || 0) + 1;
        });
      }
    });

    res.json({
      streak: user.streak || { current: 0, longest: 0 },
      activityByDate: user.activityByDate || [],
      topicDistribution: topicCount,
      totalSolved: user.solvedProblems.length,
      totalSubmissions: user.submissions.length,
    });
  } catch (error) {
    console.error('ANALYTICS ERROR:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/* ---------------- EXTERNAL PROFILES ---------------- */

export const updateExternalProfile = async (req, res) => {
  try {
    const { platform, profile } = req.body;
    const userId = req.user._id;

    if (!validatePlatform(platform)) {
      return res.status(400).json({ message: 'Invalid platform' });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const validatedProfile = validateProfileData(platform, profile);

    user.externalProfiles[platform] = {
      ...user.externalProfiles[platform],
      ...validatedProfile,
    };

    await user.save();
    res.json({ externalProfiles: user.externalProfiles });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const removeExternalProfile = async (req, res) => {
  try {
    const { platform } = req.body;
    const userId = req.user._id;

    if (!validatePlatform(platform)) {
      return res.status(400).json({ message: 'Invalid platform' });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.externalProfiles[platform] = getDefaultProfile(platform);

    await user.save();
    res.json({ externalProfiles: user.externalProfiles });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/* ---------------- DASHBOARD ---------------- */

export const getDashboard = async (req, res) => {
  try {
    const userId = req.user._id;

    // Get all submissions for this user
    const allSubmissions = await SubmissionHistory.find({ userId });
    
    // Count solved problems (status === "Accepted")
    const solvedSubmissions = await SubmissionHistory.find({
      userId,
      status: 'Accepted'
    }).distinct('problemId');

    const solvedCount = solvedSubmissions.length;
    const attemptedCount = await SubmissionHistory.distinct('problemId', { userId }).then(ids => ids.length);
    const submissionsCount = allSubmissions.length;

    // Get solved problems with details
    const solvedProblems = await Problem.find({
      _id: { $in: solvedSubmissions }
    }).select('_id title');

    // Get last solved date for each problem
    const solvedProblemsWithDates = await Promise.all(
      solvedProblems.map(async (problem) => {
        const lastSubmission = await SubmissionHistory.findOne({
          userId,
          problemId: problem._id,
          status: 'Accepted'
        }).sort({ createdAt: -1 });

        return {
          problemId: problem._id,
          title: problem.title,
          lastSolvedAt: lastSubmission?.createdAt || null
        };
      })
    );

    res.json({
      solvedCount,
      attemptedCount,
      submissionsCount,
      solvedProblems: solvedProblemsWithDates
    });
  } catch (error) {
    console.error('DASHBOARD ERROR:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
