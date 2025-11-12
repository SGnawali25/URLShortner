import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header.jsx";
import Body from "./components/Body.jsx";
import ShortCodePage from "./components/ShortCodePage.jsx";

export default function App() {
  return (
    <Router>
      <Header /> {/* Header will appear on every route */}
      <Routes>
        <Route path="/" element={<Body />} />
        <Route path="/:shortCode" element={<ShortCodePage />} />
      </Routes>
    </Router>
  );
}

