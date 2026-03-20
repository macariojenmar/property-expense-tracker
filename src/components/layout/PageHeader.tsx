import React from "react";
import { Box, Typography, Stack, SxProps, Button } from "@mui/material";
import { ReactNode } from "react";
import { ArrowLeft } from "lucide-react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  onBack?: () => void;
  sx?: SxProps;
}

export default function PageHeader({
  title,
  subtitle,
  actions,
  onBack,
  sx,
}: PageHeaderProps) {
  return (
    <Box sx={{ mb: 4, ...sx }}>
      {onBack && (
        <Button
          startIcon={<ArrowLeft size={18} />}
          onClick={onBack}
          sx={{
            mb: 1.5,
            color: "text.secondary",
            px: 0,
            "&:hover": { bgcolor: "transparent", color: "primary.main" },
            fontSize: "0.875rem",
            minWidth: 0,
            textTransform: "none",
          }}
        >
          Back
        </Button>
      )}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "stretch", sm: "center" }}
        spacing={2}
      >
        <Box>
          <Typography
            variant="h3"
            fontWeight={700}
            sx={{
              mb: subtitle ? 0.5 : 0,
              letterSpacing: "-0.02em",
              fontSize: { xs: "2rem", sm: "3rem" },
            }}
          >
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="body2" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </Box>

        {actions && (
          <Box sx={{ alignSelf: { xs: "stretch", sm: "center" } }}>
            {actions}
          </Box>
        )}
      </Stack>
    </Box>
  );
}
