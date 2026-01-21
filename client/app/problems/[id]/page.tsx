'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import api from '@/lib/api';
import { Play, MessageCircle } from 'lucide-react';
import LoginModal from '@/components/LoginModal';
import CommentsSection from '@/components/CommentsSection';
import CodeEditor from '@/components/CodeEditor';
import SubmissionResult from '@/components/SubmissionResult';
import Chatbot from '@/components/Chatbot';
import { getStarterCode } from '@/lib/languageTemplates';

interface Problem {
  _id: string;
  title: string;
  description: string;
  difficulty: string;
  category: string[];
  starterCode: string;
  sampleTestCases: Array<{ input: string; output: string; explanation?: string }>;
  testCases: Array<{ input: string; expectedOutput: string; isPublic: boolean }>;
  constraints: string;
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

export default function ProblemDetail() {
  const { user, loading: authLoading } = useAuth();
  const params = useParams();
  const [problem, setProblem] = useState<Problem | null>(null);
  const [code, setCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [runResult, setRunResult] = useState<any>(null);
  const [running, setRunning] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [loginAction, setLoginAction] = useState<'submit' | 'comment' | null>(null);
  const [codeSaved, setCodeSaved] = useState(false);
  const [language, setLanguage] = useState('javascript');
  const [chatbotVisible, setChatbotVisible] = useState(false);

  const problemId = params.id as string;
  const codeStorageKey = `code_${problemId}`;

  useEffect(() => {
    if (problemId) {
      fetchProblem();
      fetchComments();
      // Load saved code from localStorage for current language
      const languageKey = `${codeStorageKey}_${language}`;
      const savedCode = localStorage.getItem(languageKey);
      if (savedCode) {
        setCode(savedCode);
      } else if (problem) {
        setCode(getStarterCode(language));
      }
    }
  }, [problemId, language]);

  // Auto-save code to localStorage
  useEffect(() => {
    if (code && problemId) {
      const languageKey = `${codeStorageKey}_${language}`;
      localStorage.setItem(languageKey, code);
      setCodeSaved(true);
      const timer = setTimeout(() => setCodeSaved(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [code, problemId, language]);

  // Change starter code when language changes
  useEffect(() => {
    if (problem) {
      const languageKey = `${codeStorageKey}_${language}`;
      const savedCode = localStorage.getItem(languageKey);
      if (savedCode) {
        setCode(savedCode);
      } else {
        setCode(getStarterCode(language));
      }
    }
  }, [language, problem]);

  const fetchProblem = async () => {
    try {
      const response = await api.get(`/problems/${problemId}`);
      setProblem(response.data);
      const savedCode = localStorage.getItem(codeStorageKey);
      if (savedCode) {
        setCode(savedCode);
      } else {
        setCode(response.data.starterCode);
      }
    } catch (error) {
      console.error('Error fetching problem:', error);
    }
  };

  const fetchComments = async () => {
    try {
      const response = await api.get('/comments', {
        params: { problemId },
      });
      setComments(response.data);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const handleRunCode = async () => {
    if (!code.trim()) return;

    setRunning(true);
    setRunResult(null);

    try {
      const response = await api.post('/submissions/run', {
        problemId,
        code,
        language,
      });

      setRunResult(response.data);
    } catch (error: any) {
      setRunResult({
        error: error.response?.data?.message || 'Run failed',
      });
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

    try {
      const response = await api.post('/submissions', {
        problemId,
        code,
        language,
      });

      setResult(response.data);
      // Refresh problem to get updated stats
      fetchProblem();
    } catch (error: any) {
      if (error.response?.status === 401) {
        setLoginAction('submit');
        setLoginModalOpen(true);
      } else {
        setResult({
          error: error.response?.data?.message || 'Submission failed',
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetCode = () => {
    if (confirm('Are you sure you want to reset the code? This will clear your current work.')) {
      setCode(problem?.starterCode || '');
      localStorage.removeItem(codeStorageKey);
    }
  };

  const handleLoginRequired = (action: 'submit' | 'comment') => {
    localStorage.setItem('returnUrl', window.location.pathname);
    setLoginAction(action);
    setLoginModalOpen(true);
  };

  const handleLoginSuccess = () => {
    if (loginAction === 'submit') {
      handleSubmit();
    } else if (loginAction === 'comment') {
      // Comments are handled in CommentsSection
    }
    setLoginAction(null);
  };

  if (authLoading || !problem) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />
      <LoginModal
        isOpen={loginModalOpen}
        onClose={() => {
          setLoginModalOpen(false);
          setLoginAction(null);
        }}
        onSuccess={handleLoginSuccess}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Problem Description */}
          <div className="space-y-6">
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-bold">{problem.title}</h1>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    problem.difficulty === 'Easy'
                      ? 'bg-green-500/20 text-green-400'
                      : problem.difficulty === 'Medium'
                      ? 'bg-yellow-500/20 text-yellow-400'
                      : 'bg-red-500/20 text-red-400'
                  }`}
                >
                  {problem.difficulty}
                </span>
              </div>
              <div className="prose prose-invert max-w-none">
                <p className="text-gray-300 whitespace-pre-wrap mb-4">
                  {problem.description}
                </p>
                {problem.constraints && (
                  <div className="mt-4">
                    <h3 className="font-semibold mb-2">Constraints:</h3>
                    <p className="text-gray-400 text-sm">{problem.constraints}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Comments Section */}
            <CommentsSection
              problemId={problemId}
              comments={comments}
              onCommentsUpdate={setComments}
              user={user}
              onLoginRequired={handleLoginRequired}
            />
          </div>

          {/* Right Column - Code Editor & Results */}
          <div className="space-y-6">
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

            <SubmissionResult result={result} />

            {/* Run Code Button */}
            <div className="flex justify-center">
              <button
                onClick={handleRunCode}
                disabled={running || !code.trim()}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 disabled:opacity-50 transition"
              >
                <Play className="h-4 w-4" />
                {running ? 'Running...' : 'Run Code'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Chatbot Button */}
      <button
        onClick={() => setChatbotVisible(true)}
        className="fixed bottom-4 right-4 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg transition z-40"
        title="Ask AI Assistant"
      >
        <MessageCircle className="h-6 w-6" />
      </button>

      {/* Chatbot */}
      <Chatbot
        problemId={problemId}
        problemTitle={problem?.title || 'Problem'}
        userCode={code}
        language={language}
        isVisible={chatbotVisible}
        onClose={() => setChatbotVisible(false)}
      />
    </div>
  );
}
