import { runSampleTests, judgeSubmission } from "../services/judge.service.js";
import Submission from "../models/Submission.model.js";
import SubmissionHistory from "../models/SubmissionHistory.model.js";
import User from "../models/User.model.js";
import Problem from "../models/Problem.model.js";


/* =========================================
   Run code without saving (for "Run" button)
========================================= */
/* =========================================
   Run code without saving (Run button)
========================================= */


export const runCode = async (req, res) => {
  try {
    const { code, language, problemId } = req.body;

    if (!code || !language || !problemId) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // 1️⃣ Fetch problem from DB
    const problem = await Problem.findById(problemId);
    if (!problem) {
      return res.status(404).json({ error: "Problem not found" });
    }

    // 2️⃣ Use ONLY sample test cases
    const sampleTests = problem.sampleTestCases.map(tc => ({
      input: tc.input,
      expectedOutput: tc.output
    }));

    if (!sampleTests.length) {
      return res.status(400).json({ error: "No sample test cases defined" });
    }

    // 3️⃣ Run on Judge0
    const result = await runSampleTests(code, sampleTests, language);

    // 4️⃣ Format response for UI
    const formattedResult = {
      submission: {
        stdout: "",
        stderr: "",
        compile_output: "",
      },
      testResults: {
        passed: result.results.filter(r => r.passed).length,
        total: result.results.length,
        status: result.status,
        results: result.results.map((r, index) => ({
          testCase: index + 1,
          input: r.input || "",
          expectedOutput: r.expected || "",
          actualOutput: r.actual || "",
          passed: r.passed,
          error: r.error || null,
        }))
      }
    };

    res.json(formattedResult);

  } catch (err) {
    console.error("runCode error:", err);
    res.status(500).json({ error: err.message });
  }
};


