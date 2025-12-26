// // frontend/src/pages/PaymentPage.jsx

// frontend/src/pages/PaymentPage.jsx
import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import DarkModeToggle from "../components/DarkModeToggle";
import BottomNavBar from "../components/BottomNavBar";
import ProfileDrawer from "../components/ProfileDrawer";
import API from "../utils/api";
import "../styles/global.css";

export default function PaymentPage() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // 🚦 1️⃣ CHECK IF USER ALREADY PAID FOR TODAY
  useEffect(() => {
    if (!user) return;

    async function checkPayment() {
      try {
        const paymentStatus = await API.get("/payment/quiz-status");

        if (paymentStatus.data.hasPaidToday) {
          const quizData = await API.get("/quiz/today");

          // Only redirect to quiz if quiz is live
          // If quiz is not live, stay on payment page (user already paid, just waiting)
          if (quizData.data.exists && quizData.data.quiz.isLive) {
            navigate("/quiz");
          }
          // Don't redirect back to payment if already on payment page and quiz not live
          // This prevents infinite redirect loop
        }
      } catch (err) {
        console.error("Payment check error:", err);
      }
    }

    checkPayment();
  }, [user, navigate]);


  // 🔗 2️⃣ Load Razorpay script
  useEffect(() => {
    if (!window.Razorpay) {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.id = "rzp-checkout-script";
      document.body.appendChild(script);
    }
  }, []);

  // 💰 3️⃣ Test Mode Payment Handler
  const handlePayment = () => {
    if (!user) return navigate("/login");

    const spinner = document.createElement("div");
    spinner.id = "spinner-overlay";
    spinner.style.cssText = `
      position: fixed; inset: 0; background: rgba(0,0,0,0.5);
      display: flex; justify-content: center; align-items: center;
      z-index: 99999;
    `;
    spinner.innerHTML = `
      <div style="background:white; padding:25px; border-radius:10px; text-align:center;">
        <div style="border:4px solid #ddd; border-top:4px solid #660000;
        border-radius:50%; width:40px; height:40px; margin:auto;
        animation:spin 1s linear infinite;"></div>
        <p style="margin-top:10px;">Processing...</p>
      </div>
      <style>
        @keyframes spin { 0%{transform:rotate(0deg);} 100%{transform:rotate(360deg);} }
      </style>
    `;
    document.body.appendChild(spinner);
    setLoading(true);

    setTimeout(() => {
      if (!window.Razorpay) {
        alert("❌ Razorpay failed to load. Check connection.");
        spinner.remove();
        setLoading(false);
        return;
      }

      const rzp = new window.Razorpay({
        key: "rzp_test_1DP5mmOlF5G5ag",
        amount: 500, // ₹5
        currency: "INR",
        name: "Quiz Entry",
        description: "Daily Quiz Fee",
        handler: async function (response) {
          alert("✅ Payment Success!\nPayment ID: " + response.razorpay_payment_id);
          spinner.remove();
          navigate("/join-quiz");
        },
        prefill: {
          name: user?.fullName || "Student",
          email: user?.email || "test@example.com",
          contact: user?.phone || "9999999999",
        },
        theme: {
          color: "#3399cc",
        },
      });

      rzp.on("payment.failed", function (response) {
        spinner.remove();
        alert("❌ Payment failed: " + response.error.description);
        setLoading(false);
      });

      spinner.remove();
      setLoading(false);
      rzp.open();
    }, 600);
  };


  if (!user) return null;

  return (
    <>
      <header className="header">
        <div className="logo">
          <img src="/imgs/logo-DME2.png" alt="Logo" />
        </div>
        <DarkModeToggle />
        <h2>PAYMENT</h2>
      </header>

      <div className="payment-container" style={{ padding: "20px", maxWidth: "600px", margin: "0 auto" }}>
        <div className="payment-card" style={{
          background: "#fff", borderRadius: "12px", padding: "30px",
          boxShadow: "0 4px 6px rgba(0,0,0,0.1)", marginBottom: "20px"
        }}>
          <h2 style={{ marginBottom: "10px", color: "#660000" }}>🎯 Daily Quiz Entry</h2>
          <p style={{ color: "#666", marginBottom: "20px" }}>
            Participate in today's live quiz at 8:00 PM - 8:30 PM IST
          </p>

          <div style={{
            textAlign: "center", marginBottom: "30px", padding: "20px",
            background: "linear-gradient(135deg, #660000, #990000)",
            borderRadius: "12px", color: "white"
          }}>
            <span style={{ fontSize: "24px" }}>₹</span>
            <span style={{ fontSize: "48px", fontWeight: "bold", margin: "0 5px" }}>5</span>
            <span style={{ fontSize: "16px", opacity: 0.9 }}>per quiz</span>
          </div>

          <button
            onClick={handlePayment}
            disabled={loading}
            style={{
              width: "100%", padding: "15px",
              background: loading ? "#aaa" : "#660000",
              color: "white", border: "none", borderRadius: "8px",
              fontSize: "18px", fontWeight: "bold", cursor: "pointer"
            }}
          >
            {loading ? "⌛️Processing..." : "Pay ₹5 & Join Quiz"}
          </button>

          <p style={{ textAlign: "center", marginTop: "10px", color: "#666", fontSize: "14px" }}>
            Secure payments powered by Razorpay
          </p>
        </div>

        <div style={{
          background: "#f8f9fa", padding: "20px", borderRadius: "12px"
        }}>
          <h3 style={{ marginBottom: "15px", color: "#660000" }}>Payment Information</h3>
          <ul style={{ paddingLeft: "20px", lineHeight: "1.8" }}>
            <li>One-time payment per quiz</li>
            <li>Valid for today's quiz only</li>
            <li>Refund if quiz is cancelled</li>
            <li>Secure & encrypted payment</li>
          </ul>
        </div>
      </div>

      <ProfileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
      <BottomNavBar onProfileClick={() => setDrawerOpen(true)} />
    </>
  );
}
