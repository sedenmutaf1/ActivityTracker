// App.js
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginSignupForm from "./components/LoginSignupForm";
import Dashboard from "./components/Dashboard";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginSignupForm />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
