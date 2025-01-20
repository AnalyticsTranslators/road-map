import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, HashRouter } from 'react-router-dom';
import { supabase } from './supabase/config';
import Roadmap from './components/Roadmap';
import Login from './components/Login';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for changes on auth state (sign in, sign out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <HashRouter>
      <Routes>
        <Route 
          path="/" 
          element={user ? <Roadmap /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/login" 
          element={!user ? <Login /> : <Navigate to="/" />} 
        />
      </Routes>
    </HashRouter>
  );
}

export default App;
