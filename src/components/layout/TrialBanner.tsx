"use client";

import * as React from "react";
import { Box, Stack, Typography, Chip } from "@mui/material";
import { Timer, AlertCircle } from "lucide-react";

interface TrialBannerProps {
  daysRemaining: number;
  onUpgrade?: () => void;
}

export default function TrialBanner({
  daysRemaining,
  onUpgrade,
}: TrialBannerProps) {
  return (
    <Box
      sx={{
        bgcolor: "text.primary",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        px: { xs: 2, md: 4 },
        py: 1,
      }}
    >
      <Stack
        direction={"row"}
        alignItems={"center"}
        gap={1}
        width={"100%"}
        justifyContent={"space-between"}
      >
        <Stack
          direction={"row"}
          alignItems={"center"}
          gap={1}
          color={"primary.contrastText"}
        >
          {daysRemaining === 0 ? (
            <AlertCircle size={18} strokeWidth={3} />
          ) : (
            <Timer size={18} strokeWidth={3} />
          )}
          <Typography variant="body2">
            {daysRemaining === 0 ? (
              <>Your account has expired.</>
            ) : (
              <>
                Heads up! Your trial ends in <b>{daysRemaining} days</b>.
              </>
            )}
          </Typography>
        </Stack>
        <Chip
          label={"Upgrade"}
          size="small"
          onClick={onUpgrade}
          sx={{
            py: 2,
            px: 1,
            cursor: "pointer",
            color: "primary.main",
            backgroundColor: "background.default",
            fontWeight: 800,
            "&:hover": {
              backgroundColor: "background.paper",
            },
          }}
        />
      </Stack>
    </Box>
  );
}
