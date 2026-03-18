"use client";

import * as React from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Stack,
  Divider,
  TextField,
  Button,
  Alert,
  CircularProgress,
  IconButton,
  InputAdornment,
} from "@mui/material";
import { Lock, Eye, EyeOff, Save } from "lucide-react";
import { updatePassword } from "@/lib/actions/user";

export default function PasswordForm() {
  const [isPending, setIsPending] = React.useState(false);
  const [message, setMessage] = React.useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [errors, setErrors] = React.useState<Record<string, string[]>>({});
  const [showCurrentPassword, setShowCurrentPassword] = React.useState(false);
  const [showNewPassword, setShowNewPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsPending(true);
    setMessage(null);
    setErrors({});

    const form = event.currentTarget;
    const formData = new FormData(form);

    try {
      const result = await updatePassword(null, formData);

      if (result?.success) {
        setMessage({
          type: "success",
          text: result.message || "Password updated successfully",
        });
        form.reset();
      } else if (result?.errors) {
        setErrors(result.errors);
      } else if (result?.message) {
        setMessage({ type: "error", text: result.message });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setMessage({
        type: "error",
        text: "An unexpected error occurred: " + errorMessage,
      });
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Card>
      <CardContent sx={{ p: 3 }}>
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
          <Box
            sx={{
              p: 1,
              bgcolor: "primary.main" + "10",
              color: "primary.main",
              borderRadius: 2,
              display: "flex",
            }}
          >
            <Lock size={20} />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Security Settings
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Update your password to keep your account secure.
            </Typography>
          </Box>
        </Stack>

        <Divider sx={{ mb: 3 }} />

        <form onSubmit={handleSubmit}>
          <Stack spacing={3}>
            {message && (
              <Alert severity={message.type} sx={{ borderRadius: 2 }}>
                {message.text}
              </Alert>
            )}

            <TextField
              fullWidth
              label="Current Password"
              name="currentPassword"
              type={showCurrentPassword ? "text" : "password"}
              error={!!errors.currentPassword}
              helperText={errors.currentPassword?.[0]}
              slotProps={{
                input: {
                  startAdornment: (
                    <Box
                      sx={{ color: "text.secondary", mr: 1, display: "flex" }}
                    >
                      <Lock size={20} />
                    </Box>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle current password visibility"
                        onClick={() => setShowCurrentPassword((prev) => !prev)}
                        edge="end"
                        size="small"
                      >
                        {showCurrentPassword ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />

            <TextField
              fullWidth
              label="New Password"
              name="newPassword"
              type={showNewPassword ? "text" : "password"}
              error={!!errors.newPassword}
              helperText={
                errors.newPassword?.[0] || "Must be at least 6 characters"
              }
              slotProps={{
                input: {
                  startAdornment: (
                    <Box
                      sx={{ color: "text.secondary", mr: 1, display: "flex" }}
                    >
                      <Lock size={20} />
                    </Box>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle new password visibility"
                        onClick={() => setShowNewPassword((prev) => !prev)}
                        edge="end"
                        size="small"
                      >
                        {showNewPassword ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />

            <TextField
              fullWidth
              label="Confirm New Password"
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword?.[0]}
              slotProps={{
                input: {
                  startAdornment: (
                    <Box
                      sx={{ color: "text.secondary", mr: 1, display: "flex" }}
                    >
                      <Lock size={20} />
                    </Box>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle confirm password visibility"
                        onClick={() => setShowConfirmPassword((prev) => !prev)}
                        edge="end"
                        size="small"
                      >
                        {showConfirmPassword ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />

            <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
              <Button
                type="submit"
                variant="contained"
                disabled={isPending}
                startIcon={
                  isPending ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : (
                    <Save size={20} />
                  )
                }
                sx={{
                  boxShadow: "none",
                  "&:hover": { boxShadow: "none" },
                }}
              >
                {isPending ? "Updating..." : "Update Password"}
              </Button>
            </Box>
          </Stack>
        </form>
      </CardContent>
    </Card>
  );
}
