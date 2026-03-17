"use client";

import React, { useState, Suspense } from "react";
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
import { signIn } from "next-auth/react";
import NextLink from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Footer from "@/components/layout/Footer";

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const signupSuccess = searchParams.get("signup") === "success";

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        bgcolor: "background.default",
      }}
    >
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
            <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
              <Image
                src="/ntorra.svg"
                alt="Ntorra Logo"
                width={50}
                height={50}
              />
            </Box>
            <Typography
              component="h1"
              variant="h5"
              align="center"
              gutterBottom
              fontWeight={700}
            >
              Sign In to Ntorra
            </Typography>

            {signupSuccess && (
              <Alert severity="success" sx={{ mb: 1, mt: 3 }}>
                Account created successfully! Please sign in.
              </Alert>
            )}

            {error && (
              <Alert severity="error" sx={{ mb: 1, mt: 3 }}>
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit} noValidate>
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                autoFocus
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                autoComplete="current-password"
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading}
                sx={{ mt: 3, mb: 2, py: 1.5 }}
              >
                {loading ? "Signing In..." : "Sign In"}
              </Button>
            </Box>
          </Paper>
        </Container>
      </Box>
      <Footer />
    </Box>
  );
}

export default function LoginForm() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginFormContent />
    </Suspense>
  );
}
