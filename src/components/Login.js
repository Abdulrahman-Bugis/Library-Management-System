import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import '../style.css';
const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // If admin email
      if (user.email === 'test@test.com') {
        navigate('/admin');
        return;
      }

      // Fetch role from Firestore
      const userDoc = await getDoc(doc(db, 'customers', user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        if (userData.role === 'customer') {
          navigate('/customer');
        } else {
          alert('No valid role assigned. Contact admin.');
        }
      } else {
        alert('User data not found in Firestore.');
      }
    } catch (error) {
      console.error("Login Error:", error.message);
      alert("Login failed. Check your email or password.");
    }
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '100px' }}>
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ display: 'block', margin: '10px auto', padding: '10px' }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ display: 'block', margin: '10px auto', padding: '10px' }}
        />
        <button type="submit" style={{ padding: '10px 20px' }}>Login</button>
      </form>
      <p>
        <Link to="/signup">Don't have an account? Sign Up</Link>
      </p>
    </div>
  );
};

export default Login;
