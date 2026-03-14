"use client";

import * as React from "react";
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Avatar,
  useTheme,
} from "@mui/material";
import {
  Building2,
  WalletCards,
  Settings,
  Menu,
  LogOut,
  Sun,
  Moon,
  LayoutDashboard,
  BanknoteArrowDown,
  BookText,
} from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import PropertySwitcher from "@/components/layout/PropertySwitcher";
import { ColorModeContext } from "@/components/ThemeRegistry";
import { alpha } from "@mui/material/styles";

import { usePropertyStore } from "@/store/usePropertyStore";

const drawerWidth = 240;

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const theme = useTheme();
  const pathname = usePathname();
  const colorMode = React.useContext(ColorModeContext);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const { selectedProperty, setSelectedProperty } = usePropertyStore();

  const menuItems = React.useMemo(() => {
    const baseItems: Array<{
      text: string;
      icon: React.ReactNode;
      path: string;
      indent?: boolean;
    }> = [
      {
        text: "Dashboard",
        icon: <LayoutDashboard size={20} />,
        path: "/dashboard",
      },
      {
        text: "Properties",
        icon: <Building2 size={20} />,
        path: "/properties",
      },
    ];

    if (selectedProperty) {
      baseItems.push(
        {
          text: "Expenses",
          icon: <BanknoteArrowDown size={20} />,
          path: `/properties/${selectedProperty.id}/expenses`,
          indent: true,
        },
        {
          text: "Payouts",
          icon: <WalletCards size={20} />,
          path: `/properties/${selectedProperty.id}/payouts`,
          indent: true,
        },
      );
    }

    baseItems.push({
      text: "Dictionary",
      icon: <BookText size={20} />,
      path: "/dictionary",
    });

    return baseItems;
  }, [selectedProperty]);

  // Automatically clear context when navigating back to the main properties list
  React.useEffect(() => {
    if (pathname === "/properties") {
      setSelectedProperty(null);
    }
  }, [pathname, setSelectedProperty]);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawer = (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <Toolbar>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            letterSpacing: "-0.02em",
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <Box
            sx={{
              width: 24,
              height: 24,
              bgcolor: "primary.main",
              borderRadius: 0.5,
            }}
          />
          PropertyTracker
        </Typography>
      </Toolbar>
      <Divider />
      <List sx={{ px: 1, py: 2, flexGrow: 1 }}>
        {menuItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => {
                  if (item.text === "Dashboard" || item.text === "Properties") {
                    setSelectedProperty(null);
                  }
                  router.push(item.path);
                }}
                selected={isActive}
                sx={{
                  borderRadius: 2,
                  pl: item.indent ? 5 : 2,
                  "&.Mui-selected": {
                    bgcolor:
                      theme.palette.mode === "light"
                        ? "rgba(0,0,0,0.06)"
                        : "rgba(255,255,255,0.1)",
                    color: "text.primary",
                    "& .MuiListItemIcon-root": { color: "primary.main" },
                    "&:hover": {
                      bgcolor:
                        theme.palette.mode === "light"
                          ? "rgba(0,0,0,0.08)"
                          : "rgba(255,255,255,0.15)",
                    },
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 40,
                    color: isActive ? "primary.main" : "text.secondary",
                    opacity: isActive ? 1 : 0.7,
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{
                    fontSize: 14,
                    fontWeight: isActive ? 600 : 500,
                    sx: { color: isActive ? "text.primary" : "text.secondary" },
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
      <Divider />
      <List sx={{ px: 1, py: 2 }}>
        <ListItem disablePadding>
          <ListItemButton
            onClick={() => router.push("/settings")}
            selected={pathname === "/settings"}
            sx={{
              borderRadius: 2,
              "&.Mui-selected": {
                bgcolor:
                  theme.palette.mode === "light"
                    ? "rgba(0,0,0,0.06)"
                    : "rgba(255,255,255,0.1)",
                color: "text.primary",
                "& .MuiListItemIcon-root": { color: "primary.main" },
                "&:hover": {
                  bgcolor:
                    theme.palette.mode === "light"
                      ? "rgba(0,0,0,0.08)"
                      : "rgba(255,255,255,0.15)",
                },
              },
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 40,
                color:
                  pathname === "/settings" ? "primary.main" : "text.secondary",
                opacity: pathname === "/settings" ? 1 : 0.7,
              }}
            >
              <Settings size={20} />
            </ListItemIcon>
            <ListItemText
              primary="Settings"
              primaryTypographyProps={{
                fontSize: 14,
                fontWeight: pathname === "/settings" ? 600 : 500,
                sx: {
                  color:
                    pathname === "/settings"
                      ? "text.primary"
                      : "text.secondary",
                },
              }}
            />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton sx={{ borderRadius: 2, color: "error.main" }}>
            <ListItemIcon sx={{ minWidth: 40, color: "error.main" }}>
              <LogOut size={20} />
            </ListItemIcon>
            <ListItemText
              primary="Logout"
              primaryTypographyProps={{ fontSize: 14, fontWeight: 500 }}
            />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        bgcolor: "background.default",
      }}
    >
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          bgcolor: "background.paper",
          color: "text.primary",
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
        elevation={0}
      >
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: "none" } }}
          >
            <Menu />
          </IconButton>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <PropertySwitcher />
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <IconButton
              onClick={colorMode.toggleColorMode}
              color="inherit"
              size="small"
            >
              {theme.palette.mode === "dark" ? (
                <Sun size={20} />
              ) : (
                <Moon size={20} />
              )}
            </IconButton>
            <Avatar
              sx={{
                width: 32,
                height: 32,
                fontSize: 14,
                bgcolor: "primary.main",
                ml: 1,
              }}
            >
              JD
            </Avatar>
          </Box>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: "block", sm: "none" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
              borderRight: "1px solid",
              borderColor: "divider",
              boxShadow: "none",
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", sm: "block" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
              borderRight: "1px solid",
              borderColor: "divider",
              boxShadow: "none",
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          mt: "64px",
          display: "flex",
          flexDirection: "column",
          overflow: "auto",
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
