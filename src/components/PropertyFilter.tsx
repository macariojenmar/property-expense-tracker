import * as React from "react";
import {
  Box,
  FormControl,
  Select,
  MenuItem,
  SelectChangeEvent,
} from "@mui/material";
import { ChevronDown } from "lucide-react";
import { usePropertyStore } from "@/store/usePropertyStore";

interface PropertyFilterProps {
  value: number | null;
  onChange: (propertyId: number | null) => void;
}

export default function PropertyFilter({
  value,
  onChange,
}: PropertyFilterProps) {
  const properties = usePropertyStore((state) => state.properties);

  const handleChange = (e: SelectChangeEvent<string>) => {
    const val = e.target.value;
    onChange(val === "all" ? null : Number(val));
  };

  return (
    <FormControl size="small" sx={{ width: 220 }}>
      <Select
        value={value === null ? "all" : value.toString()}
        displayEmpty
        onChange={handleChange}
        IconComponent={(props) => (
          <Box
            {...props}
            sx={{
              display: "flex",
              alignItems: "center",
              mr: 1,
              color: "text.secondary",
            }}
          >
            <ChevronDown size={18} />
          </Box>
        )}
        MenuProps={{
          PaperProps: {
            sx: {
              bgcolor: "background.paper",
              backgroundImage: "none",
              mt: 1,
              borderRadius: "8px",
              border: "1px solid",
              borderColor: "divider",
              boxShadow:
                "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
              "& .MuiList-root": {
                p: 1,
              },
            },
          },
        }}
        sx={{
          bgcolor: "background.paper",
          borderRadius: "8px",
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: "divider",
            transition: "all 0.2s",
          },
          "&:hover": {
            bgcolor: "action.hover",
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "divider",
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: "primary.main",
            borderWidth: "1px",
          },
          "& .MuiSelect-select": {
            display: "flex",
            alignItems: "center",
            py: "10px",
            pr: "40px !important",
            fontWeight: 500,
            fontSize: "14px",
          },
        }}
      >
        <MenuItem
          value="all"
          sx={{
            borderRadius: "6px",
            mx: 0.5,
            fontSize: "14px",
            "&:hover": { bgcolor: "action.hover" },
          }}
        >
          All Properties
        </MenuItem>
        {properties.map((property) => (
          <MenuItem
            key={property.id}
            value={property.id.toString()}
            sx={{
              borderRadius: "6px",
              mx: 0.5,
              fontSize: "14px",
              "&:hover": { bgcolor: "action.hover" },
            }}
          >
            {property.name}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
