'use client'

import React, { useState } from 'react'
import styles from '../page.module.css'  

function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:8080/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setMessage('Login successful!');
        // Here you might want to:
        // 1. Store the user data in state management (like Redux or Context)
        // 2. Store a token in localStorage
        // 3. Redirect to a dashboard page
      } else {
        setMessage(data.error || 'Login failed');
      }
    } catch (error) {
      setMessage('Error connecting to server');
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className={styles.container}>
      <form onSubmit={handleSubmit} className={styles.form}>
        <h1>Login</h1>
        
        <div className={styles.formGroup}>
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>

        <button type="submit">Login</button>
        
        {message && <p className={message.includes('successful') ? styles.success : styles.error}>
          {message}
        </p>}

        <p className={styles.linkText}>
          <a href="/forgot-password">Forgot Password?</a>
        </p>
      </form>
    </div>
  )
}

export default LoginPage 