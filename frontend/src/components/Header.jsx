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

  // Link icon SVG
  const LinkIcon = () => (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ marginRight: "8px", verticalAlign: "middle" }}
    >
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
    </svg>
  );

  // User icon SVG
  const UserIcon = () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="currentColor"
      style={{ marginRight: "8px", verticalAlign: "middle" }}
    >
      <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4zm-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664h10z"/>
    </svg>
  );

  // Logout icon SVG
  const LogoutIcon = () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="currentColor"
      style={{ marginRight: "8px", verticalAlign: "middle" }}
    >
      <path fillRule="evenodd" d="M10 12.5a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v2a.5.5 0 0 0 1 0v-2A1.5 1.5 0 0 0 9.5 2h-8A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h8a1.5 1.5 0 0 0 1.5-1.5v-2a.5.5 0 0 0-1 0v2z"/>
      <path fillRule="evenodd" d="M15.854 8.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708.708L14.293 7.5H5.5a.5.5 0 0 0 0 1h8.793l-2.147 2.146a.5.5 0 0 0 .708.708l3-3z"/>
    </svg>
  );

  return (
    <header style={styles.header}>
      <div style={styles.container}>
        <div style={styles.logo}>
          <LinkIcon />
          <h1 style={styles.title}>Sandy URL Shortener</h1>
        </div>

        <div style={styles.right} ref={dropdownRef}>
          {user ? (
            <div style={styles.userSection}>
              <div style={styles.userInfo}>
                <img
                  src={user?.avatar?.url || "https://via.placeholder.com/40"}
                  alt="Avatar"
                  style={styles.profilePic}
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  title={`Logged in as ${user.name}`}
                />
                <span style={styles.userName}>{user.name}</span>
              </div>

              {dropdownOpen && (
                <div style={styles.dropdown}>
                  <div style={styles.dropdownHeader}>
                    <UserIcon />
                    <div>
                      <div style={styles.dropdownName}>{user.name}</div>
                      <div style={styles.dropdownEmail}>{user.email}</div>
                    </div>
                  </div>
                  <div style={styles.divider}></div>
                  <button style={styles.logoutBtn} onClick={logout}>
                    <LogoutIcon />
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div style={styles.loginWrapper}>
              <GoogleLogin
                onSuccess={handleGoogleSignIn}
                onError={() => console.error("Google Sign-In Error")}
                theme="outline"
                size="medium"
                text="signin_with"
                shape="rectangular"
              />
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

const styles = {
  header: {
    borderBottom: "1px solid #e0e0e0",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
    backgroundColor: "#ffffff",
    position: "sticky",
    top: 0,
    zIndex: 1000,
  },
  container: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "1rem 1.5rem",
    maxWidth: "1400px",
    margin: "0 auto",
  },
  logo: {
    display: "flex",
    alignItems: "center",
    color: "#007bff",
  },
  title: {
    margin: 0,
    fontSize: "clamp(1.2rem, 4vw, 1.5rem)",
    color: "#333",
    fontWeight: "700",
    letterSpacing: "-0.5px",
  },
  right: {
    display: "flex",
    alignItems: "center",
    position: "relative",
  },
  loginWrapper: {
    display: "flex",
    alignItems: "center",
  },
  userSection: {
    position: "relative",
  },
  userInfo: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    cursor: "pointer",
    padding: "0.5rem",
    borderRadius: "8px",
    transition: "background-color 0.2s",
  },
  userName: {
    fontSize: "0.95rem",
    fontWeight: "500",
    color: "#333",
    display: "none",
  },
  profilePic: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    cursor: "pointer",
    border: "2px solid #007bff",
    objectFit: "cover",
    transition: "transform 0.2s, box-shadow 0.2s",
  },
  dropdown: {
    position: "absolute",
    top: "60px",
    right: 0,
    backgroundColor: "#fff",
    border: "1px solid #e0e0e0",
    borderRadius: "8px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
    minWidth: "240px",
    zIndex: 1001,
    overflow: "hidden",
    animation: "slideDown 0.2s ease-out",
  },
  dropdownHeader: {
    display: "flex",
    alignItems: "center",
    padding: "1rem",
    gap: "0.75rem",
  },
  dropdownName: {
    fontWeight: "600",
    fontSize: "0.95rem",
    color: "#333",
    marginBottom: "0.25rem",
  },
  dropdownEmail: {
    fontSize: "0.85rem",
    color: "#666",
  },
  divider: {
    height: "1px",
    backgroundColor: "#e0e0e0",
    margin: "0",
  },
  logoutBtn: {
    width: "100%",
    background: "transparent",
    color: "#dc3545",
    border: "none",
    padding: "0.75rem 1rem",
    cursor: "pointer",
    fontSize: "0.95rem",
    fontWeight: "500",
    textAlign: "left",
    display: "flex",
    alignItems: "center",
    transition: "background-color 0.2s",
  },
};

// Add media queries and animations
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @media (min-width: 640px) {
    .user-name-visible {
      display: inline !important;
    }
  }

  @media (max-width: 639px) {
    .user-name-visible {
      display: none !important;
    }
  }

  @media (hover: hover) {
    button:hover {
      opacity: 0.9;
    }
    
    .logout-btn:hover {
      background-color: #f8f9fa !important;
    }
    
    .profile-pic:hover {
      transform: scale(1.05);
      box-shadow: 0 2px 8px rgba(0,123,255,0.3);
    }

    .user-info:hover {
      background-color: #f8f9fa;
    }
  }
`;

if (!document.head.querySelector('style[data-header-styles]')) {
  styleSheet.setAttribute('data-header-styles', 'true');
  document.head.appendChild(styleSheet);
}

export default Header;