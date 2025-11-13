import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useState } from "react";
import Header from "./components/Header.jsx";
import Body from "./components/Body.jsx";
import ShortCodePage from "./components/ShortCodePage.jsx";

export default function App() {
  const [user, setUser] = useState(null);
  return (
    <Router>
      <Header user={user} setUser={setUser} />
      <Routes>
        <Route path="/" element={<Body user={user} />} />
        <Route path="/:shortCode" element={<ShortCodePage />} />
      </Routes>
    </Router>
  );
}
