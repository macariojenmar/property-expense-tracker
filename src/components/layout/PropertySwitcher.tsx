"use client";

import * as React from "react";
import {
  Box,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  TextField,
  InputAdornment,
  alpha,
  useTheme,
  Stack,
  Divider,
} from "@mui/material";
import { Search, Check, Building2, ChevronUp, ChevronDown } from "lucide-react";
import { usePropertyStore, Property } from "@/store/usePropertyStore";
import { useRouter, usePathname } from "next/navigation";

export default function PropertySwitcher() {
  const { properties, selectedProperty, setSelectedProperty } =
    usePropertyStore();
  const router = useRouter();
  const pathname = usePathname();
  const theme = useTheme();

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [search, setSearch] = React.useState("");
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setSearch("");
  };

  const handleSelect = (property: Property | null) => {
    setSelectedProperty(property);
    handleClose();

    if (property) {
      // Maintain context if we're on a sub-page
      if (pathname.includes("/expenses")) {
        router.push(`/properties/${property.id}/expenses`);
      } else if (pathname.includes("/payouts")) {
        router.push(`/properties/${property.id}/payouts`);
      } else {
        router.push(`/properties/${property.id}`);
      }
    } else {
      // "All Properties" selected
      router.push("/dashboard");
    }
  };

  const filteredProperties = properties.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <Box>
      <Box
        component="button"
        onClick={handleClick}
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          px: 1.5,
          py: 0.75,
          bgcolor: (theme) =>
            theme.palette.mode === "light"
              ? alpha(theme.palette.primary.main, 0.04)
              : alpha(theme.palette.primary.main, 0.08),
          borderRadius: 1.5,
          border: "1px solid",
          borderColor: (theme) => alpha(theme.palette.primary.main, 0.1),
          cursor: "pointer",
          transition: "all 0.2s",
          "&:hover": {
            bgcolor: (theme) =>
              theme.palette.mode === "light"
                ? alpha(theme.palette.primary.main, 0.12)
                : alpha(theme.palette.primary.main, 0.2),
          },
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "primary.main",
              opacity: 0.8,
            }}
          >
            <Building2 size={18} />
          </Box>
          <Typography
            variant="subtitle2"
            sx={{ color: "text.primary", fontWeight: 600 }}
          >
            {selectedProperty ? selectedProperty.name : "All Properties"}
          </Typography>
        </Stack>
        <Box sx={{ color: "text.secondary", display: "flex", ml: 0.5 }}>
          {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </Box>
      </Box>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        slotProps={{
          paper: {
            sx: {
              mt: 1,
              width: 320,
              maxHeight: 480,
              borderRadius: 3,
              boxShadow: (theme) => theme.shadows[10],
              border: "1px solid",
              borderColor: "divider",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
            },
          },
        }}
        transformOrigin={{ horizontal: "left", vertical: "top" }}
        anchorOrigin={{ horizontal: "left", vertical: "bottom" }}
      >
        <Box sx={{ p: 1.5 }}>
          <TextField
            autoFocus
            fullWidth
            size="small"
            placeholder="Find property..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search size={16} color={theme.palette.text.secondary} />
                </InputAdornment>
              ),
              sx: {
                borderRadius: 1,
                fontSize: "14px",
                "& fieldset": { borderColor: "divider" },
              },
            }}
          />
        </Box>

        <Divider />

        <Box sx={{ py: 1, overflowY: "auto", flexGrow: 1 }}>
          <Typography
            variant="caption"
            sx={{
              px: 2,
              py: 1,
              color: "text.secondary",
              fontWeight: 600,
              display: "block",
            }}
          >
            Switch Property
          </Typography>

          <MenuItem
            onClick={() => handleSelect(null)}
            sx={{
              mx: 1,
              my: 0.5,
              p: 1.5,
              borderRadius: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              "&:hover": {
                bgcolor: (theme) => alpha(theme.palette.primary.main, 0.04),
              },
            }}
          >
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Box
                sx={{
                  p: 1,
                  borderRadius: 1.5,
                  bgcolor: "action.hover",
                  color: "text.secondary",
                  display: "flex",
                }}
              >
                <Building2 size={18} />
              </Box>
              <Typography variant="body2" fontWeight={600}>
                All Properties
              </Typography>
            </Stack>
            {!selectedProperty && (
              <Check size={18} color={theme.palette.primary.main} />
            )}
          </MenuItem>

          <Divider sx={{ my: 1, mx: 2 }} />
          {filteredProperties.length === 0 ? (
            <Box sx={{ px: 2, py: 4, textAlign: "center" }}>
              <Typography variant="body2" color="text.secondary">
                No properties found
              </Typography>
            </Box>
          ) : (
            // The original instruction included a line 'waivedRecurringExpenses.forEach((w) => {' here.
            // This line seems to be specific to an 'ExpensesView.tsx' component and uses an undefined variable
            // ('waivedRecurringExpenses') in the context of PropertySwitcher.tsx.
            // To maintain syntactic correctness and avoid breaking the component,
            // this specific line has been omitted from the PropertySwitcher.tsx file.
            filteredProperties.map((property) => (
              <MenuItem
                key={property.id}
                onClick={() => handleSelect(property)}
                sx={{
                  mx: 1,
                  my: 0.5,
                  p: 1.5,
                  borderRadius: 2,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  "&:hover": {
                    bgcolor: (theme) => alpha(theme.palette.primary.main, 0.04),
                  },
                }}
              >
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Box
                    sx={{
                      p: 1,
                      borderRadius: 1.5,
                      bgcolor: "action.selected",
                      color: "primary.main",
                      display: "flex",
                    }}
                  >
                    <Building2 size={18} />
                  </Box>
                  <Box>
                    <Typography variant="body2" fontWeight={600}>
                      {property.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {property.location}
                    </Typography>
                  </Box>
                </Stack>
                {selectedProperty?.id === property.id && (
                  <Check size={18} color={theme.palette.primary.main} />
                )}
              </MenuItem>
            ))
          )}
        </Box>
      </Menu>
    </Box>
  );
}
