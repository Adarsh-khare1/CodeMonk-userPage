import mongoose from "mongoose";
import Problem from "../models/Problem.model.js";
import Comment from "../models/Comment.model.js";
import sanitizeHtml from "sanitize-html";


// ---------------- GET COMMENTS ----------------
export const getComments = async (req, res) => {
  try {
    const identifier = req.query.problemId;
    if (!identifier) {
      return res.status(400).json({ message: "Problem ID is required" });
    }

    // 1️⃣ Resolve slug OR _id → real ObjectId
    const problem = await Problem.findOne({
      $or: [
        { slug: identifier },
        ...(mongoose.Types.ObjectId.isValid(identifier)
          ? [{ _id: identifier }]
          : [])
      ]
    }).select("_id");

    if (!problem) {
      return res.status(404).json({ message: "Problem not found" });
    }

    // 2️⃣ Load comments
    const allComments = await Comment.find({ problemId: problem._id })
      .populate("userId", "username email")
      .sort({ createdAt: -1 })
      .lean();   // 🔥 CRITICAL — removes ObjectId wrappers

    // 3️⃣ Build map using string keys
    const commentMap = {};
    allComments.forEach(c => {
      commentMap[c._id.toString()] = { ...c, replies: [] };
    });

    // 4️⃣ Build tree safely
    const rootComments = [];

    allComments.forEach(c => {
      const id = c._id.toString();
      const parent = c.parentId?.toString();

      if (parent && commentMap[parent]) {
        commentMap[parent].replies.push(commentMap[id]);
      } else {
        rootComments.push(commentMap[id]);
      }
    });

    res.json(rootComments);
  } catch (error) {
    console.error("GET COMMENTS ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ---------------- CREATE COMMENT ----------------
export const createComment = async (req, res) => {
  try {
    const { problemId: identifier, content, parentId } = req.body;
    const userId = req.user._id;

    if (!identifier || !content || !content.trim()) {
      return res.status(400).json({ message: "Problem ID and content are required" });
    }

    // 1️⃣ Resolve slug OR _id → real ObjectId
    const problem = await Problem.findOne({
      $or: [
        { slug: identifier },
        ...(mongoose.Types.ObjectId.isValid(identifier)
          ? [{ _id: identifier }]
          : [])
      ]
    }).select("_id");

    if (!problem) {
      return res.status(404).json({ message: "Problem not found" });
    }

    // 2️⃣ Sanitize
    const sanitizedContent = sanitizeHtml(content.trim());

    // 3️⃣ Save using REAL ObjectId
    const comment = new Comment({
      userId,
      problemId: problem._id,
      content: sanitizedContent,
      parentId: parentId || null
    });

    await comment.save();
    await comment.populate("userId", "username email");

    res.status(201).json(comment);
  } catch (error) {
    console.error("CREATE COMMENT ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};