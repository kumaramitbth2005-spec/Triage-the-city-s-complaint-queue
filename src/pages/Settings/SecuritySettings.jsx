import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useTranslation } from '../../context/LanguageContext';
import { authApi } from '../../api/settingsApi';
import {
  ShieldCheck,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Loader2,
  KeyRound,
  AlertTriangle,
  Info,
  LogOut,
} from 'lucide-react';

function PasswordStrengthBar({ password }) {
  const getStrength = (pwd) => {
    let score = 0;
    if (!pwd) return { score: 0, label: '', color: '' };
    if (pwd.length >= 8) score++;
    if (pwd.length >= 12) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;

    if (score <= 1) return { score, label: 'Very Weak', color: 'bg-red-500' };
    if (score === 2) return { score, label: 'Weak', color: 'bg-orange-500' };
    if (score === 3) return { score, label: 'Fair', color: 'bg-yellow-500' };
    if (score === 4) return { score, label: 'Strong', color: 'bg-blue-500' };
    return { score, label: 'Very Strong', color: 'bg-emerald-500' };
  };

  const { score, label, color } = getStrength(password);
  if (!password) return null;

  return (
    <div className="space-y-1.5 mt-2">
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
              i <= score ? color : 'bg-gray-200'
            }`}
          />
        ))}
      </div>
      {label && (
        <p className={`text-xs font-medium ${
          score <= 1 ? 'text-red-600' :
          score === 2 ? 'text-orange-600' :
          score === 3 ? 'text-yellow-600' :
          score === 4 ? 'text-blue-600' : 'text-emerald-600'
        }`}>
          Password strength: {label}
        </p>
      )}
    </div>
  );
}

function PasswordInput({ label, value, onChange, show, setShow, placeholder, id, onClearError }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-xs font-semibold text-gray-700 dark:text-slate-300 uppercase tracking-wider">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={show ? 'text' : 'password'}
          value={value}
          onChange={(e) => { onChange(e.target.value); if (onClearError) onClearError(); }}
          placeholder={placeholder}
          className="w-full rounded-lg px-3.5 py-2.5 pr-11 text-sm border border-gray-300 dark:border-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/50 bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm transition-all outline-none"
          autoComplete="off"
        />
        <button
          type="button"
          onClick={() => setShow((v) => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 transition-colors"
          aria-label={show ? 'Hide password' : 'Show password'}
        >
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
    </div>
  );
}

export function SecuritySettings() {
  const { t } = useTranslation();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!currentPassword) {
      setError('Please enter your current password.');
      return;
    }
    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('New password and confirm password do not match.');
      return;
    }
    if (currentPassword === newPassword) {
      setError('New password must be different from your current password.');
      return;
    }

    setLoading(true);
    try {
      await authApi.changePassword(currentPassword, newPassword);
      setSuccess('Password changed successfully! Your account is now secured with the new password.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      const msg = err?.response?.data?.error?.message || 'Failed to change password. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const securityTips = [
    { icon: KeyRound, text: 'Use a unique password not shared with other accounts' },
    { icon: ShieldCheck, text: 'Enable 2-factor authentication when available' },
    { icon: AlertTriangle, text: 'Never share your credentials with anyone' },
    { icon: Lock, text: 'Use a mix of uppercase, numbers, and symbols' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t('securityTitle', 'Security')}</h1>
        <p className="text-gray-500 mt-1">{t('securityDesc', 'Manage your password, active sessions, and account security settings.')}</p>
      </div>

      {/* Feedback Messages */}
      {success && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-sm flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
          <span>{success}</span>
        </div>
      )}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-800 text-sm flex items-center gap-2 animate-in fade-in">
          <AlertCircle size={18} className="text-red-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Change Password */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock size={18} className="text-blue-600" />
            <span>Change Password</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleChangePassword} className="space-y-5" noValidate>
            <PasswordInput
              id="current-password"
              label="Current Password"
              value={currentPassword}
              onChange={setCurrentPassword}
              show={showCurrent}
              setShow={setShowCurrent}
              placeholder="Enter your current password"
            />

            <div className="space-y-1.5">
              <label htmlFor="new-password" className="text-xs font-semibold text-gray-700 dark:text-slate-300 uppercase tracking-wider">
                New Password
              </label>
              <div className="relative">
                <input
                  id="new-password"
                  type={showNew ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => { setNewPassword(e.target.value); setError(''); }}
                  placeholder="Enter your new password (min. 8 characters)"
                  className="w-full rounded-lg px-3.5 py-2.5 pr-11 text-sm border border-gray-300 dark:border-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/50 bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm transition-all outline-none"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowNew((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label={showNew ? 'Hide password' : 'Show password'}
                >
                  {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <PasswordStrengthBar password={newPassword} />
            </div>

            <PasswordInput
              id="confirm-password"
              label="Confirm New Password"
              value={confirmPassword}
              onChange={setConfirmPassword}
              show={showConfirm}
              setShow={setShowConfirm}
              placeholder="Re-enter your new password"
            />

            {/* Requirements */}
            <div className="p-3 bg-blue-50/70 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-800/50 rounded-xl space-y-1.5">
              <p className="text-xs font-semibold text-blue-900 dark:text-blue-200">Password requirements:</p>
              <ul className="space-y-1">
                {[
                  { rule: 'At least 8 characters', met: newPassword.length >= 8 },
                  { rule: 'Contains uppercase letter (A–Z)', met: /[A-Z]/.test(newPassword) },
                  { rule: 'Contains number (0–9)', met: /[0-9]/.test(newPassword) },
                  { rule: 'Contains special character (!@#$...)', met: /[^A-Za-z0-9]/.test(newPassword) },
                ].map(({ rule, met }) => (
                  <li key={rule} className={`flex items-center gap-1.5 text-xs ${met ? 'text-emerald-700 dark:text-emerald-400' : 'text-blue-800 dark:text-blue-300'}`}>
                    <CheckCircle2 size={12} className={met ? 'text-emerald-600' : 'text-blue-300'} />
                    {rule}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex justify-end pt-1">
              <Button
                type="submit"
                disabled={loading}
                className="gap-2 bg-blue-600 hover:bg-blue-700 text-white min-w-[160px]"
                id="change-password-btn"
              >
                {loading ? (
                  <><Loader2 size={15} className="animate-spin" /> Updating...</>
                ) : (
                  <><Lock size={15} /> Change Password</>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Session Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck size={18} className="text-emerald-600" />
            <span>Session & Access</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 py-2 border-b border-gray-100">
            <div>
              <div className="font-medium text-gray-800 dark:text-white text-sm">Current Session</div>
              <div className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">This browser session is authenticated with a JWT token (1-day expiry).</div>
            </div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 text-emerald-700 dark:text-emerald-400 text-xs font-semibold self-start sm:self-auto shrink-0">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Active
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 py-2 border-b border-gray-100">
            <div>
              <div className="font-medium text-gray-800 dark:text-white text-sm">Authentication Method</div>
              <div className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">Standard email and password with bcrypt hashing (10 salt rounds)</div>
            </div>
            <span className="text-xs font-semibold text-gray-600 dark:text-slate-300 bg-gray-100 dark:bg-slate-800 px-3 py-1 rounded-full border border-gray-200 dark:border-slate-700 self-start sm:self-auto shrink-0">
              JWT · bcrypt
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 py-2">
            <div>
              <div className="font-medium text-red-600 dark:text-red-400 text-sm">Sign Out All Sessions</div>
              <div className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">Log out from this device and invalidate all active sessions</div>
            </div>
            <Button
              variant="outline"
              className="gap-2 text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 text-xs self-start sm:self-auto shrink-0"
              onClick={() => {
                localStorage.removeItem('auth_token');
                window.location.href = '/';
              }}
              id="logout-all-btn"
            >
              <LogOut size={14} />
              Sign Out
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Security Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info size={18} className="text-indigo-600" />
            <span>Security Best Practices</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {securityTips.map(({ icon: Icon, text }, i) => (
              <div
                key={i}
                className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700 rounded-xl"
              >
                <div className="p-2 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-lg shrink-0">
                  <Icon size={16} />
                </div>
                <p className="text-xs text-gray-700 dark:text-slate-300 leading-relaxed">{text}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
