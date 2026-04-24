import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Avatar,
  IconButton,
  InputAdornment,
  Snackbar,
  Alert,
} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { motion } from "framer-motion";

function MyProfile() {
  const [user, setUser] = useState({
    username: "",
    password: "",
    gender: "",
    location: "",
    phone: "",
  });

  const [edit, setEdit] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);

  // ✅ LOAD USER
  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem("user"));
    if (savedUser) setUser(savedUser);
  }, []);

  // ✅ HANDLE CHANGE
  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  // ✅ UPDATE PROFILE
  const handleUpdate = () => {
    localStorage.setItem("user", JSON.stringify(user));
    setOpenSnackbar(true); // show snackbar
    setEdit(false);
  };

  return (
    <Box
      sx={{
        p: 4,
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0f172a, #1e293b)",
        color: "#fff",
      }}
    >
      <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}>
        <Paper
          sx={{
            maxWidth: 600,
            mx: "auto",
            p: 4,
            borderRadius: 4,
            background: "rgba(255,255,255,0.05)",
            backdropFilter: "blur(12px)",
            color: "#fff",
            boxShadow: "0 0 20px rgba(0,0,0,0.5)",
          }}
        >
          {/* 🔥 PROFILE HEADER */}
          <Box textAlign="center" mb={3}>
            <Avatar
              sx={{
                width: 80,
                height: 80,
                mx: "auto",
                mb: 2,
                background: "#2563eb",
                fontSize: "30px",
              }}
            >
              {user.username?.charAt(0)?.toUpperCase()}
            </Avatar>

            <Typography variant="h5" fontWeight="bold">
              {user.username || "User"}
            </Typography>

            <Typography variant="body2" sx={{ opacity: 0.7 }}>
              Surveillance System User
            </Typography>
          </Box>

          {/* 🔥 EDIT MODE */}
          {edit ? (
            <>
              <TextField
                fullWidth
                label="Username"
                name="username"
                value={user.username}
                onChange={handleChange}
                margin="normal"
                InputProps={{ style: { color: "#fff" } }}
                InputLabelProps={{ style: { color: "#cbd5f5" } }}
              />

              {/* 🔐 PASSWORD FIELD WITH SHOW/HIDE */}
              <TextField
                fullWidth
                label="Password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={user.password}
                onChange={handleChange}
                margin="normal"
                InputProps={{
                  style: { color: "#fff" },
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        sx={{ color: "#38bdf8" }}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                InputLabelProps={{ style: { color: "#cbd5f5" } }}
              />

              <TextField
                fullWidth
                label="Gender"
                name="gender"
                value={user.gender}
                onChange={handleChange}
                margin="normal"
                InputProps={{ style: { color: "#fff" } }}
                InputLabelProps={{ style: { color: "#cbd5f5" } }}
              />

              <TextField
                fullWidth
                label="Location"
                name="location"
                value={user.location}
                onChange={handleChange}
                margin="normal"
                InputProps={{ style: { color: "#fff" } }}
                InputLabelProps={{ style: { color: "#cbd5f5" } }}
              />

              <TextField
                fullWidth
                label="Phone"
                name="phone"
                value={user.phone}
                onChange={handleChange}
                margin="normal"
                InputProps={{ style: { color: "#fff" } }}
                InputLabelProps={{ style: { color: "#cbd5f5" } }}
              />

              <Button
                fullWidth
                variant="contained"
                sx={{ mt: 3 }}
                onClick={handleUpdate}
              >
                Save Changes
              </Button>
            </>
          ) : (
            <>
              <Typography mt={2}>
                <b>Gender:</b> {user.gender}
              </Typography>

              <Typography mt={1}>
                <b>Location:</b> {user.location}
              </Typography>

              <Typography mt={1}>
                <b>Phone:</b> {user.phone}
              </Typography>

              <Button
                fullWidth
                variant="outlined"
                sx={{ mt: 3, color: "#38bdf8", borderColor: "#38bdf8" }}
                onClick={() => setEdit(true)}
              >
                Edit Profile
              </Button>
            </>
          )}
        </Paper>
      </motion.div>

      {/* 🔔 SNACKBAR */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={() => setOpenSnackbar(false)}
      >
        <Alert severity="success" variant="filled">
          Profile updated successfully ✅
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default MyProfile;