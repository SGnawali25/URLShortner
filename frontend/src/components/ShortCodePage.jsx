import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const BackendPrefix = import.meta.env.VITE_APP_API_KEY;

const ShortCodePage = () => {
  const { shortCode } = useParams();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyAndRedirect = async () => {
      try {
        // Call backend to verify the short code
        const { data } = await axios.get(
          `${BackendPrefix}/verify/${shortCode}`,
          { withCredentials: true }
        );

        if (data.status) {
          // Redirect to backend route that handles redirect
          window.location.href = `${data.url.originalUrl}`;
        } else {
          setError("Short URL not found.");
        }
      } catch (err) {
        console.error(err);
        setError("Failed to fetch URL.");
      } finally {
        setLoading(false);
      }
    };

    verifyAndRedirect();
  }, [shortCode]);

  if (loading) return <p style={{ textAlign: "center" }}>Loading...</p>;
  if (error) return <p style={{ textAlign: "center", color: "red" }}>{error}</p>;

  return null; // Nothing to render because redirect happens
};

export default ShortCodePage;
