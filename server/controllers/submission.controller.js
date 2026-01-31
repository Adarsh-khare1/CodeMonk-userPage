import mongoose from "mongoose";
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
    const userId = req.user._id;

    if (!code || !language || !problemId) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const problem = await Problem.findById(problemId);
    if (!problem) return res.status(404).json({ error: "Problem not found" });

    const sampleTests = problem.sampleTestCases.map(tc => ({
      input: tc.input,
      expectedOutput: tc.output
    }));

    const hiddenTests = problem.testCases
      .filter(tc => !tc.isPublic)
      .map(tc => ({
        input: tc.input,
        expectedOutput: tc.expectedOutput
      }));

    // ================================
    // RUN SAMPLE
    // ================================
    const sampleResult = await runSampleTests(code, sampleTests, language);

    let hiddenResult = null;
    let finalResult = null;   // 👈 what UI + DB will use

    if (sampleResult.status !== "Accepted") {
      finalResult = {
        status: "Wrong Answer",
        results: sampleResult.results,
        passed: sampleResult.results.filter(r => r.passed).length,
        total: sampleResult.results.length
      };
    } else {
      // ================================
      // RUN HIDDEN
      // ================================
      hiddenResult = await judgeSubmission(code, hiddenTests, language);

      if (hiddenResult.status !== "Accepted") {
        const failed = hiddenResult.results.find(r => !r.passed);

        finalResult = {
          status: "Wrong Answer",
          results: [
            {
              testCase: -1, // 👈 store as number for MongoDB
              label: "Hidden", // 👈 keep for UI
              input: failed.input,
              expected: failed.expected,
              actual: failed.actual,
              passed: false,
              error: failed.error
            }
          ],
          passed: sampleTests.length + hiddenResult.passed,
          total: sampleTests.length + hiddenTests.length
        };
      } else {
        finalResult = {
          status: "Accepted",
          results: [],
          passed: sampleTests.length + hiddenTests.length,
          total: sampleTests.length + hiddenTests.length
        };
      }
    }

    // ================================
    // SAVE SUBMISSION ✅
    // ================================
    const submission = await Submission.create({
      userId,
      problemId,
      code,
      language,
      status: finalResult.status,
      results: finalResult.results.map((r, i) => ({
        testCase: typeof r.testCase === "number" ? r.testCase : i + 1,

        passed: r.passed,
        input: r.input || "",
        expectedOutput: r.expected || "",
        actualOutput: r.actual || "",
        error: r.error || null
      }))
    });

    await SubmissionHistory.create({
      userId,
      problemId,
      code,
      language,
      status: finalResult.status,
      passed: finalResult.passed,
      total: finalResult.total
    });

    // ================================
    // USER + STREAK + HEATMAP
    // ================================
    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];
    const user = await User.findById(userId);

    user.submissions.push({ submissionId: submission._id, date: today });

    const day = user.activityByDate.find(d => d.date === todayStr);
    if (day) day.count += 1;
    else user.activityByDate.push({ date: todayStr, count: 1 });

    if (finalResult.status === "Accepted") {
      const alreadySolved = user.solvedProblems.some(
        p => p.problemId.toString() === problemId.toString()
      );

      if (!alreadySolved) {
        user.solvedProblems.push({ problemId, solvedAt: today });
      }

      const last = user.streak.lastSolvedDate
        ? new Date(user.streak.lastSolvedDate)
        : null;

      if (!last) user.streak.current = 1;
      else {
        const lastDate = new Date(last.toDateString());
const todayDate = new Date(today.toDateString());

const diff = (todayDate - lastDate) / 86400000;

        if (diff === 1) user.streak.current++;
        else if (diff > 1) user.streak.current = 1;
      }

      user.streak.lastSolvedDate = today;
      user.streak.longest = Math.max(user.streak.longest, user.streak.current);
    }

    await user.save();

    // ================================
    // SEND UI RESPONSE (unchanged)
    // ================================
    return res.json({
      submission: {},
      testResults: {
        passed: finalResult.passed,
        total: finalResult.total,
        status: finalResult.status,
        results: finalResult.results.map(r => ({
  testCase: r.testCase === -1 ? "Hidden" : r.testCase,
  input: r.input,
  expectedOutput: r.expected,
  actualOutput: r.actual,
  passed: r.passed,
  error: r.error
}))

      }
    });

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
   Get my submissions (for Dashboard Submissions page)
========================================= */
export const getMySubmissions = async (req, res) => {
  try {
    const userId = req.user._id;
    const submissions = await Submission.find({ userId })
      .populate("problemId", "title")
      .sort({ createdAt: -1 })
      .lean();

    const list = submissions.map((s) => ({
      _id: s._id,
      problemId: s.problemId?._id ?? s.problemId,
      problemTitle: s.problemId?.title ?? "",
      language: s.language,
      status: s.status,
      createdAt: s.createdAt,
      code: s.code,
    }));

    res.json(list);
  } catch (err) {
    console.error("getMySubmissions error:", err);
    res.status(500).json({ error: err.message });
  }
};

/* =========================================
   Get one submission by id (for loading code on problem page)
========================================= */
export const getSubmissionById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const submission = await Submission.findOne({ _id: id, userId }).lean();
    if (!submission) {
      return res.status(404).json({ error: "Submission not found" });
    }

    res.json({
      _id: submission._id,
      problemId: submission.problemId,
      language: submission.language,
      status: submission.status,
      createdAt: submission.createdAt,
      code: submission.code,
    });
  } catch (err) {
    console.error("getSubmissionById error:", err);
    res.status(500).json({ error: err.message });
  }
};

/* =========================================
   Get submission history for a problem
========================================= */
export const getProblemSubmissions = async (req, res) => {
  try {
    const identifier = req.params.problemId;
    const userId = req.user._id;

    // 1️⃣ Resolve slug → ObjectId
    const problem = await Problem.findOne({
      isDeleted: { $ne: true },
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

    // 2️⃣ Use real ObjectId
    const submissions = await SubmissionHistory.find({
      userId,
      problemId: problem._id
    })
      .sort({ createdAt: -1 })
      .select("code language status passed total createdAt")
      .limit(50);

    res.json(submissions);
  } catch (err) {
    console.error("getProblemSubmissions error:", err);
    res.status(500).json({ message: "Server error" });
  }
};