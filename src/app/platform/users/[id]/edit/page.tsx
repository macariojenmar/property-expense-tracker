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
} from "@mui/material";
import { Save } from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { getUser, updateUserAccess } from "@/lib/actions/platform";
import Loader from "@/components/Loader";

export default function EditUserPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [user, setUser] = useState<{
    name: string | null;
    email: string | null;
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
          setUser({ name: userData.name, email: userData.email });
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
    </DashboardLayout>
  );
}
