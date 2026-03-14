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
import DashboardLayout from "@/components/layout/DashboardLayout";
import { ArrowLeft, Save } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { getPendingToEntity, updatePendingToEntity } from "@/lib/actions/pending-to";
import Loader from "@/components/Loader";

export default function EditEntityPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  
  const [name, setName] = React.useState("");
  const [type, setType] = React.useState("Person");
  const [loading, setLoading] = React.useState(true);
  const [submitting, setSubmitting] = React.useState(false);

  React.useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const entity = await getPendingToEntity(id);
        if (entity) {
          setName(entity.name);
          setType(entity.type || "Person");
        }
      } catch (error) {
        console.error("Failed to fetch entity:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleSubmit = async () => {
    if (!name) return;
    setSubmitting(true);
    try {
      await updatePendingToEntity(id, { name, type });
      router.push("/entities");
    } catch (error) {
      console.error("Failed to update entity:", error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <Loader message="Loading entity details..." />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Box sx={{ maxWidth: 600, mx: "auto" }}>
        <Box sx={{ mb: 4, display: "flex", alignItems: "center", gap: 2 }}>
          <IconButton onClick={() => router.back()} size="small">
            <ArrowLeft size={20} />
          </IconButton>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: "-0.02em" }}>Edit Entity</Typography>
            <Typography variant="body2" color="text.secondary">
              Update details for {name}.
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
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
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
                  {submitting ? "Saving..." : "Save Changes"}
                </Button>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Box>
    </DashboardLayout>
  );
}
