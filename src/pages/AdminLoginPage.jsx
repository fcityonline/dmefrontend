// // frontend/src/pages/AdminLoginPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAdminAuth } from "../context/AdminAuthContext";

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const { adminLogin } = useAdminAuth();

  const [darkMode, setDarkMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    phone: "",
    password: "",
  });

  useEffect(() => {
    document.body.classList.toggle("dark", darkMode);
  }, [darkMode]);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const result = await adminLogin(formData);

    setIsLoading(false);
    if (result.success) {
      navigate("/admin-dashboard");
    } else {
      alert(result.error || "Invalid credentials.");
    }
  };

  return (
    <div className={`admin-login-page ${darkMode ? "dark" : ""}`}>
      {/* Top buttons */}
      <button className="back-btn" onClick={() => navigate("/")}>← Back</button>
      <button className="dark-toggle" onClick={() => setDarkMode(!darkMode)}>
        {darkMode ? "☀️" : "🌙"}
      </button>

      {/* Login box */}
      <div className="login-box">
        <div className="logo0">
          <img src="/imgs/logo-DME2.png" alt="Logo0" />
        </div>

        <h1>Daily Mind Education</h1>
        <h2>Admin Login</h2>
        <p>Use your admin credentials</p>

        <form onSubmit={handleSubmit}>
          <input
            type="tel"
            name="phone"
            placeholder="Phone Number"
            required
            value={formData.phone}
            onChange={handleChange}
            autoComplete="tel"
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            required
            value={formData.password}
            onChange={handleChange}
            autoComplete="current-password"
          />

          <button type="submit" className="auth-btn">
            {isLoading ? "⌛️Logging in..." : "Login"}
          </button>
        </form>

        <div style={{ marginTop: '15px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button
            className="register-btn"
            onClick={() => navigate("/admin-register")}
          >
            Register as Admin
          </button>
          <button
            className="register-btn"
            onClick={() => navigate("/admin-forgot-password")}
            style={{ fontSize: '12px', padding: '6px 12px' }}
          >
            Forgot Password?
          </button>
        </div>
      </div>

      {/* Spinner */}
      {isLoading && (
        <div className="spinner-overlay">
          <div className="spinner"></div>
        </div>
      )}

      {/* Footer */}
      <footer>
        <button onClick={() => navigate("/policy")}>Policy</button>
        <button onClick={() => navigate("/help")}>Help</button>
      </footer>

      {/* === SAME DESIGN & STYLE AS YOUR GIVEN HTML === */}
      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }

        body, .admin-login-page {
          background: linear-gradient(to bottom, #3b060e, #200307, #000000);
          color: white;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 20px;
          transition: background 0.4s ease, color 0.4s ease;
        }

        .dark {
          background: #121212;
          color: #eee;
        }

        .back-btn, .dark-toggle {
          position: absolute;
          top: 20px;
          background: rgba(255, 255, 255, 0.1);
          color: white;
          padding: 8px 15px;
          border: none;
          border-radius: 20px;
          font-size: 14px;
          cursor: pointer;
          z-index: 1000;
        }

        .back-btn { left: 20px; }
        .dark-toggle { right: 20px; }

        .login-box {
          max-width: 500px;
          width: 100%;
          background-color: rgba(255, 255, 255, 0.05);
          padding: 30px;
          border-radius: 20px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.3);
          margin-top: 50px; /* 👈 same spacing as your HTML */
          text-align: center;
        }

        .dark .login-box {
          background-color: #1e1e1e;
        }

        .logo0 {
          margin-bottom: 1px;
          animation: pulse 3s infinite ease-in-out;
        }

        .logo0 img {
          width: 125px;
          height: auto;
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.05); opacity: 0.9; }
        }

        h1 {
          font-size: 36px;
          margin-bottom: 5px;
        }

        h2 {
          font-size: 22px;
          margin-bottom: 10px;
        }

        p {
          color: #ccc;
          margin-bottom: 20px;
        }

        input {
          width: 100%;
          padding: 12px;
          margin-bottom: 15px;
          border: none;
          border-radius: 10px;
          font-size: 16px;
          background: #f4f4f4;
          color: #000;
        }

        .dark input {
          background: #2b2b2b;
          color: #eee;
          border: 1px solid #555;
        }

        button.auth-btn {
          width: 100%;
          background: green;
          color: white;
          padding: 12px;
          font-size: 18px;
          border: none;
          border-radius: 30px;
          cursor: pointer;
          margin-top: 10px;
          transition: background 0.3s ease;
        }

        button.auth-btn:hover {
          background: #008000;
        }

        .register-btn {
          background: transparent;
          border: 1px solid #888;
          color: white;
          padding: 8px 16px;
          margin-top: 15px;
          border-radius: 20px;
          font-size: 14px;
          cursor: pointer;
          transition: 0.3s;
        }

        .register-btn:hover {
          background-color: #444;
        }

        footer {
          margin-top: 40px;
          text-align: center;
        }

        footer button {
          background: transparent;
          border: 1px solid #888;
          color: white;
          padding: 8px 16px;
          margin: 5px 10px;
          border-radius: 20px;
          font-size: 14px;
          cursor: pointer;
          transition: 0.3s;
        }

        footer button:hover {
          background-color: #444;
        }

        .spinner-overlay {
          position: fixed;
          top: 0;
          left: 0;
          height: 100%;
          width: 100%;
          background: rgba(0, 0, 0, 0.85);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 9999;
        }

        .spinner {
          border: 8px solid #f3f3f3;
          border-top: 8px solid #00ff00;
          border-radius: 50%;
          width: 60px;
          height: 60px;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @media (max-width: 500px) {
          .login-box {
            padding: 20px;
          }

          h1 { font-size: 28px; }
          h2 { font-size: 18px; }

          .dark-toggle, .back-btn {
            font-size: 12px;
            padding: 6px 12px;
          }
        }
      `}</style>
    </div>
  );
}











