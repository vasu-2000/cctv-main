import React, { useState, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Chip,
  LinearProgress,
} from "@mui/material";

import HomeIcon from "@mui/icons-material/Home";
import PersonIcon from "@mui/icons-material/Person";
import WarningIcon from "@mui/icons-material/Warning";
import DescriptionIcon from "@mui/icons-material/Description";
import UploadIcon from "@mui/icons-material/Upload";
import LogoutIcon from "@mui/icons-material/Logout";
import VideocamIcon from "@mui/icons-material/Videocam";
import PlayCircleIcon from "@mui/icons-material/PlayCircle";
import CircleIcon from "@mui/icons-material/Circle";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import ShieldIcon from "@mui/icons-material/Shield";

import { useNavigate, useLocation } from "react-router-dom";

const drawerWidth = 220;

// ─── Design Tokens ───────────────────────────────────────────────────────────
const T = {
  bg: "#05101f",
  panel: "#0a1828",
  card: "#0d1f35",
  border: "rgba(0,229,255,0.12)",
  borderGlow: "rgba(0,229,255,0.35)",
  cyan: "#00e5ff",
  cyanDim: "#007c8c",
  green: "#00e676",
  red: "#ff1744",
  amber: "#ffab00",
  purple: "#7c4dff",
  textPrimary: "#dff4fa",
  textMuted: "#5f8fa4",
  fontMono: "'Share Tech Mono', monospace",
  fontDisplay: "'Exo 2', sans-serif",
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
const glassCard = (extra = {}) => ({
  background: T.card,
  border: `1px solid ${T.border}`,
  borderRadius: "10px",
  overflow: "hidden",
  transition: "border-color 0.2s, transform 0.2s",
  "&:hover": { borderColor: T.borderGlow, transform: "translateY(-2px)" },
  ...extra,
});

// ─── Reusable Components ──────────────────────────────────────────────────────

// Pulsing live dot
function LiveDot({ color = T.green, size = 8 }) {
  return (
    <Box
      sx={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: color,
        flexShrink: 0,
        "@keyframes livePulse": {
          "0%,100%": { opacity: 1, boxShadow: `0 0 0 0 ${color}66` },
          "50%": { opacity: 0.7, boxShadow: `0 0 0 5px ${color}00` },
        },
        animation: "livePulse 1.6s infinite",
      }}
    />
  );
}

// Stat card
function StatCard({ label, value, color, barWidth, trend }) {
  return (
    <Box
      sx={{
        ...glassCard(),
        p: "16px 18px",
        position: "relative",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0, left: 0, right: 0,
          height: "2px",
          background: color,
          borderRadius: "10px 10px 0 0",
        },
        "&::after": {
          content: '""',
          position: "absolute",
          bottom: 0, left: 0,
          height: "3px",
          width: barWidth,
          background: color,
          opacity: 0.3,
          borderRadius: "0 0 10px 10px",
        },
      }}
    >
      <Typography sx={{ fontFamily: T.fontMono, fontSize: 10, letterSpacing: "0.15em", color: T.textMuted, textTransform: "uppercase", mb: 1.2 }}>
        {label}
      </Typography>
      <Typography sx={{ fontFamily: T.fontDisplay, fontSize: 30, fontWeight: 700, color, lineHeight: 1, mb: 0.8 }}>
        {value}
      </Typography>
      <Typography sx={{ fontSize: 11, color: T.textMuted }}>{trend}</Typography>
    </Box>
  );
}

