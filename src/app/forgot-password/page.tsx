'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from './forgot-password.module.css';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [step, setStep] = useState(1); // 1: Email entry, 2: OTP verification, 3: New password
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // In a real application, this would be an API call to send OTP
      // For demo purposes, we'll just move to the next step
      setTimeout(() => {
        setStep(2);
      }, 1000);
    } catch (err) {
      setError('Failed to send OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // In a real application, this would be an API call to verify OTP
      // For demo purposes, we'll just move to the next step
      setTimeout(() => {
        setStep(3);
      }, 1000);
    } catch (err) {
      setError('Invalid OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      setIsLoading(false);
      return;
    }

    try {
      // In a real application, this would be an API call to reset password
      // For demo purposes, we'll just redirect to login
      setTimeout(() => {
        router.push('/login');
      }, 1000);
    } catch (err) {
      setError('Failed to reset password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.formContainer}>
        <div className={styles.formWrapper}>
          <div className={styles.logoContainer}>
            <div className={styles.logoWrapper}>
              <Image 
                src="/logo.svg" 
                alt="myShopKeeper Logo" 
                width={80} 
                height={80} 
                priority
                className="mb-2"
              />
            </div>
            <h1 className={styles.title}>myShopKeeper</h1>
            <p className={styles.subtitle}>
              {step === 1 && 'Enter your email to receive a password reset OTP.'}
              {step === 2 && 'Enter the OTP sent to your email.'}
              {step === 3 && 'Create a new password for your account.'}
            </p>
          </div>

          {error && (
            <div className={styles.errorMessage}>
              {error}
            </div>
          )}

          {step === 1 && (
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div className={styles.formGroup}>
                <label htmlFor="email" className={styles.label}>Email</label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={styles.input}
                  placeholder="Email address"
                  required
                />
              </div>

              <button
                type="submit"
                className={styles.submitButton}
                disabled={isLoading}
              >
                {isLoading ? 'Sending...' : 'Send OTP'}
              </button>

              <div className={styles.backLink}>
                <Link href="/login">
                  Back to Login
                </Link>
              </div>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleOtpSubmit} className="space-y-4">
              <div className={styles.formGroup}>
                <label htmlFor="otp" className={styles.label}>OTP</label>
                <input
                  id="otp"
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className={styles.input}
                  placeholder="Enter OTP"
                  required
                />
              </div>

              <button
                type="submit"
                className={styles.submitButton}
                disabled={isLoading}
              >
                {isLoading ? 'Verifying...' : 'Verify OTP'}
              </button>

              <div className={styles.backLink}>
                <Link href="/login">
                  Back to Login
                </Link>
              </div>
            </form>
          )}

          {step === 3 && (
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div className={styles.formGroup}>
                <label htmlFor="newPassword" className={styles.label}>New Password</label>
                <input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className={styles.input}
                  placeholder="New password"
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="confirmPassword" className={styles.label}>Confirm Password</label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={styles.input}
                  placeholder="Confirm password"
                  required
                />
              </div>

              <button
                type="submit"
                className={styles.submitButton}
                disabled={isLoading}
              >
                {isLoading ? 'Resetting...' : 'Reset Password'}
              </button>

              <div className={styles.backLink}>
                <Link href="/login">
                  Back to Login
                </Link>
              </div>
            </form>
          )}
      </div>
      </div>

      <div className={styles.previewContainer}>
        <div className={styles.previewWrapper}>
          <div className={styles.previewContent}>
            <Image
              src="/shop_login_img.jpeg"
              alt="Shop Login"
              width={800}
              height={600}
              priority
              className={styles.previewImage}
            />
          </div>
        </div>
      </div>
    </div>
  );
}