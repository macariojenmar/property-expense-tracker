'use client';

import * as React from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  TextField, 
  Button, 
  Stack, 
  Link
} from '@mui/material';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    router.push('/dashboard');
  };

  return (
    <Box 
      sx={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        bgcolor: '#fafafa',
        p: 2
      }}
    >
      <Box sx={{ maxWidth: 400, width: '100%' }}>
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Box sx={{ width: 40, height: 40, bgcolor: 'primary.main', borderRadius: 1, mx: 'auto', mb: 2 }} />
          <Typography variant="h4" sx={{ fontWeight: 700, letterSpacing: '-0.02em' }}>Welcome back</Typography>
          <Typography variant="body2" color="text.secondary">Login to manage your property expenses.</Typography>
        </Box>

        <Card>
          <CardContent sx={{ p: 4 }}>
            <form onSubmit={handleLogin}>
              <Stack spacing={3}>
                <TextField fullWidth label="Email Address" type="email" placeholder="name@example.com" required />
                <TextField fullWidth label="Password" type="password" required />
                <Button type="submit" variant="contained" fullWidth size="large">
                  Sign In
                </Button>
              </Stack>
            </form>
          </CardContent>
        </Card>

        <Stack direction="row" justifyContent="center" spacing={1} sx={{ mt: 3 }}>
          <Typography variant="body2" color="text.secondary">Don&apos;t have an account?</Typography>
          <Link href="/signup" underline="hover" sx={{ variant: 'body2', fontWeight: 600, color: 'primary.main' }}>
            Sign up
          </Link>
        </Stack>
      </Box>
    </Box>
  );
}
