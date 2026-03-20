"use client";

import * as React from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  Stack,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
} from "@mui/material";
import { ArrowLeft, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import PageHeader from "../layout/PageHeader";

interface EntityData {
  name: string;
  type: string;
}

interface EntityFormProps {
  initialData?: EntityData;
  onSubmit: (data: EntityData) => Promise<void>;
  title: string;
  description: string;
  submitLabel: string;
  loading?: boolean;
}

export default function EntityForm({
  initialData,
  onSubmit,
  title,
  description,
  submitLabel,
  loading = false,
}: EntityFormProps) {
  const router = useRouter();
  const [name, setName] = React.useState(initialData?.name || "");
  const [type, setType] = React.useState(initialData?.type || "Person");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    await onSubmit({ name, type });
  };

  return (
    <DashboardLayout width="md">
      <PageHeader
        title={title}
        subtitle={description}
        onBack={() => router.back()}
      />
      <Card>
        <CardContent sx={{ p: 4 }}>
          <form onSubmit={handleSubmit}>
            <Stack spacing={4}>
              <Grid container spacing={3}>
                <Grid size={12}>
                  <TextField
                    fullWidth
                    label="Entity Name"
                    placeholder="e.g. John Doe or ACME Corp"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 1.5 } }}
                    autoFocus={!initialData}
                    disabled={loading}
                  />
                </Grid>
                <Grid size={12}>
                  <FormControl fullWidth disabled={loading}>
                    <InputLabel>Type</InputLabel>
                    <Select
                      value={type}
                      label="Type"
                      onChange={(e) => setType(e.target.value)}
                      sx={{ borderRadius: 1.5 }}
                    >
                      <MenuItem value="Person">Person</MenuItem>
                      <MenuItem value="Organization">Organization</MenuItem>
                      <MenuItem value="Other">Other</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>

              <Stack
                direction={{ xs: "column", md: "row" }}
                justifyContent="flex-end"
                gap={2}
              >
                <Button
                  variant="outlined"
                  onClick={() => router.back()}
                  sx={{ borderRadius: 1.5, px: 3 }}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={loading ? null : <Save size={18} />}
                  disabled={loading || !name}
                  sx={{
                    borderRadius: 1.5,
                    px: 3,
                    bgcolor: "text.primary",
                    color: "background.paper",
                    "&:hover": { bgcolor: "primary.main", opacity: 0.9 },
                  }}
                >
                  {loading ? "Saving..." : submitLabel}
                </Button>
              </Stack>
            </Stack>
          </form>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
