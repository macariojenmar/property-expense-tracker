"use client";

import * as React from "react";
import {
  Box,
  FormControl,
  Select,
  MenuItem,
  SelectChangeEvent,
  ListSubheader,
  Typography,
} from "@mui/material";
import { ChevronDown } from "lucide-react";

interface Option {
  value: string;
  label: string;
}

interface GroupedOptions {
  label?: string;
  options: Option[];
}

interface StandardSelectProps {
  value: any;
  onChange: (value: any) => void;
  options?: (Option | GroupedOptions)[];
  children?: React.ReactNode;
  label?: string;
  placeholder?: string;
  minWidth?: any;
  fullWidth?: boolean;
  onOpen?: () => void;
  renderValue?: (value: any) => React.ReactNode;
  sx?: any; // Using any for simplicity with SxProps, but ideally it should be SxProps<Theme>
}

export default function StandardSelect({
  value,
  onChange,
  options,
  children,
  label,
  placeholder,
  minWidth,
  fullWidth = false,
  onOpen,
  renderValue: customRenderValue,
  sx: externalSx,
}: StandardSelectProps) {
  const handleChange = (event: SelectChangeEvent) => {
    onChange(event.target.value);
  };

  return (
    <FormControl 
      size="small" 
      fullWidth={fullWidth} 
      sx={{ 
        ...(minWidth && { minWidth }),
        width: fullWidth ? "100%" : "auto",
        ...externalSx
      }}
    >
      {label && (
        <Typography
          variant="caption"
          sx={{
            color: "text.secondary",
            fontWeight: 600,
            mb: 0.75,
            display: "block",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          {label}
        </Typography>
      )}
      <Select
        value={value}
        onChange={handleChange}
        onOpen={onOpen}
        displayEmpty
        IconComponent={() => (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              mr: 1.5,
              opacity: 0.5,
              pointerEvents: "none",
            }}
          >
            <ChevronDown size={18} />
          </Box>
        )}
        renderValue={(selected) => {
          if (customRenderValue) return customRenderValue(selected);
          
          if (!selected && placeholder) {
            return (
              <Typography variant="body2" sx={{ color: "text.secondary", opacity: 0.6 }}>
                {placeholder}
              </Typography>
            );
          }
          
          let displayLabel = selected;
          if (options) {
            for (const opt of options) {
              if ("options" in opt) {
                const subOpt = opt.options.find((o) => o.value === selected);
                if (subOpt) {
                  displayLabel = subOpt.label;
                  break;
                }
              } else if (opt.value === selected) {
                displayLabel = opt.label;
                break;
              }
            }
          }
          
          return (
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {displayLabel}
            </Typography>
          );
        }}
        sx={{
          bgcolor: "background.paper",
          borderRadius: "8px",
          color: "text.primary",
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: "divider",
            transition: "all 0.2s",
          },
          "&:hover": {
            bgcolor: "action.hover",
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: (theme) => theme.palette.mode === 'dark' ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.3)",
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: "primary.main",
            borderWidth: "1px",
          },
          "& .MuiSelect-select": {
            display: "flex",
            alignItems: "center",
            py: "10px",
            pr: "36px !important",
            fontSize: "14px",
          },
        }}
        MenuProps={{
          PaperProps: {
            sx: {
              bgcolor: "background.paper",
              backgroundImage: "none",
              mt: 1,
              borderRadius: "12px",
              border: "1px solid",
              borderColor: "divider",
              boxShadow: (theme) => theme.palette.mode === 'dark' 
                ? "0 20px 25px -5px rgb(0 0 0 / 0.5)"
                : "0 10px 15px -3px rgb(0 0 0 / 0.1)",
              "& .MuiList-root": { p: 1 },
            },
          },
        }}
      >
        {children || (options && options.map((opt, idx) => {
          if ("options" in opt) {
            return [
              opt.label && (
                <ListSubheader
                  key={`header-${idx}`}
                  sx={{
                    lineHeight: "32px",
                    bgcolor: "transparent",
                    fontSize: "11px",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    color: "text.secondary",
                    px: 1.5,
                  }}
                >
                  {opt.label}
                </ListSubheader>
              ),
              ...opt.options.map((subOpt) => (
                <MenuItem
                  key={subOpt.value}
                  value={subOpt.value}
                  sx={{
                    borderRadius: "6px",
                    mx: 0.5,
                    mb: 0.5,
                    fontSize: "14px",
                    color: "text.primary",
                    "&.Mui-selected": {
                      bgcolor: "action.selected",
                      "&:hover": { bgcolor: "action.selected" },
                    },
                    "&:hover": { bgcolor: "action.hover" },
                  }}
                >
                  {subOpt.label}
                </MenuItem>
              )),
            ];
          }
          return (
            <MenuItem
              key={opt.value}
              value={opt.value}
              sx={{
                borderRadius: "6px",
                mx: 0.5,
                mb: 0.5,
                fontSize: "14px",
                color: "text.primary",
                "&.Mui-selected": {
                  bgcolor: "action.selected",
                  "&:hover": { bgcolor: "action.selected" },
                },
                "&:hover": { bgcolor: "action.hover" },
              }}
            >
              {opt.label}
            </MenuItem>
          );
        }))}
      </Select>
    </FormControl>
  );
}
