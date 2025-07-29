import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Register from './components/Register';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import GoogleAuthSuccess from './components/GoogleAuthSuccess';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/google-auth-success/:token" element={<GoogleAuthSuccess />} />
    </Routes>
  );
}

export default App;
