import { RotateCcw, Save } from 'lucide-react';

interface CodeEditorProps {
  code: string;
  onCodeChange: (code: string) => void;
  onSubmit: () => void;
  onReset: () => void;
  submitting: boolean;
  codeSaved: boolean;
  user: any;
  language: string;
  onLanguageChange: (language: string) => void;
}

const SUPPORTED_LANGUAGES = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'python', label: 'Python' },
  { value: 'cpp', label: 'C++' },
  { value: 'c', label: 'C' },
  { value: 'java', label: 'Java' },
];

export default function CodeEditor({
  code,
  onCodeChange,
  onSubmit,
  onReset,
  submitting,
  codeSaved,
  user,
  language,
  onLanguageChange,
}: CodeEditorProps) {
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
      <div className="bg-gray-750 px-4 py-2 border-b border-gray-700 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium">Code Editor</span>
          <select
            value={language}
            onChange={(e) => onLanguageChange(e.target.value)}
            className="bg-gray-700 text-white text-sm px-2 py-1 rounded border border-gray-600 focus:outline-none focus:border-blue-500"
          >
            {SUPPORTED_LANGUAGES.map((lang) => (
              <option key={lang.value} value={lang.value}>
                {lang.label}
              </option>
            ))}
          </select>
          {codeSaved && (
            <span className="text-xs text-green-400 flex items-center gap-1">
              <Save className="h-3 w-3" />
              Saved
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onReset}
            className="text-gray-400 hover:text-white p-1.5 rounded transition"
            title="Reset code"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
          <button
            onClick={onSubmit}
            disabled={submitting || !code.trim()}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm font-medium disabled:opacity-50 transition"
          >
            {submitting ? 'Running...' : user ? 'Submit' : 'Login to Submit'}
          </button>
        </div>
      </div>
      <textarea
        value={code}
        onChange={(e) => onCodeChange(e.target.value)}
        className="w-full h-96 p-4 bg-gray-900 text-gray-100 font-mono text-sm focus:outline-none resize-none"
        spellCheck={false}
        placeholder="Write your solution here..."
      />
    </div>
  );
}