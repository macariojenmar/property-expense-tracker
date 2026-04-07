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
import PageHeader from "@/components/layout/PageHeader";
import { useCurrency } from "@/components/CurrencyContext";
import { usePropertyStore } from "@/store/usePropertyStore";
import Loader from "@/components/Loader";
import EmptyState from "@/components/EmptyState";

export default function PropertiesPage() {
  const router = useRouter();
  const { formatAmount } = useCurrency();
  const { properties, isLoading } = usePropertyStore();

  if (isLoading) {
    return (
      <DashboardLayout>
        <Loader message="Loading your properties..." />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <PageHeader
        title="Properties"
        subtitle="Manage your property listings and their finances."
        actions={
          <Button
            variant="contained"
            startIcon={<Plus size={18} />}
            onClick={() => router.push("/properties/create")}
            sx={{ width: { xs: "100%", sm: "auto" } }}
          >
            Add Property
          </Button>
        }
      />

      <Grid container spacing={3}>
        {properties.map((property) => (
          <Grid size={{ xs: 12, md: 6 }} key={property.id}>
            <Card
              sx={{
                cursor: "pointer",
                "&:hover": {
                  boxShadow: "none",
                  backgroundColor: "secondary.main",
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
                      borderRadius: 1.5,
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
                        {property.location && property.location !== ""
                          ? property.location
                          : "No location"}
                      </Typography>
                    </Box>
                  </Box>
                </Stack>

                <Divider sx={{ my: 2 }} />

                <Grid container spacing={2}>
                  <Grid size={12}>
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
                      color={
                        property.profit < 0 ? "error.main" : "success.main"
                      }
                    >
                      {formatAmount(property.profit)}
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
              description="Start managing your property listings and their finances by adding your first property."
              fullHeight
            />
          </Grid>
        )}
      </Grid>
    </DashboardLayout>
  );
}
