import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, useSearchParams, Link } from 'react-router-dom';
import { 
  ShieldCheck, Lock, Mail, User, Eye, EyeOff, 
  ArrowRight, ArrowLeft, Loader2, CheckCircle2, AlertCircle, 
  RefreshCw, KeyRound, Layers
} from 'lucide-react';
import { authApi } from '../api/authApi';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { useAppContext } from '../context/AppContext';

function GoogleIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.03h3.88c2.27-2.09 3.665-5.17 3.665-9.12z" />
      <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.03c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.24v3.12C3.26 21.36 7.33 24 12 24z" />
      <path fill="#FBBC05" d="M5.28 14.29c-.25-.72-.38-1.49-.38-2.29s.13-1.57.38-2.29V6.59H1.24C.45 8.16 0 9.94 0 12s.45 3.84 1.24 5.41l4.04-3.12z" />
      <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.24 6.59l4.04 3.12c.95-2.83 3.6-4.96 6.72-4.96z" />
    </svg>
  );
}

function FacebookIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="#1877F2">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  );
}

export function LoginPage({ defaultMode = 'login' }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const { isAuthenticated, login: authLogin } = useAuth();
  const { dispatch: settingsDispatch } = useSettings();
  const { fetchComplaints, fetchNotifications } = useAppContext();

  // Mode: 'login' | 'register' | 'verify'
  const initialModeParam = searchParams.get('mode') || defaultMode;
  const [mode, setMode] = useState(initialModeParam === 'register' ? 'register' : 'login');

  // Destination validation (prevent open redirect attacks)
  const getSafeRedirect = React.useCallback(() => {
    const rawRedirect = searchParams.get('redirect') || location.state?.from?.pathname || '/dashboard';
    if (typeof rawRedirect === 'string' && rawRedirect.startsWith('/') && !rawRedirect.startsWith('//') && !rawRedirect.includes(':')) {
      return rawRedirect;
    }
    return '/dashboard';
  }, [searchParams, location.state]);

  // If already authenticated, redirect to destination
  useEffect(() => {
    if (isAuthenticated) {
      navigate(getSafeRedirect(), { replace: true });
    }
  }, [isAuthenticated, navigate, getSafeRedirect]);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: searchParams.get('email') || '',
    password: '',
    confirmPassword: '',
    role: 'operator'
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Status states
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // 6-digit OTP verification state
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [pendingEmail, setPendingEmail] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendLoading, setResendLoading] = useState(false);
  const otpInputRefs = useRef([]);

  // Cooldown countdown timer
  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown(prev => Math.max(0, prev - 1));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrorMessage('');
  };

  const [socialLoading, setSocialLoading] = useState(null); // 'google' | 'facebook' | null
  const [socialNotice, setSocialNotice] = useState('');

  const handleSwitchTab = (newMode) => {
    setErrorMessage('');
    setSuccessMessage('');
    setSocialNotice('');
    setMode(newMode);
  };

  const handleSocialSuccess = async (resData) => {
    const u = resData.user;
    authLogin(resData.token, u);

    settingsDispatch({
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

    setSuccessMessage('Authentication successful! Loading operator desk...');
    await Promise.allSettled([fetchComplaints(), fetchNotifications()]);

    setTimeout(() => {
      navigate(getSafeRedirect(), { replace: true });
    }, 500);
  };

  const handleGoogleSignIn = async () => {
    setSocialNotice('');
    setErrorMessage('');
    setSocialLoading('google');

    try {
      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
      if (!clientId) {
        setSocialNotice(
          'Google Sign-In setup: Server/Client credentials are not yet configured (missing GOOGLE_CLIENT_ID in backend or VITE_GOOGLE_CLIENT_ID in frontend). See .env.example for configuration instructions.'
        );
        setSocialLoading(null);
        return;
      }

      if (window.google?.accounts?.id) {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: async (response) => {
            if (response.credential) {
              try {
                const res = await authApi.googleAuth({ credential: response.credential });
                if (res.data?.success && res.data?.token) {
                  await handleSocialSuccess(res.data);
                }
              } catch (apiErr) {
                setErrorMessage(apiErr.response?.data?.error?.message || 'Google authentication failed.');
              }
            }
          }
        });
        window.google.accounts.id.prompt();
      } else {
        setSocialNotice('Google Identity Services SDK is loading or blocked by your browser.');
      }
    } catch (err) {
      setErrorMessage(err.message || 'An error occurred with Google Sign-In.');
    } finally {
      setSocialLoading(null);
    }
  };

  const handleFacebookSignIn = async () => {
    setSocialNotice('');
    setErrorMessage('');
    setSocialLoading('facebook');

    try {
      const appId = import.meta.env.VITE_FACEBOOK_APP_ID;
      if (!appId) {
        setSocialNotice(
          'Facebook Login setup: Server/Client credentials are not yet configured (missing FACEBOOK_APP_ID in backend or VITE_FACEBOOK_APP_ID in frontend). See .env.example for configuration instructions.'
        );
        setSocialLoading(null);
        return;
      }

      if (window.FB) {
        window.FB.login(async (response) => {
          if (response.authResponse?.accessToken) {
            try {
              const res = await authApi.facebookAuth({
                accessToken: response.authResponse.accessToken,
                userID: response.authResponse.userID
              });
              if (res.data?.success && res.data?.token) {
                await handleSocialSuccess(res.data);
              }
            } catch (apiErr) {
              setErrorMessage(apiErr.response?.data?.error?.message || 'Facebook authentication failed.');
            }
          } else {
            setSocialNotice('Facebook sign-in was cancelled.');
          }
        }, { scope: 'public_profile,email' });
      } else {
        setSocialNotice('Facebook Login SDK is loading or blocked by your browser.');
      }
    } catch (err) {
      setErrorMessage(err.message || 'An error occurred with Facebook Login.');
    } finally {
      setSocialLoading(null);
    }
  };

  // ─── LOGIN SUBMIT ──────────────────────────────────────────────────────────
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!formData.email.trim() || !formData.password) {
      setErrorMessage('Please provide both email address and password.');
      return;
    }

    setLoading(true);

    try {
      const res = await authApi.login(formData.email.trim(), formData.password);
      if (res.data?.success && res.data?.token) {
        const u = res.data.user;
        authLogin(res.data.token, u);

        settingsDispatch({
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
          settingsDispatch({
            type: 'SET_LANGUAGE',
            payload: u.language.toLowerCase().startsWith('hi') ? 'hi' : 'en'
          });
        }

        setSuccessMessage('Authentication successful! Loading operator desk...');
        await Promise.allSettled([fetchComplaints(), fetchNotifications()]);

        setTimeout(() => {
          navigate(getSafeRedirect(), { replace: true });
        }, 500);
      }
    } catch (err) {
      const errData = err.response?.data?.error;
      const code = errData?.code;
      const message = errData?.message || err.response?.data?.message || 'Authentication failed. Please verify your credentials.';

      if (code === 'EMAIL_NOT_VERIFIED' || err.response?.data?.requiresVerification) {
        const cleanEmail = formData.email.trim();
        setPendingEmail(cleanEmail);
        setMode('verify');
        setSuccessMessage(`Please enter the 6-digit verification code sent to ${cleanEmail}.`);
        setErrorMessage('');
        setTimeout(() => {
          otpInputRefs.current[0]?.focus();
        }, 150);
      } else {
        setErrorMessage(message);
      }
    } finally {
      setLoading(false);
    }
  };

  // ─── REGISTER SUBMIT ───────────────────────────────────────────────────────
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!formData.name.trim()) {
      setErrorMessage('Full name is required.');
      return;
    }

    if (!formData.email.trim() || !formData.email.includes('@')) {
      setErrorMessage('Please provide a valid email address.');
      return;
    }

    if (formData.password.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter.');
      return;
    }

    setLoading(true);

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
        setSuccessMessage(res.data.message || 'Verification code sent to your email!');
        setErrorMessage('');
        setMode('verify');
        setTimeout(() => {
          otpInputRefs.current[0]?.focus();
        }, 150);
      }
    } catch (err) {
      const errData = err.response?.data?.error;
      const code = errData?.code;
      const cleanEmail = formData.email.trim();

      if (code === 'COOLDOWN' || err.response?.data?.requiresVerification) {
        setPendingEmail(cleanEmail);
        setOtpDigits(['', '', '', '', '', '']);
        const secs = err.response?.data?.cooldownSeconds || 60;
        setResendCooldown(secs);
        setSuccessMessage(err.response?.data?.message || `A verification code was sent to ${cleanEmail}. Please enter the 6 digits.`);
        setErrorMessage('');
        setMode('verify');
        setTimeout(() => {
          otpInputRefs.current[0]?.focus();
        }, 150);
        return;
      }

      if (code === 'EMAIL_SERVICE_ERROR' || err.response?.status === 503) {
        setErrorMessage('Unable to dispatch verification code to this address. Please verify the email and try again.');
      } else {
        const msg = errData?.message || err.response?.data?.message || 'Registration failed. Please try again.';
        setErrorMessage(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  // ─── OTP DIGIT HANDLING ────────────────────────────────────────────────────
  const handleOtpChange = (index, value) => {
    const cleanVal = value.replace(/\D/g, '');

    // Full 6-digit paste
    if (cleanVal.length > 1) {
      const pasted = cleanVal.slice(0, 6).split('');
      const newDigits = [...otpDigits];
      pasted.forEach((d, i) => {
        if (i < 6) newDigits[i] = d;
      });
      setOtpDigits(newDigits);
      setErrorMessage('');
      const nextIdx = Math.min(pasted.length, 5);
      otpInputRefs.current[nextIdx]?.focus();
      return;
    }

    const single = cleanVal.slice(-1);
    const newDigits = [...otpDigits];
    newDigits[index] = single;
    setOtpDigits(newDigits);
    setErrorMessage('');

    if (single && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowLeft' && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  // ─── VERIFY OTP SUBMIT ─────────────────────────────────────────────────────
  const handleVerifySubmit = async (e) => {
    e?.preventDefault();
    const otp = otpDigits.join('');

    if (otp.length !== 6) {
      setErrorMessage('Please enter all 6 digits of the verification code.');
      return;
    }

    setErrorMessage('');
    setSuccessMessage('');
    setLoading(true);

    try {
      const res = await authApi.verifyEmail(pendingEmail, otp);
      if (res.data?.success) {
        setSuccessMessage('✓ Email verified successfully! Preparing your desk...');

        if (res.data.token && res.data.user) {
          const u = res.data.user;
          authLogin(res.data.token, u);

          settingsDispatch({
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

          await Promise.allSettled([fetchComplaints(), fetchNotifications()]);

          setTimeout(() => {
            navigate(getSafeRedirect(), { replace: true });
          }, 600);
        } else {
          // Switch to login tab
          setTimeout(() => {
            setMode('login');
            setSuccessMessage('Email verified! Please sign in with your credentials.');
          }, 600);
        }
      }
    } catch (err) {
      const errCode = err.response?.data?.error?.code;
      const msg = err.response?.data?.error?.message || err.response?.data?.message || 'Invalid verification code. Please check and retry.';

      if (errCode === 'ALREADY_VERIFIED') {
        setSuccessMessage('✓ Email already verified! Redirecting to login...');
        setTimeout(() => {
          setMode('login');
        }, 1000);
      } else {
        setErrorMessage(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  // ─── RESEND OTP ────────────────────────────────────────────────────────────
  const handleResendOtp = async () => {
    if (resendCooldown > 0 || resendLoading) return;
    setResendLoading(true);
    setErrorMessage('');

    try {
      const res = await authApi.resendVerificationCode(pendingEmail);
      if (res.data?.success) {
        setResendCooldown(res.data.cooldownSeconds || 60);
        setSuccessMessage('A fresh verification code has been dispatched to your email.');
        setOtpDigits(['', '', '', '', '', '']);
        otpInputRefs.current[0]?.focus();
      }
    } catch (err) {
      const msg = err.response?.data?.error?.message || err.response?.data?.message || 'Could not resend verification code. Please try again.';
      setErrorMessage(msg);
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#0B0D12] text-[#F8FAFC] px-4 py-8 relative selection:bg-indigo-500 selection:text-white">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Brand & Back to Public Portal Link */}
      <div className="w-full max-w-md flex items-center justify-between mb-6 z-10">
        <Link to="/" className="flex items-center gap-2 text-xs font-bold text-[#CBD5E1] hover:text-[#F8FAFC] transition-colors group">
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
          <span>Return to Public Portal</span>
        </Link>

        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-xs">
            <Layers size={15} />
          </div>
          <span className="text-xs font-black tracking-tight text-[#F8FAFC]">Nexus AI</span>
        </div>
      </div>

      {/* Main Authentication Card */}
      <div className="w-full max-w-md rounded-3xl bg-[#111827] border border-[#2A3548] shadow-2xl p-6 sm:p-8 relative z-10">
        {/* Header Icon & Title */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#161F30] border border-[#2A3548] text-indigo-400 mb-3 shadow-sm">
            {mode === 'verify' ? <KeyRound size={22} /> : <ShieldCheck size={22} />}
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-[#F8FAFC] tracking-tight">
            {mode === 'verify' 
              ? 'Verify Your Email' 
              : mode === 'register' 
                ? 'Create Municipal Account' 
                : 'Municipal Operator Sign In'}
          </h1>
          <p className="text-xs text-[#94A3B8] mt-1">
            {mode === 'verify'
              ? `Enter the 6-digit code sent to ${pendingEmail || 'your email'}`
              : mode === 'register'
                ? 'Register to access triage, complaint queues, and SLA management'
                : 'Authentication required before accessing protected dashboard data'}
          </p>
        </div>

        {/* Mode Switcher Tabs (Hidden during OTP verification) */}
        {mode !== 'verify' && (
          <div className="grid grid-cols-2 p-1 rounded-2xl bg-[#161F30] border border-[#2A3548] mb-6">
            <button
              type="button"
              onClick={() => handleSwitchTab('login')}
              className={`py-2 text-xs font-bold rounded-xl transition-all ${
                mode === 'login'
                  ? 'bg-[#1D293B] text-[#F8FAFC] shadow-sm'
                  : 'text-[#94A3B8] hover:text-[#F8FAFC]'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => handleSwitchTab('register')}
              className={`py-2 text-xs font-bold rounded-xl transition-all ${
                mode === 'register'
                  ? 'bg-[#1D293B] text-[#F8FAFC] shadow-sm'
                  : 'text-[#94A3B8] hover:text-[#F8FAFC]'
              }`}
            >
              Create Account
            </button>
          </div>
        )}

        {/* Status Alerts */}
        {errorMessage && (
          <div className="mb-5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-start gap-2">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <span className="leading-snug">{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="mb-5 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-start gap-2">
            <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
            <span className="leading-snug">{successMessage}</span>
          </div>
        )}

        {/* ─── MODE: SIGN IN ──────────────────────────────────────────────── */}
        {mode === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#CBD5E1] mb-1.5">
                Work Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="operator@municipal.gov"
                  className="w-full bg-[#161F30] border border-[#2A3548] rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#F8FAFC] placeholder-[#94A3B8]/60 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                />
                <Mail size={15} className="absolute left-3.5 top-3 text-[#94A3B8]" />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#CBD5E1] mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#161F30] border border-[#2A3548] rounded-xl pl-10 pr-10 py-2.5 text-xs text-[#F8FAFC] placeholder-[#94A3B8]/60 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                />
                <Lock size={15} className="absolute left-3.5 top-3 text-[#94A3B8]" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-[#94A3B8] hover:text-[#F8FAFC] p-0.5 transition-colors"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 rounded-full bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-bold shadow-lg shadow-indigo-500/25 transition-all active:scale-98 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Operator Desk</span>
                  <ArrowRight size={15} />
                </>
              )}
            </button>
          </form>
        )}

        {/* ─── MODE: REGISTER ─────────────────────────────────────────────── */}
        {mode === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#CBD5E1] mb-1">
                Full Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Officer Rajesh Kumar"
                  className="w-full bg-[#161F30] border border-[#2A3548] rounded-xl pl-10 pr-4 py-2 text-xs text-[#F8FAFC] placeholder-[#94A3B8]/60 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                />
                <User size={15} className="absolute left-3.5 top-2.5 text-[#94A3B8]" />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#CBD5E1] mb-1">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="officer@municipal.gov"
                  className="w-full bg-[#161F30] border border-[#2A3548] rounded-xl pl-10 pr-4 py-2 text-xs text-[#F8FAFC] placeholder-[#94A3B8]/60 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                />
                <Mail size={15} className="absolute left-3.5 top-2.5 text-[#94A3B8]" />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#CBD5E1] mb-1">
                Password (min. 6 characters)
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#161F30] border border-[#2A3548] rounded-xl pl-10 pr-10 py-2 text-xs text-[#F8FAFC] placeholder-[#94A3B8]/60 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                />
                <Lock size={15} className="absolute left-3.5 top-2.5 text-[#94A3B8]" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2 text-[#94A3B8] hover:text-[#F8FAFC] p-0.5 transition-colors"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#CBD5E1] mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#161F30] border border-[#2A3548] rounded-xl pl-10 pr-10 py-2 text-xs text-[#F8FAFC] placeholder-[#94A3B8]/60 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                />
                <Lock size={15} className="absolute left-3.5 top-2.5 text-[#94A3B8]" />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-2 text-[#94A3B8] hover:text-[#F8FAFC] p-0.5 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 rounded-full bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-bold shadow-lg shadow-indigo-500/25 transition-all active:scale-98 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  <span>Registering...</span>
                </>
              ) : (
                <>
                  <span>Create Account & Send Code</span>
                  <ArrowRight size={15} />
                </>
              )}
            </button>
          </form>
        )}

        {/* ─── MODE: 6-DIGIT OTP VERIFICATION ─────────────────────────────── */}
        {mode === 'verify' && (
          <form onSubmit={handleVerifySubmit} className="space-y-5">
            <div>
              <label className="block text-center text-xs font-semibold text-[#CBD5E1] mb-3">
                Enter the 6-digit verification code:
              </label>

              {/* 6 Digits Row */}
              <div className="flex items-center justify-center gap-2 sm:gap-2.5">
                {otpDigits.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => (otpInputRefs.current[idx] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    className="w-11 h-12 sm:w-12 sm:h-13 text-center text-lg sm:text-xl font-mono font-bold bg-[#161F30] border border-[#2A3548] rounded-xl text-[#F8FAFC] focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/40 transition-all"
                  />
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || otpDigits.join('').length !== 6}
              className="w-full py-3 rounded-full bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-bold shadow-lg shadow-indigo-500/25 transition-all active:scale-98 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  <span>Verifying Code...</span>
                </>
              ) : (
                <>
                  <span>Confirm Code & Enter Dashboard</span>
                  <ArrowRight size={15} />
                </>
              )}
            </button>

            {/* Resend Code & Back Buttons */}
            <div className="flex items-center justify-between text-xs pt-2 border-t border-[#2A3548]">
              <button
                type="button"
                onClick={() => setMode('login')}
                className="text-[#94A3B8] hover:text-[#F8FAFC] transition-colors flex items-center gap-1"
              >
                <ArrowLeft size={13} />
                <span>Back to Sign In</span>
              </button>

              <button
                type="button"
                onClick={handleResendOtp}
                disabled={resendCooldown > 0 || resendLoading}
                className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
              >
                <RefreshCw size={12} className={resendLoading ? 'animate-spin' : ''} />
                <span>
                  {resendCooldown > 0 
                    ? `Resend in ${resendCooldown}s` 
                    : 'Resend Code'}
                </span>
              </button>
            </div>
          </form>
        )}

        {/* ─── SOCIAL SIGN-IN OPTIONS (GOOGLE & FACEBOOK) ─────────────────── */}
        {mode !== 'verify' && (
          <div className="mt-6">
            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#2A3548]" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase tracking-wider font-bold">
                <span className="bg-[#111827] px-3 text-[#94A3B8]">
                  Or continue with
                </span>
              </div>
            </div>

            <div className="space-y-2.5">
              {/* Continue with Google */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={socialLoading !== null}
                className="w-full py-2.5 px-4 rounded-xl bg-[#161F30] hover:bg-[#1B2535] active:scale-[0.99] border border-[#2A3548] hover:border-indigo-500/50 text-[#F8FAFC] text-xs font-semibold flex items-center justify-center gap-3 transition-all shadow-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/40 disabled:opacity-50"
              >
                {socialLoading === 'google' ? (
                  <Loader2 size={16} className="animate-spin text-indigo-400" />
                ) : (
                  <GoogleIcon className="w-4 h-4 shrink-0" />
                )}
                <span>Continue with Google</span>
              </button>

              {/* Continue with Facebook */}
              <button
                type="button"
                onClick={handleFacebookSignIn}
                disabled={socialLoading !== null}
                className="w-full py-2.5 px-4 rounded-xl bg-[#161F30] hover:bg-[#1B2535] active:scale-[0.99] border border-[#2A3548] hover:border-blue-500/50 text-[#F8FAFC] text-xs font-semibold flex items-center justify-center gap-3 transition-all shadow-xs focus:outline-none focus:ring-2 focus:ring-blue-500/40 disabled:opacity-50"
              >
                {socialLoading === 'facebook' ? (
                  <Loader2 size={16} className="animate-spin text-blue-400" />
                ) : (
                  <FacebookIcon className="w-4 h-4 shrink-0" />
                )}
                <span>Continue with Facebook</span>
              </button>
            </div>

            {/* Missing Credentials / Configuration Guidance Alert */}
            {socialNotice && (
              <div className="mt-3.5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-2">
                <AlertCircle size={15} className="shrink-0 mt-0.5 text-amber-400" />
                <span className="leading-snug">{socialNotice}</span>
              </div>
            )}

            {/* Bottom Mode Toggle Link */}
            <div className="mt-5 text-center text-xs text-[#94A3B8]">
              {mode === 'login' ? (
                <span>
                  Don't have a municipal operator account?{' '}
                  <button
                    type="button"
                    onClick={() => handleSwitchTab('register')}
                    className="text-indigo-400 hover:text-indigo-300 font-bold transition-colors ml-1"
                  >
                    Create Account
                  </button>
                </span>
              ) : (
                <span>
                  Already registered?{' '}
                  <button
                    type="button"
                    onClick={() => handleSwitchTab('login')}
                    className="text-indigo-400 hover:text-indigo-300 font-bold transition-colors ml-1"
                  >
                    Sign In
                  </button>
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="mt-8 text-center text-[11px] text-[#94A3B8] z-10">
        Nexus AI Municipal Desk · Protected by JWT and 6-Digit Verification
      </div>
    </div>
  );
}
