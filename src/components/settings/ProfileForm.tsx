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
} from "@mui/material";
import { User, Mail, Save } from "lucide-react";
import { useSession } from "next-auth/react";
import { updateProfile } from "@/lib/actions/user";

export default function ProfileForm() {
  const { data: session, update: updateSession } = useSession();
  const [isPending, setIsPending] = React.useState(false);
  const [message, setMessage] = React.useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [errors, setErrors] = React.useState<Record<string, string[]>>({});

  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");

  React.useEffect(() => {
    if (session?.user) {
      setName(session.user.name || "");
      setEmail(session.user.email || "");
    }
  }, [session]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsPending(true);
    setMessage(null);
    setErrors({});

    const form = event.currentTarget;
    const formData = new FormData(form);

    try {
      const result = await updateProfile(null, formData);

      if (result?.success) {
        setMessage({
          type: "success",
          text: result.message || "Profile updated successfully",
        });
        
        // Update the session to reflect changes in the UI globally
        await updateSession({
          ...session,
          user: {
            ...session?.user,
            name: name,
            email: email,
          },
        });
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

  if (!session) return null;

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
            <User size={20} />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Profile Information
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Update your basic profile details.
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
              label="Name"
              name="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              error={!!errors.name}
              helperText={errors.name?.[0]}
              variant="outlined"
              slotProps={{
                input: {
                  startAdornment: (
                    <Box
                      sx={{ color: "text.secondary", mr: 1, display: "flex" }}
                    >
                      <User size={20} />
                    </Box>
                  ),
                },
              }}
            />

            <TextField
              fullWidth
              label="Email Address"
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={!!errors.email}
              helperText={errors.email?.[0]}
              variant="outlined"
              slotProps={{
                input: {
                  startAdornment: (
                    <Box
                      sx={{ color: "text.secondary", mr: 1, display: "flex" }}
                    >
                      <Mail size={20} />
                    </Box>
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
                {isPending ? "Saving..." : "Save Changes"}
              </Button>
            </Box>
          </Stack>
        </form>
      </CardContent>
    </Card>
  );
}
