"use client";

import * as React from "react";
import {
  Box,
  Typography,
  Card,
  Grid,
  TextField,
  Button,
  Divider,
  Stack,
  alpha,
  useTheme,
  Alert,
  Snackbar,
} from "@mui/material";
import DashboardLayout from "@/components/layout/DashboardLayout";
import PageHeader from "@/components/layout/PageHeader";
import { Save, RefreshCcw, ShieldCheck } from "lucide-react";
import {
  getPlatformSettings,
  updatePlatformSettings,
} from "@/lib/actions/settings";
import Loader from "@/components/Loader";

export default function PlatformSettingsPage() {
  const theme = useTheme();
  const [settings, setSettings] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [snackbar, setSnackbar] = React.useState({
    open: false,
    message: "",
    severity: "success" as any,
  });

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const data = await getPlatformSettings();
      setSettings(data);
    } catch (error) {
      console.error("Failed to fetch settings:", error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updatePlatformSettings(settings);
      setSnackbar({
        open: true,
        message: "Settings updated successfully",
        severity: "success",
      });
    } catch (error) {
      console.error("Failed to update settings:", error);
      setSnackbar({
        open: true,
        message: "Failed to update settings",
        severity: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setSettings((prev: any) => ({ ...prev, [field]: value }));
  };

  if (loading)
    return (
      <DashboardLayout>
        <Loader message="Loading settings..." />
      </DashboardLayout>
    );

  return (
    <DashboardLayout width="lg">
      <PageHeader
        title="Platform Setting"
        subtitle="Manage trial periods and account limitations."
        sx={{ mb: 4 }}
        actions={
          <Button
            variant="contained"
            startIcon={
              saving ? (
                <RefreshCcw className="animate-spin" size={18} />
              ) : (
                <Save size={18} />
              )
            }
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        }
      />

      <Box component="form" onSubmit={handleSave}>
        <Stack spacing={4}>
          {/* Trial Period */}
          <Card sx={{ p: 3, borderRadius: 3 }}>
            <Typography
              variant="h6"
              fontWeight={600}
              gutterBottom
              sx={{ display: "flex", alignItems: "center", gap: 1 }}
            >
              Trial Account Setting
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Configure the default trial period for new accounts.
            </Typography>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  fullWidth
                  label="Length of trial period (days)"
                  type="number"
                  value={settings.trialPeriodDays}
                  onChange={(e) =>
                    handleChange("trialPeriodDays", e.target.value)
                  }
                />
              </Grid>
            </Grid>
          </Card>

          {/* Limitations */}
          <Card sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Account Limitations
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Set the maximum number of items allowed for each account type. Use
              -1 for unlimited.
            </Typography>

            <Grid container spacing={4}>
              {/* Trial */}
              <Grid size={{ xs: 12, md: 4 }}>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    bgcolor: alpha(theme.palette.primary.main, 0.04),
                    height: "100%",
                  }}
                >
                  <Typography
                    variant="subtitle1"
                    fontWeight={700}
                    color="primary.main"
                    gutterBottom
                  >
                    Trial Plan
                  </Typography>
                  <Stack spacing={2} sx={{ mt: 2 }}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Max Properties"
                      type="number"
                      value={settings.trialMaxProperties}
                      onChange={(e) =>
                        handleChange("trialMaxProperties", e.target.value)
                      }
                    />
                    <TextField
                      fullWidth
                      size="small"
                      label="Max Entities"
                      type="number"
                      value={settings.trialMaxEntities}
                      onChange={(e) =>
                        handleChange("trialMaxEntities", e.target.value)
                      }
                    />
                    <TextField
                      fullWidth
                      size="small"
                      label="Max Dictionaries"
                      type="number"
                      value={settings.trialMaxDictionaries}
                      onChange={(e) =>
                        handleChange("trialMaxDictionaries", e.target.value)
                      }
                    />
                    <TextField
                      fullWidth
                      size="small"
                      label="Max Expenses"
                      type="number"
                      value={settings.trialMaxExpenses}
                      onChange={(e) =>
                        handleChange("trialMaxExpenses", e.target.value)
                      }
                    />
                    <TextField
                      fullWidth
                      size="small"
                      label="Max Payouts"
                      type="number"
                      value={settings.trialMaxPayouts}
                      onChange={(e) =>
                        handleChange("trialMaxPayouts", e.target.value)
                      }
                    />
                  </Stack>
                </Box>
              </Grid>

              {/* Standard */}
              <Grid size={{ xs: 12, md: 4 }}>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    bgcolor: alpha(theme.palette.secondary.main, 0.04),
                    height: "100%",
                  }}
                >
                  <Typography
                    variant="subtitle1"
                    fontWeight={700}
                    color="secondary.main"
                    gutterBottom
                  >
                    Standard Plan
                  </Typography>
                  <Stack spacing={2} sx={{ mt: 2 }}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Max Properties"
                      type="number"
                      value={settings.standardMaxProperties}
                      onChange={(e) =>
                        handleChange("standardMaxProperties", e.target.value)
                      }
                    />
                    <TextField
                      fullWidth
                      size="small"
                      label="Max Entities"
                      type="number"
                      value={settings.standardMaxEntities}
                      onChange={(e) =>
                        handleChange("standardMaxEntities", e.target.value)
                      }
                    />
                    <TextField
                      fullWidth
                      size="small"
                      label="Max Dictionaries"
                      type="number"
                      value={settings.standardMaxDictionaries}
                      onChange={(e) =>
                        handleChange("standardMaxDictionaries", e.target.value)
                      }
                    />
                    <TextField
                      fullWidth
                      size="small"
                      label="Max Expenses"
                      type="number"
                      value={settings.standardMaxExpenses}
                      onChange={(e) =>
                        handleChange("standardMaxExpenses", e.target.value)
                      }
                    />
                    <TextField
                      fullWidth
                      size="small"
                      label="Max Payouts"
                      type="number"
                      value={settings.standardMaxPayouts}
                      onChange={(e) =>
                        handleChange("standardMaxPayouts", e.target.value)
                      }
                    />
                  </Stack>
                </Box>
              </Grid>

              {/* Pro */}
              <Grid size={{ xs: 12, md: 4 }}>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    bgcolor: alpha(theme.palette.success.main, 0.04),
                    height: "100%",
                  }}
                >
                  <Typography
                    variant="subtitle1"
                    fontWeight={700}
                    color="success.main"
                    gutterBottom
                  >
                    Pro Plan
                  </Typography>
                  <Stack spacing={2} sx={{ mt: 2 }}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Max Properties"
                      type="number"
                      value={settings.proMaxProperties}
                      onChange={(e) =>
                        handleChange("proMaxProperties", e.target.value)
                      }
                    />
                    <TextField
                      fullWidth
                      size="small"
                      label="Max Entities"
                      type="number"
                      value={settings.proMaxEntities}
                      onChange={(e) =>
                        handleChange("proMaxEntities", e.target.value)
                      }
                    />
                    <TextField
                      fullWidth
                      size="small"
                      label="Max Dictionaries"
                      type="number"
                      value={settings.proMaxDictionaries}
                      onChange={(e) =>
                        handleChange("proMaxDictionaries", e.target.value)
                      }
                    />
                    <TextField
                      fullWidth
                      size="small"
                      label="Max Expenses"
                      type="number"
                      value={settings.proMaxExpenses}
                      onChange={(e) =>
                        handleChange("proMaxExpenses", e.target.value)
                      }
                    />
                    <TextField
                      fullWidth
                      size="small"
                      label="Max Payouts"
                      type="number"
                      value={settings.proMaxPayouts}
                      onChange={(e) =>
                        handleChange("proMaxPayouts", e.target.value)
                      }
                    />
                  </Stack>
                </Box>
              </Grid>
            </Grid>
          </Card>
        </Stack>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </DashboardLayout>
  );
}
