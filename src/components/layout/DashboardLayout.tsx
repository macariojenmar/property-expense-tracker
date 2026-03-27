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
  IconButton,
  useTheme,
  LinearProgress,
  Container,
  Stack,
} from "@mui/material";
import {
  Building2,
  WalletCards,
  Settings,
  Menu as MenuIcon,
  LogOut,
  LayoutDashboard,
  BanknoteArrowDown,
  BookText,
  ShieldCheck,
  Users,
} from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import PropertySwitcher from "@/components/layout/PropertySwitcher";
import ThemeSwitch from "@/components/layout/ThemeSwitch";
import Image from "next/image";
import { usePropertyStore } from "@/store/usePropertyStore";
import Footer from "./Footer";
import SidebarItem from "./SidebarItem";
import AccountMenu from "./AccountMenu";
import TrialBanner from "./TrialBanner";
import PricingDialog from "@/components/PricingDialog";
import { differenceInDays } from "date-fns";

const drawerWidth = 240;

export default function DashboardLayout({
  children,
  width = "lg",
}: {
  children: React.ReactNode;
  width?: "sm" | "md" | "lg" | "xl";
}) {
  const router = useRouter();
  const theme = useTheme();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const { data: session } = useSession();
  const { selectedProperty, setSelectedProperty, isSaving, isLoading } =
    usePropertyStore();
  const [pricingOpen, setPricingOpen] = React.useState(false);

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
        },
      );
    }

    mainItems.push(
      {
        text: "Entities",
        icon: <Users size={20} />,
        path: "/entities",
      },
      {
        text: "Dictionary",
        icon: <BookText size={20} />,
        path: "/dictionary",
      },
    );

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
        },
        {
          text: "Platform Setting",
          icon: <Settings size={20} />,
          path: "/platform/settings",
        },
      );
    }

    return { mainItems, platformItems };
  }, [selectedProperty, session]);

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
          onClick={() => router.push("/dashboard")}
          variant="h6"
          sx={{
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            gap: 1,
            cursor: "pointer",
          }}
        >
          <Image src="/ntorra.svg" alt="Ntorra Logo" width={28} height={28} />
          Ntorra
        </Typography>
      </Toolbar>
      <Divider />
      <List sx={{ px: 1, py: 2, flexGrow: 1 }}>
        {menuGroups.mainItems.map((item) => (
          <SidebarItem
            key={item.text}
            text={item.text}
            icon={item.icon}
            isActive={pathname === item.path}
            indent={item.indent}
            onClick={() => {
              if (item.text === "Dashboard" || item.text === "Properties") {
                setSelectedProperty(null);
              }
              router.push(item.path);
            }}
          />
        ))}

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
            {menuGroups.platformItems.map((item) => (
              <SidebarItem
                key={item.text}
                text={item.text}
                icon={item.icon}
                isActive={pathname === item.path}
                onClick={() => router.push(item.path)}
              />
            ))}
          </Box>
        )}
      </List>
      <Divider />
      <List sx={{ px: 1, py: 2 }}>
        <SidebarItem
          text="Settings"
          icon={<Settings size={20} />}
          isActive={pathname === "/settings"}
          onClick={() => router.push("/settings")}
        />
        <SidebarItem
          text="Logout"
          icon={<LogOut size={20} />}
          isActive={false}
          onClick={() => signOut({ callbackUrl: "/login" })}
          color="error.main"
        />
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
            <ThemeSwitch />
            <AccountMenu />
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
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          mt: "64px",
          display: "flex",
          flexDirection: "column",
          overflow: "auto",
        }}
      >
        <Box mb={{ xs: 2, md: 4 }}>
          {session?.user?.accountType === "TRIAL" && (
            <TrialBanner
              daysRemaining={
                session.user.expiredAt
                  ? Math.max(
                      0,
                      differenceInDays(
                        new Date(session.user.expiredAt),
                        new Date(),
                      ),
                    )
                  : 0
              }
              onUpgrade={() => setPricingOpen(true)}
            />
          )}
        </Box>
        <Container maxWidth={width}>{children}</Container>
        <Footer />
        <PricingDialog
          open={pricingOpen}
          onClose={() => setPricingOpen(false)}
        />
      </Box>
    </Box>
  );
}
