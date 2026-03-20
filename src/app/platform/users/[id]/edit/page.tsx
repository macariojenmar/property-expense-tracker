"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  Box,
  Typography,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Paper,
  alpha,
} from "@mui/material";
import { Save } from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { getUser, updateUserAccess, expireUserTrial } from "@/lib/actions/platform";
import Loader from "@/components/Loader";
import { Clock, AlertTriangle } from "lucide-react";
import { format, isPast } from "date-fns";
import ConfirmDialog from "@/components/ConfirmDialog";

export default function EditUserPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const [user, setUser] = useState<{
    name: string | null;
    email: string | null;
    expiredAt: Date | null;
  } | null>(null);
  const [editForm, setEditForm] = useState({
    role: "",
    status: "",
    accountType: "",
  });

  useEffect(() => {
    if (!userId) return;

    const fetchUser = async () => {
      try {
        const res = await getUser(userId);
        if (res.success && res.data) {
          const userData = res.data as any;
          setUser({ 
            name: userData.name, 
            email: userData.email,
            expiredAt: userData.expiredAt ? new Date(userData.expiredAt) : null
          });
          setEditForm({
            role: userData.role,
            status: userData.status,
            accountType: userData.accountType,
          });
        } else {
          setError(res.message || "Failed to load user data");
        }
      } catch (err) {
        console.error(err);
        setError("An unexpected error occurred while fetching user data.");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId]);

  const handleSaveUser = async () => {
    setSaving(true);
    setError(null);
    try {
      const res = await updateUserAccess(userId, editForm);
      if (res?.success) {
        router.push("/platform/users");
      } else {
        setError(res?.message || "Failed to update user");
      }
    } catch (err) {
      console.error(err);
      setError("An unexpected error occurred while updating.");
    } finally {
      setSaving(false);
    }
  };

  const handleExpireTrial = async () => {
    setConfirmOpen(true);
  };

  const handleConfirmExpire = async () => {
    setSaving(true);
    setError(null);
    try {
      const res = await expireUserTrial(userId);
      if (res?.success) {
        // Refresh page data
        const refreshRes = await getUser(userId);
        if (refreshRes.success && refreshRes.data) {
          const userData = refreshRes.data as any;
          setUser({ 
            name: userData.name, 
            email: userData.email,
            expiredAt: userData.expiredAt ? new Date(userData.expiredAt) : null
          });
        }
      } else {
        setError(res?.message || "Failed to expire trial");
      }
    } catch (err) {
      console.error(err);
      setError("An unexpected error occurred while expiring trial.");
    } finally {
      setConfirmOpen(false);
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <Loader message="Fetching user details..." />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout width="md">
      <PageHeader
        title="Edit User Access"
        subtitle={`Modify the role, status, and account type for ${user?.name || user?.email || "this user"}.`}
        onBack={() => router.push("/platform/users")}
      />

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 3 }}>
          {error}
        </Alert>
      )}

      <Paper
        elevation={0}
        sx={{
          p: 4,
          borderRadius: 4,
          border: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
          display: "flex",
          flexDirection: "column",
          gap: 4,
        }}
      >
        <Box>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            User Information
          </Typography>
          <Typography variant="body1" fontWeight={600}>
            {user?.name || "Unknown"}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {user?.email}
          </Typography>
        </Box>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <FormControl fullWidth>
            <InputLabel>Role</InputLabel>
            <Select
              value={editForm.role}
              label="Role"
              onChange={(e) =>
                setEditForm({ ...editForm, role: e.target.value })
              }
            >
              <MenuItem value="USER">User (Standard Access)</MenuItem>
              <MenuItem value="DEVELOPER">
                Developer (Platform Management Access)
              </MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel>Status</InputLabel>
            <Select
              value={editForm.status}
              label="Status"
              onChange={(e) =>
                setEditForm({ ...editForm, status: e.target.value })
              }
            >
              <MenuItem value="ACTIVE">Active</MenuItem>
              <MenuItem value="INACTIVE">Inactive</MenuItem>
              <MenuItem value="PENDING">Pending</MenuItem>
              <MenuItem value="DELETED">Deleted</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel>Account Type</InputLabel>
            <Select
              value={editForm.accountType}
              label="Account Type"
              onChange={(e) =>
                setEditForm({ ...editForm, accountType: e.target.value })
              }
            >
              <MenuItem value="TRIAL">Trial</MenuItem>
              <MenuItem value="STANDARD">Standard</MenuItem>
              <MenuItem value="PRO">Pro</MenuItem>
            </Select>
          </FormControl>

          {editForm.accountType === "TRIAL" && (
            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: (theme) => alpha(theme.palette.warning.main, 0.05),
                border: "1px dashed",
                borderColor: "warning.main",
                display: "flex",
                flexDirection: "column",
                gap: 2,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <Clock size={18} className="text-amber-500" style={{ color: '#f59e0b' }} />
                <Box>
                  <Typography variant="subtitle2" fontWeight={700}>
                    Trial Management
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {user?.expiredAt ? (
                      <>
                        Expires on {format(user.expiredAt, "PPP")}
                        {isPast(user.expiredAt) && (
                          <Typography component="span" variant="body2" color="error.main" fontWeight={700} sx={{ ml: 1 }}>
                            (Already Expired)
                          </Typography>
                        )}
                      </>
                    ) : (
                      "No expiration date set"
                    )}
                  </Typography>
                </Box>
              </Box>
              
              {!user?.expiredAt || !isPast(user.expiredAt) ? (
                <Button
                  variant="outlined"
                  color="warning"
                  size="small"
                  onClick={handleExpireTrial}
                  disabled={saving}
                  startIcon={<AlertTriangle size={16} />}
                  sx={{ alignSelf: "flex-start", fontWeight: 600 }}
                >
                  Expire Trial Today
                </Button>
              ) : (
                <Alert severity="info" icon={<Clock size={16} />} sx={{ borderRadius: 2 }}>
                  This trial has already expired.
                </Alert>
              )}
            </Box>
          )}
        </Box>

        <Box
          sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 2 }}
        >
          <Button
            variant="outlined"
            color="inherit"
            onClick={() => router.push("/platform/users")}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveUser}
            disabled={saving}
            startIcon={
              saving ? (
                <CircularProgress size={16} color="inherit" />
              ) : (
                <Save size={18} />
              )
            }
          >
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </Box>
      </Paper>

      <ConfirmDialog
        open={confirmOpen}
        loading={saving}
        title="Expire Trial Immediately"
        message="Are you sure you want to expire this trial for this user today? This action cannot be undone."
        confirmLabel="Expire Now"
        onConfirm={handleConfirmExpire}
        onCancel={() => setConfirmOpen(false)}
      />
    </DashboardLayout>
  );
}
