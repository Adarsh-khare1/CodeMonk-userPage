import Comment from '../models/Comment.model.js';
import sanitizeHtml from 'sanitize-html';

// ---------------- GET COMMENTS ----------------
export const getComments = async (req, res) => {
  try {
    const { problemId } = req.query;

    if (!problemId) {
      return res.status(400).json({ message: 'Problem ID is required' });
    }

    // Fetch all comments for the problem in one query
    const allComments = await Comment.find({ problemId })
      .populate('userId', 'username email')
      .sort({ createdAt: -1 });

    // Map comments by their _id for quick access
    const commentMap = {};
    allComments.forEach((comment) => {
      commentMap[comment._id] = { ...comment.toObject(), replies: [] };
    });

    // Build the tree
    const rootComments = [];
    allComments.forEach((comment) => {
      if (comment.parentId) {
        // Append to parent if exists
        commentMap[comment.parentId]?.replies.push(commentMap[comment._id]);
      } else {
        // Top-level comment
        rootComments.push(commentMap[comment._id]);
      }
    });

    res.json(rootComments);
  } catch (error) {
    console.error('GET COMMENTS ERROR:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ---------------- CREATE COMMENT ----------------
export const createComment = async (req, res) => {
  try {
    const { problemId, content, parentId } = req.body;
    const userId = req.user._id;

    if (!problemId || !content || !content.trim()) {
      return res.status(400).json({ message: 'Problem ID and content are required' });
    }

    // Sanitize content to prevent XSS
    const sanitizedContent = sanitizeHtml(content.trim());

    const comment = new Comment({
      userId,
      problemId,
      content: sanitizedContent,
      parentId: parentId || null,
    });

    await comment.save();
    await comment.populate('userId', 'username email');

    res.status(201).json({
      ...comment.toObject(),
      message: 'Comment posted successfully',
    });
  } catch (error) {
    console.error('CREATE COMMENT ERROR:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
