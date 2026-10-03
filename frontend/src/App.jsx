import { BrowserRouter, Routes, Route } from "react-router-dom";

import LandingPage from "./pages/LandingPage";
import AtsCheckerPage from "./pages/AtsCheckerPage";
import ProfilePage from "./pages/ProfilePage";

import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Landing Page */}
        <Route
          path="/"
          element={<LandingPage />}
        />

        {/* ATS Resume Checker */}
        <Route
          path="/ats-score"
          element={<AtsCheckerPage />}
        />

        {/* User Profile */}
        <Route
          path="/profile"
          element={<ProfilePage />}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;