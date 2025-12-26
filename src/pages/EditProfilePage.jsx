// frontend/src/pages/EditProfilePage.jsx
import React, { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import DarkModeToggle from "../components/DarkModeToggle";
import API from "../utils/api";
import "../styles/global.css";
import { getImageURL } from "../utils/imageHelper";


export default function EditProfilePage() {
  const { user, updateUser } = useContext(AuthContext);
  const navigate = useNavigate();

  // const [form, setForm] = useState({
  //   fullName: user?.fullName || "",
  //   username: user?.username || "",
  //   phone: user?.phone || "",
  // });
  const [form, setForm] = useState({
  fullName: user?.fullName || "",
  username: user?.username || "",
  phone: user?.phone || "",
  email: user?.email || "",
  age: user?.age || "",
  gender: user?.gender || "Other",
  schoolName: user?.schoolName || "",
  // coachingName: user?.coachingName || "",
});
  const [profileImage, setProfileImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(
    user?.profileImage ? getImageURL(user.profileImage) : null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (user?.profileImage) {
      setPreviewImage(getImageURL(user.profileImage));
    }
  }, [user?.profileImage]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return setError("Please select an image file");
    if (file.size > 5 * 1024 * 1024) return setError("Image must be <5MB");

    setError("");
    setProfileImage(file);

    const reader = new FileReader();
    reader.onload = (ev) => setPreviewImage(ev.target.result);
    reader.readAsDataURL(file);
  };

  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   setLoading(true);
  //   setError("");
  //   setSuccess("");
  //   try {
  //     const formData = new FormData();
  //     formData.append("fullName", form.fullName);
  //     formData.append("username", form.username);
  //     if (profileImage) formData.append("profileImage", profileImage);

  //     const { data } = await API.put("/auth/profile", formData, {
  //       headers: { "Content-Type": "multipart/form-data" },
  //     });

  //     // Update user context
  //     updateUser(data.user);

  //     // Update local preview
  //     setPreviewImage(data.user?.profileImage ? getMediaUrl(data.user.profileImage) : null);

  //     setSuccess("Profile updated! Redirecting...");
  //     setTimeout(() => navigate("/profile"), 2000);
  //   } catch (err) {
  //     console.error(err);
  //     setError(err.response?.data?.message || "Failed to update profile");
  //     setTimeout(() => setError(""), 5000);
  //   } finally {
  //     setLoading(false);
  //   }
  // };
const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError("");
  setSuccess("");
  try {
    const formData = new FormData();
    formData.append("fullName", form.fullName);
    formData.append("username", form.username);
    formData.append("email", form.email);
    formData.append("age", form.age);
    formData.append("gender", form.gender);
    formData.append("schoolName", form.schoolName);
    formData.append("coachingName", form.coachingName);
    if (profileImage) formData.append("profileImage", profileImage);

    const { data } = await API.put("/auth/profile", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    // Update user context
    updateUser(data.user);

    // Update local preview
    setPreviewImage(data.user?.profileImage ? getImageURL(data.user.profileImage) : null);

    setSuccess("Profile updated! Redirecting...");
    setTimeout(() => navigate("/profile"), 2000);
  } catch (err) {
    console.error(err);
    setError(err.response?.data?.message || "Failed to update profile");
    setTimeout(() => setError(""), 5000);
  } finally {
    setLoading(false);
  }
};


  return (
    <>
      <header className="header">
        <div className="logo">
          <img src="/imgs/logo-DME2.png" alt="Logo" />
        </div>
        <DarkModeToggle />
        <h2>EDIT PROFILE</h2>
      </header>

      <div className="auth-container">
        <div className="auth-box">
          <h2>Edit Profile</h2>
          <p className="auth-subtitle">Update your personal information</p>

          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label>Profile Picture</label>
              <div className="profile-image-upload">
                <div
                  className="profile-image-preview"
                  style={{ position: "relative", width: 120, height: 120 }}
                >
                  {previewImage ? (
                    <img
                      src={previewImage}
                      alt="Profile Preview"
                      style={{
                        width: "100%",
                        height: "100%",
                        borderRadius: "50%",
                        objectFit: "cover",
                      }}
                      onError={(e) => (e.target.style.display = "none")}
                    />
                    ) : (
                    <div
                      style={{
                        width: "100%",
                        height: "100%",
                        borderRadius: "50%",
                        backgroundColor: "var(--color-primary)",
                        color: "#fff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "36px",
                        fontWeight: "bold",
                      }}
                    >
                      {(user?.fullName || user?.username || "U").charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <input
                  type="file"
                  id="profileImage"
                  accept="image/*"
                  onChange={handleImageChange}
                  style={{ display: "none" }}
                />
                <label htmlFor="profileImage" className="upload-button">
                  Choose Image
                </label>
              </div>
            </div>

            <div className="input-group">
              <label>Full Name</label>
              <input
                type="text"
                name="fullName"
                value={form.fullName}
                onChange={handleChange}
                required
                minLength={2}
                maxLength={50}
              />
            </div>

            <div className="input-group">
              <label>Username</label>
              <input
                type="text"
                name="username"
                value={form.username}
                onChange={handleChange}
                required
                minLength={3}
                maxLength={30}
                pattern="[a-zA-Z0-9_]+"
              />
            </div>

            <div className="input-group">
  <label>Email</label>
  <input
    type="email"
    name="email"
    value={form.email}
    onChange={handleChange}
    placeholder="your@email.com"
  />
</div>

<div className="input-group">
  <label>Age</label>
  <input
    type="number"
    name="age"
    value={form.age}
    onChange={handleChange}
    min={13}
    max={99}
    placeholder="Enter your age"
  />
</div>


<div className="input-group">
  <label>School/Coaching Name</label>
  <input
    type="text"
    name="schoolName"
    value={form.schoolName}
    onChange={handleChange}
    placeholder="Enter your School/Coaching name"
  />
</div>

<div className="input-group">
  <label>Gender</label>
  <select name="gender" value={form.gender} onChange={handleChange}>
    <option value="Male">Male</option>
    <option value="Female">Female</option>
    <option value="Other">Other</option>
  </select>
</div>

{/* <div className="input-group">
  <label>Coaching Name</label>
  <input
    type="text"
    name="coachingName"
    value={form.coachingName}
    onChange={handleChange}
    placeholder="Enter your coaching name"
  />
</div> */}


            <button type="submit" className="auth-button" disabled={loading}>
              {loading ? "⌛️Updating..." : "Update Profile"}
            </button>
          </form>

          <div className="auth-footer">
            <button className="back-button" onClick={() => navigate("/profile")}>
              ← Back to Profile
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
