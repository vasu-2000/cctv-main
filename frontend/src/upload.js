import React, { useState, useRef, useEffect } from "react";
import {
  Box, Typography, LinearProgress, Chip,
  AppBar, Toolbar, Button,
  Drawer, List, ListItemButton, ListItemIcon, ListItemText, Divider,
} from "@mui/material";

import HomeIcon from "@mui/icons-material/Home";
import PersonIcon from "@mui/icons-material/Person";
import WarningIcon from "@mui/icons-material/Warning";
import DescriptionIcon from "@mui/icons-material/Description";
import UploadIcon from "@mui/icons-material/Upload";
import LogoutIcon from "@mui/icons-material/Logout";
import VideocamIcon from "@mui/icons-material/Videocam";
import PlayCircleIcon from "@mui/icons-material/PlayCircle";
import ShieldIcon from "@mui/icons-material/Shield";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";

import { useNavigate, useLocation } from "react-router-dom";

const drawerWidth = 220;

// ─── Design Tokens (same as Dashboard) ───────────────────────────────────────
const T = {
  bg: "#05101f",
  panel: "#0a1828",
  card: "#0d1f35",
  border: "rgba(0,229,255,0.12)",
  borderGlow: "rgba(0,229,255,0.35)",
  cyan: "#00e5ff",
  green: "#00e676",
  red: "#ff1744",
  amber: "#ffab00",
  purple: "#7c4dff",
  textPrimary: "#dff4fa",
  textMuted: "#5f8fa4",
  fontMono: "'Share Tech Mono', monospace",
  fontDisplay: "'Exo 2', sans-serif",
};

const glassCard = (extra = {}) => ({
  background: T.card,
  border: `1px solid ${T.border}`,
  borderRadius: "10px",
  overflow: "hidden",
  ...extra,
});

function LiveDot({ color = T.green, size = 8 }) {
  return (
    <Box sx={{
      width: size, height: size, borderRadius: "50%", background: color, flexShrink: 0,
      "@keyframes livePulse": {
        "0%,100%": { opacity: 1, boxShadow: `0 0 0 0 ${color}66` },
        "50%": { opacity: 0.7, boxShadow: `0 0 0 5px ${color}00` },
      },
      animation: "livePulse 1.6s infinite",
    }} />
  );
}