/* =========================================
   Submit solution (save to DB)
========================================= */
export const submitSolution = async (req, res) => {
  try {
   const { code, language, problemId } = req.body;

if (!code || !language || !problemId) {
  return res.status(400).json({ error: "Missing required fields" });
}

// Fetch problem from DB
const problem = await Problem.findById(problemId);
if (!problem) {
  return res.status(404).json({ error: "Problem not found" });
}

// Only hidden test cases
const hiddenTests = problem.testCases
  .filter(tc => !tc.isPublic)
  .map(tc => ({
    input: tc.input,
      expectedOutput: tc.expectedOutput
  }));

if (!hiddenTests.length) {
  return res.status(400).json({ error: "No hidden test cases found" });
}


    // Judge hidden test cases
    // 1️⃣ Run sample tests first
const sampleTests = problem.sampleTestCases.map(tc => ({
  input: tc.input,
  expectedOutput: tc.output
}));

const sampleResult = await runSampleTests(code, sampleTests, language);

// ❌ If sample tests failed → return immediately
if (sampleResult.status !== "Accepted") {
  return res.json({
    submission: {},
    testResults: {
      passed: sampleResult.results.filter(r => r.passed).length,
      total: sampleResult.results.length,
      status: "Wrong Answer",
      results: sampleResult.results.map(r => ({
        testCase: r.testCase,
        input: r.input,
        expectedOutput: r.expected,
        actualOutput: r.actual,
        passed: r.passed,
        error: r.error
      }))
    }
  });
}
const hiddenResult = await judgeSubmission(code, hiddenTests, language);
// ❌ If any hidden test failed → send ONLY first failed case
if (hiddenResult.status !== "Accepted") {
  const failed = hiddenResult.results.find(r => !r.passed);

  return res.json({
    submission: {},
    testResults: {
      passed: sampleTests.length + hiddenResult.passed,
      total: sampleTests.length + hiddenTests.length,
      status: "Wrong Answer",
      results: [
        {
          testCase: "Hidden",
          input: failed.input,
          expectedOutput: failed.expected,
          actualOutput: failed.actual,
          passed: false,
          error: failed.error
        }
      ]
    }
  });
}
return res.json({
  submission: {},
  testResults: {
    passed: sampleTests.length + hiddenTests.length,
    total: sampleTests.length + hiddenTests.length,
    status: "Accepted",
    results: []   // No test list
  }
});




    // Save submission in DB
    const submission = await Submission.create({
      userId: req.user._id,
      problemId,
      code,
      language,
      status: result.status,
      executionTime: result.executionTime,
      memoryUsed: result.memoryUsed,
     results: result.results.map((r, index) => ({
  testCase: r.testCase ?? index + 1,   // GUARANTEED
  passed: r.passed,
  input: r.input || "",
  expectedOutput: r.expected || "",
  actualOutput:  r.actual || "",
  error: r.error || null,
}))

    });

    // Save to history
    await SubmissionHistory.create({
      userId: req.user._id,
      problemId,
      code,
      language,
      status: result.status,
      passed: result.passed,
      total: result.total,
    });



    // Transform for frontend
    const formattedResult = {
      submission: {
        stdout: "",
        stderr: "",
        compile_output: "",
      },
      testResults: {
        passed: result.passed,
        total: result.total,
        status: result.status,
        results: result.results.map(r => ({
          testCase: r.testCase,
          input: r.input || "",
          expectedOutput: r.expected || "",
          actualOutput: r.actual || "",
          passed: r.passed,
          error: r.error,
        })),
      },
    };
    const today = new Date();
const todayStr = today.toISOString().split("T")[0]; // "2026-01-30"

const user = await User.findById(req.user._id);

// 1️⃣ Push submission to user.submissions
user.submissions.push({
  submissionId: submission._id,
  date: today,
});

// 2️⃣ Update heatmap
const dayEntry = user.activityByDate.find(d => d.date === todayStr);
if (dayEntry) {
  dayEntry.count += 1;
} else {
  user.activityByDate.push({ date: todayStr, count: 1 });
}

// 3️⃣ If Accepted → solved + streak
if (result.status === "Accepted") {
  const alreadySolved = user.solvedProblems.some(
    p => p.problemId?.toString() === problemId.toString()
  );

  if (!alreadySolved) {
    user.solvedProblems.push({ problemId, solvedAt: today });
  }

  // 🔥 STREAK LOGIC
  const last = user.streak.lastSolvedDate
    ? new Date(user.streak.lastSolvedDate)
    : null;

  if (!last) {
    user.streak.current = 1;
  } else {
    const diff = Math.floor((today - last) / (1000 * 60 * 60 * 24));

    if (diff === 1) user.streak.current += 1;
    else if (diff > 1) user.streak.current = 1;
  }

  user.streak.lastSolvedDate = today;
  user.streak.longest = Math.max(user.streak.longest, user.streak.current);
}

await user.save();


    res.json(formattedResult);
  } catch (err) {
    console.error("submitSolution error:", err);
    res.status(500).json({ error: err.message });
  }
};


/* =========================================
   Get all submissions of logged-in user
========================================= */
export const getUserSubmissions = async (req, res) => {
  try {
    const submissions = await Submission.find({ userId: req.user._id })
      .populate("problemId", "title difficulty")
      .sort({ createdAt: -1 });

    res.json(submissions);
  } catch (err) {
    console.error("getUserSubmissions error:", err);
    res.status(500).json({ error: err.message });
  }
};

/* =========================================
   Get submission history for a problem
========================================= */
export const getProblemSubmissions = async (req, res) => {
  try {
    const { problemId } = req.params;
    const userId = req.user._id;

    const submissions = await SubmissionHistory.find({
      userId,
      problemId,
    })
      .sort({ createdAt: -1 })
      .select("code language status passed total createdAt")
      .limit(50);

    res.json(submissions);
  } catch (err) {
    console.error("getProblemSubmissions error:", err);
    res.status(500).json({ error: err.message });
  }
};
