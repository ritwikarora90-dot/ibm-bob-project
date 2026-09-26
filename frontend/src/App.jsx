import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";

import Navbar from "./components/Navbar";

import Home from "./pages/Home";
import Analyze from "./pages/Analyze";
import Optimization from "./pages/Optimization";
import SecurityPatch from "./pages/SecurityPatch";
import Verification from "./pages/Verification";
import Performance from "./pages/Performance";

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/analyze" element={<Analyze />} />
        <Route path="/optimization" element={<Optimization />} />
        <Route path="/security" element={<SecurityPatch />} />
        <Route path="/verification" element={<Verification />} />
        <Route path="/performance" element={<Performance />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;