import React, { createContext, useContext, useState, useEffect } from 'react';
import { Candidate, Company, HRUser } from '../types/index';
import { api } from '../services/api';

interface AuthContextType {
  role: 'candidate' | 'hr' | null;
  user: Candidate | HRUser | null;
  company: Company | null;
  token: string | null;
  isLoading: boolean;
  loginCandidate: (identifier: string, pass: string) => Promise<void>;
  registerCandidate: (data: any) => Promise<void>;
  loginHR: (company_id: string, email: string, pass: string) => Promise<void>;
  logout: () => void;
  quickDemoLogin: (type: 'candidate' | 'hr', id: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<'candidate' | 'hr' | null>(null);
  const [user, setUser] = useState<Candidate | HRUser | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('hirescreen_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function initAuth() {
      const storedToken = localStorage.getItem('hirescreen_token');
      if (!storedToken) {
        setIsLoading(false);
        return;
      }

      try {
        const data = await api.getCurrentUser();
        setRole(data.role);
        setUser(data.user);
        if (data.company) {
          setCompany(data.company);
        }
      } catch (err) {
        console.warn('Session expired or invalid, clearing credentials:', err);
        localStorage.removeItem('hirescreen_token');
        setToken(null);
        setUser(null);
        setRole(null);
        setCompany(null);
      } finally {
        setIsLoading(false);
      }
    }

    initAuth();
  }, []);

  const loginCandidate = async (identifier: string, pass: string) => {
    setIsLoading(true);
    try {
      const res = await api.candidateLogin(identifier, pass);
      localStorage.setItem('hirescreen_token', res.token);
      setToken(res.token);
      setUser(res.user);
      setRole('candidate');
      setCompany(null);
    } finally {
      setIsLoading(false);
    }
  };

  const registerCandidate = async (data: any) => {
    setIsLoading(true);
    try {
      const res = await api.candidateRegister(data);
      localStorage.setItem('hirescreen_token', res.token);
      setToken(res.token);
      setUser(res.user);
      setRole('candidate');
      setCompany(null);
    } finally {
      setIsLoading(false);
    }
  };

  const loginHR = async (company_id: string, email: string, pass: string) => {
    setIsLoading(true);
    try {
      const res = await api.hrLogin(company_id, email, pass);
      localStorage.setItem('hirescreen_token', res.token);
      setToken(res.token);
      setUser(res.user);
      setCompany(res.company);
      setRole('hr');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('hirescreen_token');
    setToken(null);
    setUser(null);
    setRole(null);
    setCompany(null);
  };

  const quickDemoLogin = async (targetRole: 'candidate' | 'hr', id: string) => {
    setIsLoading(true);
    try {
      if (targetRole === 'candidate') {
        const pass = 'password123';
        const res = await api.candidateLogin(id, pass);
        localStorage.setItem('hirescreen_token', res.token);
        setToken(res.token);
        setUser(res.user);
        setRole('candidate');
        setCompany(null);
      } else {
        // HR login
        const pass = 'password123';
        let email = 'hr@infosys.com';
        if (id === 'TCS001') email = 'hr@tcs.com';
        else if (id === 'WIP001') email = 'hr@wipro.com';
        else if (id === 'ACC001') email = 'hr@accenture.com';
        else if (id === 'HCL001') email = 'hr@hcltech.com';
        else if (id === 'TM001') email = 'hr@techmahindra.com';

        const res = await api.hrLogin(id, email, pass);
        localStorage.setItem('hirescreen_token', res.token);
        setToken(res.token);
        setUser(res.user);
        setCompany(res.company);
        setRole('hr');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        role,
        user,
        company,
        token,
        isLoading,
        loginCandidate,
        registerCandidate,
        loginHR,
        logout,
        quickDemoLogin
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
