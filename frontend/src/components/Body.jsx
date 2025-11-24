import React, { useState, useEffect } from "react";
import axios from "axios";

const BackendPrefix = import.meta.env.VITE_APP_API_KEY;
const frontendPrefix = import.meta.env.VITE_APP_FRONTEND_PREFIX;

const Body = ({ user }) => {
  const [originalUrl, setOriginalUrl] = useState("");
  const [shortenedUrl, setShortenedUrl] = useState(null);
  const [urls, setUrls] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [users, setUsers] = useState([]);

  // Fetch dashboard URLs when user changes
  useEffect(() => {
    const fetchDashboardUrls = async () => {
      if (!user) {
        setUrls([]);
        return;
      }

      try {
        const { data } = await axios.get(`${BackendPrefix}/dashboard`, {
          withCredentials: true,
        });
        setUrls(data.urls || []);
        if (user.role === "admin") {
          const { data } = await axios.get(`${BackendPrefix}/users`, {
            withCredentials: true,
          });
          setUsers(data.users || []);
        }
      } catch (err) {
        console.error("Failed to fetch dashboard URLs:", err);
      }
    };

    fetchDashboardUrls();
  }, [user]);

  // Handle URL shortening
  const handleShorten = async () => {
    if (!originalUrl) return setError("Please enter a URL.");

    setLoading(true);
    setError("");
    setShortenedUrl(null);

    try {
      const { data } = await axios.post(
        `${BackendPrefix}/shorten`,
        { originalUrl },
        { withCredentials: true }
      );

      setShortenedUrl(`${frontendPrefix}/${data.url.shortCode}`);
      setOriginalUrl("");
      // Refresh dashboard URLs
      if (user) {
        const dashboardRes = await axios.get(`${BackendPrefix}/dashboard`, {
          withCredentials: true,
        });
        setUrls(dashboardRes.data.urls || []);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Something went wrong");
    }

    setLoading(false);
  };

  // Handle URL delete (user or admin)
  const handleDelete = async (id) => {
    try {
      await axios.delete(`${BackendPrefix}/url/${id}`, {
        withCredentials: true,
      });

      const dashboardRes = await axios.get(`${BackendPrefix}/dashboard`, {
        withCredentials: true,
      });
      setUrls(dashboardRes.data.urls || []);
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  // Handle user delete (user or admin)
  const handleDeleteUser = async (id) => {
    try {
      await axios.delete(`${BackendPrefix}/user/${id}`, {
        withCredentials: true,
      });

      const dashboardRes = await axios.get(`${BackendPrefix}/dashboard`, {
        withCredentials: true,
      });
      setUrls(dashboardRes.data.urls || []);
      const usersRes = await axios.get(`${BackendPrefix}/users`, {
        withCredentials: true,
      });
      setUsers(usersRes.data.users || []);
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  // Format date
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleString("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  // Trash icon component
  const TrashIcon = () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="currentColor"
      style={{ display: "inline-block", verticalAlign: "middle" }}
    >
      <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z" />
      <path
        fillRule="evenodd"
        d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"
      />
    </svg>
  );

  return (
    <div style={styles.container}>
      {/* Input to shorten URL */}
      <div style={styles.inputContainer}>
        <input
          type="text"
          placeholder="Enter URL"
          value={originalUrl}
          onChange={(e) => setOriginalUrl(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleShorten();
            }
          }}
          style={styles.input}
        />
        <button
          onClick={handleShorten}
          disabled={loading}
          style={styles.button}
        >
          {loading ? "Shortening..." : "Shorten"}
        </button>
      </div>

      {error && <p style={styles.error}>{error}</p>}

      {shortenedUrl && (
        <div style={styles.result}>
          <strong>Shortened URL:</strong>{" "}
          <a
            href={shortenedUrl}
            target="_blank"
            rel="noreferrer"
            style={styles.link}
          >
            {shortenedUrl}
          </a>
        </div>
      )}

      {urls.length > 0 && (
        <div style={styles.tableContainer}>
          <h4 style={styles.subtitle}>Your URLs:</h4>
          <div style={styles.desktopTable}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Original URL</th>
                  <th style={styles.th}>Shortened URL</th>
                  <th style={styles.th}>Created At</th>
                  {user?.role === "admin" && (
                    <th style={styles.th}>Created By</th>
                  )}
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {urls.map((url) => (
                  <tr key={url._id} style={styles.tr}>
                    <td style={styles.td}>
                      <a
                        href={url.originalUrl}
                        target="_blank"
                        rel="noreferrer"
                        style={styles.link}
                      >
                        {url.originalUrl}
                      </a>
                    </td>
                    <td style={styles.td}>
                      <a
                        href={`${frontendPrefix}/${url.shortCode}`}
                        target="_blank"
                        rel="noreferrer"
                        style={styles.link}
                      >
                        {frontendPrefix}/{url.shortCode}
                      </a>
                    </td>
                    <td style={styles.td}>{formatDate(url.createdAt)}</td>
                    {user?.role === "admin" && (
                      <td style={styles.td}>
                        {url.createdBy?.email || "Anonymous"}
                      </td>
                    )}
                    <td style={styles.td}>
                      {(user?.role === "admin" ||
                        url.createdBy === user?._id) && (
                        <button
                          onClick={() => handleDelete(url._id)}
                          style={styles.deleteButton}
                          title="Delete URL"
                        >
                          <TrashIcon />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {users.length > 0 && (
        <div style={styles.tableContainer}>
          <h4 style={styles.subtitle}>Users:</h4>
          <div style={styles.desktopTable}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Name</th>
                  <th style={styles.th}>Email</th>
                  <th style={styles.th}>Picture</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id} style={styles.tr}>
                    <td style={styles.td}>
                      <span>{user.name}</span>
                    </td>
                    <td style={styles.td}>
                      <span>{user.email}</span>
                    </td>
                    <td style={styles.td}>
                      {user.avatar?.url ? (
                        <img
                          src={user.avatar.url}
                          alt="User Avatar"
                          style={{
                            width: "40px",
                            height: "40px",
                            borderRadius: "50%",
                            objectFit: "cover",
                          }}
                        />
                      ) : (
                        <span>No Avatar</span>
                      )}
                    </td>

                    <td style={styles.td}>
                      <button
                        onClick={() => handleDeleteUser(user._id)}
                        style={styles.deleteButton}
                        title="Delete URL"
                      >
                        <TrashIcon />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    padding: "1rem",
    maxWidth: "1200px",
    margin: "0 auto",
  },
  title: {
    textAlign: "center",
    fontSize: "clamp(1.5rem, 5vw, 2rem)",
    marginBottom: "1.5rem",
  },
  subtitle: {
    fontSize: "clamp(1.1rem, 3vw, 1.5rem)",
    marginBottom: "1rem",
    textAlign: "center",
  },
  inputContainer: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: "0.5rem",
    marginBottom: "1rem",
    padding: "0 0.5rem",
  },
  input: {
    flex: "1 1 300px",
    minWidth: "200px",
    maxWidth: "500px",
    padding: "0.75rem",
    fontSize: "1rem",
    border: "1px solid #ddd",
    borderRadius: "4px",
  },
  button: {
    padding: "0.75rem 1.5rem",
    fontSize: "1rem",
    cursor: "pointer",
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    borderRadius: "4px",
    transition: "background-color 0.2s",
    minWidth: "120px",
  },
  error: {
    color: "#dc3545",
    textAlign: "center",
    padding: "0.5rem",
  },
  result: {
    margin: "1rem 0",
    padding: "1rem",
    backgroundColor: "#d4edda",
    borderRadius: "4px",
    wordBreak: "break-all",
    textAlign: "center",
  },
  link: {
    color: "#007bff",
    textDecoration: "none",
  },
  tableContainer: {
    marginTop: "2rem",
  },
  // Desktop table (hidden on mobile)
  desktopTable: {
    display: "block",
    overflowX: "auto",
  },
  table: {
    borderCollapse: "collapse",
    width: "100%",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    backgroundColor: "white",
  },
  th: {
    backgroundColor: "#f4f4f4",
    padding: "0.75rem",
    textAlign: "left",
    borderBottom: "2px solid #ddd",
    fontWeight: "600",
    fontSize: "0.9rem",
  },
  td: {
    padding: "0.75rem",
    borderBottom: "1px solid #ddd",
    wordBreak: "break-word",
    fontSize: "0.9rem",
  },
  tr: {
    backgroundColor: "#fff",
    transition: "background-color 0.2s",
  },
  deleteButton: {
    padding: "0.4rem 0.8rem",
    cursor: "pointer",
    color: "white",
    backgroundColor: "#dc3545",
    border: "none",
    borderRadius: "4px",
    fontSize: "0.9rem",
    transition: "background-color 0.2s",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minWidth: "40px",
  },

  card: {
    backgroundColor: "white",
    border: "1px solid #ddd",
    borderRadius: "8px",
    padding: "1rem",
    marginBottom: "1rem",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  },
  cardRow: {
    marginBottom: "0.75rem",
    display: "flex",
    flexDirection: "column",
    gap: "0.25rem",
  },
  cardLabel: {
    fontWeight: "600",
    color: "#555",
    fontSize: "0.9rem",
  },
  cardLink: {
    color: "#007bff",
    textDecoration: "none",
    wordBreak: "break-all",
    fontSize: "0.9rem",
  },
  deleteButtonCard: {
    width: "100%",
    padding: "0.75rem",
    cursor: "pointer",
    color: "white",
    backgroundColor: "#dc3545",
    border: "none",
    borderRadius: "4px",
    fontSize: "1rem",
    marginTop: "0.5rem",
    transition: "background-color 0.2s",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.5rem",
  },
};

// Add media query styles via a style tag
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @media (max-width: 768px) {
    .desktop-table {
      display: none !important;
    }
    .mobile-cards {
      display: block !important;
    }
  }
`;
if (!document.head.querySelector("style[data-url-shortener-styles]")) {
  styleSheet.setAttribute("data-url-shortener-styles", "true");
  document.head.appendChild(styleSheet);
}

export default Body;
