"use client";

import { createTheme, ThemeOptions } from "@mui/material/styles";

export const DARK = "dark";
export const LIGHT = "light";
export const BOX_SHADOW = "0 1px 3px rgba(0, 0, 0, 0.08)";

export const PURPLE = "#8B5CF6";
export const ORANGE = "#FF9800";
export const BLUE = "#2196F3";
export const GREEN = "#4CAF50";
export const RED = "#FA5B45";

export const getThemeOptions = (mode: "light" | "dark"): ThemeOptions => ({
  palette: {
    mode,
    primary: {
      main: mode === LIGHT ? "#000000" : "#ffffff",
    },
    secondary: {
      main: mode === LIGHT ? "#f5f5f5ff" : "#080808ff",
      dark: mode === LIGHT ? "#dadadaff" : "rgba(27, 27, 27, 1)",
    },
    background: {
      default: mode === LIGHT ? "#ffffff" : "#000000",
      paper: mode === LIGHT ? "#ffffff" : "#000000",
    },
    text: {
      primary: mode === LIGHT ? "#000000" : "#ffffff",
      secondary: "#666666",
    },
    divider: mode === LIGHT ? "rgba(0, 0, 0, 0.1)" : "rgba(255, 255, 255, 0.1)",
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
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: 12,
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          height: 46,
          padding: "0 30px",
          boxShadow: "none",
          "&:hover": {
            boxShadow: "none",
          },
        },
        containedPrimary: {
          backgroundColor: mode === LIGHT ? "#000" : "#fff",
          color: mode === LIGHT ? "#fff" : "#000",
          "&:hover": {
            backgroundColor: mode === LIGHT ? "#333" : "#ccc",
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          border: `1px solid ${mode === LIGHT ? "rgba(0, 0, 0, 0.1)" : "rgba(255, 255, 255, 0.1)"}`,
          backgroundColor: mode === LIGHT ? "#ffffff" : "#000000",
          boxShadow: "none",
          borderRadius: 12,
          transition: "all 0.3s ease",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          boxShadow: "none",
          border: `1px solid ${mode === LIGHT ? "rgba(0, 0, 0, 0.1)" : "rgba(255, 255, 255, 0.1)"}`,
          backgroundColor: mode === LIGHT ? "#ffffff" : "#000000",
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderColor:
            mode === LIGHT ? "rgba(0, 0, 0, 0.1)" : "rgba(255, 255, 255, 0.1)",
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          boxShadow: "none",
        },
      },
      defaultProps: {
        slotProps: {
          backdrop: {
            sx: {
              backgroundColor:
                mode === LIGHT ? "rgba(0, 0, 0, 0.7)" : "rgba(0, 0, 0, 0.8)",
            },
          },
        },
      },
    },
  },
});

const theme = createTheme(getThemeOptions(LIGHT));
export default theme;
