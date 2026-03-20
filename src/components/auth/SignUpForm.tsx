"use client";

import React, { useActionState, useEffect, useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Alert,
  Link,
  Container,
  InputAdornment,
  IconButton,
  Stack,
  CircularProgress,
} from "@mui/material";
import { signUp, type SignUpState } from "@/lib/actions/auth";
import NextLink from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Footer from "@/components/layout/Footer";
import ThemeSwitch from "@/components/layout/ThemeSwitch";
import { ArrowRight, Eye, EyeOff, Lock, Mail, User } from "lucide-react";

export default function SignUpForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
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
        minHeight: "100dvh",
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
            <Stack spacing={2} direction={"row"} alignItems={"center"} sx={{ mb: 2 }}>
              <Box sx={{ display: "flex", justifyContent: "center" }}>
                <Image
                  src="/ntorra.svg"
                  alt="Ntorra Logo"
                  width={50}
                  height={50}
                />
              </Box>
              <Typography
                component="h1"
                variant="h4"
                align="center"
                fontWeight={700}
              >
                Sign Up
              </Typography>
            </Stack>

            <Typography variant="body2" mt={2} mb={1}>
              Already have an account?{" "}
              <Link
                href="/login"
                component={NextLink}
                sx={{
                  fontWeight: 700,
                  textDecoration: "none",
                  "&:hover": { textDecoration: "underline" },
                }}
              >
                Sign In
              </Link>
            </Typography>

            {state?.errors?.message && (
              <Alert severity="error" sx={{ mb: 2, mt: 2 }}>
                {state.errors.message[0]}
              </Alert>
            )}

            <Box component="form" action={action} noValidate sx={{ mt: 1 }}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="name"
                name="name"
                autoComplete="name"
                placeholder="Full Name"
                autoFocus
                error={!!state?.errors?.name}
                helperText={state?.errors?.name?.[0]}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <User size={18} />
                      </InputAdornment>
                    ),
                  },
                }}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                name="email"
                autoComplete="email"
                placeholder="Email Address"
                error={!!state?.errors?.email}
                helperText={state?.errors?.email?.[0]}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <Mail size={18} />
                      </InputAdornment>
                    ),
                  },
                }}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                type={showPassword ? "text" : "password"}
                id="password"
                placeholder="Password"
                autoComplete="new-password"
                error={!!state?.errors?.password}
                helperText={state?.errors?.password?.[0]}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock size={18} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword((prev) => !prev)}
                        >
                          {showPassword ? (
                            <EyeOff size={20} />
                          ) : (
                            <Eye size={20} />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={pending}
                sx={{ mt: 3, mb: 2, py: 1.5 }}
                endIcon={
                  pending ? (
                    <CircularProgress size={18} color="inherit" />
                  ) : (
                    <ArrowRight size={18} />
                  )
                }
              >
                {pending ? "Creating Account..." : "Sign Up"}
              </Button>
            </Box>
          </Paper>
        </Container>
      </Box>
      <Footer />
    </Box>
  );
}