// Section module card
function ModuleCard({ title, path, image, tag, navigate }) {
  return (
    <Box
      onClick={() => navigate(path)}
      sx={{
        ...glassCard({ cursor: "pointer" }),
        "&:hover img": { transform: "scale(1.06)" },
        "&:hover .overlay": { background: "rgba(0,20,40,0.45)" },
      }}
    >
      <Box sx={{ position: "relative", height: 180, overflow: "hidden" }}>
        <Box
          component="img"
          src={image}
          sx={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.4s ease", display: "block" }}
        />
        {/* scan-line overlay */}
        <Box
          className="overlay"
          sx={{
            position: "absolute", inset: 0,
            background: "rgba(0,20,40,0.55)",
            transition: "background 0.3s",
          }}
        />
        {/* corner brackets */}
        {[
          { top: 8, left: 8, borderTop: `1.5px solid ${T.cyan}`, borderLeft: `1.5px solid ${T.cyan}` },
          { top: 8, right: 8, borderTop: `1.5px solid ${T.cyan}`, borderRight: `1.5px solid ${T.cyan}` },
          { bottom: 8, left: 8, borderBottom: `1.5px solid ${T.cyan}`, borderLeft: `1.5px solid ${T.cyan}` },
          { bottom: 8, right: 8, borderBottom: `1.5px solid ${T.cyan}`, borderRight: `1.5px solid ${T.cyan}` },
        ].map((s, i) => (
          <Box key={i} sx={{ position: "absolute", width: 14, height: 14, ...s }} />
        ))}
        {tag && (
          <Box sx={{
            position: "absolute", top: 8, right: 8,
            background: "rgba(255,23,68,0.88)",
            color: "#fff", fontFamily: T.fontMono, fontSize: 9,
            px: "6px", py: "2px", borderRadius: "3px",
            letterSpacing: "0.1em",
            "@keyframes blinkTag": { "0%,100%": { opacity: 1 }, "50%": { opacity: 0.3 } },
            animation: "blinkTag 1.2s infinite",
          }}>
            {tag}
          </Box>
        )}
      </Box>
      <Box sx={{ p: "12px 14px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Box>
          <Typography sx={{ fontFamily: T.fontDisplay, fontWeight: 700, fontSize: 13, color: T.textPrimary, letterSpacing: "0.05em", textTransform: "uppercase" }}>
            {title}
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.8, mt: 0.4 }}>
            <LiveDot size={6} />
            <Typography sx={{ fontFamily: T.fontMono, fontSize: 10, color: T.textMuted }}>LIVE FEED</Typography>
          </Box>
        </Box>
        <Box sx={{
          width: 28, height: 28, borderRadius: "50%",
          border: `1px solid ${T.borderGlow}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          color: T.cyan, fontSize: 14,
        }}>›</Box>
      </Box>
    </Box>
  );
}

// ─── Dashboard ───────────────────────────────────────────────────────────────
function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [clock, setClock] = useState("");

  useEffect(() => {
    const tick = () => setClock(new Date().toLocaleTimeString("en-IN", { hour12: false }));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  // Load Google Fonts once
  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Exo+2:wght@400;600;700&display=swap";
    document.head.appendChild(link);
  }, []);

  // ── Sidebar Menu ──────────────────────────────────────────────────────────
  const menu = [
    { text: "Home",           icon: <HomeIcon sx={{ fontSize: 18 }} />,        path: "/dashboard" },
    { text: "My Profile",     icon: <PersonIcon sx={{ fontSize: 18 }} />,      path: "/profile"   },
    { text: "Incidents",      icon: <WarningIcon sx={{ fontSize: 18 }} />,     path: "/incidents", badge: 5 },
    { text: "Reports",        icon: <DescriptionIcon sx={{ fontSize: 18 }} />, path: "/reports"   },
    { text: "Upload Session", icon: <UploadIcon sx={{ fontSize: 18 }} />,      path: "/upload"    },
  ];

  const cameraMenu = [
    { text: "Live View",  icon: <VideocamIcon sx={{ fontSize: 18 }} />,    path: "/cctv",    badge: 16 },
    { text: "Playback",   icon: <PlayCircleIcon sx={{ fontSize: 18 }} />,  path: "/playback" },
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  // ── Stats ─────────────────────────────────────────────────────────────────
  const stats = [
    { label: "Active Cameras",  value: "16",  color: T.cyan,   barWidth: "100%", trend: "↑ 2 added this week" },
    { label: "Incidents Today", value: "5",   color: "#ff6090", barWidth: "60%",  trend: "3 unresolved" },
    { label: "Alerts",          value: "12",  color: T.amber,  barWidth: "80%",  trend: "8 acknowledged" },
    { label: "Storage Used",    value: "85%", color: T.amber,  barWidth: "85%",  trend: "⚠ 1.8 TB remaining" },
  ];

  // ── Module Cards ──────────────────────────────────────────────────────────
  const sections = [
    { title: "CCTV Monitoring",    path: "/cctv",      image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800", tag: "MOTION" },
    { title: "Real-Time Detection",path: "/detection", image: "https://images.unsplash.com/photo-1563206767-5b18f218e8de?w=800" },
    { title: "Security Analytics", path: "/analytics", image: "https://images.unsplash.com/photo-1510511459019-5dda7724fd87?w=800" },
    { title: "Face Recognition",   path: "/face",      image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800" },
    { title: "Motion Detection",   path: "/motion",    image: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800" },
    { title: "Threat Alerts",      path: "/alerts",    image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800", tag: "ALERT" },
  ];

  // ── Recent Incidents ──────────────────────────────────────────────────────
  const incidents = [
    { label: "Unauthorized Access — Zone C",   cam: "CAM-07", time: "11:32 AM", severity: "HIGH",   color: T.red   },
    { label: "Loitering Detected — Parking",   cam: "CAM-12", time: "10:58 AM", severity: "MED",    color: T.amber },
    { label: "Camera Occlusion — Server Room", cam: "CAM-04", time: "10:21 AM", severity: "HIGH",   color: T.red   },
    { label: "Unrecognized Face — Gate 2",     cam: "CAM-03", time: "09:47 AM", severity: "MED",    color: T.amber },
    { label: "After-hours Access — Office B",  cam: "CAM-09", time: "08:15 AM", severity: "LOW",    color: T.green },
  ];

  // ── Severity chip colors ──────────────────────────────────────────────────
  const severityStyle = {
    HIGH: { bg: "rgba(255,23,68,0.15)",    border: "rgba(255,23,68,0.35)",    color: "#ff6090" },
    MED:  { bg: "rgba(255,171,0,0.12)",   border: "rgba(255,171,0,0.3)",    color: "#ffd740" },
    LOW:  { bg: "rgba(0,230,118,0.1)",    border: "rgba(0,230,118,0.25)",   color: "#66ffa6" },
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <Box sx={{ display: "flex", background: T.bg, minHeight: "100vh", fontFamily: T.fontDisplay }}>

      {/* ── SIDEBAR ──────────────────────────────────────────────────────── */}
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            background: T.panel,
            borderRight: `1px solid ${T.border}`,
            color: T.textPrimary,
            boxSizing: "border-box",
          },
        }}
      >
        {/* Logo */}
        <Box sx={{ p: "16px 18px", display: "flex", alignItems: "center", gap: 1.2 }}>
          <Box sx={{
            width: 32, height: 32, border: `1.5px solid ${T.cyan}`,
            borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <ShieldIcon sx={{ fontSize: 16, color: T.cyan }} />
          </Box>
          <Box>
            <Typography sx={{ fontFamily: T.fontDisplay, fontWeight: 700, fontSize: 15, color: T.cyan, letterSpacing: "0.08em", lineHeight: 1.1 }}>
              SentinelX
            </Typography>
            <Typography sx={{ fontFamily: T.fontMono, fontSize: 8.5, color: T.textMuted, letterSpacing: "0.18em" }}>
              SURVEILLANCE
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ borderColor: T.border }} />

        {/* Nav label */}
        <Typography sx={{ fontFamily: T.fontMono, fontSize: 9, color: T.textMuted, letterSpacing: "0.2em", px: "18px", pt: 2, pb: 0.5 }}>
          NAVIGATION
        </Typography>

        <List dense sx={{ px: 1 }}>
          {menu.map((item) => (
            <ListItemButton
              key={item.text}
              onClick={() => navigate(item.path)}
              selected={location.pathname === item.path}
              sx={{
                borderRadius: "6px", mb: "2px", py: 1,
                borderLeft: location.pathname === item.path ? `2px solid ${T.cyan}` : "2px solid transparent",
                "&.Mui-selected": { background: "rgba(0,229,255,0.09)", color: T.cyan },
                "&:hover": { background: "rgba(0,229,255,0.06)" },
                color: T.textMuted,
              }}
            >
              <ListItemIcon sx={{ color: "inherit", minWidth: 32 }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} primaryTypographyProps={{ fontSize: 13, fontWeight: 600, letterSpacing: "0.04em" }} />
              {item.badge && (
                <Box sx={{
                  background: "rgba(255,23,68,0.18)", border: "1px solid rgba(255,23,68,0.35)",
                  color: "#ff6090", fontFamily: T.fontMono, fontSize: 9,
                  px: "6px", py: "1px", borderRadius: "10px",
                }}>
                  {item.badge}
                </Box>
              )}
            </ListItemButton>
          ))}
        </List>

        <Divider sx={{ borderColor: T.border, mx: 1, my: 0.5 }} />

        <Typography sx={{ fontFamily: T.fontMono, fontSize: 9, color: T.textMuted, letterSpacing: "0.2em", px: "18px", pt: 1, pb: 0.5 }}>
          CAMERAS
        </Typography>

        <List dense sx={{ px: 1 }}>
          {cameraMenu.map((item) => (
            <ListItemButton
              key={item.text}
              onClick={() => navigate(item.path)}
              selected={location.pathname === item.path}
              sx={{
                borderRadius: "6px", mb: "2px", py: 1,
                borderLeft: location.pathname === item.path ? `2px solid ${T.cyan}` : "2px solid transparent",
                "&.Mui-selected": { background: "rgba(0,229,255,0.09)", color: T.cyan },
                "&:hover": { background: "rgba(0,229,255,0.06)" },
                color: T.textMuted,
              }}
            >
              <ListItemIcon sx={{ color: "inherit", minWidth: 32 }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} primaryTypographyProps={{ fontSize: 13, fontWeight: 600, letterSpacing: "0.04em" }} />
              {item.badge && (
                <Box sx={{
                  background: "rgba(0,229,255,0.12)", border: `1px solid ${T.borderGlow}`,
                  color: T.cyan, fontFamily: T.fontMono, fontSize: 9,
                  px: "6px", py: "1px", borderRadius: "10px",
                }}>
                  {item.badge}
                </Box>
              )}
            </ListItemButton>
          ))}
        </List>

        <Divider sx={{ borderColor: T.border, mx: 1, my: 0.5 }} />

        {/* Logout */}
        <List dense sx={{ px: 1 }}>
          <ListItemButton
            onClick={handleLogout}
            sx={{ borderRadius: "6px", color: "#f87171", "&:hover": { background: "rgba(248,113,113,0.08)" } }}
          >
            <ListItemIcon sx={{ color: "inherit", minWidth: 32 }}><LogoutIcon sx={{ fontSize: 18 }} /></ListItemIcon>
            <ListItemText primary="Logout" primaryTypographyProps={{ fontSize: 13, fontWeight: 600, letterSpacing: "0.04em" }} />
          </ListItemButton>
        </List>

        {/* User Card */}
        <Box sx={{ mt: "auto", p: "12px 14px" }}>
          <Box sx={{
            background: T.card, border: `1px solid ${T.border}`,
            borderRadius: "8px", p: "10px 12px",
            display: "flex", alignItems: "center", gap: 1.2,
          }}>
            <Box sx={{
              width: 32, height: 32, borderRadius: "50%",
              background: "linear-gradient(135deg, #005060, #001a25)",
              border: `1.5px solid ${T.cyan}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: T.fontMono, fontSize: 11, color: T.cyan, fontWeight: 700,
            }}>AD</Box>
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

        {/* ── TOPBAR ─────────────────────────────────────────────────────── */}
        <AppBar
          position="fixed"
          elevation={0}
          sx={{
            ml: `${drawerWidth}px`,
            width: `calc(100% - ${drawerWidth}px)`,
            background: T.panel,
            borderBottom: `1px solid ${T.border}`,
          }}
        >
          <Toolbar sx={{ gap: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <LiveDot size={8} />
              <Typography sx={{ fontFamily: T.fontMono, fontSize: 12, color: T.textMuted }}>
                SYSTEM ONLINE
              </Typography>
            </Box>

            <Typography sx={{ fontFamily: T.fontMono, fontSize: 12, color: T.textMuted }}>
              {clock}
            </Typography>

            <Box sx={{ flexGrow: 1 }} />

            <Box sx={{
              display: "flex", alignItems: "center", gap: 0.8,
              background: "rgba(255,23,68,0.12)",
              border: "1px solid rgba(255,23,68,0.35)",
              borderRadius: "4px", px: 1.5, py: 0.4,
            }}>
              <NotificationsActiveIcon sx={{ fontSize: 14, color: "#ff6090" }} />
              <Typography sx={{ fontFamily: T.fontMono, fontSize: 11, color: "#ff6090", letterSpacing: "0.06em" }}>
                3 ACTIVE ALERTS
              </Typography>
            </Box>

            <Button
              onClick={handleLogout}
              variant="outlined"
              size="small"
              sx={{
                fontFamily: T.fontDisplay, fontWeight: 600, fontSize: 11,
                letterSpacing: "0.1em", textTransform: "uppercase",
                borderColor: T.border, color: T.textMuted,
                "&:hover": { borderColor: T.cyan, color: T.cyan, background: "rgba(0,229,255,0.05)" },
              }}
            >
              Logout
            </Button>
          </Toolbar>
        </AppBar>

        <Toolbar />

        {/* ── CONTENT ──────────────────────────────────────────────────── */}
        <Box sx={{ p: 3 }}>

          {/* HERO BANNER */}
          <Box sx={{
            background: T.card,
            border: `1px solid ${T.border}`,
            borderRadius: "12px",
            p: "24px 28px",
            mb: 2.5,
            position: "relative",
            overflow: "hidden",
          }}>
            {/* grid texture */}
            <Box sx={{
              position: "absolute", inset: 0, pointerEvents: "none",
              backgroundImage: "linear-gradient(rgba(0,229,255,0.035) 1px,transparent 1px),linear-gradient(90deg,rgba(0,229,255,0.035) 1px,transparent 1px)",
              backgroundSize: "32px 32px",
            }} />
            {/* radial glow */}
            <Box sx={{
              position: "absolute", top: 0, right: 0, width: 220, height: 220, pointerEvents: "none",
              background: "radial-gradient(circle at top right, rgba(0,229,255,0.06) 0%, transparent 70%)",
            }} />

            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
              <Box sx={{ width: 20, height: 1, background: T.cyan }} />
              <Typography sx={{ fontFamily: T.fontMono, fontSize: 10, color: T.cyan, letterSpacing: "0.2em" }}>
                SMART SURVEILLANCE SYSTEM v4.2
              </Typography>
            </Box>
            <Typography sx={{ fontFamily: T.fontDisplay, fontWeight: 700, fontSize: 26, color: T.textPrimary, letterSpacing: "0.04em", mb: 0.5 }}>
              Smart Surveillance Dashboard
            </Typography>
            <Typography sx={{ fontSize: 13, color: T.textMuted }}>
              Monitor, detect and analyze security events in real-time
            </Typography>

            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mt: 2, flexWrap: "wrap" }}>
              <Box sx={{
                display: "flex", alignItems: "center", gap: 0.8,
                background: "rgba(0,230,118,0.1)", border: "1px solid rgba(0,230,118,0.25)",
                borderRadius: "20px", px: 1.5, py: 0.5,
              }}>
                <LiveDot size={7} />
                <Typography sx={{ fontFamily: T.fontMono, fontSize: 11, color: "#66ffa6" }}>All systems operational</Typography>
              </Box>
              <Box sx={{
                display: "flex", alignItems: "center", gap: 0.8,
                background: "rgba(255,171,0,0.1)", border: "1px solid rgba(255,171,0,0.3)",
                borderRadius: "20px", px: 1.5, py: 0.5,
              }}>
                <Typography sx={{ fontSize: 11, color: "#ffd740" }}>⚠</Typography>
                <Typography sx={{ fontFamily: T.fontMono, fontSize: 11, color: "#ffd740" }}>Storage at 85% — action required</Typography>
              </Box>
              <Typography sx={{ ml: "auto", fontFamily: T.fontMono, fontSize: 10, color: T.textMuted }}>
                ZONE A–D MONITORED
              </Typography>
            </Box>
          </Box>

          {/* STAT GRID */}
          <Box sx={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 1.5, mb: 2.5 }}>
            {stats.map((s) => <StatCard key={s.label} {...s} />)}
          </Box>

          {/* MODULE CARDS */}
          <Box sx={{ mb: 1.5 }}>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.5 }}>
              <Typography sx={{ fontFamily: T.fontDisplay, fontWeight: 700, fontSize: 13, color: T.textPrimary, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                System Modules
              </Typography>
              <Typography sx={{ fontFamily: T.fontMono, fontSize: 10, color: T.cyan, cursor: "pointer" }}>
                VIEW ALL →
              </Typography>
            </Box>
            <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 1.5 }}>
              {sections.map((s) => <ModuleCard key={s.title + s.path} {...s} navigate={navigate} />)}
            </Box>
          </Box>

          {/* INCIDENTS + STORAGE */}
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5, mt: 2.5 }}>

            {/* Recent Incidents */}
            <Box sx={glassCard()}>
              <Box sx={{ p: "14px 16px", borderBottom: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Typography sx={{ fontFamily: T.fontDisplay, fontWeight: 700, fontSize: 13, color: T.textPrimary, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                  Recent Incidents
                </Typography>
                <Typography sx={{ fontFamily: T.fontMono, fontSize: 10, color: T.cyan, cursor: "pointer" }} onClick={() => navigate("/incidents")}>
                  VIEW ALL →
                </Typography>
              </Box>
              {incidents.map((inc, i) => {
                const s = severityStyle[inc.severity];
                return (
                  <Box
                    key={i}
                    sx={{
                      p: "11px 16px", borderBottom: i < incidents.length - 1 ? `1px solid ${T.border}` : "none",
                      display: "flex", alignItems: "flex-start", gap: 1.2,
                      cursor: "pointer",
                      "&:hover": { background: "rgba(0,229,255,0.03)" },
                    }}
                  >
                    <CircleIcon sx={{ fontSize: 8, color: inc.color, mt: "5px", flexShrink: 0 }} />
                    <Box sx={{ flex: 1 }}>
                      <Typography sx={{ fontSize: 12, fontWeight: 600, color: T.textPrimary }}>{inc.label}</Typography>
                      <Typography sx={{ fontFamily: T.fontMono, fontSize: 10, color: T.textMuted, mt: "2px" }}>
                        {inc.cam} • {inc.time}
                      </Typography>
                    </Box>
                    <Box sx={{
                      background: s.bg, border: `1px solid ${s.border}`,
                      color: s.color, fontFamily: T.fontMono, fontSize: 9,
                      px: "7px", py: "2px", borderRadius: "3px", flexShrink: 0,
                    }}>
                      {inc.severity}
                    </Box>
                  </Box>
                );
              })}
            </Box>

            {/* Storage Overview */}
            <Box sx={glassCard()}>
              <Box sx={{ p: "14px 16px", borderBottom: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Typography sx={{ fontFamily: T.fontDisplay, fontWeight: 700, fontSize: 13, color: T.textPrimary, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                  Storage Overview
                </Typography>
                <Typography sx={{ fontFamily: T.fontMono, fontSize: 10, color: T.cyan, cursor: "pointer" }}>MANAGE →</Typography>
              </Box>
              <Box sx={{ p: "16px" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
                  <Box sx={{ position: "relative", width: 70, height: 70, flexShrink: 0 }}>
                    <svg viewBox="0 0 70 70" width="70" height="70">
                      <circle cx="35" cy="35" r="28" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
                      <circle cx="35" cy="35" r="28" fill="none" stroke={T.amber} strokeWidth="8"
                        strokeDasharray="175.9" strokeDashoffset="26.4"
                        strokeLinecap="round" transform="rotate(-90 35 35)" opacity="0.85" />
                    </svg>
                    <Box sx={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                      <Typography sx={{ fontFamily: T.fontDisplay, fontWeight: 700, fontSize: 15, color: T.amber, lineHeight: 1 }}>85%</Typography>
                      <Typography sx={{ fontFamily: T.fontMono, fontSize: 8, color: T.textMuted }}>used</Typography>
                    </Box>
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: 13, fontWeight: 700, color: T.textPrimary, mb: 0.4 }}>12 TB Total Capacity</Typography>
                    <Typography sx={{ fontFamily: T.fontMono, fontSize: 10, color: T.textMuted, lineHeight: 1.8 }}>
                      10.2 TB used<br />1.8 TB available<br />Est. full in ~6 days
                    </Typography>
                  </Box>
                </Box>

                {[
                  { name: "CCTV Footage (HD)", size: "6.8 TB", pct: 57, color: T.cyan },
                  { name: "AI Event Clips",    size: "2.1 TB", pct: 17, color: T.purple },
                  { name: "Incident Reports",  size: "0.8 TB", pct: 7,  color: T.amber },
                  { name: "Backups",           size: "0.5 TB", pct: 4,  color: T.green },
                ].map((row) => (
                  <Box key={row.name} sx={{ mb: 1.2 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.3 }}>
                      <Typography sx={{ fontSize: 11, color: T.textMuted }}>{row.name}</Typography>
                      <Typography sx={{ fontFamily: T.fontMono, fontSize: 10, color: T.textPrimary }}>{row.size}</Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={row.pct}
                      sx={{
                        height: 4, borderRadius: 2,
                        background: "rgba(255,255,255,0.06)",
                        "& .MuiLinearProgress-bar": { background: row.color, borderRadius: 2 },
                      }}
                    />
                  </Box>
                ))}

                <Box sx={{
                  mt: 1.5, p: "10px 12px",
                  background: "rgba(255,171,0,0.07)",
                  border: "1px solid rgba(255,171,0,0.22)",
                  borderRadius: "6px",
                }}>
                  <Typography sx={{ fontFamily: T.fontMono, fontSize: 10, color: "#ffd740" }}>
                    ⚠ Storage will reach critical level (95%) in ~6 days. Consider archiving older footage.
                  </Typography>
                </Box>
              </Box>
            </Box>

          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export default Dashboard;
