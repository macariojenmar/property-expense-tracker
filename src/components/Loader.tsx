"use client";

import * as React from "react";
import { Box, Typography, keyframes, alpha } from "@mui/material";

const pulse = keyframes`
  0% { transform: scale(0.95); opacity: 0.5; }
  50% { transform: scale(1.05); opacity: 1; }
  100% { transform: scale(0.95); opacity: 0.5; }
`;

const rotate = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const dash = keyframes`
  0% { stroke-dasharray: 1, 150; stroke-dashoffset: 0; }
  50% { stroke-dasharray: 90, 150; stroke-dashoffset: -35; }
  100% { stroke-dasharray: 90, 150; stroke-dashoffset: -124; }
`;

interface LoaderProps {
  message?: string;
  fullscreen?: boolean;
  size?: number;
}

export default function Loader({
  message = "Loading...",
  fullscreen = false,
  size = 40,
}: LoaderProps) {
  const content = (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 2,
        p: 3,
        width: "100%",
        height: "73vh",
        minHeight: "200px",
        flex: 1,
        color: "primary.main",
      }}
    >
      <Box
        sx={{
          position: "relative",
          width: size,
          height: size,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Modern Spinner */}
        <Box
          component="svg"
          viewBox="0 0 50 50"
          sx={{
            animation: `${rotate} 2s linear infinite`,
            width: "100%",
            height: "100%",
          }}
        >
          <Box
            component="circle"
            cx="25"
            cy="25"
            r="20"
            fill="none"
            stroke="url(#loader-gradient)"
            strokeWidth="4"
            strokeLinecap="round"
            sx={{
              animation: `${dash} 1.5s ease-in-out infinite`,
            }}
          />
          <defs>
            <linearGradient
              id="loader-gradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor="currentColor" stopOpacity="1" />
              <stop offset="100%" stopColor="currentColor" stopOpacity="0.3" />
            </linearGradient>
          </defs>
        </Box>

        {/* Center Pulse Dot */}
        <Box
          sx={{
            position: "absolute",
            width: size * 0.2,
            height: size * 0.2,
            bgcolor: "currentColor",
            borderRadius: "50%",
            animation: `${pulse} 1.5s ease-in-out infinite`,
            boxShadow: (theme) =>
              `0 0 10px ${alpha(theme.palette.primary.main, 0.4)}`,
          }}
        />
      </Box>

      {message && (
        <Typography
          variant="body2"
          sx={{
            fontWeight: 600,
            letterSpacing: "0.05em",
            textTransform: "uppercase",
            color: "text.secondary",
          }}
        >
          {message}
        </Typography>
      )}
    </Box>
  );

  if (fullscreen) {
    return (
      <Box
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: (theme) => alpha(theme.palette.background.default, 0.8),
          backdropFilter: "blur(8px)",
          zIndex: 9999,
        }}
      >
        {content}
      </Box>
    );
  }

  return content;
}
