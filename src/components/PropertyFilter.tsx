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
import { useRouter, usePathname } from "next/navigation";

interface PropertyFilterProps {
  value: string | null;
  onChange?: (propertyId: string | null) => void;
}

export default function PropertyFilter({
  value,
  onChange,
}: PropertyFilterProps) {
  const { properties, setSelectedProperty, selectedProperty } = usePropertyStore();
  const router = useRouter();
  const pathname = usePathname();

  const handleChange = (e: SelectChangeEvent<string>) => {
    const val = e.target.value;
    const propertyId = val === "all" ? null : val;
    const newProperty = propertyId ? properties.find(p => p.id === propertyId) || null : null;
    
    setSelectedProperty(newProperty);

    if (onChange) {
      onChange(propertyId);
    }

    // Navigation logic
    const isPropertyExpenses = pathname.includes("/expenses");
    const isPropertyPayouts = pathname.includes("/payouts");

    if (propertyId) {
      // If on an expense/payout page, update route to reflect new property
      if (isPropertyExpenses) {
        router.push(`/properties/${propertyId}/expenses`);
      } else if (isPropertyPayouts) {
        router.push(`/properties/${propertyId}/payouts`);
      }
    } else {
      // If "All Properties" is selected and we're on a property-specific page, go to dashboard
      if (isPropertyExpenses || isPropertyPayouts || pathname.startsWith("/properties/")) {
        router.push("/dashboard");
      }
    }
  };

  return (
    <FormControl size="small" sx={{ width: { xs: "100%", sm: 220 } }}>
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
