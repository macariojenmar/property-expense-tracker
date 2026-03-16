"use client";

import * as React from "react";
import {
  Box,
  Typography,
  Button,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Container,
} from "@mui/material";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Plus, Pencil, Trash2, ArrowLeft, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  getPendingToEntities,
  deletePendingToEntity,
} from "@/lib/actions/pending-to";
import Loader from "@/components/Loader";
import EmptyState from "@/components/EmptyState";

export default function EntitiesPage() {
  const router = useRouter();
  const [entities, setEntities] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  const fetchEntities = async () => {
    setLoading(true);
    try {
      const data = await getPendingToEntities();
      setEntities(data);
    } catch (error) {
      console.error("Failed to fetch entities:", error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchEntities();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this entity?")) return;
    try {
      await deletePendingToEntity(id);
      fetchEntities();
    } catch (error) {
      console.error("Failed to delete entity:", error);
    }
  };

  return (
    <DashboardLayout>
      <Container maxWidth="md">
        <Box sx={{ mb: 4, display: "flex", alignItems: "center", gap: 2 }}>
          <IconButton onClick={() => router.back()} size="small">
            <ArrowLeft size={20} />
          </IconButton>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h4" fontWeight={700}>
              Pending To Entities
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Manage people or organizations for pending expenses.
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<Plus size={18} />}
            onClick={() => router.push("/entities/create")}
            sx={{ borderRadius: 1.5, px: 3, height: 44 }}
          >
            Add Entity
          </Button>
        </Box>

        {loading ? (
          <Loader message="Loading entities..." />
        ) : entities.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No entities found"
            description="Manage people or organizations you pay for expenses by adding your first entity."
          />
        ) : (
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {entities.map((entity) => (
                  <TableRow key={entity.id}>
                    <TableCell sx={{ fontWeight: 600 }}>
                      {entity.name}
                    </TableCell>
                    <TableCell>{entity.type}</TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        onClick={() =>
                          router.push(`/entities/${entity.id}/edit`)
                        }
                        sx={{ mr: 1 }}
                      >
                        <Pencil size={18} />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDelete(entity.id)}
                      >
                        <Trash2 size={18} />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Container>
    </DashboardLayout>
  );
}
