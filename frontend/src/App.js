// App.js
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginSignupForm from "./components/LoginSignupForm";
import Dashboard from "./components/Dashboard";
import OngoingSession from "./components/OngoingSession";
import OldSessions from "./components/OldSessions";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginSignupForm />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/session" element={<OngoingSession />} />
        <Route path="/oldsessions" element={<OldSessions />} />
      </Routes>
    </Router>
  );
}

export default App;
