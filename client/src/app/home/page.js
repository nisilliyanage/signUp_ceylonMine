'use client'
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from '../page.module.css';

export default function HomePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check if user data exists in localStorage
    const userData = localStorage.getItem('user');
    if (!userData) {
      // If no user data, redirect to login
      router.push('/login');
    } else {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    router.push('/login');
  };

  if (!user) return null;

  return (
    <div className={styles.container}>
      <div className={styles.form}>
        <h1>Welcome, {user.firstName}!</h1>
        
        <div className={styles.formGroup}>
          <label>Email</label>
          <div className={styles.infoField}>{user.email}</div>
        </div>

        <div className={styles.formGroup}>
          <label>Username</label>
          <div className={styles.infoField}>{user.username}</div>
        </div>

        <div className={styles.formGroup}>
          <label>Role</label>
          <div className={styles.infoField}>{user.role}</div>
        </div>

        <button onClick={handleLogout}>
          Logout
        </button>
      </div>
    </div>
  );
} 