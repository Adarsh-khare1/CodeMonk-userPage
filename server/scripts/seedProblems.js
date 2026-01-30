import mongoose from "mongoose";
import dotenv from "dotenv";
import Problem from "../models/Problem.model.js";

dotenv.config();

const ADMIN_ID = new mongoose.Types.ObjectId("64f000000000000000000001");

// ============================
// Helper functions
// ============================

// Convert JSON array string to space-separated numbers for C/C++
function arrayToSpaceSeparated(input) {
  if (input.startsWith("[") && input.endsWith("]")) {
    return input.slice(1, -1).split(",").map(s => s.trim()).join(" ");
  }
  return input;
}

// ============================
// Test cases
// ============================

const twoSumSamples = [
  { input: arrayToSpaceSeparated("[2,7,11,15]") + " 9", output: "[0,1]" },
  { input: arrayToSpaceSeparated("[3,3]") + " 6", output: "[0,1]" }
];

const twoSumHidden = [
  { input: arrayToSpaceSeparated("[3,2,4]") + " 6", output: "[1,2]" },
  { input: arrayToSpaceSeparated("[1,5,7,9]") + " 10", output: "[0,3]" },
  { input: arrayToSpaceSeparated("[10,20,30,40]") + " 50", output: "[0,3]" },
  { input: arrayToSpaceSeparated("[4,6,8,2]") + " 10", output: "[0,1]" },
  { input: arrayToSpaceSeparated("[5,5,5,5]") + " 10", output: "[0,1]" },
  { input: arrayToSpaceSeparated("[0,4,3,0]") + " 0", output: "[0,3]" },
  { input: arrayToSpaceSeparated("[1,2,3,4,5]") + " 9", output: "[3,4]" },
  { input: arrayToSpaceSeparated("[2,11,7,15]") + " 9", output: "[0,2]" },
  { input: arrayToSpaceSeparated("[3,8,12,4]") + " 16", output: "[1,2]" },
  { input: arrayToSpaceSeparated("[6,3,5,9]") + " 14", output: "[2,3]" }
];

const reverseSamples = [
  { input: '"hello"', output: '"olleh"' },
  { input: '"abc"', output: '"cba"' }
];

const reverseHidden = [
  { input: '"abcd"', output: '"dcba"' },
  { input: '"racecar"', output: '"racecar"' },
  { input: '"z"', output: '"z"' },
  { input: '"leetcode"', output: '"edocteel"' },
  { input: '"openai"', output: '"ianepo"' },
  { input: '"testing"', output: '"gnitset"' },
  { input: '"abcdef"', output: '"fedcba"' },
  { input: '"aaa"', output: '"aaa"' },
  { input: '"12345"', output: '"54321"' },
  { input: '"Aba"', output: '"abA"' }
];

const binarySamples = [
  { input: arrayToSpaceSeparated("[1,2,3,4,5]") + " 4", output: "3" },
  { input: arrayToSpaceSeparated("[1,3,5,7]") + " 7", output: "3" }
];

const binaryHidden = [
  { input: arrayToSpaceSeparated("[1,2,3,4,5]") + " 6", output: "-1" },
  { input: arrayToSpaceSeparated("[10,20,30]") + " 10", output: "0" },
  { input: arrayToSpaceSeparated("[10,20,30]") + " 30", output: "2" },
  { input: arrayToSpaceSeparated("[5,10,15]") + " 15", output: "2" },
  { input: arrayToSpaceSeparated("[2,4,6,8]") + " 6", output: "2" },
  { input: arrayToSpaceSeparated("[2,4,6,8]") + " 7", output: "-1" },
  { input: arrayToSpaceSeparated("[1]") + " 1", output: "0" },
  { input: arrayToSpaceSeparated("[1]") + " 2", output: "-1" },
  { input: arrayToSpaceSeparated("[0,5,10]") + " 5", output: "1" },
  { input: arrayToSpaceSeparated("[0,5,10]") + " 0", output: "0" }
];

const maxSubSamples = [
  { input: arrayToSpaceSeparated("[-2,1,-3,4,-1,2,1,-5,4]"), output: "6" },
  { input: arrayToSpaceSeparated("[1]"), output: "1" }
];

const maxSubHidden = [
  { input: arrayToSpaceSeparated("[5,4,-1,7,8]"), output: "23" },
  { input: arrayToSpaceSeparated("[-1]"), output: "-1" },
  { input: arrayToSpaceSeparated("[-2,-1]"), output: "-1" },
  { input: arrayToSpaceSeparated("[1,2,3,4]"), output: "10" },
  { input: arrayToSpaceSeparated("[-1,-2,-3]"), output: "-1" },
  { input: arrayToSpaceSeparated("[3,-2,5,-1]"), output: "6" },
  { input: arrayToSpaceSeparated("[100,-1,2,-3,4]"), output: "102" },
  { input: arrayToSpaceSeparated("[1,-1,1,-1]"), output: "1" },
  { input: arrayToSpaceSeparated("[0,0,0,0,0,0,0,0,0,0,0]"), output: "0" },
  { input: arrayToSpaceSeparated("[-5,4,6,-3,4,-1]"), output: "11" }
];

// ============================
// Problems
// ============================

const problems = [
  {
    title: "Two Sum",
    description: "Find indices of two numbers that add up to the target.",
    difficulty: "Easy",
    topics: ["Array", "Hashing"],
    constraints: ["2 ≤ nums.length ≤ 10^4"],
    starterCode: `function twoSum(nums, target) {\n  // Write your code here\n}`,
    samples: twoSumSamples,
    hidden: twoSumHidden
  },
  {
    title: "Reverse String",
    description: "Reverse the given string.",
    difficulty: "Easy",
    topics: ["String"],
    constraints: ["1 ≤ length ≤ 10^5"],
    starterCode: `function reverseString(s) {\n  // Write your code here\n}`,
    samples: reverseSamples,
    hidden: reverseHidden
  },
  {
    title: "Binary Search",
    description: "Find target index using binary search.",
    difficulty: "Medium",
    topics: ["Binary Search"],
    constraints: ["1 ≤ n ≤ 10^5"],
    starterCode: `function binarySearch(arr, target) {\n  // Write your code here\n}`,
    samples: binarySamples,
    hidden: binaryHidden
  },
  {
    title: "Maximum Subarray",
    description: "Find the subarray with the maximum sum.",
    difficulty: "Medium",
    topics: ["Array", "DP"],
    constraints: ["1 ≤ n ≤ 10^5"],
    starterCode: `function maxSubArray(nums) {\n  // Write your code here\n}`,
    samples: maxSubSamples,
    hidden: maxSubHidden
  }
];

// ============================
// Seeder
// ============================

async function seedProblems() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ MongoDB connected");

    await Problem.deleteMany();
    console.log("🗑️ Old problems removed");

    const docs = problems.map(p => ({
      title: p.title,
      description: p.description,
      difficulty: p.difficulty,
      topics: p.topics,
      starterCode: p.starterCode,
      constraints: p.constraints,
      attemptsCount: 0,
      acceptedCount: 0,

      sampleTestCases: p.samples.map(s => ({
        input: s.input,
        output: s.output,
        explanation: ""
      })),

      testCases: p.hidden.map(h => ({
        input: h.input,
        expectedOutput: h.output,
        isPublic: false
      })),

      createdBy: ADMIN_ID
    }));

    await Problem.insertMany(docs);
    console.log(`🚀 Seeded ${docs.length} problems successfully`);
    process.exit(0);
  } catch (err) {
    console.error("❌ Seeding failed:", err);
    process.exit(1);
  }
}

seedProblems();
