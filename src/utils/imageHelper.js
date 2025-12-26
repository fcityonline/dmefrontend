// frontend/src/utils/imageHelper.js
// For local storage, images are served from /images/ route (not /uploads/images/)

// Dynamic API base URL detection for production
const getAPIBase = () => {
  // Use environment variable if set
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL.replace("/api", "");
  }
  
  // For production (cloudflared tunnel), use current hostname
  const hostname = window.location.hostname;
  const protocol = window.location.protocol;
  const port = window.location.port;
  
  // If port exists and not standard ports, include it
  if (port && port !== '80' && port !== '443' && port !== '3000') {
    return `${protocol}//${hostname}:${port}`;
  }
  
  // For cloudflared tunnel (no port in URL), use same hostname
  // Backend should be accessible on same domain or configured port
  if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
    // Production: assume backend on same domain or port 5000
    return `${protocol}//${hostname}${port ? ':' + port : ''}`;
  }
  
  // Development fallback
  return "http://localhost:5000";
};

export const getImageURL = (path) => {
  if (!path) return "/default-user.png";

  // Already full URL (S3 or external)
  if (path.startsWith("http://") || path.startsWith("https://")) return path;

  // Remove leading slashes
  let clean = path.replace(/^\/+/, "");

  // Remove old prefixes if present
  clean = clean.replace(/^api\/uploads\/images\//, "");
  clean = clean.replace(/^uploads\/images\//, "");

  // For local storage, server serves from /images/ route
  const API_BASE = getAPIBase();
  return `${API_BASE}/images/${clean}`;
};

// Helper for PDF URLs
export const getPDFURL = (path) => {
  if (!path) return null;

  // Already full URL
  if (path.startsWith("http://") || path.startsWith("https://")) return path;

  // Remove leading slashes
  let clean = path.replace(/^\/+/, "");
  clean = clean.replace(/^api\/uploads\/pdfs\//, "");
  clean = clean.replace(/^uploads\/pdfs\//, "");

  // For local storage, server serves from /pdfs/ route
  const API_BASE = getAPIBase();
  return `${API_BASE}/pdfs/${clean}`;
};