// ─── Detection Result Row ────────────────────────────────────────────────────
function DetectionRow({ frame, label, confidence, color }) {
  return (
    <Box sx={{
      display: "flex", alignItems: "center", gap: 1.5,
      p: "10px 14px", borderBottom: `1px solid ${T.border}`,
      "&:last-child": { borderBottom: "none" },
    }}>
      <Box sx={{
        width: 36, height: 36, borderRadius: "6px",
        background: "rgba(0,229,255,0.06)",
        border: `1px solid ${T.border}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: T.fontMono, fontSize: 9, color: T.textMuted,
      }}>
        F{frame}
      </Box>
      <Box sx={{ flex: 1 }}>
        <Typography sx={{ fontSize: 12, fontWeight: 700, color: T.textPrimary }}>{label}</Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.4 }}>
          <Box sx={{ flex: 1, height: 4, borderRadius: 2, background: "rgba(255,255,255,0.06)" }}>
            <Box sx={{ height: "100%", width: `${confidence}%`, background: color, borderRadius: 2 }} />
          </Box>
          <Typography sx={{ fontFamily: T.fontMono, fontSize: 10, color: T.textMuted, minWidth: 32 }}>
            {confidence}%
          </Typography>
        </Box>
      </Box>
      <Box sx={{
        background: `${color}22`, border: `1px solid ${color}55`,
        color, fontFamily: T.fontMono, fontSize: 9,
        px: "8px", py: "2px", borderRadius: "3px",
      }}>
        {confidence >= 80 ? "HIGH" : confidence >= 55 ? "MED" : "LOW"}
      </Box>
    </Box>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function UploadSession() {
  const navigate = useNavigate();
  const location = useLocation();
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);

  const [clock, setClock] = useState("");
  const [file, setFile] = useState(null);
  const [videoURL, setVideoURL] = useState(null);
  const [status, setStatus] = useState("idle"); // idle | uploading | success | error
  const [progress, setProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");
  const [results, setResults] = useState([]);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Exo+2:wght@400;600;700&display=swap";
    document.head.appendChild(link);
    const tick = () => setClock(new Date().toLocaleTimeString("en-IN", { hour12: false }));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const handleLogout = () => { localStorage.removeItem("token"); navigate("/"); };

  const menu = [
    { text: "Home",           icon: <HomeIcon sx={{ fontSize: 18 }} />,        path: "/dashboard" },
    { text: "My Profile",     icon: <PersonIcon sx={{ fontSize: 18 }} />,      path: "/profile"   },
    { text: "Incidents",      icon: <WarningIcon sx={{ fontSize: 18 }} />,     path: "/incidents", badge: 5 },
    { text: "Reports",        icon: <DescriptionIcon sx={{ fontSize: 18 }} />, path: "/reports"   },
    { text: "Upload Session", icon: <UploadIcon sx={{ fontSize: 18 }} />,      path: "/upload"    },
  ];

  const handleFileSelect = (selectedFile) => {
    if (!selectedFile) return;
    setFile(selectedFile);
    setVideoURL(URL.createObjectURL(selectedFile));
    setStatus("idle");
    setResults([]);
    setErrorMsg("");
    setProgress(0);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped && dropped.type.startsWith("video/")) handleFileSelect(dropped);
  };

  const handleUpload = async () => {
    if (!file) return;
    setStatus("uploading");
    setProgress(0);
    setErrorMsg("");
    setResults([]);

    const formData = new FormData();
    formData.append("video", file);

    // Simulate progress bar while waiting
    const progressInterval = setInterval(() => {
      setProgress((p) => (p < 88 ? p + Math.random() * 8 : p));
    }, 400);

    try {
      // ⚠️ CHANGE THIS URL to match your backend (e.g. "http://localhost:5000/detect")
      const res = await fetch("http://localhost:5000/detect", {
        method: "POST",
        body: formData,
      });

      clearInterval(progressInterval);

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Server returned ${res.status}: ${errText}`);
      }

      const data = await res.json();
      setProgress(100);
      setStatus("success");

      // Normalize result format — adjust keys to match your actual API response
      // Expected: { detections: [{ frame, label, confidence }] }
      // or:       { results: [...] }  — adapt below as needed
      const detections =
        data.detections || data.results || data.predictions || [];
      setResults(detections);

    } catch (err) {
      clearInterval(progressInterval);
      setProgress(0);
      setStatus("error");

      if (err.message.includes("Failed to fetch") || err.message.includes("NetworkError")) {
        setErrorMsg(
          "Cannot reach the detection server. Make sure your backend is running on localhost:5000 and CORS is enabled."
        );
      } else {
        setErrorMsg(err.message);
      }
    }
  };

  const formatBytes = (bytes) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <Box sx={{ display: "flex", background: T.bg, minHeight: "100vh", fontFamily: T.fontDisplay }}>

      {/* ── SIDEBAR ──────────────────────────────────────────────────────── */}
      <Drawer variant="permanent" sx={{
        width: drawerWidth,
        "& .MuiDrawer-paper": { width: drawerWidth, background: T.panel, borderRight: `1px solid ${T.border}`, color: T.textPrimary },
      }}>
        <Box sx={{ p: "16px 18px", display: "flex", alignItems: "center", gap: 1.2 }}>
          <Box sx={{ width: 32, height: 32, border: `1.5px solid ${T.cyan}`, borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <ShieldIcon sx={{ fontSize: 16, color: T.cyan }} />
          </Box>
          <Box>
            <Typography sx={{ fontFamily: T.fontDisplay, fontWeight: 700, fontSize: 15, color: T.cyan, letterSpacing: "0.08em", lineHeight: 1.1 }}>SentinelX</Typography>
            <Typography sx={{ fontFamily: T.fontMono, fontSize: 8.5, color: T.textMuted, letterSpacing: "0.18em" }}>SURVEILLANCE</Typography>
          </Box>
        </Box>
        <Divider sx={{ borderColor: T.border }} />
        <Typography sx={{ fontFamily: T.fontMono, fontSize: 9, color: T.textMuted, letterSpacing: "0.2em", px: "18px", pt: 2, pb: 0.5 }}>NAVIGATION</Typography>
        <List dense sx={{ px: 1 }}>
          {menu.map((item) => (
            <ListItemButton key={item.text} onClick={() => navigate(item.path)} selected={location.pathname === item.path}
              sx={{
                borderRadius: "6px", mb: "2px", py: 1,
                borderLeft: location.pathname === item.path ? `2px solid ${T.cyan}` : "2px solid transparent",
                "&.Mui-selected": { background: "rgba(0,229,255,0.09)", color: T.cyan },
                "&:hover": { background: "rgba(0,229,255,0.06)" },
                color: T.textMuted,
              }}>
              <ListItemIcon sx={{ color: "inherit", minWidth: 32 }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} primaryTypographyProps={{ fontSize: 13, fontWeight: 600, letterSpacing: "0.04em" }} />
              {item.badge && (
                <Box sx={{ background: "rgba(255,23,68,0.18)", border: "1px solid rgba(255,23,68,0.35)", color: "#ff6090", fontFamily: T.fontMono, fontSize: 9, px: "6px", py: "1px", borderRadius: "10px" }}>
                  {item.badge}
                </Box>
              )}
            </ListItemButton>
          ))}
          <Divider sx={{ borderColor: T.border, my: 0.5 }} />
          <ListItemButton onClick={handleLogout} sx={{ borderRadius: "6px", color: "#f87171", "&:hover": { background: "rgba(248,113,113,0.08)" } }}>
            <ListItemIcon sx={{ color: "inherit", minWidth: 32 }}><LogoutIcon sx={{ fontSize: 18 }} /></ListItemIcon>
            <ListItemText primary="Logout" primaryTypographyProps={{ fontSize: 13, fontWeight: 600 }} />
          </ListItemButton>
        </List>
        <Box sx={{ mt: "auto", p: "12px 14px" }}>
          <Box sx={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: "8px", p: "10px 12px", display: "flex", alignItems: "center", gap: 1.2 }}>
            <Box sx={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg,#005060,#001a25)", border: `1.5px solid ${T.cyan}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: T.fontMono, fontSize: 11, color: T.cyan, fontWeight: 700 }}>AD</Box>
            <Box sx={{ flex: 1 }}>
              <Typography sx={{ fontSize: 12, fontWeight: 700, color: T.textPrimary, lineHeight: 1.2 }}>Admin User</Typography>
              <Typography sx={{ fontFamily: T.fontMono, fontSize: 9, color: T.textMuted }}>SUPERVISOR</Typography>
            </Box>
            <LiveDot size={7} />
          </Box>
        </Box>
      </Drawer>

      {/* ── MAIN ─────────────────────────────────────────────────────────── */}
      <Box sx={{ flexGrow: 1, ml: `${drawerWidth}px`, width: `calc(100% - ${drawerWidth}px)` }}>

        {/* TOPBAR */}
        <AppBar position="fixed" elevation={0} sx={{ ml: `${drawerWidth}px`, width: `calc(100% - ${drawerWidth}px)`, background: T.panel, borderBottom: `1px solid ${T.border}` }}>
          <Toolbar sx={{ gap: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <LiveDot size={8} />
              <Typography sx={{ fontFamily: T.fontMono, fontSize: 12, color: T.textMuted }}>SYSTEM ONLINE</Typography>
            </Box>
            <Typography sx={{ fontFamily: T.fontMono, fontSize: 12, color: T.textMuted }}>{clock}</Typography>
            <Box sx={{ flexGrow: 1 }} />
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.8, background: "rgba(255,23,68,0.12)", border: "1px solid rgba(255,23,68,0.35)", borderRadius: "4px", px: 1.5, py: 0.4 }}>
              <NotificationsActiveIcon sx={{ fontSize: 14, color: "#ff6090" }} />
              <Typography sx={{ fontFamily: T.fontMono, fontSize: 11, color: "#ff6090" }}>3 ACTIVE ALERTS</Typography>
            </Box>
            <Button onClick={handleLogout} variant="outlined" size="small"
              sx={{ fontFamily: T.fontDisplay, fontWeight: 600, fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", borderColor: T.border, color: T.textMuted, "&:hover": { borderColor: T.cyan, color: T.cyan, background: "rgba(0,229,255,0.05)" } }}>
              Logout
            </Button>
          </Toolbar>
        </AppBar>
        <Toolbar />

        {/* PAGE CONTENT */}
        <Box sx={{ p: 3 }}>

          {/* Page Header */}
          <Box sx={{ ...glassCard(), p: "22px 28px", mb: 2.5, position: "relative", overflow: "hidden" }}>
            <Box sx={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(0,229,255,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(0,229,255,0.03) 1px,transparent 1px)", backgroundSize: "32px 32px", pointerEvents: "none" }} />
            <Box sx={{ position: "absolute", top: 0, right: 0, width: 200, height: 200, background: "radial-gradient(circle at top right,rgba(0,229,255,0.05) 0%,transparent 70%)", pointerEvents: "none" }} />
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
              <Box sx={{ width: 20, height: 1, background: T.cyan }} />
              <Typography sx={{ fontFamily: T.fontMono, fontSize: 10, color: T.cyan, letterSpacing: "0.2em" }}>ANALYSIS MODULE</Typography>
            </Box>
            <Typography sx={{ fontFamily: T.fontDisplay, fontWeight: 700, fontSize: 22, color: T.textPrimary, letterSpacing: "0.04em", mb: 0.4 }}>
              Upload Session
            </Typography>
            <Typography sx={{ fontSize: 13, color: T.textMuted }}>
              Submit CCTV footage for AI-powered threat detection and behavioral analysis
            </Typography>
          </Box>

          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2, alignItems: "start" }}>

            {/* LEFT: Upload + Preview */}
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>

              {/* Drop Zone */}
              <Box sx={glassCard()}>
                <Box sx={{ p: "14px 16px", borderBottom: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <Typography sx={{ fontFamily: T.fontDisplay, fontWeight: 700, fontSize: 13, color: T.textPrimary, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                    Select Footage
                  </Typography>
                  <Typography sx={{ fontFamily: T.fontMono, fontSize: 9, color: T.textMuted }}>MP4 / AVI / MOV / MKV</Typography>
                </Box>

                <Box
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  sx={{
                    m: 2, p: "36px 24px",
                    border: `1.5px dashed ${isDragging ? T.cyan : T.borderGlow}`,
                    borderRadius: "8px",
                    background: isDragging ? "rgba(0,229,255,0.05)" : "rgba(0,229,255,0.02)",
                    display: "flex", flexDirection: "column", alignItems: "center",
                    cursor: "pointer", transition: "all 0.2s",
                    "&:hover": { background: "rgba(0,229,255,0.04)", borderColor: T.cyan },
                  }}
                >
                  <Box sx={{
                    width: 56, height: 56, borderRadius: "50%",
                    background: "rgba(0,229,255,0.08)",
                    border: `1px solid ${T.borderGlow}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    mb: 1.5,
                  }}>
                    <CloudUploadIcon sx={{ fontSize: 26, color: T.cyan }} />
                  </Box>
                  <Typography sx={{ fontFamily: T.fontDisplay, fontWeight: 600, fontSize: 14, color: T.textPrimary, mb: 0.5 }}>
                    {file ? file.name : "Drop video file here"}
                  </Typography>
                  <Typography sx={{ fontFamily: T.fontMono, fontSize: 11, color: T.textMuted, mb: 2 }}>
                    {file ? `${formatBytes(file.size)} • Ready to analyze` : "or click to browse files"}
                  </Typography>
                  <Box sx={{
                    px: 2.5, py: 0.8,
                    background: "rgba(0,229,255,0.1)",
                    border: `1px solid ${T.borderGlow}`,
                    borderRadius: "6px",
                    fontFamily: T.fontMono, fontSize: 11, color: T.cyan, letterSpacing: "0.1em",
                  }}>
                    SELECT VIDEO
                  </Box>
                  <input ref={fileInputRef} type="file" accept="video/*" hidden onChange={(e) => handleFileSelect(e.target.files[0])} />
                </Box>

                {/* File info */}
                {file && (
                  <Box sx={{ px: 2, pb: 2, display: "flex", gap: 1, flexWrap: "wrap" }}>
                    {[
                      { label: "FILE", value: file.name },
                      { label: "SIZE", value: formatBytes(file.size) },
                      { label: "TYPE", value: file.type.split("/")[1]?.toUpperCase() || "VIDEO" },
                    ].map((info) => (
                      <Box key={info.label} sx={{ background: "rgba(0,229,255,0.06)", border: `1px solid ${T.border}`, borderRadius: "4px", px: 1.2, py: 0.4 }}>
                        <Typography sx={{ fontFamily: T.fontMono, fontSize: 9, color: T.textMuted }}>{info.label}</Typography>
                        <Typography sx={{ fontFamily: T.fontMono, fontSize: 10, color: T.textPrimary }}>{info.value}</Typography>
                      </Box>
                    ))}
                  </Box>
                )}
              </Box>

              {/* Video Preview */}
              {videoURL && (
                <Box sx={glassCard()}>
                  <Box sx={{ p: "12px 16px", borderBottom: `1px solid ${T.border}`, display: "flex", alignItems: "center", gap: 1 }}>
                    <LiveDot size={7} color={T.cyan} />
                    <Typography sx={{ fontFamily: T.fontDisplay, fontWeight: 700, fontSize: 13, color: T.textPrimary, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                      Preview
                    </Typography>
                  </Box>
                  <Box sx={{ position: "relative", background: "#010a15" }}>
                    {/* corner brackets */}
                    {[
                      { top: 8, left: 8, borderTop: `1.5px solid ${T.cyan}`, borderLeft: `1.5px solid ${T.cyan}` },
                      { top: 8, right: 8, borderTop: `1.5px solid ${T.cyan}`, borderRight: `1.5px solid ${T.cyan}` },
                      { bottom: 8, left: 8, borderBottom: `1.5px solid ${T.cyan}`, borderLeft: `1.5px solid ${T.cyan}` },
                      { bottom: 8, right: 8, borderBottom: `1.5px solid ${T.cyan}`, borderRight: `1.5px solid ${T.cyan}` },
                    ].map((s, i) => (
                      <Box key={i} sx={{ position: "absolute", width: 14, height: 14, zIndex: 2, ...s }} />
                    ))}
                    <video ref={videoRef} src={videoURL} controls style={{ width: "100%", maxHeight: 260, display: "block", background: "#010a15" }} />
                  </Box>
                </Box>
              )}

              {/* Upload Button */}
              <Box
                onClick={handleUpload}
                sx={{
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 1.5,
                  p: "14px",
                  background: file && status !== "uploading"
                    ? "rgba(0,229,255,0.1)"
                    : "rgba(255,255,255,0.03)",
                  border: `1.5px solid ${file && status !== "uploading" ? T.cyan : T.border}`,
                  borderRadius: "10px",
                  cursor: file && status !== "uploading" ? "pointer" : "not-allowed",
                  transition: "all 0.2s",
                  "&:hover": file && status !== "uploading" ? { background: "rgba(0,229,255,0.16)", transform: "translateY(-1px)" } : {},
                }}
              >
                <CloudUploadIcon sx={{ fontSize: 20, color: file && status !== "uploading" ? T.cyan : T.textMuted }} />
                <Typography sx={{
                  fontFamily: T.fontDisplay, fontWeight: 700, fontSize: 14,
                  letterSpacing: "0.12em", textTransform: "uppercase",
                  color: file && status !== "uploading" ? T.cyan : T.textMuted,
                }}>
                  {status === "uploading" ? "Analyzing..." : "Upload & Detect"}
                </Typography>
              </Box>

              {/* Progress */}
              {status === "uploading" && (
                <Box sx={glassCard({ p: "14px 16px" })}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                    <Typography sx={{ fontFamily: T.fontMono, fontSize: 11, color: T.cyan }}>ANALYZING FOOTAGE</Typography>
                    <Typography sx={{ fontFamily: T.fontMono, fontSize: 11, color: T.textMuted }}>{Math.round(progress)}%</Typography>
                  </Box>
                  <LinearProgress variant="determinate" value={progress} sx={{
                    height: 5, borderRadius: 2,
                    background: "rgba(0,229,255,0.08)",
                    "& .MuiLinearProgress-bar": { background: T.cyan, borderRadius: 2 },
                  }} />
                  <Typography sx={{ fontFamily: T.fontMono, fontSize: 10, color: T.textMuted, mt: 0.8 }}>
                    Running AI detection model — please wait...
                  </Typography>
                </Box>
              )}

              {/* Error Message */}
              {status === "error" && (
                <Box sx={{
                  ...glassCard({ p: "14px 16px" }),
                  borderColor: "rgba(255,23,68,0.3)",
                  background: "rgba(255,23,68,0.06)",
                }}>
                  <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.2 }}>
                    <ErrorIcon sx={{ fontSize: 18, color: T.red, mt: "2px", flexShrink: 0 }} />
                    <Box>
                      <Typography sx={{ fontFamily: T.fontDisplay, fontWeight: 700, fontSize: 13, color: "#ff6090", mb: 0.5 }}>
                        Connection Failed
                      </Typography>
                      <Typography sx={{ fontFamily: T.fontMono, fontSize: 10, color: T.textMuted, lineHeight: 1.7 }}>
                        {errorMsg}
                      </Typography>
                      <Box sx={{ mt: 1.2, p: "10px 12px", background: "rgba(0,0,0,0.2)", borderRadius: "6px", border: `1px solid ${T.border}` }}>
                        <Typography sx={{ fontFamily: T.fontMono, fontSize: 10, color: T.textMuted, lineHeight: 1.9 }}>
                          <span style={{ color: T.cyan }}>FIX 1:</span> Run your backend → <span style={{ color: "#ffd740" }}>python app.py</span><br />
                          <span style={{ color: T.cyan }}>FIX 2:</span> Add CORS to Flask → <span style={{ color: "#ffd740" }}>CORS(app)</span><br />
                          <span style={{ color: T.cyan }}>FIX 3:</span> Verify endpoint URL in this file matches your server port
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </Box>
              )}
            </Box>

            {/* RIGHT: Detection Results + Instructions */}
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>

              {/* AI Model Info */}
              <Box sx={glassCard()}>
                <Box sx={{ p: "12px 16px", borderBottom: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <Typography sx={{ fontFamily: T.fontDisplay, fontWeight: 700, fontSize: 13, color: T.textPrimary, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                    AI Engine Status
                  </Typography>
                  <LiveDot size={7} />
                </Box>
                <Box sx={{ p: "14px 16px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1 }}>
                  {[
                    { label: "MODEL", value: "YOLOv8-Threat", color: T.cyan },
                    { label: "STATUS", value: "LOADED", color: T.green },
                    { label: "ACCURACY", value: "98.4%", color: T.cyan },
                    { label: "BACKEND", value: "localhost:5000", color: T.amber },
                  ].map((item) => (
                    <Box key={item.label} sx={{ background: "rgba(0,229,255,0.04)", border: `1px solid ${T.border}`, borderRadius: "6px", p: "8px 10px" }}>
                      <Typography sx={{ fontFamily: T.fontMono, fontSize: 9, color: T.textMuted, letterSpacing: "0.12em" }}>{item.label}</Typography>
                      <Typography sx={{ fontFamily: T.fontMono, fontSize: 12, color: item.color, fontWeight: 700, mt: 0.3 }}>{item.value}</Typography>
                    </Box>
                  ))}
                </Box>
              </Box>

              {/* Detection Results */}
              <Box sx={glassCard()}>
                <Box sx={{ p: "12px 16px", borderBottom: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <Typography sx={{ fontFamily: T.fontDisplay, fontWeight: 700, fontSize: 13, color: T.textPrimary, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                    Detection Results
                  </Typography>
                  {status === "success" && (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.6 }}>
                      <CheckCircleIcon sx={{ fontSize: 14, color: T.green }} />
                      <Typography sx={{ fontFamily: T.fontMono, fontSize: 10, color: T.green }}>{results.length} EVENTS</Typography>
                    </Box>
                  )}
                </Box>

                {status === "idle" && !results.length && (
                  <Box sx={{ p: "32px 24px", display: "flex", flexDirection: "column", alignItems: "center", gap: 1.5 }}>
                    <Box sx={{ width: 52, height: 52, borderRadius: "50%", background: "rgba(0,229,255,0.05)", border: `1px dashed ${T.border}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <VideocamIcon sx={{ fontSize: 24, color: T.textMuted }} />
                    </Box>
                    <Typography sx={{ fontFamily: T.fontMono, fontSize: 11, color: T.textMuted, textAlign: "center", lineHeight: 1.7 }}>
                      No results yet.<br />Upload a video and click Detect.
                    </Typography>
                  </Box>
                )}

                {status === "uploading" && (
                  <Box sx={{ p: "24px 16px" }}>
                    {[1, 2, 3].map((i) => (
                      <Box key={i} sx={{ display: "flex", gap: 1.5, p: "10px 0", borderBottom: `1px solid ${T.border}` }}>
                        <Box sx={{ width: 36, height: 36, borderRadius: "6px", background: "rgba(0,229,255,0.04)", border: `1px solid ${T.border}`, "@keyframes shimmer": { "0%": { opacity: 0.3 }, "100%": { opacity: 0.7 } }, animation: "shimmer 0.9s infinite alternate" }} />
                        <Box sx={{ flex: 1 }}>
                          <Box sx={{ height: 10, width: "60%", background: "rgba(0,229,255,0.08)", borderRadius: 1, mb: 1, animation: "shimmer 0.9s infinite alternate" }} />
                          <Box sx={{ height: 6, width: "80%", background: "rgba(0,229,255,0.05)", borderRadius: 1, animation: "shimmer 1.1s infinite alternate" }} />
                        </Box>
                      </Box>
                    ))}
                  </Box>
                )}

                {status === "success" && results.length > 0 && (
                  results.map((r, i) => (
                    <DetectionRow
                      key={i}
                      frame={r.frame ?? i + 1}
                      label={r.label ?? r.class ?? r.name ?? "Detection"}
                      confidence={Math.round(r.confidence ?? r.score ?? 0)}
                      color={
                        (r.confidence ?? r.score ?? 0) >= 80 ? T.red :
                        (r.confidence ?? r.score ?? 0) >= 55 ? T.amber : T.green
                      }
                    />
                  ))
                )}

                {status === "success" && results.length === 0 && (
                  <Box sx={{ p: "24px 16px", textAlign: "center" }}>
                    <CheckCircleIcon sx={{ fontSize: 28, color: T.green, mb: 1 }} />
                    <Typography sx={{ fontFamily: T.fontMono, fontSize: 11, color: T.green }}>Analysis complete — no threats detected</Typography>
                  </Box>
                )}
              </Box>


            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}