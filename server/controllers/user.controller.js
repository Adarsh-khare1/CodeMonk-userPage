import User from '../models/User.model.js';
import Submission from '../models/Submission.model.js';
import Problem from '../models/Problem.model.js';
import { validatePlatform, getDefaultProfile, validateProfileData } from '../utils/profileUtils.js';

export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password')
      .populate('solvedProblems.problemId', 'title difficulty category');

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getAnalytics = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);

    // Get category distribution
    const solvedProblems = await Problem.find({
      _id: { $in: user.solvedProblems.map((p) => p.problemId) },
    });

    const categoryCount = {};
    solvedProblems.forEach((problem) => {
      problem.category.forEach((cat) => {
        categoryCount[cat] = (categoryCount[cat] || 0) + 1;
      });
    });

    // Get activity data
    const activityData = user.activityByDate.slice(-365); // Last year

    res.json({
      streak: user.streak,
      activityByDate: activityData,
      categoryDistribution: categoryCount,
      totalSolved: user.solvedProblems.length,
      totalSubmissions: user.submissions.length,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const updateExternalProfile = async (req, res) => {
  try {
    const { platform, profile } = req.body;
    const userId = req.user._id;

    if (!validatePlatform(platform)) {
      return res.status(400).json({ message: 'Invalid platform' });
    }

    const user = await User.findById(userId);
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
    user.externalProfiles[platform] = getDefaultProfile(platform);

    await user.save();
    res.json({ externalProfiles: user.externalProfiles });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
