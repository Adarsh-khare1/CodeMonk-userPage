import mongoose from 'mongoose';
import Problem from '../models/Problem.model.js';

export const getProblems = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ message: 'Database not connected' });
    }

    const { difficulty, topic, search } = req.query;
    const filter = {};

    if (difficulty) filter.difficulty = difficulty;

    // FIX: use topics instead of category
    if (topic) filter.topics = { $in: [topic] };

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const problems = await Problem.find(filter).sort({ createdAt: -1 });
    res.json(problems);
  } catch (error) {
    console.error('GET PROBLEMS ERROR:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getProblemById = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ message: 'Database unavailable' });
    }

    const problem = await Problem.findById(req.params.id);
    if (!problem) {
      return res.status(404).json({ message: 'Problem not found' });
    }

    res.json(problem);
  } catch (error) {
    console.error('GET PROBLEM ERROR:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
