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
  LinearProgress,
  Menu,
  MenuItem,
  Tooltip,
} from "@mui/material";
import {
  Building2,
  WalletCards,
  Settings,
  Menu as MenuIcon,
  LogOut,
  Sun,
  Moon,
  LayoutDashboard,
  BanknoteArrowDown,
  BookText,
  ShieldCheck,
  Users,
} from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import PropertySwitcher from "@/components/layout/PropertySwitcher";
import { ColorModeContext } from "@/components/ThemeRegistry";
import Image from "next/image";
import { usePropertyStore } from "@/store/usePropertyStore";
import Footer from "./Footer";

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
  const { data: session } = useSession();
  const { selectedProperty, setSelectedProperty, isSaving, isLoading } =
    usePropertyStore();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleProfileClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileClose = () => {
    setAnchorEl(null);
  };

  const menuGroups = React.useMemo(() => {
    const mainItems: Array<{
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
      mainItems.push(
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
        }
      );
    }

    mainItems.push({
      text: "Dictionary",
      icon: <BookText size={20} />,
      path: "/dictionary",
    });

    const platformItems: Array<{
      text: string;
      icon: React.ReactNode;
      path: string;
      indent?: boolean;
    }> = [];

    if (session?.user?.role === "DEVELOPER") {
      platformItems.push(
        {
          text: "User Management",
          icon: <Users size={20} />,
          path: "/platform/users",
        },
        {
          text: "Roles & Permissions",
          icon: <ShieldCheck size={20} />,
          path: "/platform/roles",
        }
      );
    }

    return { mainItems, platformItems };
  }, [selectedProperty, session]);

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
      <Toolbar sx={{ display: "flex", justifyContent: "center" }}>
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
          <Image
            src="/ntorra.svg"
            alt="Ntorra Logo"
            width={28}
            height={28}
            style={{ borderRadius: "4px" }}
          />
          Ntorra
        </Typography>
      </Toolbar>
      <Divider />
      <List sx={{ px: 1, py: 2, flexGrow: 1 }}>
        {menuGroups.mainItems.map((item) => {
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

        {menuGroups.platformItems.length > 0 && (
          <Box sx={{ mt: 3 }}>
            <Typography
              variant="caption"
              sx={{
                px: 2,
                pb: 1,
                display: "block",
                color: "text.secondary",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              Platform Management
            </Typography>
            {menuGroups.platformItems.map((item) => {
              const isActive = pathname === item.path;
              return (
                <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
                  <ListItemButton
                    onClick={() => router.push(item.path)}
                    selected={isActive}
                    sx={{
                      borderRadius: 2,
                      pl: 2,
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
                        sx: {
                          color: isActive ? "text.primary" : "text.secondary",
                        },
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              );
            })}
          </Box>
        )}
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
          <ListItemButton
            sx={{ borderRadius: 2, color: "error.main" }}
            onClick={() => signOut({ callbackUrl: "/login" })}
          >
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
            <MenuIcon />
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
                <Sun size={22} />
              ) : (
                <Moon size={22} />
              )}
            </IconButton>
            <Tooltip title="Account settings">
              <IconButton
                onClick={handleProfileClick}
                size="small"
                sx={{ ml: 1, p: 0.5 }}
                aria-controls={open ? "account-menu" : undefined}
                aria-haspopup="true"
                aria-expanded={open ? "true" : undefined}
              >
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
                    : "U"}
                </Avatar>
              </IconButton>
            </Tooltip>
            <Menu
              anchorEl={anchorEl}
              id="account-menu"
              open={open}
              onClose={handleProfileClose}
              onClick={handleProfileClose}
              transformOrigin={{ horizontal: "right", vertical: "top" }}
              anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
              PaperProps={{
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
              }}
            >
              <Box sx={{ px: 2, py: 1.5 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                  {session?.user?.name || "User"}
                </Typography>
                <Typography variant="body2" color="text.secondary" noWrap>
                  {session?.user?.email}
                </Typography>
              </Box>
              <Divider />
              <MenuItem onClick={() => router.push("/settings")} sx={{ py: 1.2 }}>
                <ListItemIcon>
                  <Settings size={18} />
                </ListItemIcon>
                <Typography variant="body2">Settings</Typography>
              </MenuItem>
              <MenuItem 
                onClick={() => signOut({ callbackUrl: "/login" })}
                sx={{ py: 1.2, color: "error.main" }}
              >
                <ListItemIcon sx={{ color: "error.main" }}>
                  <LogOut size={18} />
                </ListItemIcon>
                <Typography variant="body2">Logout</Typography>
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
        {(isSaving || isLoading) && (
          <LinearProgress
            sx={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: 2,
              zIndex: (theme) => theme.zIndex.appBar + 1,
            }}
          />
        )}
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
        <Footer />
      </Box>
    </Box>
  );
}
