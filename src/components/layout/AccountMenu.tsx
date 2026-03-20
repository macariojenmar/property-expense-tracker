"use client";

import * as React from "react";
import {
  Box,
  Avatar,
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
  Typography,
  Divider,
  Stack,
  Chip,
} from "@mui/material";
import { Settings, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import Image from "next/image";

export default function AccountMenu() {
  const router = useRouter();
  const { data: session } = useSession();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleClose();
    signOut({ callbackUrl: "/login" });
  };

  const handleSettings = () => {
    handleClose();
    router.push("/settings");
  };

  return (
    <React.Fragment>
      <Tooltip title="Account settings">
        <IconButton
          onClick={handleClick}
          size="small"
          sx={{ ml: 1, p: 0.5 }}
          aria-controls={open ? "account-menu" : undefined}
          aria-haspopup="true"
          aria-expanded={open ? "true" : undefined}
        >
          {session?.user?.image ? (
            <Image
              src={session.user.image}
              alt={session.user.name || "User avatar"}
              width={32}
              height={32}
              style={{ borderRadius: "50%" }}
            />
          ) : (
            <Avatar
              sx={{
                width: 32,
                height: 32,
                fontSize: 14,
                bgcolor: "primary.main",
              }}
            >
              {session?.user?.name
                ? session.user.name.charAt(0).toUpperCase()
                : "A"}
            </Avatar>
          )}
        </IconButton>
      </Tooltip>
      <Menu
        anchorEl={anchorEl}
        id="account-menu"
        open={open}
        onClose={handleClose}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        slotProps={{
          paper: {
            elevation: 0,
            sx: {
              overflow: "visible",
              filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.12))",
              mt: 1.5,
              minWidth: 200,
              "& .MuiAvatar-root": {
                width: 32,
                height: 32,
                ml: -0.5,
                mr: 1,
              },
              "&::before": {
                content: '""',
                display: "block",
                position: "absolute",
                top: 0,
                right: 14,
                width: 10,
                height: 10,
                bgcolor: "background.paper",
                transform: "translateY(-50%) rotate(45deg)",
                zIndex: 0,
              },
            },
          },
        }}
      >
        <Box sx={{ px: 2, py: 1.5 }}>
          <Stack
            direction={"row"}
            alignItems={"center"}
            justifyContent={"space-between"}
          >
            <Typography
              variant="body1"
              sx={{ fontWeight: 700 }}
              width={100}
              noWrap
            >
              {session?.user?.name || "User"}
            </Typography>
            <Chip
              label={session?.user?.accountType}
              size="small"
              sx={{
                fontWeight: 700,
                fontSize: 11,
              }}
            />
          </Stack>
          <Typography
            variant="caption"
            color="text.secondary"
            noWrap
            lineHeight={0}
          >
            {session?.user?.email}
          </Typography>
        </Box>
        <Divider />
        <MenuItem onClick={handleSettings} sx={{ py: 1.2 }}>
          <ListItemIcon>
            <Settings size={18} />
          </ListItemIcon>
          <Typography variant="body2">Settings</Typography>
        </MenuItem>
        <MenuItem onClick={handleLogout} sx={{ py: 1.2, color: "error.main" }}>
          <ListItemIcon sx={{ color: "error.main" }}>
            <LogOut size={18} />
          </ListItemIcon>
          <Typography variant="body2">Logout</Typography>
        </MenuItem>
      </Menu>
    </React.Fragment>
  );
}
