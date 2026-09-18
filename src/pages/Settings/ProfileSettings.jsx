import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useSettings } from '../../context/SettingsContext';
import { UserCircle, Edit3, Save, X, CheckCircle2, AlertCircle, Loader2, Camera } from 'lucide-react';

export function ProfileSettings() {
  const { state, dispatch } = useSettings();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    phone: '',
    bio: '',
    zone: '',
    department: '',
    avatar: '',
  });

  // Sync with context
  useEffect(() => {
    if (state.profile) {
      setFormData({
        name: state.profile.name || '',
        username: state.profile.username || 'operator_1',
        email: state.profile.email || 'operator@municipal.gov',
        phone: state.profile.phone || '',
        bio: state.profile.bio || '',
        zone: state.profile.zone || 'Zone 1 - Central',
        department: state.profile.department || 'Public Works & Sanitation',
        avatar: state.profile.avatar || '',
      });
    }
  }, [state.profile]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrorMessage('');
  };

  const handleCancel = () => {
    setIsEditing(false);
    setErrorMessage('');
    // Reset to context state
    if (state.profile) {
      setFormData({
        name: state.profile.name || '',
        username: state.profile.username || 'operator_1',
        email: state.profile.email || 'operator@municipal.gov',
        phone: state.profile.phone || '',
        bio: state.profile.bio || '',
        zone: state.profile.zone || 'Zone 1 - Central',
        department: state.profile.department || 'Public Works & Sanitation',
        avatar: state.profile.avatar || '',
      });
    }
  };

  const handleSave = async () => {
    // Validation
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
      await dispatch({
        type: 'UPDATE_PROFILE',
        payload: {
          name: formData.name.trim(),
          username: formData.username.trim(),
          phone: formData.phone.trim(),
          bio: formData.bio.trim(),
          zone: formData.zone,
          avatar: formData.avatar,
        }
      });

      setIsEditing(false);
      setSuccessMessage('Profile updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setErrorMessage('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Profile</h1>
          <p className="text-gray-500 mt-1">Manage your account information, public profile, and identity.</p>
        </div>
        {!isEditing ? (
          <Button onClick={() => setIsEditing(true)} className="gap-2 self-start sm:self-auto">
            <Edit3 size={16} /> Edit Profile
          </Button>
        ) : (
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleCancel} disabled={loading} className="gap-1.5">
              <X size={15} /> Cancel
            </Button>
            <Button onClick={handleSave} disabled={loading} className="gap-1.5 bg-blue-600 hover:bg-blue-700">
              {loading ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
              Save Changes
            </Button>
          </div>
        )}
      </div>

      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-sm flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 size={18} className="text-emerald-600" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-800 text-sm flex items-center gap-2 animate-in fade-in">
          <AlertCircle size={18} className="text-red-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Avatar Section */}
          <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-gray-100">
            <div className="relative group">
              <div className="w-24 h-24 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-3xl font-bold border-4 border-white shadow-md overflow-hidden">
                {formData.avatar ? (
                  <img src={formData.avatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span>{formData.name ? formData.name.charAt(0).toUpperCase() : 'U'}</span>
                )}
              </div>
              {isEditing && (
                <div className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full shadow-md border-2 border-white hover:bg-blue-700 cursor-pointer">
                  <Camera size={14} />
                </div>
              )}
            </div>

            <div className="flex-1 text-center sm:text-left space-y-1">
              <div className="text-base font-semibold text-gray-900">{formData.name || 'User'}</div>
              <div className="text-xs text-gray-500">{state.profile.role || 'Operator'} • {formData.email}</div>
              {isEditing && (
                <div className="pt-2">
                  <input 
                    type="url"
                    placeholder="Paste image URL for avatar"
                    value={formData.avatar}
                    onChange={(e) => handleChange('avatar', e.target.value)}
                    className="w-full max-w-md text-xs px-3 py-1.5 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Full Name</label>
              <input 
                type="text" 
                disabled={!isEditing}
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className={`w-full rounded-lg px-3.5 py-2.5 text-sm transition-all ${
                  isEditing 
                    ? 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 bg-white shadow-xs' 
                    : 'border-gray-200 bg-gray-50/70 text-gray-700 cursor-not-allowed'
                }`}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Username</label>
              <input 
                type="text" 
                disabled={!isEditing}
                value={formData.username}
                onChange={(e) => handleChange('username', e.target.value)}
                className={`w-full rounded-lg px-3.5 py-2.5 text-sm transition-all ${
                  isEditing 
                    ? 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 bg-white shadow-xs' 
                    : 'border-gray-200 bg-gray-50/70 text-gray-700 cursor-not-allowed'
                }`}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Email Address <span className="text-[10px] text-gray-400 font-normal lowercase">(read-only)</span>
              </label>
              <input 
                type="email" 
                disabled
                value={formData.email}
                className="w-full rounded-lg px-3.5 py-2.5 text-sm border-gray-200 bg-gray-50/70 text-gray-500 cursor-not-allowed"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Phone Number</label>
              <input 
                type="tel" 
                disabled={!isEditing}
                placeholder="+91 00000 00000"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                className={`w-full rounded-lg px-3.5 py-2.5 text-sm transition-all ${
                  isEditing 
                    ? 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 bg-white shadow-xs' 
                    : 'border-gray-200 bg-gray-50/70 text-gray-700 cursor-not-allowed'
                }`}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Assigned Zone / Ward</label>
              <input 
                type="text" 
                disabled={!isEditing}
                value={formData.zone}
                onChange={(e) => handleChange('zone', e.target.value)}
                className={`w-full rounded-lg px-3.5 py-2.5 text-sm transition-all ${
                  isEditing 
                    ? 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 bg-white shadow-xs' 
                    : 'border-gray-200 bg-gray-50/70 text-gray-700 cursor-not-allowed'
                }`}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                System Role <span className="text-[10px] text-gray-400 font-normal lowercase">(read-only)</span>
              </label>
              <input 
                type="text" 
                disabled
                value={state.profile.role || 'Complaint Desk Operator'}
                className="w-full rounded-lg px-3.5 py-2.5 text-sm border-gray-200 bg-gray-50/70 text-gray-500 cursor-not-allowed"
              />
            </div>

            <div className="md:col-span-2 space-y-1.5">
              <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Bio & Notes</label>
              <textarea 
                rows={3}
                disabled={!isEditing}
                placeholder="Brief description about your role or ward jurisdiction..."
                value={formData.bio}
                onChange={(e) => handleChange('bio', e.target.value)}
                className={`w-full rounded-lg px-3.5 py-2.5 text-sm transition-all resize-none ${
                  isEditing 
                    ? 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 bg-white shadow-xs' 
                    : 'border-gray-200 bg-gray-50/70 text-gray-700 cursor-not-allowed'
                }`}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
