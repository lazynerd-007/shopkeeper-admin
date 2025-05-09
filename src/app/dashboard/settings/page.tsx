'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './settings-page.module.css';
import env from '../../../utils/env';

function SuccessModal({ show, message, onClose }: { show: boolean; message: string; onClose: () => void }) {
  if (!show) return null;
  
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'rgba(0,0,0,0.3)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
    }}>
      <div style={{
        background: 'white',
        borderRadius: 12,
        padding: '2rem 3rem',
        boxShadow: '0 4px 24px rgba(0,0,0,0.15)',
        textAlign: 'center',
        minWidth: 280,
      }}>
        <h2 style={{ color: '#2563eb', marginBottom: 12 }}>Success!</h2>
        <p style={{ color: '#374151', marginBottom: 20 }}>{message}</p>
        <button 
          onClick={onClose}
          style={{
            backgroundColor: '#2563eb',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '6px',
            fontWeight: 500,
            cursor: 'pointer'
          }}
        >
          Close
        </button>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [countryCode, setCountryCode] = useState('+234');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordHint, setPasswordHint] = useState('');
  const [passwordsMatch, setPasswordsMatch] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isProfileLoading, setIsProfileLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  // Fetch user profile data on component mount
  useEffect(() => {
    const fetchUserProfile = async () => {
      setIsProfileLoading(true);
      try {
        // Get user data from localStorage
        const userData = localStorage.getItem('userData');
        let user = null;
        
        if (userData) {
          try {
            user = JSON.parse(userData);
            
            // Set form fields with user data
            setFirstName(user.firstName || '');
            setLastName(user.lastName || '');
            setEmail(user.email || '');
            setPhoneNumber(user.phoneNumber || '');
            setCountryCode(user.countryCode || '+234');
          } catch (e) {
            console.error('Error parsing user data from localStorage:', e);
            setMessage({ 
              type: 'error', 
              text: 'Could not load profile data. Please log out and log in again.' 
            });
          }
        } else {
          // No user data found in localStorage
          console.warn('No user data found in localStorage');
          setMessage({ 
            type: 'error', 
            text: 'Profile data not found. Please log out and log in again to load your profile.' 
          });
          
          // Set empty default values
          setFirstName('');
          setLastName('');
          setEmail('');
          setPhoneNumber('');
          setCountryCode('+234');
        }
      } catch (err) {
        console.error('Error handling profile data:', err);
        setMessage({ 
          type: 'error', 
          text: 'Failed to load profile data. Please try refreshing the page.' 
        });
        
        // Set default empty values
        setFirstName('');
        setLastName('');
        setEmail('');
        setPhoneNumber('');
        setCountryCode('+234');
      } finally {
        setIsProfileLoading(false);
      }
    };
    
    fetchUserProfile();
  }, []);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('You must be logged in to update your profile.');
      }

      const userData = {
        firstName,
        lastName,
        countryCode
      };

      const response = await fetch(`${env.API_BASE_URL}/auth/update-user`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'D-UUID': '645545453533',
        },
        body: JSON.stringify(userData)
      });

      const data = await response.json();

      if (!response.ok || !data.status) {
        throw new Error(data.message || 'Failed to update profile.');
      }

      // Update localStorage with the updated user data
      // Get the current user data to preserve the phone number and email
      const currentUserData = localStorage.getItem('userData');
      let currentPhoneNumber = '';
      let currentEmail = '';
      
      if (currentUserData) {
        try {
          const userData = JSON.parse(currentUserData);
          currentPhoneNumber = userData.phoneNumber || '';
          currentEmail = userData.email || '';
        } catch (e) {
          console.error('Error parsing current user data:', e);
        }
      }
      
      const updatedUserData = {
        firstName,
        lastName,
        email: currentEmail, // Keep the original email
        phoneNumber: currentPhoneNumber, // Keep the original phone number
        countryCode
      };
      localStorage.setItem('userData', JSON.stringify(updatedUserData));

      setMessage({ type: 'success', text: data.message || 'Profile updated successfully!' });
      setShowProfileModal(true);
    } catch (err: Error | unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update profile. Please try again.';
      setMessage({ type: 'error', text: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: '', text: '' });

    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match.' });
      setPasswordsMatch(false);
      setIsLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('You must be logged in to change your password.');
      }

      const passwordData = {
        oldPassword: currentPassword,
        newPassword: newPassword,
        passwordHint: passwordHint
      };

      const response = await fetch(`${env.API_BASE_URL}/auth/change-password`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'D-UUID': '645545453533',
        },
        body: JSON.stringify(passwordData)
      });

      const data = await response.json();

      if (!response.ok || !data.status) {
        throw new Error(data.message || 'Failed to update password.');
      }

      setMessage({ type: 'success', text: data.message || 'Password updated successfully!' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      setPasswordHint('');
      setShowPasswordModal(true);
    } catch (err: Error | unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update password. Please try again.';
      setMessage({ type: 'error', text: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setNewPassword(newValue);
    setPasswordsMatch(confirmPassword === '' || confirmPassword === newValue);
  };

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setConfirmPassword(newValue);
    setPasswordsMatch(newValue === '' || newValue === newPassword);
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
            {isProfileLoading ? (
              <div className="flex justify-center items-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : (
            <form onSubmit={handleProfileUpdate}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className={styles.formGroup}>
                    <label htmlFor="firstName" className={styles.formLabel}>First Name</label>
                <input
                      id="firstName"
                  type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                  className={styles.formInput}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                    <label htmlFor="lastName" className={styles.formLabel}>Last Name</label>
                <input
                      id="lastName"
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                  className={styles.formInput}
                  required
                />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="email" className={styles.formLabel}>
                    Email <span className="text-xs text-gray-500">(cannot be changed)</span>
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    className={`${styles.formInput} bg-gray-100`}
                    required
                    disabled
                    readOnly
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className={styles.formGroup}>
                    <label htmlFor="countryCode" className={styles.formLabel}>Code</label>
                    <input
                      id="countryCode"
                      type="text"
                      value={countryCode}
                      onChange={(e) => setCountryCode(e.target.value)}
                      className={styles.formInput}
                      placeholder="+234"
                      maxLength={5}
                      style={{ width: '100%' }}
                    />
                  </div>

                  <div className={`${styles.formGroup} col-span-2`}>
                    <label htmlFor="phoneNumber" className={styles.formLabel}>
                      Phone Number <span className="text-xs text-gray-500">(cannot be changed)</span>
                    </label>
                    <input
                      id="phoneNumber"
                      type="tel"
                      value={phoneNumber}
                      className={`${styles.formInput} bg-gray-100`}
                      placeholder="8067709887"
                      disabled
                      readOnly
                    />
                  </div>
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
            )}
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
                  onChange={handleNewPasswordChange}
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
                  onChange={handleConfirmPasswordChange}
                  className={`${styles.formInput} ${!passwordsMatch ? 'border-red-500' : ''}`}
                  required
                />
                {!passwordsMatch && confirmPassword !== '' && (
                  <p className="text-red-500 text-sm mt-1">Passwords do not match</p>
                )}
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="passwordHint" className={styles.formLabel}>Password Hint (Optional)</label>
                <input
                  id="passwordHint"
                  type="text"
                  value={passwordHint}
                  onChange={(e) => setPasswordHint(e.target.value)}
                  className={styles.formInput}
                  placeholder="Something to help you remember your password"
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
      
      <SuccessModal 
        show={showProfileModal}
        message="Profile updated successfully!"
        onClose={() => setShowProfileModal(false)}
      />
      
      <SuccessModal
        show={showPasswordModal}
        message="Password updated successfully!"
        onClose={() => setShowPasswordModal(false)}
      />
    </div>
  );
}