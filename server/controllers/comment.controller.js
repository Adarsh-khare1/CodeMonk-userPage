import Comment from '../models/Comment.model.js';

export const getComments = async (req, res) => {
  try {
    const { problemId } = req.query;

    // Helper function to recursively build comment tree
    const buildCommentTree = async (parentId = null) => {
      const comments = await Comment.find({ problemId, parentId })
        .populate('userId', 'username email')
        .sort({ createdAt: -1 });

      // Recursively get replies for each comment
      const commentsWithReplies = await Promise.all(
        comments.map(async (comment) => {
          const replies = await buildCommentTree(comment._id);
          return {
            ...comment.toObject(),
            replies,
          };
        })
      );

      return commentsWithReplies;
    };

    const comments = await buildCommentTree();
    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const createComment = async (req, res) => {
  try {
    const { problemId, content, parentId } = req.body;
    const userId = req.user._id;

    if (!problemId || !content || !content.trim()) {
      return res.status(400).json({ message: 'Problem ID and content are required' });
    }

    const comment = new Comment({
      userId,
      problemId,
      content: content.trim(),
      parentId: parentId || null,
    });

    await comment.save();
    await comment.populate('userId', 'username email');

    res.status(201).json({
      ...comment.toObject(),
      message: 'Comment posted successfully',
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
