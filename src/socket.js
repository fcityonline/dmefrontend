// frontend/src/socket.js
import { io } from "socket.io-client";

// Get auth token from localStorage
const token = localStorage.getItem("token");

// Determine the base URL for Socket.IO (should connect to backend, not frontend)
const getSocketURL = () => {
  // Use environment variable if set
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL.replace(/\/api$/, "");
  }
  
  // For production (cloudflared tunnel), use current hostname
  const hostname = window.location.hostname;
  const protocol = window.location.protocol;
  const port = window.location.port;
  
  // Development
  if (hostname === "localhost" || hostname === "127.0.0.1") {
    return "http://localhost:5000";
  }
  
  // Production: use same hostname (cloudflared tunnel)
  // Backend should be accessible on same domain
  return `${protocol}//${hostname}${port && port !== '80' && port !== '443' && port !== '3000' ? ':' + port : ''}`;
};

const SOCKET_URL = getSocketURL();

console.log("🔌 Socket.IO URL:", SOCKET_URL);

// Initialize socket
export const socket = io(SOCKET_URL, {
  transports: ["websocket", "polling"], // fallback to polling if websocket fails
  auth: { token },
  autoConnect: false,
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: 5,
});

// Handle connection events for debugging
socket.on("connect", () => {
  console.log("✅ Socket connected:", socket.id);
});

socket.on("connect_error", (err) => {
  console.error("❌ Socket connection error:", err.message);
  console.log("📡 Falling back to polling...");
});

socket.on("disconnect", (reason) => {
  console.warn("⚠️ Socket disconnected:", reason);
});
// });
