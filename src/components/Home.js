import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div>
      <h1>Library Management System</h1>
      <p>Welcome! Please login or register to continue.</p>
      <Link to="/login"><button>Login</button></Link>
      <Link to="/Signup"><button>Register</button></Link>
    </div>
  );
};

export default Home;
