import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import AtsCheckerPage from "./pages/AtsCheckerPage";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/ats-score" element={<AtsCheckerPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;