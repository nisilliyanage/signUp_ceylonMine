'use client'

import React, { useState } from 'react'
import { useParams } from 'next/navigation'
import styles from '../../page.module.css'

function ResetPasswordPage() {
  const params = useParams()
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setMessage('Passwords do not match');
      return;
    }

    try {
      const response = await fetch('http://localhost:8080/api/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: params.token,
          password: password
        }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setMessage('Password updated successfully!');
        setPassword('');
        setConfirmPassword('');
      } else {
        setMessage(data.error || 'Password reset failed');
      }
    } catch (error) {
      setMessage('Error connecting to server');
    }
  };

  return (
    <div className={styles.container}>
      <form onSubmit={handleSubmit} className={styles.form}>
        <h1>Set New Password</h1>
        
        <div className={styles.formGroup}>
          <label htmlFor="password">New Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
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
          />
        </div>

        <button type="submit">Update Password</button>
        
        {message && <p className={message.includes('successfully') ? styles.success : styles.error}>
          {message}
        </p>}
        
        <p className={styles.linkText}>
          <a href="/login">Back to Login</a>
        </p>
      </form>
    </div>
  )
}

export default ResetPasswordPage 