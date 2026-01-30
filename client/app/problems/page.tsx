'use client';

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import api from "@/lib/api";

interface Problem {
  _id: string;
  title: string;
  description: string;
  difficulty: string;
  topics: string[];
  starterCode: string;
  constraints: string[];
  attemptsCount: number;
  acceptedCount: number;
}

export default function ProblemsPage() {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [filterDifficulty, setFilterDifficulty] = useState<string>("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchProblems = async () => {
    try {
      setLoading(true);
      const params: { difficulty?: string; search?: string } = {};
      if (filterDifficulty) params.difficulty = filterDifficulty;
      if (search) params.search = search;

      const response = await api.get("/problems", { params });
      setProblems(response.data);
    } catch (error) {
      console.error("Error fetching problems:", error);
    } finally {
      setLoading(false);
    }
  };

  // Debounced fetching
  useEffect(() => {
    const handler = setTimeout(fetchProblems, 500);
    return () => clearTimeout(handler);
  }, [filterDifficulty, search]);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy":
        return "bg-green-500/20 text-green-400";
      case "Medium":
        return "bg-yellow-500/20 text-yellow-400";
      case "Hard":
        return "bg-red-500/20 text-red-400";
      default:
        return "bg-gray-500/20 text-gray-400";
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-4">Problems</h1>
          <div className="flex gap-4 flex-wrap">
            <input
              type="text"
              placeholder="Search problems..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg flex-1 min-w-[200px] focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={filterDifficulty}
              onChange={(e) => setFilterDifficulty(e.target.value)}
              className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Difficulties</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>
        </div>

        {loading && (
          <div className="text-center text-gray-400 py-4">Loading...</div>
        )}

        <div className="space-y-2">
          {problems.map((problem) => (
            <Link
              key={problem._id}
              href={`/problems/${problem._id}`}
              className="block bg-gray-800 border border-gray-700 rounded-lg p-4 hover:bg-gray-700/80 transition duration-200"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-1">{problem.title}</h3>
                  <div className="flex gap-2 flex-wrap">
                    {(problem.topics || []).map((topic) => (
                      <span
                        key={topic}
                        className="px-2 py-1 bg-gray-700 text-sm rounded"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(
                    problem.difficulty
                  )}`}
                >
                  {problem.difficulty}
                </span>
              </div>
            </Link>
          ))}
        </div>

        {!loading && problems.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            No problems found
          </div>
        )}
      </div>
    </div>
  );
}
