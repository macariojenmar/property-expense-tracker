"use client";

import { createTheme, ThemeOptions } from "@mui/material/styles";

// Vercel/Supabase inspired theme generator
export const getThemeOptions = (mode: "light" | "dark"): ThemeOptions => ({
  palette: {
    mode,
    primary: {
      main: mode === "light" ? "#000000" : "#ffffff",
    },
    secondary: {
      main: "#666666",
    },
    background: {
      default: mode === "light" ? "#ffffff" : "#000000",
      paper: mode === "light" ? "#ffffff" : "#000000",
    },
    text: {
      primary: mode === "light" ? "#000000" : "#ffffff",
      secondary: "#666666",
    },
    divider:
      mode === "light" ? "rgba(0, 0, 0, 0.06)" : "rgba(255, 255, 255, 0.1)",
  },
  typography: {
    fontFamily: "var(--font-geist-sans), Inter, system-ui, sans-serif",
    h1: { fontSize: "2.5rem", fontWeight: 600, letterSpacing: "-0.02em" },
    h2: { fontSize: "2rem", fontWeight: 600, letterSpacing: "-0.02em" },
    h3: { fontSize: "1.5rem", fontWeight: 600, letterSpacing: "-0.02em" },
    button: { textTransform: "none", fontWeight: 500 },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          boxShadow: "none",
          "&:hover": {
            boxShadow: "none",
          },
        },
        containedPrimary: {
          backgroundColor: mode === "light" ? "#000" : "#fff",
          color: mode === "light" ? "#fff" : "#000",
          "&:hover": {
            backgroundColor: mode === "light" ? "#333" : "#ccc",
          },
        },
        outlined: {
          borderColor: mode === "light" ? "#eaeaea" : "#333333",
          color: mode === "light" ? "#000" : "#fff",
          "&:hover": {
            backgroundColor: mode === "light" ? "#f5f5f5" : "#111",
            borderColor: mode === "light" ? "#ddd" : "#444",
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          border: `1px solid ${mode === "light" ? "rgba(0, 0, 0, 0.06)" : "rgba(255, 255, 255, 0.1)"}`,
          backgroundColor: mode === "light" ? "#ffffff" : "#000000",
          boxShadow: "none",
          borderRadius: 12,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          boxShadow: "none",
          border: `1px solid ${mode === "light" ? "rgba(0, 0, 0, 0.06)" : "rgba(255, 255, 255, 0.1)"}`,
          backgroundColor: mode === "light" ? "#ffffff" : "#000000",
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderColor:
            mode === "light"
              ? "rgba(0, 0, 0, 0.06)"
              : "rgba(255, 255, 255, 0.1)",
        },
      },
    },
  },
});

const theme = createTheme(getThemeOptions("light"));
export default theme;
