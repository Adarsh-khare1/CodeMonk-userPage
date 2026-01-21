interface SubmissionResultProps {
  result: any;
}

export default function SubmissionResult({ result }: SubmissionResultProps) {
  if (!result) return null;

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
      <h2 className="text-xl font-bold mb-4">Submission Result</h2>
      {result.error ? (
        <div className="text-red-400">{result.error}</div>
      ) : (
        <div className="space-y-4">
          <div
            className={`text-lg font-semibold ${
              result.submission?.status === 'Accepted'
                ? 'text-green-400'
                : 'text-red-400'
            }`}
          >
            {result.submission?.status || result.testResults?.status}
          </div>
          {result.testResults && (
            <div>
              <p className="text-gray-300 mb-2">
                Passed: {result.testResults.passed} /{' '}
                {result.testResults.total}
              </p>
              <div className="space-y-2">
                {result.testResults.results?.map((r: any, i: number) => (
                  <div
                    key={i}
                    className={`p-2 rounded text-sm ${
                      r.passed
                        ? 'bg-green-900/30 border border-green-700'
                        : 'bg-red-900/30 border border-red-700'
                    }`}
                  >
                    Test {i + 1}: {r.passed ? 'Passed' : 'Failed'}
                  </div>
                ))}
              </div>
            </div>
          )}
          {result.submission?.aiFeedback && (
            <div className="mt-4 p-4 bg-blue-900/20 border border-blue-700 rounded-lg">
              <h3 className="font-semibold mb-2 text-blue-300">
                AI Feedback:
              </h3>
              <p className="text-gray-300 text-sm">
                {result.submission.aiFeedback}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}