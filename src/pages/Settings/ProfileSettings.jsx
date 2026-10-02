import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useSettings } from '../../context/SettingsContext';
import { useTranslation } from '../../context/LanguageContext';
import { profileApi } from '../../api/settingsApi';
import { ProfilePhotoModal } from '../../components/profile/ProfilePhotoModal';
import { 
  Edit3, 
  Save, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Camera, 
  Trash2,
  Calendar,
  ShieldCheck,
  Mail,
  Fingerprint,
  Phone,
  Globe,
  Bell,
  Building,
  MapPin,
  Clock
} from 'lucide-react';

export function ProfileSettings() {
  const { state, dispatch, refreshProfile } = useSettings();
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(false);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [formData, setFormData] = useState(() => ({
    _id: state.profile?._id || state.profile?.id || '',
    name: state.profile?.name || '',
    username: state.profile?.username || '',
    email: state.profile?.email || '',
    phone: state.profile?.phone || '',
    bio: state.profile?.bio || '',
    zone: state.profile?.zone || 'Zone 1 - Central',
    department: state.profile?.department || 'Public Works & Sanitation',
    avatar: state.profile?.avatar || '',
    role: state.profile?.role || 'citizen',
    language: state.language || 'English',
    theme: state.theme || 'light',
    createdAt: state.profile?.createdAt || null,
    lastLogin: state.profile?.lastLogin || null,
  }));

  // Fetch fresh profile from backend on mount for strict user isolation
  useEffect(() => {
    let isMounted = true;
    setIsInitialLoading(true);
    profileApi.get()
      .then(res => {
        if (res.data?.success && res.data?.data && isMounted) {
          const user = res.data.data;
          setFormData({
            _id: user._id || user.id || '',
            name: user.name || '',
            username: user.username || '',
            email: user.email || '',
            phone: user.phone || '',
            bio: user.bio || '',
            zone: user.zone || 'Zone 1 - Central',
            department: user.department || 'Public Works & Sanitation',
            avatar: user.avatar || '',
            role: user.role || 'citizen',
            language: user.language || 'English',
            theme: user.theme || 'light',
            createdAt: user.createdAt || null,
            lastLogin: user.lastLogin || null,
          });

          dispatch({
            type: 'UPDATE_PROFILE',
            payload: user
          });
        }
      })
      .catch(() => {})
      .finally(() => {
        if (isMounted) setIsInitialLoading(false);
      });

    return () => { isMounted = false; };
  }, [dispatch]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrorMessage('');
  };

  const handleCancel = () => {
    setIsEditing(false);
    setErrorMessage('');
    if (state.profile) {
      setFormData(prev => ({
        ...prev,
        name: state.profile.name || '',
        username: state.profile.username || '',
        email: state.profile.email || '',
        phone: state.profile.phone || '',
        bio: state.profile.bio || '',
        zone: state.profile.zone || 'Zone 1 - Central',
        department: state.profile.department || 'Public Works & Sanitation',
        avatar: state.profile.avatar || '',
      }));
    }
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      setErrorMessage('Full name cannot be empty.');
      return;
    }
    if (formData.phone && formData.phone.length > 20) {
      setErrorMessage('Phone number cannot exceed 20 characters.');
      return;
    }
    if (formData.bio && formData.bio.length > 500) {
      setErrorMessage('Bio cannot exceed 500 characters.');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      const updates = {
        name: formData.name.trim(),
        username: formData.username.trim(),
        phone: formData.phone.trim(),
        bio: formData.bio.trim(),
        zone: formData.zone,
        department: formData.department,
      };

      const res = await profileApi.update(updates);
      const updatedUser = res.data?.data || updates;

      dispatch({
        type: 'UPDATE_PROFILE',
        payload: updatedUser
      });

      setIsEditing(false);
      setSuccessMessage('Profile information saved successfully!');
      setTimeout(() => setSuccessMessage(''), 3500);
      if (refreshProfile) refreshProfile();
    } catch (err) {
      const msg = err.response?.data?.error?.message || err.response?.data?.message || 'Failed to update profile. Please try again.';
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  // Profile Picture Upload Handler
  const handleSavePhoto = async (croppedDataUrl) => {
    try {
      const res = await profileApi.update({ avatar: croppedDataUrl });
      const updatedUser = res.data?.data;
      const finalAvatar = updatedUser?.avatar || croppedDataUrl;
      dispatch({
        type: 'UPDATE_PROFILE',
        payload: { avatar: finalAvatar }
      });
      setFormData(prev => ({ ...prev, avatar: finalAvatar }));
      setSuccessMessage('Profile picture updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3500);
      if (refreshProfile) refreshProfile();
    } catch (err) {
      const msg = err.response?.data?.error?.message || err.response?.data?.message || 'Failed to upload profile picture.';
      setErrorMessage(msg);
      throw err;
    }
  };

  // Remove Photo Handler
  const handleRemovePhoto = async () => {
    try {
      await profileApi.deleteAvatar();
      dispatch({
        type: 'UPDATE_PROFILE',
        payload: { avatar: null }
      });
      setFormData(prev => ({ ...prev, avatar: null }));
      setSuccessMessage('Profile picture removed successfully.');
      setTimeout(() => setSuccessMessage(''), 3500);
      if (refreshProfile) refreshProfile();
    } catch (err) {
      const msg = err.response?.data?.error?.message || err.response?.data?.message || 'Failed to remove profile picture.';
      setErrorMessage(msg);
      throw err;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Active Account';
    try {
      const d = new Date(dateString);
      if (isNaN(d.getTime())) return 'Active Account';
      return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'Active Account';
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'Recently';
    try {
      const d = new Date(dateString);
      if (isNaN(d.getTime())) return 'Recently';
      return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Recently';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{t('profileTitle', 'User Profile')}</h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            {t('profileDesc', 'Manage your account identity, personal details, and municipal zone credentials.')}
          </p>
        </div>

        {!isEditing ? (
          <Button 
            onClick={() => setIsEditing(true)} 
            className="gap-2 self-start sm:self-auto bg-blue-600 hover:bg-blue-700 text-white shadow-sm cursor-pointer"
          >
            <Edit3 size={16} /> Edit Profile
          </Button>
        ) : (
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <Button 
              variant="outline" 
              onClick={handleCancel} 
              disabled={loading} 
              className="gap-1.5 border-slate-300 text-slate-700 cursor-pointer"
            >
              <X size={15} /> Cancel
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={loading} 
              className="gap-1.5 bg-blue-600 hover:bg-blue-700 text-white shadow-sm cursor-pointer"
            >
              {loading ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
              Save Changes
            </Button>
          </div>
        )}
      </div>

      {/* Alerts */}
      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs sm:text-sm flex items-center gap-2.5 animate-in fade-in shadow-xs">
          <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
          <span className="font-medium">{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs sm:text-sm flex items-center gap-2.5 animate-in fade-in shadow-xs">
          <AlertCircle size={18} className="text-rose-600 shrink-0" />
          <span className="font-medium">{errorMessage}</span>
        </div>
      )}

      {/* Main Profile Card */}
      <Card className="border border-slate-200 shadow-sm rounded-2xl overflow-hidden bg-white">
        <CardHeader className="bg-slate-50/60 border-b border-slate-100 py-4 px-6">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-bold text-slate-800">
              Account & Profile Information
            </CardTitle>
            {isInitialLoading && (
              <span className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                <Loader2 size={13} className="animate-spin" /> Syncing with server...
              </span>
            )}
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-8">
          
          {/* PROFILE PICTURE HERO SECTION */}
          <div className="flex flex-col sm:flex-row items-center gap-6 p-6 rounded-2xl bg-gradient-to-r from-blue-50/60 via-slate-50/80 to-indigo-50/40 border border-slate-200/80">
            {/* Clickable Profile Picture */}
            <div className="relative group">
              <button
                type="button"
                onClick={() => setIsPhotoModalOpen(true)}
                aria-label="Change profile picture"
                className="relative w-28 h-28 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center text-4xl font-bold border-4 border-white shadow-lg overflow-hidden cursor-pointer transition-transform group-hover:scale-105 group-focus:ring-4 group-focus:ring-blue-300"
              >
                {formData.avatar ? (
                  <img 
                    src={formData.avatar} 
                    alt={formData.name || 'User Profile'} 
                    className="w-full h-full object-cover" 
                  />
                ) : (
                  <span>{formData.name ? formData.name.charAt(0).toUpperCase() : 'U'}</span>
                )}

                {/* Hover Camera Overlay */}
                <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-2xs flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white text-[11px] font-medium p-1 text-center">
                  <Camera size={20} className="mb-0.5" />
                  <span>Change</span>
                </div>
              </button>

              {/* Badge Button */}
              <button
                type="button"
                onClick={() => setIsPhotoModalOpen(true)}
                title="Change Photo"
                className="absolute bottom-1 right-1 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full shadow-md border-2 border-white transition-transform hover:scale-110 cursor-pointer"
              >
                <Camera size={14} />
              </button>
            </div>

            {/* Profile Identity Details */}
            <div className="flex-1 text-center sm:text-left space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <h2 className="text-xl font-bold text-slate-900">
                  {formData.name || 'Municipal Officer'}
                </h2>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200 self-center sm:self-auto capitalize">
                  <ShieldCheck size={13} className="text-blue-600" />
                  {(formData.role || state.profile?.role || 'citizen').replace('_', ' ')}
                </span>
              </div>

              <div className="text-xs text-slate-600 flex flex-wrap items-center justify-center sm:justify-start gap-y-1 gap-x-3">
                <span className="flex items-center gap-1">
                  <Mail size={13} className="text-slate-400" />
                  {formData.email || 'operator@municipal.gov'}
                </span>
                {formData._id && (
                  <span className="flex items-center gap-1 font-mono text-[11px] text-slate-500">
                    <Fingerprint size={13} className="text-slate-400" />
                    ID: {formData._id.slice(-8).toUpperCase()}
                  </span>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsPhotoModalOpen(true)}
                  className="bg-white hover:bg-slate-100 text-slate-700 border-slate-300 text-xs gap-1.5 shadow-2xs font-semibold cursor-pointer"
                >
                  <Camera size={14} /> Change Photo
                </Button>

                {formData.avatar && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleRemovePhoto}
                    className="bg-white hover:bg-rose-50 text-rose-600 border-rose-200 text-xs gap-1.5 shadow-2xs font-semibold cursor-pointer"
                  >
                    <Trash2 size={13} /> Remove Photo
                  </Button>
                )}

                <span className="text-[11px] text-slate-400 w-full sm:w-auto">
                  Click photo to crop, zoom & rotate
                </span>
              </div>
            </div>
          </div>

          {/* FORM / PROFILE FIELDS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            
            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
                <span>Full Name</span>
                {isEditing && <span className="text-[10px] text-blue-600 font-semibold lowercase">Required</span>}
              </label>
              <input 
                type="text" 
                disabled={!isEditing}
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="e.g. Amit Kumar"
                className={`w-full rounded-xl px-3.5 py-2.5 text-sm transition-all outline-none ${
                  isEditing 
                    ? 'border border-slate-300 focus:border-blue-500 focus:ring-3 focus:ring-blue-100 bg-white text-slate-900 shadow-xs' 
                    : 'border border-slate-200 bg-slate-50/80 text-slate-800 cursor-not-allowed font-medium'
                }`}
              />
            </div>

            {/* Username */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Username
              </label>
              <input 
                type="text" 
                disabled={!isEditing}
                value={formData.username}
                onChange={(e) => handleChange('username', e.target.value)}
                placeholder="e.g. amit_kumar"
                className={`w-full rounded-xl px-3.5 py-2.5 text-sm transition-all outline-none ${
                  isEditing 
                    ? 'border border-slate-300 focus:border-blue-500 focus:ring-3 focus:ring-blue-100 bg-white text-slate-900 shadow-xs' 
                    : 'border border-slate-200 bg-slate-50/80 text-slate-800 cursor-not-allowed font-medium'
                }`}
              />
            </div>

            {/* Email Address (Read-Only) */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
                <span>Email Address</span>
                <span className="text-[10px] text-slate-400 font-medium lowercase flex items-center gap-1">
                  <ShieldCheck size={11} /> read-only
                </span>
              </label>
              <div className="relative">
                <input 
                  type="email" 
                  disabled
                  value={formData.email}
                  className="w-full rounded-xl px-3.5 py-2.5 text-sm border border-slate-200 bg-slate-50/80 text-slate-600 cursor-not-allowed font-medium"
                />
              </div>
            </div>

            {/* Phone Number */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Phone size={13} className="text-slate-400" />
                <span>Phone Number</span>
              </label>
              <input 
                type="tel" 
                disabled={!isEditing}
                placeholder="+91 98765 43210"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                className={`w-full rounded-xl px-3.5 py-2.5 text-sm transition-all outline-none ${
                  isEditing 
                    ? 'border border-slate-300 focus:border-blue-500 focus:ring-3 focus:ring-blue-100 bg-white text-slate-900 shadow-xs' 
                    : 'border border-slate-200 bg-slate-50/80 text-slate-800 cursor-not-allowed font-medium'
                }`}
              />
            </div>

            {/* Assigned Zone / Ward */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <MapPin size={13} className="text-slate-400" />
                <span>Assigned Zone / Ward</span>
              </label>
              <input 
                type="text" 
                disabled={!isEditing}
                value={formData.zone}
                onChange={(e) => handleChange('zone', e.target.value)}
                placeholder="e.g. Zone 1 - Central"
                className={`w-full rounded-xl px-3.5 py-2.5 text-sm transition-all outline-none ${
                  isEditing 
                    ? 'border border-slate-300 focus:border-blue-500 focus:ring-3 focus:ring-blue-100 bg-white text-slate-900 shadow-xs' 
                    : 'border border-slate-200 bg-slate-50/80 text-slate-800 cursor-not-allowed font-medium'
                }`}
              />
            </div>

            {/* Department */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Building size={13} className="text-slate-400" />
                <span>Department</span>
              </label>
              <input 
                type="text" 
                disabled={!isEditing}
                value={formData.department}
                onChange={(e) => handleChange('department', e.target.value)}
                placeholder="e.g. Public Works & Sanitation"
                className={`w-full rounded-xl px-3.5 py-2.5 text-sm transition-all outline-none ${
                  isEditing 
                    ? 'border border-slate-300 focus:border-blue-500 focus:ring-3 focus:ring-blue-100 bg-white text-slate-900 shadow-xs' 
                    : 'border border-slate-200 bg-slate-50/80 text-slate-800 cursor-not-allowed font-medium'
                }`}
              />
            </div>

            {/* User ID / Account ID (Read-Only) */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
                <span>Account ID</span>
                <span className="text-[10px] text-slate-400 font-medium lowercase">system identifier</span>
              </label>
              <input 
                type="text" 
                disabled
                value={formData._id ? `USR-${formData._id}` : 'USR-AUTHENTICATED'}
                className="w-full rounded-xl px-3.5 py-2.5 text-xs font-mono border border-slate-200 bg-slate-50/80 text-slate-600 cursor-not-allowed"
              />
            </div>

            {/* Role (Read-Only) */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
                <span>System Role</span>
                <span className="text-[10px] text-slate-400 font-medium lowercase">governance role</span>
              </label>
              <input 
                type="text" 
                disabled
                value={(formData.role || state.profile?.role || 'citizen').replace('_', ' ').toUpperCase()}
                className="w-full rounded-xl px-3.5 py-2.5 text-sm border border-slate-200 bg-slate-50/80 text-slate-600 cursor-not-allowed font-semibold"
              />
            </div>

            {/* Bio & Ward Notes */}
            <div className="md:col-span-2 space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Bio & Jurisdiction Notes
                </label>
                {isEditing && (
                  <span className="text-[11px] text-slate-400 font-mono">
                    {formData.bio?.length || 0}/500
                  </span>
                )}
              </div>
              <textarea 
                rows={3}
                disabled={!isEditing}
                maxLength={500}
                placeholder="Brief description regarding your municipal ward jurisdiction or triage responsibilities..."
                value={formData.bio}
                onChange={(e) => handleChange('bio', e.target.value)}
                className={`w-full rounded-xl px-3.5 py-2.5 text-sm transition-all resize-none outline-none ${
                  isEditing 
                    ? 'border border-slate-300 focus:border-blue-500 focus:ring-3 focus:ring-blue-100 bg-white text-slate-900 shadow-xs' 
                    : 'border border-slate-200 bg-slate-50/80 text-slate-800 cursor-not-allowed font-medium'
                }`}
              />
            </div>
          </div>

          {/* READ-ONLY ACCOUNT STATUS & PREFERENCES SECTION */}
          <div className="pt-6 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Preferred Language */}
            <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/70 space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                <Globe size={14} className="text-blue-500" />
                <span>Preferred Language</span>
              </div>
              <p className="text-sm font-bold text-slate-800">
                {formData.language || 'English'}
              </p>
            </div>

            {/* Notifications Status */}
            <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/70 space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                <Bell size={14} className="text-emerald-500" />
                <span>Notifications</span>
              </div>
              <p className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                Enabled
              </p>
            </div>

            {/* Account Created Date */}
            <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/70 space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                <Calendar size={14} className="text-indigo-500" />
                <span>Account Created</span>
              </div>
              <p className="text-sm font-bold text-slate-800">
                {formatDate(formData.createdAt)}
              </p>
            </div>

            {/* Last Login */}
            <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/70 space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                <Clock size={14} className="text-amber-500" />
                <span>Last Login</span>
              </div>
              <p className="text-sm font-bold text-slate-800 truncate">
                {formatDateTime(formData.lastLogin)}
              </p>
            </div>

          </div>

        </CardContent>
      </Card>

      {/* Profile Photo Modal with Camera, Gallery & Crop/Zoom/Rotate */}
      <ProfilePhotoModal
        isOpen={isPhotoModalOpen}
        onClose={() => setIsPhotoModalOpen(false)}
        currentAvatar={formData.avatar}
        onSave={handleSavePhoto}
        onRemove={handleRemovePhoto}
        userName={formData.name || 'User'}
      />
    </div>
  );
}
