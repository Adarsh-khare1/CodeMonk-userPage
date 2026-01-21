import mongoose from 'mongoose';

const submissionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  problemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Problem',
    required: true,
  },
  code: {
    type: String,
    required: true,
  },
  language: {
    type: String,
    default: 'javascript',
  },
  status: {
    type: String,
    enum: ['Accepted', 'Wrong Answer', 'Time Limit Exceeded', 'Runtime Error', 'Compilation Error'],
    required: true,
  },
  executionTime: {
    type: Number,
    default: 0,
  },
  memoryUsed: {
    type: Number,
    default: 0,
  },
  aiFeedback: {
    type: String,
    default: '',
  },
}, {
  timestamps: true,
});

export default mongoose.model('Submission', submissionSchema);
