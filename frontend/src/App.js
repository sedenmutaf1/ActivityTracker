// App.js
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginSignupForm from "./components/LoginSignupForm";
import Dashboard from "./components/Dashboard";
import OngoingSession from "./components/OngoingSession";
import OldSessions from "./components/OldSessions";
import ResetPassword from "./components/ResetPassword";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginSignupForm />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/session" element={<OngoingSession />} />
        <Route path="/oldsessions" element={<OldSessions />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Routes>
    </Router>
  );
}



export default App;
