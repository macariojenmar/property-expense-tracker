"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Paper,
  TextField,
  Stack,
  IconButton,
  InputAdornment,
} from "@mui/material";
import { UserPlus, Eye, EyeOff } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import PageHeader from "@/components/layout/PageHeader";
import { createUser } from "@/lib/actions/platform";

export default function CreateUserPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "USER",
    status: "PENDING",
    accountType: "TRIAL",
  });

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setFieldErrors({});

    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        formData.append(key, value);
      });

      const res = await createUser(null, formData);

      if (res?.success) {
        router.push("/platform/users");
      } else if (res?.errors) {
        setFieldErrors(res.errors);
      } else {
        setError(res?.message || "Failed to create user");
      }
    } catch (err) {
      console.error(err);
      setError("An unexpected error occurred while creating user.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <Box
        sx={{
          maxWidth: 800,
          mx: "auto",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <PageHeader
          title="Create New User"
          subtitle="Fill in the details to manually create a new system user."
          onBack={() => router.push("/platform/users")}
        />

        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 3 }}>
            {error}
          </Alert>
        )}

        <Paper
          elevation={0}
          component="form"
          onSubmit={handleCreateUser}
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
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <TextField
              fullWidth
              label="Full Name"
              placeholder="e.g. John Doe"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              error={!!fieldErrors.name}
              helperText={fieldErrors.name?.[0]}
              required
            />

            <TextField
              fullWidth
              label="Email Address"
              type="email"
              placeholder="e.g. john@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              error={!!fieldErrors.email}
              helperText={fieldErrors.email?.[0]}
              required
            />

            <TextField
              fullWidth
              label="Password"
              type={showPassword ? "text" : "password"}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              error={!!fieldErrors.password}
              helperText={fieldErrors.password?.[0]}
              required
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <FormControl fullWidth>
                <InputLabel>Role</InputLabel>
                <Select
                  value={form.role}
                  label="Role"
                  onChange={(e) =>
                    setForm({ ...form, role: e.target.value })
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
                  value={form.status}
                  label="Status"
                  onChange={(e) =>
                    setForm({ ...form, status: e.target.value })
                  }
                >
                  <MenuItem value="ACTIVE">Active</MenuItem>
                  <MenuItem value="INACTIVE">Inactive</MenuItem>
                  <MenuItem value="PENDING">Pending</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Account Type</InputLabel>
                <Select
                  value={form.accountType}
                  label="Account Type"
                  onChange={(e) =>
                    setForm({ ...form, accountType: e.target.value })
                  }
                >
                  <MenuItem value="TRIAL">Trial</MenuItem>
                  <MenuItem value="STANDARD">Standard</MenuItem>
                  <MenuItem value="PRO">Pro</MenuItem>
                </Select>
              </FormControl>
            </Stack>
          </Box>

          <Box
            sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 2 }}
          >
            <Button
              variant="outlined"
              color="inherit"
              onClick={() => router.push("/platform/users")}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              startIcon={
                loading ? (
                  <CircularProgress size={16} color="inherit" />
                ) : (
                  <UserPlus size={18} />
                )
              }
            >
              {loading ? "Creating..." : "Create User"}
            </Button>
          </Box>
        </Paper>
      </Box>
    </DashboardLayout>
  );
}
