import mongoose from "mongoose";
import slugify from "slugify";

const problemSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, unique: true, trim: true }, // ✅ new slug field
    description: { type: String, required: true, trim: true },
    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      required: true,
    },
    topics: { type: [String], required: true },
    starterCode: { type: String, default: "" },
    sampleTestCases: [
      {
        input: { type: String, required: true },
        output: { type: String, required: true },
        explanation: { type: String, default: "" },
      },
    ],
    testCases: [
      {
        input: { type: String, required: true },
        expectedOutput: { type: String, required: true },
        isPublic: { type: Boolean, default: false },
      },
    ],
    constraints: { type: [String], default: [] },
    attemptsCount: { type: Number, default: 0 },
    acceptedCount: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

// Indexes for performance
problemSchema.index({ difficulty: 1 });
problemSchema.index({ topics: 1 });
problemSchema.index({ slug: 1 }); // 🔹 index for slug

// 🔹 Auto-generate slug from title before save
problemSchema.pre("save", function (next) {
  if (!this.isModified("title")) return next();
  this.slug = slugify(this.title, { lower: true, strict: true });
  next();
});

export default mongoose.model("Problem", problemSchema);
