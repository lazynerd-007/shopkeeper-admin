'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from './login.module.css';
import env from '../../utils/env';

function SuccessModal({ show }: { show: boolean }) {
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
        <h2 style={{ color: '#2563eb', marginBottom: 12 }}>Login Successful!</h2>
        <p style={{ color: '#374151' }}>Redirecting to dashboard...</p>
      </div>
    </div>
  );
}

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`${env.API_BASE_URL}/auth/login-user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'D-UUID': '645545453533'
        },
        body: JSON.stringify({
          emailOrPhone: email,
          password: password,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.status) {
        throw new Error(data.message || 'Login failed.');
      }

      // Store complete user data in localStorage for profile settings
      localStorage.setItem('token', data.data.token);
      if (data.data.user) {
        localStorage.setItem('userData', JSON.stringify({
          firstName: data.data.user.firstName,
          lastName: data.data.user.lastName,
          email: data.data.user.email,
          phoneNumber: data.data.user.phoneNumber,
          countryCode: data.data.user.countryCode || '+234'
        }));
        
        if (data.data.user.ownerStore && data.data.user.ownerStore.length > 0) {
          localStorage.setItem('storeId', data.data.user.ownerStore[0].id);
        }
      }

      setShowSuccess(true);
      setTimeout(() => {
        router.push('/dashboard');
      }, 1500);
    } catch (err: Error | unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Invalid credentials. Please try again.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.loginContainer}>
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
                className="mb-2" />
          </div>
            <h1 className={styles.title}>myShopKeeper</h1>
            <p className={styles.subtitle}>Sign-in to your Admin viewing system.</p>
          </div>

          {error && (
            <div className={styles.errorMessage}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
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

            <div className={styles.formGroup}>
              <label htmlFor="password" className={styles.label}>Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={styles.input}
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              className={styles.submitButton}
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Log In'}
            </button>
          </form>
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

      <SuccessModal show={showSuccess} />
    </div>
  );
}