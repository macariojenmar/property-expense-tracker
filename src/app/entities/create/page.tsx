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
  Container,
} from "@mui/material";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { ArrowLeft, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { createPendingToEntity } from "@/lib/actions/pending-to";

export default function CreateEntityPage() {
  const router = useRouter();
  const [name, setName] = React.useState("");
  const [type, setType] = React.useState("Person");
  const [submitting, setSubmitting] = React.useState(false);

  const handleSubmit = async () => {
    if (!name) return;
    setSubmitting(true);
    try {
      await createPendingToEntity({ name, type });
      router.push("/entities");
    } catch (error) {
      console.error("Failed to create entity:", error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <Container maxWidth="sm">
        <Box sx={{ mb: 4, display: "flex", alignItems: "center", gap: 2 }}>
          <IconButton onClick={() => router.back()} size="small">
            <ArrowLeft size={20} />
          </IconButton>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: "-0.02em" }}>Add Entity</Typography>
            <Typography variant="body2" color="text.secondary">
              Create a new person or organization for pending expenses.
            </Typography>
          </Box>
        </Box>

        <Card>
          <CardContent sx={{ p: 4 }}>
            <Stack spacing={4}>
              <Grid container spacing={3}>
                <Grid size={12}>
                  <TextField
                    fullWidth
                    label="Entity Name"
                    placeholder="e.g. John Doe or ACME Corp"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
                    autoFocus
                  />
                </Grid>
                <Grid size={12}>
                  <FormControl fullWidth>
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

              <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
                <Button variant="outlined" onClick={() => router.back()} sx={{ borderRadius: 1.5, px: 3 }}>
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  startIcon={submitting ? null : <Save size={18} />}
                  onClick={handleSubmit}
                  disabled={submitting || !name}
                  sx={{ 
                    borderRadius: 1.5, 
                    px: 3, 
                    bgcolor: 'text.primary', 
                    color: 'background.paper', 
                    '&:hover': { bgcolor: 'primary.main', opacity: 0.9 } 
                  }}
                >
                  {submitting ? "Saving..." : "Create Entity"}
                </Button>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Container>
    </DashboardLayout>
  );
}
