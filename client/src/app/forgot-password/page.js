'use client'

import React, { useState } from 'react'
import styles from '../page.module.css'

function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:8080/api/request-reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      
      const data = await response.json();
      setMessage(data.message);
      if (response.ok) {
        setEmail('');
      }
    } catch (error) {
      setMessage('Error connecting to server');
    }
  };

  return (
    <div className={styles.container}>
      <form onSubmit={handleSubmit} className={styles.form}>
        <h1>Reset Password</h1>
        
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

        <button type="submit">Send Reset Link</button>
        
        {message && <p className={styles.message}>{message}</p>}
        
        <p className={styles.linkText}>
          <a href="/login">Back to Login</a>
        </p>
      </form>
    </div>
  )
}

export default ForgotPasswordPage 