"use client";

import * as React from "react";
import { Box, Typography, alpha, keyframes } from "@mui/material";
import { LucideIcon } from "lucide-react";

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  fullHeight?: boolean;
}

export default function EmptyState({
  icon: Icon,
  title,
  description,
  fullHeight = false,
}: EmptyStateProps) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        p: 6,
        borderRadius: 4,
        bgcolor: (theme) => alpha(theme.palette.primary.main, 0.02),
        border: "1px dashed",
        borderColor: (theme) => alpha(theme.palette.primary.main, 0.2),
        minHeight: fullHeight ? "70vh" : 320,
        height: "100%",
        overflow: "hidden",
        transition: "all 0.3s ease",
        animation: `${fadeIn} 0.6s ease-out forwards`,
        flexGrow: 1,
        width: "100%",
        boxSizing: "border-box",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 84,
          height: 84,
          borderRadius: "24px",
          bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
          color: "primary.main",
          mb: 3,
          position: "relative",
          "&::after": {
            content: '""',
            position: "absolute",
            inset: -4,
            borderRadius: "28px",
            border: "1px solid",
            borderColor: (theme) => alpha(theme.palette.primary.main, 0.1),
            opacity: 0.5,
          },
        }}
      >
        <Icon size={42} strokeWidth={1.5} />
      </Box>
      <Typography variant="h5" sx={{ fontWeight: 800, mb: 1.5, letterSpacing: "-0.01em" }}>
        {title}
      </Typography>
      <Typography
        variant="body1"
        color="text.secondary"
        sx={{ maxWidth: 440, mb: 0, mx: "auto", lineHeight: 1.6, opacity: 0.8 }}
      >
        {description}
      </Typography>
    </Box>
  );
}
