"use client";

import React, { useActionState, useEffect } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Alert,
  Link,
  Container,
} from "@mui/material";
import { signUp, type SignUpState } from "@/lib/actions/auth";
import NextLink from "next/link";
import { useRouter } from "next/navigation";
import Footer from "@/components/layout/Footer";
import ThemeSwitch from "@/components/layout/ThemeSwitch";

export default function SignUpForm() {
  const router = useRouter();
  const [state, action, pending] = useActionState<SignUpState, FormData>(
    signUp,
    null,
  );

  useEffect(() => {
    if (state?.success) {
      router.push("/login?signup=success");
    }
  }, [state, router]);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        bgcolor: "background.default",
        position: "relative",
      }}
    >
      <Box sx={{ position: "absolute", top: 16, right: 16, zIndex: 10 }}>
        <ThemeSwitch />
      </Box>
      <Box
        sx={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Container maxWidth="xs">
          <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
            <Typography component="h1" variant="h5" align="center" gutterBottom>
              Create Account
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              align="center"
              sx={{ mb: 3 }}
            >
              Join Property Tracker
            </Typography>

            {state?.errors?.message && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {state.errors.message[0]}
              </Alert>
            )}

            <Box component="form" action={action} noValidate>
              <TextField
                margin="normal"
                required
                fullWidth
                id="name"
                label="Full Name"
                name="name"
                autoComplete="name"
                autoFocus
                error={!!state?.errors?.name}
                helperText={state?.errors?.name?.[0]}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                error={!!state?.errors?.email}
                helperText={state?.errors?.email?.[0]}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                autoComplete="new-password"
                error={!!state?.errors?.password}
                helperText={state?.errors?.password?.[0]}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={pending}
                sx={{ mt: 3, mb: 2, py: 1.5 }}
              >
                {pending ? "Creating Account..." : "Sign Up"}
              </Button>
              <Box sx={{ textAlign: "center" }}>
                <Link component={NextLink} href="/login" variant="body2">
                  {"Already have an account? Sign In"}
                </Link>
              </Box>
            </Box>
          </Paper>
        </Container>
      </Box>
      <Footer />
    </Box>
  );
}
