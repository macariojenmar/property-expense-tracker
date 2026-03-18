"use client";

import * as React from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Divider,
} from "@mui/material";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useCurrency, currencies } from "@/components/CurrencyContext";
import { Globe } from "lucide-react";
import ProfileForm from "@/components/settings/ProfileForm";
import PasswordForm from "@/components/settings/PasswordForm";

export default function SettingsPage() {
  const { currency, setCurrency } = useCurrency();

  return (
    <DashboardLayout>
      <Stack spacing={3} sx={{ maxWidth: 800, mx: "auto" }}>
        <Box>
          <Typography variant="h4" sx={{ mb: 1 }}>
            Settings
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage your application preferences and global configurations.
          </Typography>
        </Box>
        <Card>
          <CardContent sx={{ p: 3 }}>
            <Stack
              direction="row"
              spacing={2}
              alignItems="center"
              sx={{ mb: 3 }}
            >
              <Box
                sx={{
                  p: 1,
                  bgcolor: "primary.main" + "10",
                  color: "primary.main",
                  borderRadius: 2,
                  display: "flex",
                }}
              >
                <Globe size={20} />
              </Box>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Regional Settings
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Set your preferred currency for all property tracking.
                </Typography>
              </Box>
            </Stack>

            <Divider sx={{ mb: 3 }} />

            <FormControl fullWidth>
              <InputLabel id="currency-select-label">
                Global Currency
              </InputLabel>
              <Select
                labelId="currency-select-label"
                id="currency-select"
                value={currency.code}
                label="Global Currency"
                onChange={(e) => setCurrency(e.target.value)}
              >
                {currencies.map((curr) => (
                  <MenuItem key={curr.code} value={curr.code}>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      sx={{ width: "100%" }}
                    >
                      <Typography>{curr.label}</Typography>
                      <Typography
                        color="text.secondary"
                        sx={{ fontWeight: 600 }}
                      >
                        {curr.symbol} {curr.code}
                      </Typography>
                    </Stack>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </CardContent>
        </Card>

        <ProfileForm />
        <PasswordForm />
      </Stack>
    </DashboardLayout>
  );
}
