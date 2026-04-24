import logo from './logo.svg';
import './App.css';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./login";
import Register from "./register";
import Dashboard from "./Dashboard";
import Upload from "./upload";
import MyProfile from "./myprofile";
import Incidents from "./incidents";
import Reports from "./reports";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/upload" element={<Upload />} />
         <Route path="/profile" element={<MyProfile />} />
    <Route path="/incidents" element={<Incidents />} />
    <Route path="/reports" element={<Reports />} />
      </Routes>
    </Router>
  );
}

export default App;

