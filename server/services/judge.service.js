import fetch from "node-fetch";

/* =========================================
   Judge0 Self-Hosted Configuration
========================================= */

const JUDGE0_URL = process.env.JUDGE0_URL || "http://localhost:2358";
const JUDGE0_API_KEY = process.env.JUDGE0_API_KEY || "";

/* =========================================
   Language IDs (Judge0 CE v1.13.1)
========================================= */

const LANGUAGE_IDS = {
  c: 50,
  cpp: 54,
  java: 62,
  python: 71,
  javascript: 63
};

/* =========================================
   Status Mapping
========================================= */

const STATUS_MAP = {
  1: "In Queue",
  2: "Processing",
  3: "Accepted",
  4: "Wrong Answer",
  5: "Time Limit Exceeded",
  6: "Compilation Error",
  7: "Runtime Error",
  8: "Runtime Error",
  9: "Runtime Error",
  10: "Runtime Error",
  11: "Runtime Error",
  12: "Runtime Error",
  13: "Internal Error"
};

const MAX_WAIT_TIME = 10000;
const POLL_INTERVAL = 500;

/* =========================================
   Headers
========================================= */

const getHeaders = () => {
  const headers = {
    "Content-Type": "application/json"
  };

  if (JUDGE0_API_KEY) {
    headers["X-Auth-Token"] = JUDGE0_API_KEY;
  }

  return headers;
};

/* =========================================
   Helpers
========================================= */

const normalizeOutput = (out) => {
  if (!out) return "";
  return out.trim().replace(/\r\n/g, "\n").replace(/\r/g, "\n");
};

/* =========================================
   Submit Code
========================================= */

const submitToJudge0 = async (code, languageId, stdin, expectedOutput) => {
  const url = `${JUDGE0_URL}/submissions?base64_encoded=true`;


const body = {
  source_code: Buffer.from(code).toString("base64"),
  language_id: languageId,
  stdin: Buffer.from(stdin || "").toString("base64"),
  expected_output: Buffer.from(expectedOutput || "").toString("base64"),
  cpu_time_limit: 2,
  wall_time_limit: 3,
  memory_limit: 256000,
  enable_network: false
};

  const response = await fetch(url, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(err);
  }

  const data = await response.json();
  return data.token;
};

/* =========================================
   Get Result
========================================= */

const getSubmissionResult = async (token) => {
  const url = `${JUDGE0_URL}/submissions/${token}?base64_encoded=true`;

  const response = await fetch(url, {
    method: "GET",
    headers: getHeaders()
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(err);
  }

  return response.json();
};

/* =========================================
   Poll
========================================= */

const pollSubmission = async (token) => {
  const start = Date.now();

  while (Date.now() - start < MAX_WAIT_TIME) {
    const result = await getSubmissionResult(token);

    if (result.status.id !== 1 && result.status.id !== 2) {
      return result;
    }

    await new Promise((r) => setTimeout(r, POLL_INTERVAL));
  }

  throw new Error("Execution Timeout");
};

/* =========================================
   Run Single Test
========================================= */

const runTestCase = async (code, languageId, input, expectedOutput) => {
  const token = await submitToJudge0(code, languageId, input, expectedOutput);
  const result = await pollSubmission(token);

  const decode = (v) => v ? Buffer.from(v, "base64").toString() : "";
const stdout = decode(result.stdout);
const stderr = decode(result.stderr);
const compile = decode(result.compile_output);
let actual = stdout || compile || stderr;


  actual = normalizeOutput(actual);
  const expected = normalizeOutput(expectedOutput || "");

  const status = STATUS_MAP[result.status.id] || "Error";
  const passed = status === "Accepted" && actual === expected;

  // Format error object if there's an error
  let errorObj = null;
  if (compile || stderr) {
    const errorText = compile || stderr || "";
    errorObj = {
      message: errorText.split('\n')[0] || "Error occurred",
      full: errorText,
      line: null
    };
  }

  return {
    input,
    status,
    passed,
    actual,
    expected,
    error: errorObj,
    executionTime: result.time ? parseFloat(result.time) * 1000 : 0,
    memoryUsed: result.memory || 0
  };
};

/* =========================================
   Sample Tests (Public)
========================================= */

export const runSampleTests = async (code, sampleTests, language) => {
  const languageId = LANGUAGE_IDS[language.toLowerCase()];
  if (!languageId) throw new Error("Unsupported Language");

  const results = [];
  let allPassed = true;

  for (let i = 0; i < sampleTests.length; i++) {
    const t = sampleTests[i];
    const r = await runTestCase(code, languageId, t.input, t.expectedOutput);


    results.push({
      testCase: i + 1,
      passed: r.passed,
      input: r.input,  
      expected: r.expected,
      actual: r.actual,
      error: r.error
    });

    if (!r.passed) allPassed = false;
  }

return {
  status: allPassed ? "Accepted" : "Wrong Answer",
  results
};

};

/* =========================================
   Final Judge (Hidden Tests)
========================================= */

export const judgeSubmission = async (code, testCases, language) => {
  const languageId = LANGUAGE_IDS[language.toLowerCase()];
  if (!languageId) throw new Error("Unsupported Language");

  let passed = 0;
  let time = 0;
  let memory = 0;

  const results = [];

  let hasCompileError = false;
  let hasRuntimeError = false;

  for (let i = 0; i < testCases.length; i++) {
    const t = testCases[i];
    const r = await runTestCase(code, languageId, t.input, t.expectedOutput);

    time += r.executionTime;
    memory = Math.max(memory, r.memoryUsed);

    if (r.passed) passed++;

    if (r.error) {
      if (r.status === "Compilation Error") hasCompileError = true;
      if (r.status === "Runtime Error") hasRuntimeError = true;
    }

    results.push({
      testCase: i + 1,
      passed: r.passed,
      input: r.input,
      expected: r.expected,
      actual: r.actual,
      error: r.error
    });
  }

  // 🔥 REAL FINAL STATUS
  let finalStatus;
  if (hasCompileError) finalStatus = "Compilation Error";
  else if (hasRuntimeError) finalStatus = "Runtime Error";
  else if (passed === testCases.length) finalStatus = "Accepted";
  else finalStatus = "Wrong Answer";

  return {
    status: finalStatus,
    passed,
    total: testCases.length,
    executionTime: testCases.length > 0 ? Math.round(time / testCases.length) : 0,
    memoryUsed: memory,
    results
  };
};
