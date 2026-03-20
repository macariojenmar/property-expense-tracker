"use client";

import * as React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Stack,
  alpha,
  useTheme,
} from "@mui/material";
import { Crown, CheckCircle2, Zap } from "lucide-react";
import { useRouter } from "next/navigation";

interface PricingDialogProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
  limitType?: string;
  isExpired?: boolean;
}

export default function PricingDialog({
  open,
  onClose,
  isExpired = false,
  title,
  message,
  limitType,
}: PricingDialogProps) {
  const theme = useTheme();
  const router = useRouter();

  const displayTitle = title || (isExpired ? "Account Expired" : "Upgrade Your Account");
  const displayMessage = message || (isExpired 
    ? "Your trial period has ended. Upgrade your account to continue using all features and keep your data active."
    : "You've reached the limit for your current plan. Upgrade to a higher plan to continue adding more items.");

  const handleUpgrade = () => {
    // router.push("/pricing"); // Pricing page doesn't exist yet
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 4,
          p: 1,
          overflow: "initial",
        },
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: -30,
          left: "50%",
          transform: "translateX(-50%)",
          bgcolor: "primary.main",
          color: "primary.contrastText",
          p: 1.5,
          borderRadius: "50%",
          boxShadow: `0 8px 16px ${alpha(theme.palette.primary.main, 0.4)}`,
          zIndex: 1,
        }}
      >
        <Crown size={32} />
      </Box>

      <DialogTitle
        component="div"
        sx={{
          textAlign: "center",
          pt: 5,
          pb: 1,
          fontWeight: 700,
          fontSize: "1.5rem",
        }}
      >
        {displayTitle}
      </DialogTitle>

      <DialogContent>
        <Typography
          variant="body1"
          color="text.secondary"
          textAlign="center"
          sx={{ mb: 4 }}
        >
          {displayMessage}
        </Typography>

        <Stack spacing={2} sx={{ mb: 2 }}>
          {[
            "Unlimited properties and entities",
            "Unlimited expenses and payouts",
            "Priority support and more",
          ].map((feature, i) => (
            <Box
              key={i}
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: alpha(theme.palette.primary.main, 0.05),
                display: "flex",
                alignItems: "center",
                gap: 2,
              }}
            >
              <CheckCircle2 size={20} color={theme.palette.primary.main} />
              <Typography variant="body2" fontWeight={500}>
                {feature}
              </Typography>
            </Box>
          ))}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 0, justifyContent: "center", gap: 2 }}>
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{ borderRadius: 2, px: 3 }}
        >
          Maybe Later
        </Button>
        <Button
          onClick={handleUpgrade}
          variant="contained"
          startIcon={<Zap size={18} />}
          sx={{
            borderRadius: 2,
            px: 4,
            py: 1,
            boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
          }}
        >
          View Pricing
        </Button>
      </DialogActions>
    </Dialog>
  );
}
