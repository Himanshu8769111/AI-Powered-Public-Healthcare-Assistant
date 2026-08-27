import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './views/LandingPage';
import Auth from './views/Auth';
import Dashboard from './views/Dashboard';
import SymptomChecker from './views/SymptomChecker';

// Mock Hospital Locator View
function HospitalLocator() {
  return (
    <div className="min-h-screen bg-warm-light dark:bg-slate-950 p-10 pt-32 text-center text-brown-900 dark:text-white">
      <h1 className="text-4xl font-serif mb-6">Hospital Locator Protocol</h1>
      <p className="text-brown-600 dark:text-slate-400 max-w-md mx-auto mb-10">
        Mapping and resolving regional healthcare centers with offline capability active.
      </p>
      <div className="glass-strong max-w-2xl mx-auto h-[400px] rounded-3xl flex items-center justify-center border border-brown-100 dark:border-white/10 relative overflow-hidden bg-card-beige/20 dark:bg-white/5">
        <div className="absolute inset-0 grid-overlay opacity-10" />
        <span className="text-xs font-black uppercase tracking-widest text-accent-gold dark:text-indigo-400 animate-pulse">
          Offline Maps Loaded · Locate Nearest Facility
        </span>
      </div>
    </div>
  );
}

// Mock SOS View
function EmergencySos() {
  const [activated, setActivated] = useState(false);
  return (
    <div className="min-h-screen bg-red-950 text-white p-10 pt-32 text-center flex flex-col items-center justify-center">
      <h1 className="text-5xl font-serif mb-6 uppercase tracking-wider text-red-500 font-bold">SOS Emergency Gateway</h1>
      <p className="text-red-200/70 max-w-md mb-12">
        Instant notification protocol transmitting location and triage logs to nearest medical services.
      </p>
      <button 
        onClick={() => setActivated(!activated)}
        className={`w-48 h-48 rounded-full border-8 border-red-500 shadow-2xl transition-all duration-500 flex items-center justify-center text-xl font-black uppercase tracking-widest ${
          activated ? 'bg-red-600 animate-ping' : 'bg-red-800 hover:bg-red-700'
        }`}
      >
        {activated ? "Active" : "Trigger"}
      </button>
      <span className="mt-8 text-xs uppercase tracking-widest text-red-400 font-bold">
        {activated ? "Broadcasting signal..." : "Tap to activate emergency protocol"}
      </span>
    </div>
  );
}

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('auth_token') || '');
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <Router>
      <Routes>
        <Route 
          path="/" 
          element={<LandingPage theme={theme} toggleTheme={toggleTheme} />} 
        />
        <Route 
          path="/auth" 
          element={<Auth setToken={setToken} />} 
        />
        <Route 
          path="/dashboard" 
          element={<Dashboard setToken={setToken} theme={theme} toggleTheme={toggleTheme} />} 
        />
        <Route 
          path="/symptoms" 
          element={<Navigate to="/dashboard#symptoms" replace />} 
        />
        <Route 
          path="/hospitals" 
          element={<Navigate to="/dashboard#locator" replace />} 
        />
        <Route 
          path="/sos" 
          element={<Navigate to="/dashboard#sos" replace />} 
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}
