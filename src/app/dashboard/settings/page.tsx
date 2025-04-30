'use client';

import { useState } from 'react';
import Link from 'next/link';
import styles from './settings-page.module.css';

export default function SettingsPage() {
  const [adminName, setAdminName] = useState('Admin User');
  const [adminEmail, setAdminEmail] = useState('admin@myshopkeeper.com');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: '', text: '' });

    try {
      // In a real application, this would be an API call to update profile
      setTimeout(() => {
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
        setIsLoading(false);
      }, 1000);
    } catch {
      setMessage({ type: 'error', text: 'Failed to update profile. Please try again.' });
      setIsLoading(false);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: '', text: '' });

    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match.' });
      setIsLoading(false);
      return;
    }

    try {
      // In a real application, this would be an API call to update password
      setTimeout(() => {
        setMessage({ type: 'success', text: 'Password updated successfully!' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setIsLoading(false);
      }, 1000);
    } catch {
      setMessage({ type: 'error', text: 'Failed to update password. Please try again.' });
      setIsLoading(false);
    }
  };



  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Settings</h1>
        <div className={styles.buttonGroup}>
          <Link 
            href="/dashboard"
            className={styles.backButton}
          >
            Back to Dashboard
          </Link>
        </div>
      </div>

      {message.text && (
        <div className={`p-4 rounded-md ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Profile Settings */}
        <div className={styles.settingsCard}>
          <div className={styles.settingsHeader}>
            <h2 className={styles.sectionTitle}>Profile Settings</h2>
            <p className={styles.sectionSubtitle}>Update your account information</p>
          </div>
          <div className={styles.settingsBody}>
            <form onSubmit={handleProfileUpdate}>
              <div className={styles.formGroup}>
                <label htmlFor="adminName" className={styles.formLabel}>Name</label>
                <input
                  id="adminName"
                  type="text"
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                  className={styles.formInput}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="adminEmail" className={styles.formLabel}>Email</label>
                <input
                  id="adminEmail"
                  type="email"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  className={styles.formInput}
                  required
                />
              </div>

              <div className={styles.buttonContainer}>
                <button
                  type="submit"
                  className={styles.saveButton}
                  disabled={isLoading}
                >
                  {isLoading ? 'Updating...' : 'Update Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Password Settings */}
        <div className={styles.settingsCard}>
          <div className={styles.settingsHeader}>
            <h2 className={styles.sectionTitle}>Password Settings</h2>
            <p className={styles.sectionSubtitle}>Update your password</p>
          </div>
          <div className={styles.settingsBody}>
            <form onSubmit={handlePasswordUpdate}>
              <div className={styles.formGroup}>
                <label htmlFor="currentPassword" className={styles.formLabel}>Current Password</label>
                <input
                  id="currentPassword"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className={styles.formInput}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="newPassword" className={styles.formLabel}>New Password</label>
                <input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className={styles.formInput}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="confirmPassword" className={styles.formLabel}>Confirm New Password</label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={styles.formInput}
                  required
                />
              </div>

              <div className={styles.buttonContainer}>
                <button
                  type="submit"
                  className={styles.saveButton}
                  disabled={isLoading}
                >
                  {isLoading ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}