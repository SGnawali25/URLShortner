import React, { useEffect, useRef } from "react";
import { GoogleLogin } from "@react-oauth/google";
import axios from "axios";

const BackendPrefix = import.meta.env.VITE_APP_API_KEY;

const Header = ({ user, setUser }) => {
  const [dropdownOpen, setDropdownOpen] = React.useState(false);
  const dropdownRef = useRef(null);

  // Check current user on mount
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data } = await axios.get(`${BackendPrefix}/user/me?_=${Date.now()}`, {
          withCredentials: true,
        });
        setUser(data.user || null);
      } catch (error) {
        console.error("Failed to fetch user:", error);
        setUser(null);
      }
    };
    fetchUser();
  }, [setUser]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Google Sign-In
  const handleGoogleSignIn = async (credentialResponse) => {
    try {
      const { credential } = credentialResponse;
      const config = {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      };
      await axios.post(`${BackendPrefix}/signin`, { credential }, config);

      // Fetch user after login
      const { data } = await axios.get(`${BackendPrefix}/user/me?_=${Date.now()}`, {
        withCredentials: true,
      });
      setUser(data.user);
    } catch (err) {
      console.error("Google Sign-In failed:", err);
      alert("Google Sign-In failed.");
    }
  };

  // Logout
  const logout = async () => {
    try {
      await axios.get(`${BackendPrefix}/logout`, { withCredentials: true });
      setUser(null);
      setDropdownOpen(false);
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <header style={styles.header}>
      <h2 style={styles.title}>Sandy URL Shortener</h2>

      <div style={styles.right} ref={dropdownRef}>
        {user ? (
          <div style={{ position: "relative" }}>
            <img
              src={user?.avatar?.url || "avatar"}
              alt="Avatar"
              style={styles.profilePic}
              onClick={() => setDropdownOpen(!dropdownOpen)}
              title={`Logged in as ${user.name}`}
            />

            {dropdownOpen && (
              <div style={styles.dropdown}>
                <button style={styles.logoutBtn} onClick={logout}>
                  Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <GoogleLogin
            onSuccess={handleGoogleSignIn}
            onError={() => console.error("Google Sign-In Error")}
          />
        )}
      </div>
    </header>
  );
};

const styles = {
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0.75rem 1.5rem",
    borderBottom: "1px solid #ddd",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
    backgroundColor: "#fff",
    position: "sticky",
    top: 0,
    zIndex: 10,
  },
  title: {
    margin: 0,
    fontSize: "1.5rem",
    color: "#333",
    fontWeight: "600",
    textAlign: "center",
    flexGrow: 1,
  },
  right: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    width: "150px",
  },
  profilePic: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    cursor: "pointer",
    border: "2px solid #4285F4",
  },
  dropdown: {
    position: "absolute",
    top: "50px",
    right: 0,
    backgroundColor: "#fff",
    border: "1px solid #ddd",
    borderRadius: "5px",
    boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
    padding: "0.5rem",
    zIndex: 100,
  },
  logoutBtn: {
    background: "#4285F4",
    color: "#fff",
    border: "none",
    padding: "0.5rem 1rem",
    borderRadius: "5px",
    cursor: "pointer",
  },
};

export default Header;
