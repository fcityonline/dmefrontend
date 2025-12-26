// frontend/src/pages/UserBlogsPage.jsx
import React, { useEffect, useState, useContext, useCallback } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import API from "../utils/api";
import { getPDFURL } from "../utils/imageHelper";
import { AuthContext } from "../context/AuthContext";
import BottomNavBar from "../components/BottomNavBar";
import ProfileDrawer from "../components/ProfileDrawer";
import DarkModeToggle from "../components/DarkModeToggle";
import "../styles/global.css";
import { getImageURL } from "../utils/imageHelper";

dayjs.extend(relativeTime);

export default function UserBlogsPage() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const highlightBlogId = searchParams.get('highlight');

  const { user } = useContext(AuthContext);
  const [blogs, setBlogs] = useState([]);
  const [blogUser, setBlogUser] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const loadUserBlogs = useCallback(async () => {
    if (!userId) {
      setError("Invalid user ID");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data } = await API.get(`/blogs/user/${userId}?page=${page}&limit=10`);

      if (!data.blogs || !Array.isArray(data.blogs)) {
        setBlogs([]);
        setBlogUser(data.user || null);
        return;
      }

      // STEP 1 — Update views automatically once per visit
      data.blogs.forEach(async (b) => {
        const key = `viewed_${userId}`;

        if (!localStorage.getItem(key)) {
          try {
            // await API.post(`/blogs/${b._id}/view`);
            await API.post(`/blogs/${userId}/view`);
            localStorage.setItem(key, "1");
          } catch (err) {
            console.log("Auto view update failed:", b._id, err);
          }
        }
      });

      // STEP 2 — Map blog data
      const mapped = data.blogs.map((b) => ({
        ...b,
        likesCount: b.likes?.length || 0,
        liked: Array.isArray(b.likes) && user
          ? b.likes.some((like) => like.toString() === user._id)
          : false,
      }));

      setBlogs(mapped);
      setBlogUser(data.user);
      setPagination(data.pagination);

    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to load user blogs");
      setBlogs([]);

      if (err.response?.status === 404) {
        setTimeout(() => navigate("/home"), 2000);
      }
    } finally {
      setLoading(false);
    }
  }, [userId, page, user, navigate]);

  useEffect(() => {
    loadUserBlogs();
  }, [loadUserBlogs]);

  // Scroll to highlighted blog when navigating from notification
  useEffect(() => {
    if (highlightBlogId && blogs.length > 0) {
      setTimeout(() => {
        const element = document.getElementById(`blog-${highlightBlogId}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          element.style.background = '#fff9e6';
          element.style.border = '2px solid #ffd700';
          setTimeout(() => {
            element.style.background = '';
            element.style.border = '';
          }, 3000);
        }
        // Remove highlight from URL
        navigate(`/user/${userId}/blogs`, { replace: true });
      }, 500);
    }
  }, [highlightBlogId, blogs, userId, navigate]);

  const toggleLike = async (id) => {
    try {
      if (!user) {
        window.location.href = "/login";
        return;
      }

      const { data } = await API.post(`/blogs/${id}/like`);

      setBlogs((prev) =>
        prev.map((b) =>
          b._id === id
            ? {
                ...b,
                liked: data.liked,
                likesCount: Array.isArray(data.likes)
                  ? data.likes.length
                  : data.likes,
              }
            : b
        )
      );
    } catch (err) {
      console.error("Like toggle error:", err);
    }
  };

  const filteredBlogs = blogs.filter(
    (b) =>
      b.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <header className="header">
        <div className="logo">
          <img src="/imgs/logo-DME2.png" alt="Logo" />
        </div>
        <DarkModeToggle />
        <h2>USER NOTES</h2>
      </header>

      <div className="home-container">
        {blogUser && (
          <div
            className="glass-premium-card"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "15px",
              marginBottom: "20px",
              padding: "15px",
              background: "rgba(255, 255, 255, 0.2)",
              backdropFilter: "blur(10px)",
              WebkitBackdropFilter: "blur(10px)",
              borderRadius: "16px",
              border: "1px solid rgba(255, 255, 255, 0.3)",
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.15)",
            }}
          >
            <div style={{ position: "relative", width: 60, height: 60 }}>
              <img
                src={getImageURL(blogUser.profileImage)}
                alt={blogUser.username || blogUser.fullName}
                style={{
                  width: "60px",
                  height: "60px",
                  borderRadius: "50%",
                  objectFit: "cover",
                  display: blogUser.profileImage ? "block" : "none",
                }}
                onError={(e) => (e.target.style.display = "none")}
              />

              {!blogUser.profileImage && (
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "60px",
                    height: "60px",
                    borderRadius: "50%",
                    backgroundColor: "var(--color-primary)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "24px",
                    fontWeight: "bold",
                    color: "#fff",
                  }}
                >
                  {(blogUser.fullName || blogUser.username || "U")
                    .charAt(0)
                    .toUpperCase()}
                </div>
              )}
            </div>

            <div>
              <h3 style={{ margin: 0, fontSize: "18px", color: "white" }}>
                {blogUser.fullName || blogUser.username || "Unknown User"}
              </h3>
              <p style={{ margin: 0, color: "#666", fontSize: "14px" }}>
                @{blogUser.username || "user"}
              </p>
            </div>
          </div>
        )}

        <h2
          style={{
            fontSize: "15px",
            fontWeight: "bold",
            color: "var(--color-primary)",
            margin: "5px 0 15px 0",
            letterSpacing: "0.5px",
          }}
        >
          📝 {blogUser?.fullName || blogUser?.username || "User"}'s Notes
        </h2>

        <input
          id="searchBar2"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            display: "block",
            width: "100%",
            maxWidth: "400px",
            margin: "0 auto 25px auto",
            padding: "10px 15px",
            fontSize: "16px",
            border: "1px solid gainsboro",
            borderRadius: "30px",
            outline: "none",
          }}
        />

        <div id="postListHome">
          {loading && <p style={{ textAlign: "center" }}>⌛️Loading notes...</p>}
          {error && (
            <p style={{ textAlign: "center", color: "red" }}>
              Error: {error}
              {error.includes("not found") && (
                <>
                  <br />⌛️Redirecting to home...
                </>
              )}
            </p>
          )}

          {!loading &&
            !error &&
            filteredBlogs.length > 0 &&
            filteredBlogs.map((post) => (
              <div key={post._id} id={`blog-${post._id}`}>
                <PostCard post={post} onLike={() => toggleLike(post._id)} />
              </div>
            ))}
        </div>

        {pagination && pagination.totalPages > 1 && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "10px",
              marginTop: "20px",
            }}
          >
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={!pagination.hasPrev}
                style={{
                padding: "8px 16px",
                backgroundColor: pagination.hasPrev ? "var(--color-primary)" : "#ccc",
                color: "white",
                border: "none",
                borderRadius: "5px",
                cursor: pagination.hasPrev ? "pointer" : "not-allowed",
              }}
            >
              Previous
            </button>

            <span style={{ display: "flex", alignItems: "center" }}>
              Page {pagination.currentPage} of {pagination.totalPages}
            </span>

            <button
              onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
              disabled={!pagination.hasNext}
                style={{
                padding: "8px 16px",
                backgroundColor: pagination.hasNext ? "var(--color-primary)" : "#ccc",
                color: "white",
                border: "none",
                borderRadius: "5px",
                cursor: pagination.hasNext ? "pointer" : "not-allowed",
              }}
            >
              Next
            </button>
          </div>
        )}
      </div>
{/* 
      <ProfileDrawer
        key={user?._id || "no-user"}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      /> */}
      <ProfileDrawer
  key={user?._id + "_" + (user?.profileImage || "no-image")}
  open={drawerOpen}
  onClose={() => setDrawerOpen(false)}
/>


      <BottomNavBar onProfileClick={() => setDrawerOpen(true)} />
    </>
  );
}

// ----------------------------------
// POSTCARD COMPONENT (final version)
// ----------------------------------
function PostCard({ post, onLike }) {
  const [expanded, setExpanded] = useState(false);
  // const [localViews, setLocalViews] = useState(post.views || 0);
  

  const isLong = post.content.length > 300;
  const shortContent = isLong ? post.content.slice(0, 300) + "..." : post.content;

  const timestamp = `${dayjs(post.createdAt).format("MMM D, YYYY")} • ${dayjs(
    post.createdAt
  ).fromNow()}`;

  return (
    <div className="post-card" style={{ marginBottom: 16 }}>
      <div className="post-header">
        <div className="username">
          <div>
            {post.author?.fullName ||
              post.author?.username ||
              post.user?.fullName ||
              post.user?.username ||
              "Unknown"}
          </div>
          <div className="timestamp">{timestamp}</div>
        </div>
      </div>

      <div
        className="post-title"
        style={{
          fontWeight: "bold",
          marginBottom: "10px",
          fontSize: "18px",
        }}
      >
        {post.title}

        {post.pdfUrl && (
          <div className="pdf-link">
            <a
              href={getPDFURL(post.pdfUrl)}
              target="_blank"
              rel="noreferrer"
            >
              Click Here To Download PDF File
            </a>
          </div>
        )}
      </div>

      <div className={`post-content ${expanded ? "expanded" : isLong ? "collapsed" : ""}`}>
        <p className="note-preview" aria-label="note-preview">
          {expanded ? post.content : shortContent}
        </p>
        {!expanded && isLong && <div className="fade"></div>}
      </div>

      {isLong && (
        <div
          className="read-more"
          onClick={() => setExpanded((s) => !s)}
          style={{ cursor: "pointer" }}
        >
          {expanded ? "Show less" : "Read more"}
        </div>
      )}

      <div style={{ marginTop: "8px" }}>
        <span
          className="star-icon"
          onClick={onLike}
          style={{
            color: post.liked ? "gold" : "gray",
            cursor: "pointer",
          }}
        >
          ⭐
        </span>

        <span className="star-count" style={{ marginLeft: "4px" }}>
          {post.likesCount}
        </span>

        <span style={{ marginLeft: "15px", color: "#666" }}>
          👁{post.views}
        </span>
      </div>
    </div>
  );
}


