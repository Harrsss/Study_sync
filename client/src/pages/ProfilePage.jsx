import React, { useState, useEffect } from 'react';
import { User, Mail, Shield, Key, Trophy, Award, BookOpen, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { leaderboardService } from '../services/leaderboardService';
import api from '../services/api';
import Button from '../components/common/Button';

const ProfilePage = () => {
  const { user } = useAuth();
  const [userRank, setUserRank] = useState(null);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState({ type: '', text: '' });
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    const fetchRank = async () => {
      try {
        const res = await leaderboardService.getMyRank();
        setUserRank(res.data);
      } catch (err) {
        console.error('Failed to load user rank:', err);
      }
    };
    fetchRank();
  }, []);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'New passwords do not match' });
      return;
    }

    if (newPassword.length < 6) {
      setPasswordMsg({ type: 'error', text: 'New password must be at least 6 characters' });
      return;
    }

    try {
      setChangingPassword(true);
      setPasswordMsg({ type: '', text: '' });

      await api.patch('/users/password', {
        currentPassword,
        newPassword
      });

      setPasswordMsg({ type: 'success', text: 'Password updated successfully' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPasswordMsg({
        type: 'error',
        text: err.response?.data?.message || 'Failed to update password'
      });
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Account Profile</h1>
        <p className="text-sm text-slate-500 mt-0.5">Manage your student profile and security credentials</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card (1 col) */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs space-y-4">
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-2xl mb-3 shadow-xs">
              {user?.username?.charAt(0).toUpperCase() || 'U'}
            </div>
            <h3 className="text-base font-bold text-slate-900">{user?.username}</h3>
            <p className="text-xs text-slate-500">{user?.email}</p>
          </div>

          <div className="border-t border-slate-100 pt-3 space-y-2.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-medium">Rank</span>
              <span className="font-bold text-slate-900">#{userRank?.rank ?? 1}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-medium">Total Points</span>
              <span className="font-bold text-indigo-600">{userRank?.points ?? user?.points ?? 0} pts</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-medium">Role</span>
              <span className="text-slate-700 font-semibold uppercase text-[10px] bg-slate-100 px-1.5 py-0.5 rounded">
                Student
              </span>
            </div>
          </div>
        </div>

        {/* Change Password Form (2 cols) */}
        <div className="md:col-span-2 bg-white border border-slate-200 rounded-lg p-5 shadow-xs">
          <div className="flex items-center gap-2 pb-3 mb-4 border-b border-slate-100">
            <Shield className="w-4 h-4 text-indigo-600" />
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
              Security &amp; Password
            </h2>
          </div>

          <form onSubmit={handlePasswordChange} className="space-y-4">
            {passwordMsg.text && (
              <div
                className={`p-3 rounded-lg text-xs font-medium ${
                  passwordMsg.type === 'success'
                    ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                    : 'bg-rose-50 border border-rose-200 text-rose-800'
                }`}
              >
                {passwordMsg.text}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Current Password
              </label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  New Password
                </label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <Button
                type="submit"
                variant="primary"
                size="sm"
                isLoading={changingPassword}
                icon={Key}
              >
                Update Password
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
