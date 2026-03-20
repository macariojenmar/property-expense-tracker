"use client";

import * as React from "react";
import { IconButton, useTheme, Tooltip } from "@mui/material";
import { Sun, Moon } from "lucide-react";
import { ColorModeContext } from "@/components/ThemeRegistry";

interface ThemeSwitchProps {
  size?: "small" | "medium" | "large";
  sx?: object;
}

export default function ThemeSwitch({ size = "small", sx = {} }: ThemeSwitchProps) {
  const theme = useTheme();
  const colorMode = React.useContext(ColorModeContext);

  return (
    <Tooltip title={`Switch to ${theme.palette.mode === "dark" ? "light" : "dark"} mode`}>
      <IconButton
        onClick={colorMode.toggleColorMode}
        color="inherit"
        size={size}
        sx={sx}
      >
        {theme.palette.mode === "dark" ? (
          <Sun size={size === "small" ? 22 : 24} />
        ) : (
          <Moon size={size === "small" ? 22 : 24} />
        )}
      </IconButton>
    </Tooltip>
  );
}
