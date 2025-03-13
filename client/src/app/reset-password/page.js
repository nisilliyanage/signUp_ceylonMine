'use client'
import { useState } from 'react';
import styles from '../page.module.css';

export default function ResetPassword() {
  const [step, setStep] = useState('request'); // 'request' or 'reset'
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  const handleRequestReset = async (e) => {
    e.preventDefault();
    setMessage('');
    setIsError(false);

    try {
      const response = await fetch('http://localhost:8080/api/request-reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      console.log('Request Reset Response:', data);  // Debug log

      if (response.ok) {
        setToken(data.token); // Store the token
        setStep('reset'); // Move to reset step
        setMessage('Please enter your new password');
        setIsError(false);
      } else {
        setMessage(data.error || 'Failed to process request');
        setIsError(true);
      }
    } catch (error) {
      console.error('Error:', error);  // Debug log
      setMessage('Error connecting to server');
      setIsError(true);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setMessage('');
    setIsError(false);

    if (password !== confirmPassword) {
      setMessage('Passwords do not match');
      setIsError(true);
      return;
    }

    try {
      const response = await fetch('http://localhost:8080/api/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          password,
        }),
      });

      const data = await response.json();
      console.log('Reset Password Response:', data);  // Debug log

      if (response.ok) {
        setMessage('Password updated successfully! You can now login with your new password.');
        setIsError(false);
      } else {
        setMessage(data.error || 'Failed to reset password');
        setIsError(true);
      }
    } catch (error) {
      console.error('Error:', error);  // Debug log
      setMessage('Error connecting to server');
      setIsError(true);
    }
  };

  return (
    <div className={styles.container}>
      <form onSubmit={step === 'request' ? handleRequestReset : handleResetPassword} className={styles.form}>
        <h1>Reset Password</h1>

        {message && (
          <div className={isError ? styles.error : styles.success}>
            {message}
          </div>
        )}

        {step === 'request' ? (
          <div className={styles.formGroup}>
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        ) : (
          <>
            <div className={styles.formGroup}>
              <label htmlFor="password">New Password:</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="confirmPassword">Confirm Password:</label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={8}
              />
            </div>
          </>
        )}

        <button type="submit">
          {step === 'request' ? 'Request Reset' : 'Reset Password'}
        </button>

        <p className={styles.linkText}>
          <a href="/login">Back to Login</a>
        </p>
      </form>
    </div>
  );
} 