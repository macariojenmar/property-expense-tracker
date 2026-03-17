"use client";

import React from "react";
import { Box, Typography, Link } from "@mui/material";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        px: 2,
        mt: "auto",
        textAlign: "center",
      }}
    >
      <Typography variant="caption" color="text.secondary">
        {"© "}
        {currentYear} Ntorra. All rights reserved. {" Developed by "}
        <Link
          href="https://dev-jenmar.vercel.app/"
          target="_blank"
          rel="noopener noreferrer"
          color="inherit"
          sx={{
            fontWeight: 600,
            textDecoration: "none",
            "&:hover": { textDecoration: "underline" },
          }}
        >
          Jenmar Macario
        </Link>
      </Typography>
    </Box>
  );
}
