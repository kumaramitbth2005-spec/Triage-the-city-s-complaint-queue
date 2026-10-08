import React, { useState, useEffect, useRef } from 'react';
import { 
  X, Lock, Mail, User, Shield, Loader2, CheckCircle2, 
  AlertCircle, Eye, EyeOff, KeyRound, ArrowLeft, RefreshCw,
  Send, Sparkles
} from 'lucide-react';
import { Button } from '../ui/Button';
import { authApi } from '../../api/authApi';
import { useSettings } from '../../context/SettingsContext';
import { useAppContext } from '../../context/AppContext';

export function AuthModal({ isOpen, onClose, initialMode = 'login', onSuccess }) {
  const [mode, setMode] = useState(initialMode); // 'login' | 'register' | 'verify' | 'send_otp'
  
  // Independent state per mode to prevent crosstalk
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [loginSuccess, setLoginSuccess] = useState('');
  const [unverifiedEmail, setUnverifiedEmail] = useState('');

  const [registerLoading, setRegisterLoading] = useState(false);
  const [registerError, setRegisterError] = useState('');
  const [registerSuccess, setRegisterSuccess] = useState('');

  const [sendOtpLoading, setSendOtpLoading] = useState(false);
  const [sendOtpError, setSendOtpError] = useState('');
  const [sendOtpSuccess, setSendOtpSuccess] = useState('');

  const [verifyLoading, setVerifyLoading] = useState(false);
  const [verifyError, setVerifyError] = useState('');
  const [verifySuccess, setVerifySuccess] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  // Password visibility toggles
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Verification OTP state (6 separate digits)
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [pendingEmail, setPendingEmail] = useState('');
  const otpInputRefs = useRef([]);

  const { dispatch } = useSettings();
  const { fetchComplaints, fetchNotifications } = useAppContext();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'operator'
  });

  // Sync initialMode when modal opens
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      clearAllStates();
    }
  }, [isOpen, initialMode]);

  // Resend cooldown timer
  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown(prev => Math.max(0, prev - 1));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendCooldown]);

  if (!isOpen) return null;

  const clearAllStates = () => {
    setLoginError('');
    setLoginSuccess('');
    setLoginLoading(false);
    setUnverifiedEmail('');

    setRegisterError('');
    setRegisterSuccess('');
    setRegisterLoading(false);

    setSendOtpError('');
    setSendOtpSuccess('');
    setSendOtpLoading(false);

    setVerifyError('');
    setVerifySuccess('');
    setVerifyLoading(false);
    setResendMessage('');

    setShowPassword(false);
    setShowConfirmPassword(false);
    setOtpDigits(['', '', '', '', '', '']);
  };

  const handleSwitchTab = (newMode) => {
    clearAllStates();
    setMode(newMode);
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (mode === 'login') {
      setLoginError('');
      setUnverifiedEmail('');
    } else if (mode === 'register') {
      setRegisterError('');
    } else if (mode === 'send_otp') {
      setSendOtpError('');
    }
  };

  // Mask email for display: user@gmail.com -> u***@gmail.com
  const maskEmail = (email) => {
    if (!email || !email.includes('@')) return email || '';
    const [local, domain] = email.split('@');
    if (local.length <= 1) return `*@${domain}`;
    return `${local[0]}${'*'.repeat(Math.min(local.length - 1, 4))}@${domain}`;
  };

  // ─── LOGIN HANDLER ──────────────────────────────────────────────────────────
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginError('');
    setLoginSuccess('');
    setUnverifiedEmail('');
    setLoginLoading(true);

    try {
      const res = await authApi.login(formData.email.trim(), formData.password);
      if (res.data?.success && res.data?.token) {
        localStorage.setItem('auth_token', res.data.token);
        localStorage.setItem('auth_user', JSON.stringify(res.data.user));

        const u = res.data.user;
        dispatch({
          type: 'UPDATE_PROFILE',
          payload: {
            name: u.name,
            username: u.username || u.name.toLowerCase().replace(/\s+/g, '_'),
            email: u.email,
            phone: u.phone || '',
            bio: u.bio || '',
            role: u.role || 'operator',
            zone: u.zone || 'Zone 1 - Central',
            department: u.department || 'Public Works & Sanitation',
            avatar: u.avatar || ''
          }
        });

        if (u.language) {
          dispatch({ 
            type: 'SET_LANGUAGE', 
            payload: u.language === 'Hindi' ? 'hi' : (u.language.toLowerCase().startsWith('hi') ? 'hi' : 'en') 
          });
        }

        setLoginSuccess('Signed in successfully! Redirecting...');
        await Promise.all([fetchComplaints(), fetchNotifications()]);
        setTimeout(() => {
          onClose();
          if (onSuccess) onSuccess(u);
        }, 600);
      }
    } catch (err) {
      const errData = err.response?.data?.error;
      const code = errData?.code;
      const message = errData?.message || err.response?.data?.message || 'Authentication failed. Please check your credentials.';

      if (code === 'EMAIL_NOT_VERIFIED' || err.response?.data?.requiresVerification) {
        const cleanEmail = formData.email.trim();
        setPendingEmail(cleanEmail);
        setMode('verify');
        setVerifySuccess(`Please enter the 6-digit verification code sent to ${cleanEmail}.`);
        setVerifyError('');
        setTimeout(() => {
          if (otpInputRefs.current[0]) otpInputRefs.current[0].focus();
        }, 150);
        return;
      } else {
        setLoginError(message);
      }
    } finally {
      setLoginLoading(false);
    }
  };

  // ─── REGISTRATION HANDLER ───────────────────────────────────────────────────
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setRegisterError('');
    setRegisterSuccess('');

    if (!formData.name.trim()) {
      setRegisterError('Full name is required.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setRegisterError('Passwords do not match. Please re-enter.');
      return;
    }

    if (formData.password.length < 6) {
      setRegisterError('Password must be at least 6 characters long.');
      return;
    }

    setRegisterLoading(true);

    try {
      const cleanEmail = formData.email.trim();
      const res = await authApi.register(
        formData.name.trim(), 
        cleanEmail, 
        formData.password, 
        formData.role
      );

      if (res.data?.success) {
        setPendingEmail(cleanEmail);
        setOtpDigits(['', '', '', '', '', '']);
        const secs = res.data.cooldownSeconds || 60;
        setResendCooldown(secs);
        setVerifySuccess(res.data.message || 'Verification code sent to your email!');
        setVerifyError('');
        setMode('verify');
        setTimeout(() => {
          if (otpInputRefs.current[0]) {
            otpInputRefs.current[0].focus();
          }
        }, 150);
      }
    } catch (err) {
      const errData = err.response?.data?.error;
      const code = errData?.code;
      const cleanEmail = formData.email.trim();

      // If user has an active code or requires verification, immediately route them to the verify screen
      if (code === 'COOLDOWN' || err.response?.data?.requiresVerification) {
        setPendingEmail(cleanEmail);
        setOtpDigits(['', '', '', '', '', '']);
        const secs = err.response?.data?.cooldownSeconds || 60;
        setResendCooldown(secs);
        setVerifySuccess(`A verification code was already sent to ${cleanEmail}. Please enter the 6 digits below.`);
        setVerifyError('');
        setMode('verify');
        setTimeout(() => {
          if (otpInputRefs.current[0]) {
            otpInputRefs.current[0].focus();
          }
        }, 150);
        return;
      }

      const message = errData?.message || err.response?.data?.message || "We couldn't send the verification code. Please try again.";
      setRegisterError(message);
    } finally {
      setRegisterLoading(false);
    }
  };

  // ─── SEND VERIFICATION CODE (STANDALONE) ────────────────────────────────────
  const handleSendOtpSubmit = async (e) => {
    e.preventDefault();
    setSendOtpError('');
    setSendOtpSuccess('');
    
    if (!formData.email.trim()) {
      setSendOtpError('Email address is required.');
      return;
    }

    setSendOtpLoading(true);

    try {
      const cleanEmail = formData.email.trim();
      const res = await authApi.sendVerificationCode(cleanEmail, formData.name || '');

      if (res.data?.success) {
        setPendingEmail(cleanEmail);
        setOtpDigits(['', '', '', '', '', '']);
        setResendCooldown(res.data.cooldownSeconds || 60);
        setVerifySuccess(res.data.message || 'Verification code sent successfully.');
        setVerifyError('');
        setMode('verify');
        setTimeout(() => {
          if (otpInputRefs.current[0]) otpInputRefs.current[0].focus();
        }, 150);
      }
    } catch (err) {
      const errData = err.response?.data?.error;
      const code = errData?.code;
      const cleanEmail = formData.email.trim();

      if (code === 'COOLDOWN' || err.response?.data?.requiresVerification) {
        setPendingEmail(cleanEmail);
        setOtpDigits(['', '', '', '', '', '']);
        setResendCooldown(err.response?.data?.cooldownSeconds || 60);
        setVerifySuccess(`A verification code was already sent to ${cleanEmail}. Please enter the 6 digits below.`);
        setVerifyError('');
        setMode('verify');
        setTimeout(() => {
          if (otpInputRefs.current[0]) otpInputRefs.current[0].focus();
        }, 150);
        return;
      }

      const msg = errData?.message || err.response?.data?.message || "We couldn't send the verification code. Please try again.";
      setSendOtpError(msg);
    } finally {
      setSendOtpLoading(false);
    }
  };

  // ─── OTP INPUT UX ───────────────────────────────────────────────────────────
  const handleOtpChange = (index, value) => {
    const cleanVal = value.replace(/\D/g, '');

    // Handle full paste of 6 digits (e.g. "583214")
    if (cleanVal.length > 1) {
      const pastedDigits = cleanVal.slice(0, 6).split('');
      const newDigits = [...otpDigits];
      pastedDigits.forEach((d, i) => {
        if (i < 6) newDigits[i] = d;
      });
      setOtpDigits(newDigits);
      setVerifyError('');
      
      const nextFocus = Math.min(pastedDigits.length, 5);
      if (otpInputRefs.current[nextFocus]) {
        otpInputRefs.current[nextFocus].focus();
      }
      return;
    }

    const singleDigit = cleanVal.slice(-1);
    const newDigits = [...otpDigits];
    newDigits[index] = singleDigit;
    setOtpDigits(newDigits);
    setVerifyError('');

    // Auto-focus next box
    if (singleDigit && index < 5) {
      if (otpInputRefs.current[index + 1]) {
        otpInputRefs.current[index + 1].focus();
      }
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      if (otpInputRefs.current[index - 1]) {
        otpInputRefs.current[index - 1].focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  // ─── VERIFY OTP HANDLER ─────────────────────────────────────────────────────
  const handleVerifySubmit = async (e) => {
    e?.preventDefault();
    const otp = otpDigits.join('');
    
    if (otp.length !== 6) {
      setVerifyError('Please enter all 6 digits of the verification code.');
      return;
    }

    setVerifyError('');
    setVerifySuccess('');
    setVerifyLoading(true);

    try {
      const res = await authApi.verifyEmail(pendingEmail, otp);
      if (res.data?.success) {
        setVerifySuccess('✓ Email verified! Taking you to dashboard...');

        if (res.data.token && res.data.user) {
          localStorage.setItem('auth_token', res.data.token);
          localStorage.setItem('auth_user', JSON.stringify(res.data.user));

          const u = res.data.user;
          dispatch({
            type: 'UPDATE_PROFILE',
            payload: {
              name: u.name,
              username: u.username || u.name.toLowerCase().replace(/\s+/g, '_'),
              email: u.email,
              role: u.role || 'operator',
              zone: u.zone || 'Zone 1 - Central',
              department: u.department || 'Public Works & Sanitation',
              avatar: u.avatar || ''
            }
          });

          await Promise.all([fetchComplaints(), fetchNotifications()]);
          setTimeout(() => {
            onClose();
            if (onSuccess) onSuccess(u);
          }, 600);
        } else {
          // No token returned — switch to login
          setTimeout(() => {
            handleSwitchTab('login');
            setLoginSuccess('Email verified! Please sign in.');
          }, 600);
        }
      }
    } catch (err) {
      const errCode = err.response?.data?.error?.code;
      const msg = err.response?.data?.error?.message || err.response?.data?.message || 'Invalid verification code. Please try again.';

      // ─── If email is already verified, auto-login the user ───────────────
      if (errCode === 'ALREADY_VERIFIED') {
        setVerifySuccess('✓ Email already verified! Signing you in...');
        setVerifyError('');
        try {
          const loginRes = await authApi.login(pendingEmail, formData.password);
          if (loginRes.data?.success && loginRes.data?.token) {
            localStorage.setItem('auth_token', loginRes.data.token);
            localStorage.setItem('auth_user', JSON.stringify(loginRes.data.user));
            const u = loginRes.data.user;
            dispatch({
              type: 'UPDATE_PROFILE',
              payload: {
                name: u.name,
                username: u.username || u.name.toLowerCase().replace(/\s+/g, '_'),
                email: u.email,
                role: u.role || 'operator',
                zone: u.zone || 'Zone 1 - Central',
                department: u.department || 'Public Works & Sanitation',
                avatar: u.avatar || ''
              }
            });
            await Promise.all([fetchComplaints(), fetchNotifications()]);
            setTimeout(() => {
              onClose();
              if (onSuccess) onSuccess(u);
            }, 600);
          }
        } catch {
          // Password not available or wrong — redirect to login screen
          setTimeout(() => {
            handleSwitchTab('login');
            setLoginSuccess('Your email is verified. Please sign in.');
          }, 600);
        }
        return;
      }

      setVerifyError(msg);
    } finally {
      setVerifyLoading(false);
    }
  };

  // ─── RESEND OTP HANDLER ─────────────────────────────────────────────────────
  const handleResendOtp = async () => {
    if (resendCooldown > 0 || resendLoading) return;
    setResendLoading(true);
    setResendMessage('');
    setVerifyError('');

    try {
      const res = await authApi.resendVerificationCode(pendingEmail);
      if (res.data?.success) {
        setResendMessage('A new 6-digit verification code has been sent to your email.');
        setResendCooldown(60);
        setOtpDigits(['', '', '', '', '', '']);
        if (otpInputRefs.current[0]) {
          otpInputRefs.current[0].focus();
        }
      }
    } catch (err) {
      const msg = err.response?.data?.error?.message || err.response?.data?.message || "We couldn't send the verification code. Please try again.";
      setVerifyError(msg);
    } finally {
      setResendLoading(false);
    }
  };

  const handleStartVerificationFromLogin = () => {
    setPendingEmail(unverifiedEmail || formData.email.trim());
    clearAllStates();
    setMode('verify');
    setResendCooldown(30);
    setTimeout(() => {
      if (otpInputRefs.current[0]) otpInputRefs.current[0].focus();
    }, 100);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto animate-in fade-in" 
      role="dialog" 
      aria-modal="true"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-stone-200/80 dark:border-slate-800 relative my-auto overflow-hidden text-slate-800 dark:text-slate-100 transition-colors">
        
        {/* Close Button */}
        <button 
          onClick={onClose} 
          type="button"
          className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-200 transition-colors z-10"
          aria-label="Close modal"
        >
          <X size={18} />
        </button>

        {/* ─── HEADER ─── */}
        <div className="text-center space-y-1.5 pt-1">
          <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center mx-auto mb-2 shadow-xs border border-indigo-100 dark:border-indigo-800/60">
            {mode === 'verify' ? <KeyRound size={22} /> : mode === 'send_otp' ? <Send size={22} /> : <Lock size={22} />}
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            {mode === 'login' && 'Sign in to your account'}
            {mode === 'register' && 'Create a new account'}
            {mode === 'verify' && 'Verify your email address'}
            {mode === 'send_otp' && 'Send verification code'}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto leading-relaxed">
            {mode === 'login' && 'Access your municipal grievance workspace & triage desk'}
            {mode === 'register' && 'Register to triage complaints and track civic issues in real time'}
            {mode === 'send_otp' && 'Enter your email to receive a 6-digit verification code'}
            {mode === 'verify' && (
              <span>
                Enter the 6-digit code sent to <strong className="text-slate-800 dark:text-slate-200 font-semibold">{maskEmail(pendingEmail)}</strong>
              </span>
            )}
          </p>
        </div>

        {/* ─── TAB SWITCHER (Only shown in Login / Register mode) ─── */}
        {mode !== 'verify' && (
          <div className="w-full bg-slate-100 dark:bg-slate-800/80 p-1 rounded-2xl flex items-center gap-1 border border-slate-200/80 dark:border-slate-700/60 mt-4">
            <button
              type="button"
              onClick={() => handleSwitchTab('login')}
              className={`flex-1 py-2 px-3 text-xs font-semibold rounded-xl transition-all duration-200 ${
                mode === 'login' 
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm' 
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => handleSwitchTab('register')}
              className={`flex-1 py-2 px-3 text-xs font-semibold rounded-xl transition-all duration-200 ${
                mode === 'register' 
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm' 
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Register
            </button>
          </div>
        )}

        {/* ─── FEEDBACK ALERTS ─── */}
        <div className="space-y-2 mt-4">
          {/* Login Alerts */}
          {mode === 'login' && loginError && (
            <div className="p-3 bg-red-50 dark:bg-rose-950/40 border border-red-200 dark:border-rose-900/60 rounded-xl text-red-700 dark:text-rose-300 text-xs flex items-start gap-2.5 animate-in fade-in">
              <AlertCircle size={16} className="shrink-0 mt-0.5 text-red-600 dark:text-rose-400" />
              <div className="flex-1">
                <span>{loginError}</span>
                {unverifiedEmail && (
                  <button
                    type="button"
                    onClick={handleStartVerificationFromLogin}
                    className="block mt-1.5 font-semibold text-indigo-600 dark:text-indigo-400 hover:underline transition-colors"
                  >
                    Enter Verification Code →
                  </button>
                )}
              </div>
            </div>
          )}

          {mode === 'login' && loginSuccess && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 rounded-xl text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2.5 animate-in fade-in">
              <CheckCircle2 size={16} className="shrink-0 text-emerald-600 dark:text-emerald-400" />
              <span>{loginSuccess}</span>
            </div>
          )}

          {/* Registration Alerts */}
          {mode === 'register' && registerError && (
            <div className="p-3 bg-red-50 dark:bg-rose-950/40 border border-red-200 dark:border-rose-900/60 rounded-xl text-red-700 dark:text-rose-300 text-xs flex items-center gap-2.5 animate-in fade-in">
              <AlertCircle size={16} className="shrink-0 text-red-600 dark:text-rose-400" />
              <span>{registerError}</span>
            </div>
          )}

          {mode === 'register' && registerSuccess && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 rounded-xl text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2.5 animate-in fade-in">
              <CheckCircle2 size={16} className="shrink-0 text-emerald-600 dark:text-emerald-400" />
              <span>{registerSuccess}</span>
            </div>
          )}

          {/* Send OTP Alerts */}
          {mode === 'send_otp' && sendOtpError && (
            <div className="p-3 bg-red-50 dark:bg-rose-950/40 border border-red-200 dark:border-rose-900/60 rounded-xl text-red-700 dark:text-rose-300 text-xs flex items-center gap-2.5 animate-in fade-in">
              <AlertCircle size={16} className="shrink-0 text-red-600 dark:text-rose-400" />
              <span>{sendOtpError}</span>
            </div>
          )}

          {mode === 'send_otp' && sendOtpSuccess && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 rounded-xl text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2.5 animate-in fade-in">
              <CheckCircle2 size={16} className="shrink-0 text-emerald-600 dark:text-emerald-400" />
              <span>{sendOtpSuccess}</span>
            </div>
          )}

          {/* Verification Alerts */}
          {mode === 'verify' && verifyError && (
            <div className="p-3 bg-red-50 dark:bg-rose-950/40 border border-red-200 dark:border-rose-900/60 rounded-xl text-red-700 dark:text-rose-300 text-xs flex items-center gap-2.5 animate-in fade-in">
              <AlertCircle size={16} className="shrink-0 text-red-600 dark:text-rose-400" />
              <span>{verifyError}</span>
            </div>
          )}

          {mode === 'verify' && resendMessage && (
            <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/60 rounded-xl text-indigo-700 dark:text-indigo-300 text-xs flex items-center gap-2.5 animate-in fade-in">
              <CheckCircle2 size={16} className="shrink-0 text-indigo-600 dark:text-indigo-400" />
              <span>{resendMessage}</span>
            </div>
          )}

          {mode === 'verify' && verifySuccess && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 rounded-xl text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2.5 animate-in fade-in">
              <CheckCircle2 size={16} className="shrink-0 text-emerald-600 dark:text-emerald-400" />
              <span>{verifySuccess}</span>
            </div>
          )}
        </div>

        {/* ─── LOGIN FORM ─── */}
        {mode === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-4 mt-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Email Address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="name@example.com"
                  autoComplete="email"
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900/40 outline-none transition-all"
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Password</label>
                <button
                  type="button"
                  onClick={() => handleSwitchTab('send_otp')}
                  className="text-[11px] font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  Verify Email / OTP?
                </button>
              </div>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900/40 outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(prev => !prev)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors focus:outline-none"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loginLoading}
              className="w-full py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold rounded-xl shadow-md shadow-indigo-500/20 gap-2 mt-2"
            >
              {loginLoading && <Loader2 size={16} className="animate-spin" />}
              Sign In
            </Button>
          </form>
        )}

        {/* ─── REGISTER FORM ─── */}
        {mode === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="space-y-3.5 mt-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Full Name</label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="e.g. Amit Kumar"
                  autoComplete="name"
                  className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900/40 outline-none transition-all"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Email Address (for 6-digit OTP code)</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="e.g. name@gmail.com"
                  autoComplete="email"
                  className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900/40 outline-none transition-all"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  className="w-full pl-9 pr-10 py-2 rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900/40 outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(prev => !prev)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors focus:outline-none"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Confirm Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={formData.confirmPassword}
                  onChange={(e) => handleChange('confirmPassword', e.target.value)}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  className="w-full pl-9 pr-10 py-2 rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900/40 outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(prev => !prev)}
                  aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors focus:outline-none"
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Account Role</label>
              <div className="relative">
                <Shield size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <select
                  value={formData.role}
                  onChange={(e) => handleChange('role', e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all cursor-pointer"
                >
                  <option value="operator">Complaint Desk Operator</option>
                  <option value="citizen">Citizen User</option>
                  <option value="zone_head">Zone Head</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>
            </div>

            <Button
              type="submit"
              disabled={registerLoading}
              className="w-full py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold rounded-xl shadow-md shadow-indigo-500/20 gap-2 mt-2"
            >
              {registerLoading && <Loader2 size={16} className="animate-spin" />}
              Send Verification Code
            </Button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => {
                  const email = formData.email.trim();
                  if (email) setPendingEmail(email);
                  setMode('verify');
                }}
                className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
              >
                Already received a code? Enter verification code →
              </button>
            </div>
          </form>
        )}

        {/* ─── STANDALONE SEND OTP FORM ─── */}
        {mode === 'send_otp' && (
          <form onSubmit={handleSendOtpSubmit} className="space-y-4 mt-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Your Email Address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="name@gmail.com"
                  autoComplete="email"
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900/40 outline-none transition-all"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={sendOtpLoading || !formData.email.trim()}
              className="w-full py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold rounded-xl shadow-md shadow-indigo-500/20 gap-2"
            >
              {sendOtpLoading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              Send Verification Code
            </Button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => handleSwitchTab('login')}
                className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
              >
                ← Back to Sign In
              </button>
            </div>
          </form>
        )}

        {/* ─── EMAIL OTP VERIFICATION FORM ─── */}
        {mode === 'verify' && (
          <form onSubmit={handleVerifySubmit} className="space-y-5 mt-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block text-center">
                Enter 6-Digit Verification Code
              </label>
              
              {/* 6 Digit Input Boxes */}
              <div className="flex items-center justify-center gap-2 sm:gap-2.5">
                {otpDigits.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => { otpInputRefs.current[idx] = el; }}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    className="w-11 h-12 text-center text-xl font-black text-slate-900 dark:text-white rounded-xl border border-gray-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-800 focus:border-indigo-600 dark:focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900/40 outline-none transition-all shadow-xs"
                    aria-label={`Digit ${idx + 1}`}
                  />
                ))}
              </div>
            </div>

            <Button
              type="submit"
              disabled={verifyLoading || otpDigits.join('').length !== 6}
              className="w-full py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold rounded-xl shadow-md shadow-indigo-500/20 gap-2 disabled:opacity-50"
            >
              {verifyLoading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
              Verify Email & Continue
            </Button>

            {/* Resend and Back Controls */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <button
                type="button"
                onClick={() => {
                  clearAllStates();
                  setMode('register');
                }}
                className="flex items-center gap-1 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium transition-colors"
              >
                <ArrowLeft size={14} /> Back
              </button>

              <button
                type="button"
                disabled={resendCooldown > 0 || resendLoading}
                onClick={handleResendOtp}
                className="flex items-center gap-1 font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 disabled:text-slate-400 dark:disabled:text-slate-600 disabled:cursor-not-allowed transition-colors"
              >
                {resendLoading ? (
                  <Loader2 size={13} className="animate-spin" />
                ) : (
                  <RefreshCw size={13} />
                )}
                {resendCooldown > 0 ? `Resend code (${resendCooldown}s)` : 'Resend Code'}
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}
