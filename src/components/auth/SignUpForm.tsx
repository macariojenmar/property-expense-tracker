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
import { signIn } from "next-auth/react";

const GoogleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 48 48">
    <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
    <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
    <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
    <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
  </svg>
);

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

            <Box sx={{ mt: 2, mb: 1, display: 'flex', alignItems: 'center' }}>
              <Box sx={{ flex: 1, height: '1px', bgcolor: 'divider' }} />
              <Typography variant="body2" sx={{ mx: 2, color: 'text.secondary', fontWeight: 500 }}>OR</Typography>
              <Box sx={{ flex: 1, height: '1px', bgcolor: 'divider' }} />
            </Box>

            <Button
              fullWidth
              variant="outlined"
              onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
              startIcon={<GoogleIcon />}
              sx={{ py: 1.2, mb: 1, borderColor: 'divider', color: 'text.primary', '&:hover': { borderColor: 'primary.main', bgcolor: 'action.hover' } }}
            >
              Sign Up with Google
            </Button>
          </Paper>
        </Container>
      </Box>
      <Footer />
    </Box>
  );
}
