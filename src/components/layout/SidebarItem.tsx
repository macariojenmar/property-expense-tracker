"use client";

import React from "react";
import {
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  useTheme,
  SxProps,
  Theme,
} from "@mui/material";

interface SidebarItemProps {
  text: string;
  icon: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
  indent?: boolean;
  color?: string;
}

const SidebarItem: React.FC<SidebarItemProps> = ({
  text,
  icon,
  isActive,
  onClick,
  indent = false,
  color,
}) => {
  const theme = useTheme();

  const selectedSx: SxProps<Theme> = {
    bgcolor: theme.palette.secondary.main,
    color: color || "text.primary",
    "& .MuiListItemIcon-root": { color: color || "primary.main" },
  };

  return (
    <ListItem disablePadding sx={{ mb: 0.5 }}>
      <ListItemButton
        onClick={onClick}
        selected={isActive}
        sx={{
          borderRadius: 2,
          pl: indent ? 5 : 2,
          color: color,
          "&.Mui-selected": {
            ...selectedSx,
            "&:hover": selectedSx,
          },
        }}
      >
        <ListItemIcon
          sx={{
            minWidth: 40,
            color: color || (isActive ? "primary.main" : "text.secondary"),
            opacity: isActive ? 1 : 0.7,
          }}
        >
          {icon}
        </ListItemIcon>
        <ListItemText
          primary={text}
          slotProps={{
            primary: {
              fontSize: 14,
              fontWeight: isActive ? 600 : 500,
              sx: {
                color: color || (isActive ? "text.primary" : "text.secondary"),
              },
            },
          }}
        />
      </ListItemButton>
    </ListItem>
  );
};

export default SidebarItem;
