import mongoose from 'mongoose';

const problemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    required: true,
  },
  category: {
    type: [String],
    required: true,
  },
  starterCode: {
    type: String,
    required: true,
  },
  sampleTestCases: [{
    input: { type: String, required: true },
    output: { type: String, required: true },
    explanation: { type: String, default: '' },
  }],
  testCases: [{
    input: { type: String, required: true },
    expectedOutput: { type: String, required: true },
    isPublic: { type: Boolean, default: false },
  }],
  constraints: {
    type: String,
    default: '',
  },
  attemptsCount: {
    type: Number,
    default: 0,
  },
  acceptedCount: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

export default mongoose.model('Problem', problemSchema);
