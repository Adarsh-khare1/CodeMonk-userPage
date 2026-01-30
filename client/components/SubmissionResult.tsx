import React from "react";

interface ErrorObject {
  message?: string;
  full?: string;
  line?: number | null;
}

interface TestCaseResult {
  testCase?: number;
  passed: boolean;
  input?: string;
  expectedOutput?: string;
  actualOutput?: string;
  error?: string | ErrorObject | null;
}

interface TestResults {
  passed: number;
  total: number;
  results: TestCaseResult[];
  status?: string;
}

interface Submission {
  status: string;
  stdout?: string;
  stderr?: string;
  compile_output?: string;
  aiFeedback?: string;
}

interface SubmissionResultType {
  error?: string;
  submission?: Submission;
  testResults?: TestResults;
}

interface SubmissionResultProps {
  result: SubmissionResultType | null;
}

export default function SubmissionResult({ result }: SubmissionResultProps) {
  if (!result) return null;

  if (result.error) {
    return (
      <div className="bg-gray-800 p-4 rounded text-red-400">
        {result.error}
      </div>
    );
  }
const status = result.submission?.status || result.testResults?.status;

// Helper to extract error message from error object or string
const getErrorMessage = (error: string | ErrorObject | null | undefined): string | null => {
  if (!error) return null;
  if (typeof error === 'string') return error;
  if (typeof error === 'object' && error !== null) {
    return error.message || error.full || null;
  }
  return null;
};

// Helper to get error line
const getErrorLine = (error: string | ErrorObject | null | undefined): number | null => {
  if (!error || typeof error !== 'object' || error === null) return null;
  return error.line || null;
};

const compileError =
  result.testResults?.status === "Compilation Error"
    ? result.submission?.compile_output || getErrorMessage(result.testResults?.results[0]?.error)
    : null;


  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
      <h2 className="text-xl font-bold mb-4">Submission Result</h2>

      {status && (
        <div
          className={`text-lg font-semibold mb-4 ${
            status === "Accepted" ? "text-green-400" : "text-red-400"
          }`}
        >
          {status}
        </div>
      )}

      {/* GLOBAL COMPILATION ERROR */}
      {compileError && (
        <div className="mb-4 bg-red-900/30 border border-red-700 rounded p-3 text-red-300 text-sm">
          <b>Compilation / Runtime Error:</b>
          <div className="mt-2 max-h-64 overflow-y-auto break-words whitespace-pre-wrap font-mono">
            {compileError}
          </div>
        </div>
      )}

      {/* TEST CASES */}
      {result.testResults && (
        <>
          <div className="mb-2 text-gray-300">
            Passed: {result.testResults.passed} / {result.testResults.total}
          </div>

          <div className="space-y-3">
            {result.testResults.results.map((r, i) => {
              const testCaseNum = r.testCase !== undefined ? r.testCase : i + 1;
              const errorMsg = getErrorMessage(r.error);
              const errorLine = getErrorLine(r.error);
              const isTLE = result.testResults?.status === "Time Limit Exceeded";
              
              return (
                <div
                  key={i}
                  className={`rounded p-3 text-sm border ${
                    r.passed
                      ? "bg-green-900/20 border-green-700"
                      : "bg-red-900/20 border-red-700"
                  }`}
                >
                  <div className="font-semibold mb-2">
                    Test Case {testCaseNum}: {r.passed ? "Passed" : (isTLE ? "Time Limit Exceeded" : "Failed")}
                  </div>

                  {errorMsg && (
                    <div className="mb-2 p-2 bg-red-900/30 border border-red-700 rounded text-red-300 text-xs">
                      <div className="font-semibold">Error:</div>
                      <div className="whitespace-pre-wrap break-words">{errorMsg}</div>
                      {errorLine !== null && (
                        <div className="mt-1 text-red-400">Line: {errorLine}</div>
                      )}
                    </div>
                  )}

                  <div className="grid grid-cols-3 gap-4 text-xs font-mono text-gray-200">
                    <div>
                      <div className="text-gray-400 mb-1">Input</div>
                      <div className="max-h-32 overflow-y-auto break-words whitespace-pre-wrap bg-gray-900/50 p-2 rounded">
                        {r.input || ""}
                      </div>
                    </div>

                    <div>
                      <div className="text-gray-400 mb-1">Expected</div>
                      <div className="max-h-32 overflow-y-auto break-words whitespace-pre-wrap bg-gray-900/50 p-2 rounded">
                        {r.expectedOutput || ""}
                      </div>
                    </div>

                    <div>
                      <div className="text-gray-400 mb-1">Your Output</div>
                      <div className="max-h-32 overflow-y-auto break-words whitespace-pre-wrap bg-gray-900/50 p-2 rounded">
                        {r.actualOutput || ""}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
