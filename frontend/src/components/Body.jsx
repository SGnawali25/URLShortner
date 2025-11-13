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

  // Fetch dashboard URLs when user changes
  useEffect(() => {
    const fetchDashboardUrls = async () => {
      if (!user) {
        setUrls([]);
        return;
      };

      try {
        const { data } = await axios.get(`${BackendPrefix}/dashboard`, {
          withCredentials: true,
        });
        setUrls(data.urls || []);
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

  // Format date
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleString("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };
  console.log("user", user);
  console.log("urls", urls);
  return (
    <div style={styles.container}>
      <h3>URL Shortener</h3>

      {/* Input to shorten URL */}
      <div style={styles.inputContainer}>
        <input
          type="text"
          placeholder="Enter URL"
          value={originalUrl}
          onChange={(e) => setOriginalUrl(e.target.value)}
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
          Shortened URL:{" "}
          <a href={shortenedUrl} target="_blank" rel="noreferrer">
            {shortenedUrl}
          </a>
        </div>
      )}

      {urls.length > 0 && (
        <div style={styles.tableContainer}>
          <h4>Your URLs:</h4>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Original URL</th>
                <th style={styles.th}>Shortened URL</th>
                <th style={styles.th}>Created At</th>
                {user?.role === "admin" && <th style={styles.th}>Created By</th>}
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {urls.map((url) => (
                <tr key={url._id} style={styles.tr}>
                  <td style={styles.td}>
                    <a href={url.originalUrl} target="_blank" rel="noreferrer">
                      {url.originalUrl}
                    </a>
                  </td>
                  <td style={styles.td}>
                    <a
                      href={`${frontendPrefix}/${url.shortCode}`}
                      target="_blank"
                      rel="noreferrer"
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
                      >
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: { padding: "1rem", textAlign: "center" },
  inputContainer: {
    display: "flex",
    justifyContent: "center",
    gap: "0.5rem",
    marginBottom: "1rem",
  },
  input: { width: "300px", padding: "0.5rem", fontSize: "1rem" },
  button: { padding: "0.5rem 1rem", fontSize: "1rem", cursor: "pointer" },
  error: { color: "red" },
  result: { margin: "1rem 0" },
  tableContainer: {
    marginTop: "2rem",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  table: {
    borderCollapse: "collapse",
    width: "90%",
    maxWidth: "1000px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  },
  th: {
    backgroundColor: "#f4f4f4",
    padding: "0.75rem",
    textAlign: "left",
    borderBottom: "2px solid #ddd",
    fontWeight: "600",
  },
  td: {
    padding: "0.75rem",
    borderBottom: "1px solid #ddd",
    wordBreak: "break-word",
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
  },
};

export default Body;
