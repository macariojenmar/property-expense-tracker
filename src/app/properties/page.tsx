"use client";

import * as React from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  Stack,
  Avatar,
  Divider,
  alpha,
} from "@mui/material";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Plus, Home, MapPin, Wallet, TrendingUp } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCurrency } from "@/components/CurrencyContext";
import { usePropertyStore } from "@/store/usePropertyStore";
import { getProperties } from "@/lib/actions/property";
import Loader from "@/components/Loader";
import EmptyState from "@/components/EmptyState";

export default function PropertiesPage() {
  const router = useRouter();
  const { formatAmount } = useCurrency();
  const { properties, setProperties } = usePropertyStore();
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await getProperties();
        setProperties(data as any);
      } catch (error) {
        console.error("Failed to fetch properties:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [setProperties]);

  if (loading) {
    return (
      <DashboardLayout>
        <Loader message="Loading your properties..." />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Box
        sx={{
          mb: 4,
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          justifyContent: "space-between",
          alignItems: { xs: "stretch", sm: "center" },
          gap: 2,
        }}
      >
        <Box>
          <Typography variant="h4" sx={{ mb: 0.5, fontWeight: 700 }}>
            Properties
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage your Airbnb listings and their finances.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Plus size={18} />}
          onClick={() => router.push("/properties/create")}
          fullWidth={{ xs: true, sm: false } as any}
        >
          Add Property
        </Button>
      </Box>

      <Grid container spacing={3}>
        {properties.map((property) => (
          <Grid size={{ xs: 12, md: 6 }} key={property.id}>
            <Card
              sx={{
                cursor: "pointer",
                transition: "all 0.2s",
                "&:hover": {
                  bgcolor: (theme) => alpha(theme.palette.primary.main, 0.04),
                },
              }}
              onClick={() => router.push(`/properties/${property.id}`)}
            >
              <CardContent>
                <Stack
                  direction="row"
                  spacing={2}
                  alignItems="center"
                  sx={{ mb: 2 }}
                >
                  <Avatar
                    sx={{
                      bgcolor: "action.hover",
                      color: "text.primary",
                      borderRadius: 2,
                      border: "1px solid",
                      borderColor: "divider",
                    }}
                  >
                    <Home size={20} />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {property.name}
                    </Typography>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 0.5,
                        color: "text.secondary",
                      }}
                    >
                      <MapPin size={14} />
                      <Typography variant="caption">
                        {property.location}
                      </Typography>
                    </Box>
                  </Box>
                </Stack>

                <Divider sx={{ my: 2 }} />

                <Grid container spacing={2}>
                  <Grid size={6}>
                    <Stack
                      direction="row"
                      spacing={0.5}
                      alignItems="center"
                      sx={{ mb: 0.5 }}
                    >
                      <TrendingUp size={14} color="#10b981" />
                      <Typography variant="caption" color="text.secondary">
                        Total Profit
                      </Typography>
                    </Stack>
                    <Typography
                      variant="h6"
                      fontWeight={600}
                      color={property.profit < 0 ? "error.main" : "success.main"}
                    >
                      {formatAmount(property.profit)}
                    </Typography>
                  </Grid>

                  <Grid size={6}>
                    <Stack
                      direction="row"
                      spacing={0.5}
                      alignItems="center"
                      sx={{ mb: 0.5 }}
                    >
                      <Wallet size={14} color="gray" />
                      <Typography variant="caption" color="text.secondary">
                        Funds
                      </Typography>
                    </Stack>
                    <Typography
                      variant="h6"
                      fontWeight={600}
                      color={property.funds < 0 ? "error.main" : "text.primary"}
                      sx={{ opacity: property.funds < 0 ? 1 : 0.8 }}
                    >
                      {formatAmount(property.funds)}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        ))}
        {properties.length === 0 && (
          <Grid size={12}>
            <EmptyState
              icon={Home}
              title="No properties found"
              description="Start managing your Airbnb listings and their finances by adding your first property."
              fullHeight
            />
          </Grid>
        )}
      </Grid>
    </DashboardLayout>
  );
}
