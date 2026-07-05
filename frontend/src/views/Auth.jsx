import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, KeyRound, Mail, ArrowLeft, 
  CheckCircle, User, Lock, ArrowRight,
  AlertTriangle 
} from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';

const API_BASE = `http://${window.location.hostname}:5000/api`;

const AuthInput = ({ label, icon: Icon, ...props }) => (
  <div className="flex flex-col gap-2">
    <label className="text-[10px] font-black text-brown-600 dark:text-slate-500 uppercase tracking-[0.2em] px-1">
      {label}
    </label>
    <div className="relative group">
      <div className="absolute inset-y-0 left-4 flex items-center text-brown-600 dark:text-slate-500 group-focus-within:text-brown-900 dark:group-focus-within:text-indigo-500 transition-colors">
        <Icon size={18} />
      </div>
      <input 
        {...props}
        className="w-full bg-card-beige dark:bg-white/5 border border-brown-100 dark:border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm text-brown-900 dark:text-white placeholder-brown-600 dark:placeholder-slate-500 focus:outline-none focus:border-brown-900 dark:focus:border-indigo-500 focus:ring-4 focus:ring-brown-900/10 dark:focus:ring-indigo-500/10 transition-all"
      />
    </div>
  </div>
);

export default function Auth({ setToken }) {
  const [authMode, setAuthMode] = useState('login'); // 'login', 'signup', 'forgot_password', 'reset_password'
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    otp: '',
    newPassword: ''
  });
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMsg('');
    
    try {
      if (authMode === 'login' || authMode === 'signup') {
        const endpoint = authMode === 'login' ? '/login' : '/signup';
        const res = await axios.post(`${API_BASE}${endpoint}`, formData);
        localStorage.setItem('auth_token', res.data.token);
        localStorage.setItem('user_name', res.data.user?.name || formData.name);
        localStorage.setItem('user_photo', res.data.user?.profile_photo || '');
        setToken(res.data.token);
        navigate('/');
      } else if (authMode === 'forgot_password') {
        const res = await axios.post(`${API_BASE}/forgot-password`, { email: formData.email });
        let msg = res.data.message || 'OTP sent to your email.';
        if (res.data.otp_fallback) {
          msg += ` (Dev Fallback OTP: ${res.data.otp_fallback})`;
        }
        setSuccessMsg(msg);
        setAuthMode('reset_password');
      } else if (authMode === 'reset_password') {
        const res = await axios.post(`${API_BASE}/reset-password`, { 
          email: formData.email, 
          otp: formData.otp, 
          new_password: formData.newPassword 
        });
        setSuccessMsg(res.data.message || 'Password reset successful! Please login.');
        setAuthMode('login');
        setFormData({ ...formData, password: '', otp: '', newPassword: '' });
      }
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Request failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (response) => {
    try {
      setLoading(true);
      const res = await axios.post(`${API_BASE}/google-login`, {
        credential: response.credential
      });
      localStorage.setItem('auth_token', res.data.token);
      localStorage.setItem('user_name', res.data.user.name);
      localStorage.setItem('user_photo', res.data.user.profile_photo || '');
      setToken(res.data.token);
      navigate('/');
    } catch (err) {
      setError("Google Authentication Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-warm-light dark:bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden transition-colors duration-500">
      {/* Atmospheric Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-accent-gold/10 dark:bg-indigo-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] bg-brown-900/10 dark:bg-purple-500/10 blur-[120px] rounded-full" />
        <div className="absolute inset-0 dark:opacity-20 opacity-5 grid-overlay" />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md relative z-10"
      >
        <Link to="/" className="inline-flex items-center gap-2 text-brown-600 dark:text-slate-500 hover:text-brown-900 dark:hover:text-indigo-500 transition-colors mb-8 font-bold text-xs uppercase tracking-widest group">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Hub
        </Link>

        {/* The Portal Card */}
        <div className="glass-strong bg-card-beige/50 dark:bg-white/5 rounded-[40px] p-10 border border-brown-100 dark:border-white/10 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent-gold via-brown-600 to-brown-900 dark:from-indigo-500 dark:via-purple-500 dark:to-pink-500" />
          
          <div className="text-center mb-10">
            <motion.div 
               whileHover={{ rotate: 180 }}
               className="w-16 h-16 bg-brown-900 dark:bg-indigo-600 rounded-2xl flex items-center justify-center text-white mx-auto mb-6 shadow-xl shadow-brown-900/20 dark:shadow-indigo-500/20"
            >
              <Activity size={32} />
            </motion.div>
            <h1 className="text-4xl font-serif text-brown-900 dark:text-white mb-2 leading-tight">
              {authMode === 'login' && 'Welcome Back'}
              {authMode === 'signup' && 'Portal Access'}
              {authMode === 'forgot_password' && 'Reset Access'}
              {authMode === 'reset_password' && 'New Security Key'}
            </h1>
            <p className="text-brown-600 dark:text-slate-400 font-medium text-sm">
              {authMode === 'login' && 'Initialize your medical identity'}
              {authMode === 'signup' && 'Create your secure health profile'}
              {authMode === 'forgot_password' && 'Enter your email to receive an OTP'}
              {authMode === 'reset_password' && 'Enter your OTP and new security key'}
            </p>
          </div>

          <form onSubmit={handleAuth} className="flex flex-col gap-6">
            <AnimatePresence mode="wait">
              {authMode === 'signup' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <AuthInput 
                    label="Identity Name"
                    icon={User}
                    placeholder="Full Name"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <AuthInput 
              label="Primary Protocol (Email)"
              icon={Mail}
              type="email"
              placeholder="name@healthcare.ai"
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
              required
              disabled={authMode === 'reset_password'}
            />

            {(authMode === 'login' || authMode === 'signup') && (
              <div className="flex flex-col gap-2">
                <AuthInput 
                  label="Security Key"
                  icon={Lock}
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={e => setFormData({...formData, password: e.target.value})}
                  required
                />
                {authMode === 'login' && (
                  <button 
                    type="button" 
                    onClick={() => { setAuthMode('forgot_password'); setError(''); setSuccessMsg(''); }}
                    className="text-[10px] font-black text-accent-gold dark:text-indigo-500 uppercase tracking-widest text-right hover:text-brown-900 dark:hover:text-indigo-600 transition-colors"
                  >
                    Forgot Security Key?
                  </button>
                )}
              </div>
            )}

            {authMode === 'reset_password' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="flex flex-col gap-6"
              >
                <AuthInput 
                  label="OTP Code"
                  icon={KeyRound}
                  type="text"
                  placeholder="1234"
                  value={formData.otp}
                  onChange={e => setFormData({...formData, otp: e.target.value})}
                  required
                />
                <AuthInput 
                  label="New Security Key"
                  icon={Lock}
                  type="password"
                  placeholder="••••••••"
                  value={formData.newPassword}
                  onChange={e => setFormData({...formData, newPassword: e.target.value})}
                  required
                />
              </motion.div>
            )}

            <AnimatePresence>
              {successMsg && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl flex items-center gap-3 text-emerald-600 dark:text-emerald-400 text-xs font-bold"
                >
                  <CheckCircle size={16} /> {successMsg}
                </motion.div>
              )}
              {error && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl flex items-center gap-3 text-red-500 text-xs font-bold"
                >
                  <AlertTriangle size={16} /> {error}
                </motion.div>
              )}
            </AnimatePresence>

            <button 
              type="submit" 
              disabled={loading}
              className="mt-4 w-full bg-brown-900 hover:bg-brown-900/90 dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white font-black py-4 rounded-2xl shadow-xl shadow-brown-900/20 dark:shadow-indigo-500/20 transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 group disabled:opacity-50"
            >
              {loading ? 'Processing...' : (
                <>
                  {authMode === 'login' && 'Authorize Access'}
                  {authMode === 'signup' && 'Create Identity'}
                  {authMode === 'forgot_password' && 'Send OTP Protocol'}
                  {authMode === 'reset_password' && 'Confirm New Key'}
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>

            {/* Separator */}
            {(authMode === 'login' || authMode === 'signup') && (
              <>
                <div className="flex items-center gap-4 py-2">
                  <div className="h-px flex-grow bg-brown-100 dark:bg-white/10" />
                  <span className="text-[10px] font-black text-brown-600 dark:text-slate-400 uppercase tracking-widest">Neural Link</span>
                  <div className="h-px flex-grow bg-brown-100 dark:bg-white/10" />
                </div>

                <div className="flex justify-center">
                   <GoogleLogin 
                      onSuccess={handleGoogleSuccess}
                      onError={() => setError("Google Authentication Failed")}
                      theme={document.documentElement.classList.contains('dark') ? 'filled_black' : 'outline'}
                      shape="pill"
                   />
                </div>
              </>
            )}

            <div className="text-center mt-4">
              <p className="text-brown-600 dark:text-slate-500 text-xs font-bold uppercase tracking-widest">
                {(authMode === 'login' || authMode === 'signup') ? (
                  <>
                    {authMode === 'login' ? "New to the platform?" : "Already verified?"}{' '}
                    <button 
                      type="button" 
                      onClick={() => { setAuthMode(authMode === 'login' ? 'signup' : 'login'); setError(''); setSuccessMsg(''); }}
                      className="text-brown-900 hover:text-accent-gold dark:text-indigo-500 dark:hover:text-indigo-400 underline underline-offset-4"
                    >
                      {authMode === 'login' ? 'Register here' : 'Login here'}
                    </button>
                  </>
                ) : (
                  <button 
                    type="button" 
                    onClick={() => { setAuthMode('login'); setError(''); setSuccessMsg(''); }}
                    className="text-brown-900 hover:text-accent-gold dark:text-indigo-500 dark:hover:text-indigo-400 underline underline-offset-4"
                  >
                    Return to Login
                  </button>
                )}
              </p>
            </div>
          </form>
        </div>

        <div className="mt-12 text-center flex flex-col gap-4">
           <div className="flex items-center justify-center gap-4 text-[10px] font-black text-brown-600 dark:text-slate-400 uppercase tracking-widest">
              <span>&copy; 2026 MedAssist AI</span>
              <span className="w-1 h-1 bg-brown-600/30 dark:bg-slate-300 rounded-full" />
              <span>Privacy Policy</span>
              <span className="w-1 h-1 bg-brown-600/30 dark:bg-slate-300 rounded-full" />
              <span>Patient Terms</span>
           </div>
        </div>
      </motion.div>
    </div>
  );
}
