'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useParams, useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import api from '@/lib/api';
import {Play } from 'lucide-react';
import LoginModal from '@/components/LoginModal';
import CommentsSection from '@/components/CommentsSection';
import CodeEditor from '@/components/CodeEditor';
import SubmissionResult from '@/components/SubmissionResult';
import PastSubmissions from '@/components/PastSubmissions';
import { getStarterCode } from '@/lib/languageTemplates';
import Loader from '@/components/Loader';

// ---------------- TYPES ----------------

interface SampleTestCase {
  input: string;
  output: string;
  explanation?: string;
}

interface TestCase {
  input: string;
  expectedOutput: string;
  isPublic: boolean;
}

interface Problem {
  _id: string;
  title: string;
  description: string;
  difficulty: string;
  topics: string[];
  starterCode: string;
  sampleTestCases: SampleTestCase[];
  testCases: TestCase[];
  constraints: string[];
  attemptsCount: number;
  acceptedCount: number;
}

interface Comment {
  _id: string;
  userId: { username: string; email: string };
  content: string;
  replies?: Comment[];
  createdAt: string;
}

interface SubmissionResultType {
  stdout?: string;
  stderr?: string;
  compile_output?: string;
  error?: string;
}

// ---------------- COMPONENT ----------------

export default function ProblemDetail() {
  const { user, loading: authLoading } = useAuth();
  const params = useParams();
  const searchParams = useSearchParams();
  const problemId = params.id as string;
  const submissionIdFromUrl = searchParams.get('submissionId');

  const [problem, setProblem] = useState<Problem | null>(null);
  const [code, setCode] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<SubmissionResultType | null>(null);
  const [runResult, setRunResult] = useState<SubmissionResultType | null>(null);
  const [running, setRunning] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [loginAction, setLoginAction] = useState<'submit' | 'comment' | null>(null);
  const [codeSaved, setCodeSaved] = useState(false);
  const [language, setLanguage] = useState('javascript');

  const codeStorageKey = `code_${problemId}_${language}`;

  // ---------------- FETCH ----------------

  useEffect(() => {
    if (!problemId) return;
    fetchProblem();
    fetchComments();
  }, [problemId, language]);

  useEffect(() => {
    if (submissionIdFromUrl && user) {
      api
        .get(`/submissions/by-id/${submissionIdFromUrl}`)
        .then((res) => {
          if (res.data?.code != null) setCode(res.data.code);
          if (res.data?.language) setLanguage(res.data.language);
        })
        .catch(() => {});
    }
  }, [submissionIdFromUrl, user]);

  useEffect(() => {
  if (submissionIdFromUrl) return;
  const fresh = getStarterCode(language);
  setCode(fresh);
}, [language, submissionIdFromUrl]);


  const fetchProblem = async () => {
    try {
      const res = await api.get(`/problems/${problemId}`);
      setProblem(res.data);

      if (submissionIdFromUrl) return;
      const savedCode = localStorage.getItem(codeStorageKey);
      if (savedCode) {
        setCode(savedCode);
      } else {
        setCode(getStarterCode(language) || res.data.starterCode);
      }

    } catch (err) {
      console.error('Failed to fetch problem:', err);
    }
  };

  const fetchComments = async () => {
    try {
      const res = await api.get('/comments', { params: { problemId } });
      setComments(res.data);
    } catch (err) {
      console.error('Failed to fetch comments:', err);
    }
  };

  // ---------------- DEBOUNCED AUTO SAVE ----------------

  useEffect(() => {
    if (!problemId) return;
    const handler = setTimeout(() => {
      localStorage.setItem(codeStorageKey, code);
      setCodeSaved(true);
      setTimeout(() => setCodeSaved(false), 1200);
    }, 500); // debounce 500ms

    return () => clearTimeout(handler);
  }, [code, codeStorageKey, problemId]);

  // ---------------- ACTIONS ----------------

 const handleRunCode = async () => {
  if (!code.trim()) return;
  setRunning(true);
  setRunResult(null);
  setResult(null);

  try {
   

    const res = await api.post('/submissions/run', { problemId, code, language });
    setRunResult(res.data);
  } catch (err: any) {
    setRunResult({ error: err.response?.data?.error || err.message || 'Run failed' });
  } finally {
    setRunning(false);
  }
};

const handleSubmit = async () => {
  if (!code.trim()) return;

  if (!user) {
    localStorage.setItem('returnUrl', window.location.pathname);
    setLoginAction('submit');
    setLoginModalOpen(true);
    return;
  }

  setSubmitting(true);
  setResult(null);
  setRunResult(null);

  try {
    

    const res = await api.post('/submissions', { problemId, code, language});
    setResult(res.data);
    fetchProblem();
  } catch (err: any) {
    setResult({ error: err.response?.data?.error || err.message || 'Submission failed' });
  } finally {
    setSubmitting(false);
  }
};


  const handleResetCode = () => {
    if (confirm('Reset code?')) {
      const fresh = problem?.starterCode || getStarterCode(language);
      setCode(fresh);
      localStorage.removeItem(codeStorageKey);
    }
  };

  const handleLoginSuccess = () => {
    if (loginAction === 'submit') handleSubmit();
    setLoginAction(null);
  };

  // ---------------- LOADING ----------------

if (authLoading || !problem) {
  return (
    <div className="animate-fadeOut">
      <Loader />
    </div>
  );
}

  // ---------------- UI ----------------

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />

      <LoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        onSuccess={handleLoginSuccess}
      />

      <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* LEFT */}
        <div className="space-y-6">
          <div className="bg-gray-800 p-6 rounded-lg">
            <h1 className="text-2xl font-bold">{problem.title}</h1>
            <p className="text-gray-300 mt-4 whitespace-pre-wrap">
              {problem.description}
            </p>
          </div>

          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="font-semibold">Difficulty</h2>
            <p>{problem.difficulty}</p>
          </div>

          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="font-semibold">Topics</h2>
            <div className="flex gap-2 flex-wrap mt-2">
              {problem.topics.map((t) => (
                <span key={t} className="bg-blue-600 px-3 py-1 rounded-full text-sm">
                  {t}
                </span>
              ))}
            </div>
          </div>

          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="font-semibold">Constraints</h2>
            <ul className="list-disc ml-6 mt-2">
              {problem.constraints.map((c, i) => (
                <li key={i}>{c}</li>
              ))}
            </ul>
          </div>

          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="font-semibold">Sample Test Cases</h2>
            {problem.sampleTestCases.map((t, i) => (
              <div key={i} className="mt-4 border border-gray-700 p-3 rounded">
                <p><b>Input:</b> {t.input}</p>
                <p><b>Output:</b> {t.output}</p>
                {t.explanation && (
                  <p className="text-gray-400"><b>Explanation:</b> {t.explanation}</p>
                )}
              </div>
            ))}
          </div>

          <CommentsSection
            problemId={problemId}
            comments={comments}
            onCommentsUpdate={setComments}
            user={user}
            onLoginRequired={() => {
              setLoginAction('comment');
              setLoginModalOpen(true);
            }}
          />
        </div>

        {/* RIGHT */}
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <CodeEditor
                code={code}
                onCodeChange={setCode}
                onSubmit={handleSubmit}
                onReset={handleResetCode}
                submitting={submitting}
                codeSaved={codeSaved}
                user={user}
                language={language}
                onLanguageChange={setLanguage}
              />

              <SubmissionResult result={result || runResult} />

              <div className="flex justify-center">
                <button
                  onClick={handleRunCode}
                  disabled={running || !code.trim()}
                  className="bg-blue-600 px-6 py-3 rounded-lg flex gap-2"
                >
                  <Play size={16} />
                  {running ? 'Running...' : 'Run Code'}
                </button>
              </div>
            </div>

            <div className="lg:col-span-1">
              <PastSubmissions
                problemId={problemId}
                user={user}
                onSelectSubmission={(sub) => {
                  setCode(sub.code);
                  setLanguage(sub.language);
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
