// frontend/src/pages/LoginPage.jsx

import React, { useContext, useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import DarkModeToggle from "../components/DarkModeToggle";
import "../styles/global.css";

export default function LoginPage() {
  const [form, setForm] = useState({ identifier: "", password: "" });
  const [loginMethod, setLoginMethod] = useState("phone"); // 'phone' or 'email'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { login, normalizePhone } = useContext(AuthContext);
  const nav = useNavigate();

  // Clear identifier when switching login method
  useEffect(() => {
    setForm(f => ({ ...f, identifier: '' }));
  }, [loginMethod]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (!form.identifier || !form.password) {
        setError("Please fill in all fields");
        return;
      }

      if (loginMethod === 'phone') {
        const normalized = normalizePhone(form.identifier);
        await login(normalized, form.password);
      } else {
        await login(null, form.password, form.identifier); // email login
      }
      nav("/home");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* <header className="header"> */}
        {/* <div className="logo">
        <img src="/imgs/logo-DME.png" alt="Logo" />
        </div>
        <h2>LOGIN</h2>
        {/* </header> */}

        <button className="back-btn" onClick={() => nav("/")}>← Back</button>
        <DarkModeToggle />

      <div className="auth-container">
        <div className="auth-box">
                  <div className="logo-auth">
          <img src="/imgs/logo-DME3.png" alt="Logo" />
          <h2>Daily Mind Education</h2>
        </div>
          <p className="auth-subtitle">Sign in to your account</p>
          
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div className="input-group">
              {/* <label>Login Method</label> */}
              {/* <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <label style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <input type="radio" name="loginMethod" value="phone" checked={loginMethod === 'phone'} onChange={() => setLoginMethod('phone')} /> Phone
                </label>
                <label style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <input type="radio" name="loginMethod" value="email" checked={loginMethod === 'email'} onChange={() => setLoginMethod('email')} /> Email
                </label>
              </div> */}
            </div>

            <div className="input-group">
              <label>{loginMethod === 'phone' ? 'Phone Number' : 'Email Address'}</label>
              <input 
                type={loginMethod === 'phone' ? 'tel' : 'email'}
                placeholder={loginMethod === 'phone' ? 'Enter your phone number' : 'Enter your email address'} 
                value={form.identifier} 
                onChange={(e) => setForm({ ...form, identifier: e.target.value })}
                required
              />
            </div>

            <div className="input-group">
              <label>Password</label>
              <input 
                type="password" 
                placeholder="Enter your password" 
                value={form.password} 
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
            </div>

            <button 
              type="submit" 
              className="auth-button"
              disabled={loading}
            >
              {loading ? "⌛️Signing In..." : "Sign In"}
            </button>
          </form>

          <div className="auth-footer">
            <p>Don't have an account? <Link to="/register">Sign Up</Link></p>
            <p style={{ marginTop: '10px' }}>
              <Link to="/forgot-password">Forgot Password?</Link>
            </p>

        <footer>
  <button onClick={() => window.location.href = '/help.html'}>Policy</button>
  <button onClick={() => window.location.href = '/help.html#help-section'}>Help</button>
          </footer>
          
          </div>
        </div>
      </div>
    </>
  );
}


