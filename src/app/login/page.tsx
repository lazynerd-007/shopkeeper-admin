'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from './login.module.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // In a real application, this would be an API call to authenticate
      // For demo purposes, we'll just redirect to the dashboard
      setTimeout(() => {
        router.push('/dashboard');
      }, 1000);
    } catch (err) {
      setError('Invalid credentials. Please try again.');
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

            <div className={styles.forgotPasswordLink}>
              <Link href="/forgot-password">
                Forgot password?
              </Link>
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
    </div>
  );
}