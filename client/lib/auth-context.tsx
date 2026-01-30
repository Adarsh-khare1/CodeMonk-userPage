'use client';

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { User } from "@/types/user";

// ---------------- CONTEXT TYPES ----------------

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

// ---------------- CONTEXT ----------------

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ---------------- PROVIDER ----------------

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // ---------------- HYDRATE FROM LOCAL STORAGE ----------------
  useEffect(() => {
    try {
      const storedToken = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser) as User);
      }
    } catch (err) {
      console.error("Auth hydration failed:", err);
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    } finally {
      setLoading(false);
    }
  }, []);

  // ---------------- LOGIN ----------------
  const login = async (email: string, password: string) => {
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Login failed");
      }

      // Must contain _id, username, email
      const user: User = {
        _id: data.user._id,
        username: data.user.username,
        email: data.user.email,
      };

      setUser(user);
      setToken(data.token);

      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("token", data.token);
    } catch (err) {
      console.error("Login error:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ---------------- SIGNUP ----------------
  const signup = async (username: string, email: string, password: string) => {
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Signup failed");
      }

      const user: User = {
        _id: data.user._id,
        username: data.user.username,
        email: data.user.email,
      };

      setUser(user);
      setToken(data.token);

      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("token", data.token);
    } catch (err) {
      console.error("Signup error:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ---------------- LOGOUT ----------------
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    router.push("/");
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// ---------------- HOOK ----------------

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}
