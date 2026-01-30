import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  problemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Problem',
    required: true,
    index: true, // Faster lookups
  },
  content: {
    type: String,
    required: true,
    trim: true,
  },
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment',
    default: null,
    index: true, // Faster tree building
  },
}, {
  timestamps: true,
});

export default mongoose.model('Comment', commentSchema);
