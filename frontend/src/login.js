import React, { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    password: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = () => {
    const savedUser = JSON.parse(localStorage.getItem("user"));

    if (
      savedUser &&
      savedUser.username === form.username &&
      savedUser.password === form.password
    ) {
      localStorage.setItem("token", "loggedin");
      navigate("/dashboard");
    } else {
      alert("Invalid credentials ❌");
    }
  };

  return (
    <Box
      sx={{
        height: "100vh",
        backgroundImage:
          "url(https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1600)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {/* 🔥 GLASS EFFECT CARD */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Paper
          elevation={10}
          sx={{
            p: 5,
            width: 360,
            borderRadius: 4,
            backdropFilter: "blur(15px)",
            background: "rgba(15, 23, 42, 0.7)",
            color: "#fff",
            textAlign: "center",
            boxShadow: "0 0 30px rgba(0,0,0,0.5)",
          }}
        >
          {/* 🔥 TITLE */}
          <Typography variant="h4" fontWeight="bold" mb={1}>
            🔐 Surveillance Login
          </Typography>

          <Typography variant="body2" mb={3} sx={{ opacity: 0.8 }}>
            Secure access to AI-powered CCTV monitoring system
          </Typography>

          {/* INPUTS */}
          <TextField
            fullWidth
            label="Username"
            name="username"
            margin="normal"
            onChange={handleChange}
            InputProps={{ style: { color: "#fff" } }}
            InputLabelProps={{ style: { color: "#cbd5f5" } }}
          />

          <TextField
            fullWidth
            label="Password"
            type="password"
            name="password"
            margin="normal"
            onChange={handleChange}
            InputProps={{ style: { color: "#fff" } }}
            InputLabelProps={{ style: { color: "#cbd5f5" } }}
          />

          {/* 🔥 LOGIN BUTTON */}
          <Button
            fullWidth
            variant="contained"
            sx={{
              mt: 3,
              py: 1.3,
              fontWeight: "bold",
              background: "linear-gradient(90deg, #2563eb, #38bdf8)",
              boxShadow: "0 0 10px #38bdf8",
              "&:hover": {
                background: "linear-gradient(90deg, #1d4ed8, #0ea5e9)",
                boxShadow: "0 0 20px #38bdf8",
              },
            }}
            onClick={handleLogin}
          >
            LOGIN
          </Button>

          {/* 🔥 REGISTER LINK */}
          <Typography mt={3} sx={{ fontSize: "14px" }}>
            New user?{" "}
            <span
              style={{
                color: "#38bdf8",
                cursor: "pointer",
                fontWeight: "bold",
              }}
              onClick={() => navigate("/register")}
            >
              Create Account
            </span>
          </Typography>
        </Paper>
      </motion.div>
    </Box>
  );
}

export default Login;