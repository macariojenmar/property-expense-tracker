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
} from "@mui/material";
import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  Plus,
  Home,
  MapPin,
  Wallet,
  Calculator,
  TrendingUp,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCurrency } from "@/components/CurrencyContext";

const properties = [
  {
    id: 1,
    name: "Seaside Sanctuary",
    location: "Siargao, Philippines",
    price: 5000,
    funds: 25000,
    profit: 8500,
    estimatedFunds: 32000,
    estimatedProfit: 12000,
  },
  {
    id: 2,
    name: "Mountain Retreat",
    location: "Bagui, Philippines",
    price: 3500,
    funds: 12000,
    profit: 4200,
    estimatedFunds: 15500,
    estimatedProfit: 6800,
  },
];
export default function PropertiesPage() {
  const router = useRouter();
  const { formatAmount } = useCurrency();

  return (
    <DashboardLayout>
      <Box
        sx={{
          mb: 4,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Box>
          <Typography variant="h4" sx={{ mb: 1 }}>
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
                "&:hover": { bgcolor: "action.hover" },
              }}
              onClick={() => {}}
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
                        Current Profit
                      </Typography>
                    </Stack>
                    <Typography
                      variant="h6"
                      fontWeight={600}
                      color="success.main"
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
                      <TrendingUp size={14} color="#3b82f6" />
                      <Typography variant="caption" color="text.secondary">
                        Estimated Profit
                      </Typography>
                    </Stack>
                    <Typography
                      variant="h6"
                      fontWeight={600}
                      color="primary.main"
                    >
                      {formatAmount(property.estimatedProfit)}
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
                        Current Funds
                      </Typography>
                    </Stack>
                    <Typography
                      variant="h6"
                      fontWeight={500}
                      color="text.secondary"
                      sx={{ opacity: 0.8 }}
                    >
                      {formatAmount(property.funds)}
                    </Typography>
                  </Grid>
                  <Grid size={6}>
                    <Stack
                      direction="row"
                      spacing={0.5}
                      alignItems="center"
                      sx={{ mb: 0.5 }}
                    >
                      <Calculator size={14} color="gray" />
                      <Typography variant="caption" color="text.secondary">
                        Estimated Funds
                      </Typography>
                    </Stack>
                    <Typography
                      variant="h6"
                      fontWeight={500}
                      color="text.secondary"
                      sx={{ opacity: 0.8 }}
                    >
                      {formatAmount(property.estimatedFunds)}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        ))}
        {properties.length === 0 && (
          <Grid size={12}>
            <Card
              sx={{
                p: 4,
                textAlign: "center",
                bgcolor: "transparent",
                borderStyle: "dashed",
              }}
            >
              <Typography color="text.secondary">
                No properties found. Add your first property to get started!
              </Typography>
            </Card>
          </Grid>
        )}
      </Grid>
    </DashboardLayout>
  );
}
