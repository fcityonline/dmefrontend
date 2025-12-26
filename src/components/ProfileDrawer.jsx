// // // frontend/src/components/ProfileDrawer.jsx
import React, { useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { getImageURL } from "../utils/imageHelper";

export default function ProfileDrawer({ open, onClose }) {
  const { user, logout } = useContext(AuthContext);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
  }, [open]);

  const getInitials = () => {
    if (!user) return "U";
    const name = user.fullName || user.username || "User";
    return name.charAt(0).toUpperCase();
  };

  return (
    <>
      {/* Overlay */}
      <div className={`overlay ${open ? "active" : ""}`} onClick={onClose}></div>

      {/* Drawer */}
      <aside className={`drawer left-drawer ${open ? "open" : ""}`}>
        <div className="drawer-header">
          <h2>Profile</h2>
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="profile-pic" style={{ position: "relative" }}>
          {user?.profileImage ? (
            <>
              <img
                src={getImageURL(user.profileImage)}
                alt="Profile"
                style={{
                  width: "100%",
                  height: "100%",
                  borderRadius: "50%",
                  objectFit: "cover",
                  position: "absolute",
                  top: 0,
                  left: 0,
                }}
                onError={(e) => {
                  e.target.style.display = "none";
                  const fallback = e.target.parentElement?.querySelector(".profile-pic-fallback");
                  if (fallback) fallback.style.display = "flex";
                }}
              />
              <div
                className="profile-pic-fallback"
                style={{
                  width: "100%",
                  height: "100%",
                  borderRadius: "50%",
                  background: "linear-gradient(to bottom, #3b060e, #200307)",
                  display: "none",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "32px",
                  fontWeight: "bold",
                  color: "#fff",
                  position: "absolute",
                  top: 0,
                  left: 0,
                }}
              >
                {getInitials()}
              </div>
            </>
          ) : (
            <div
              style={{
                width: "100%",
                height: "100%",
                borderRadius: "50%",
                background: "linear-gradient(to bottom, #3b060e, #200307)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "32px",
                fontWeight: "bold",
                color: "#fff",
              }}
            >
              {getInitials()}
            </div>
          )}
        </div>

        <div className="profile-info">
          <h3>{user?.fullName || "Guest User"}</h3>
          <p>{user?.username}</p>
        </div>

        <div className="sidebar-item" onClick={() => (window.location.href = "/edit-profile")}>
          👤 Edit Profile
        </div>
        <div className="sidebar-item" onClick={() => (window.location.href = "/quiz-analytics")}>
          📜 My Quizzes Analytics
        </div>
        <div className="sidebar-item" onClick={() => (window.location.href = "/payment-history")}>
          💳 Payment History
        </div>
        <div className="sidebar-item" onClick={() => (window.location.href = "/settings")}>
          ⚙️ Settings
        </div>
        <div
          className="sidebar-item"
          onClick={async () => {
            await logout();
            onClose();
            window.location.href = "/login";
          }}
        >
          🚪 Logout
        </div>
      </aside>
    </>
  );
}

