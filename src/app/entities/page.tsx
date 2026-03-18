"use client";

import * as React from "react";
import {
  Box,
  Typography,
  Button,
  IconButton,
  Card,
  Stack,
  alpha,
  Grid,
} from "@mui/material";
import DashboardLayout from "@/components/layout/DashboardLayout";
import PageHeader from "@/components/layout/PageHeader";
import {
  Plus,
  Pencil,
  Trash2,
  Users,
  ChevronLeft,
  ChevronRight,
  Building2,
  User,
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
  getPendingToEntities,
  deletePendingToEntity,
} from "@/lib/actions/pending-to";
import Loader from "@/components/Loader";
import EmptyState from "@/components/EmptyState";
import ConfirmDialog from "@/components/ConfirmDialog";

interface Entity {
  id: string;
  name: string;
  type: string | null;
}

export default function EntitiesPage() {
  const router = useRouter();
  const [entities, setEntities] = React.useState<Entity[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [page, setPage] = React.useState(1);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [entityToDelete, setEntityToDelete] = React.useState<Entity | null>(
    null,
  );
  const [isDeleting, setIsDeleting] = React.useState(false);
  const itemsPerPage = 6;

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

  const handleDelete = (entity: Entity) => {
    setEntityToDelete(entity);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!entityToDelete) return;
    setIsDeleting(true);
    try {
      await deletePendingToEntity(entityToDelete.id);
      fetchEntities();
      setIsDeleteDialogOpen(false);
      setEntityToDelete(null);
    } catch (error) {
      console.error("Failed to delete entity:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const totalPages = Math.ceil(entities.length / itemsPerPage);
  const paginatedEntities = entities.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage,
  );

  return (
    <DashboardLayout width="md">
      <PageHeader
        title="Entities"
        subtitle="Manage people or organizations for pending expenses."
        sx={{ mb: 4 }}
        actions={
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              width: { xs: "100%", md: "auto" },
            }}
          >
            {entities.length > itemsPerPage && (
              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                sx={{ display: { xs: "none", md: "flex" } }}
              >
                <Typography variant="body2" color="text.secondary">
                  {(page - 1) * itemsPerPage + 1}–
                  {Math.min(page * itemsPerPage, entities.length)} of{" "}
                  {entities.length}
                </Typography>
                <Stack direction="row" spacing={0.5}>
                  <IconButton
                    size="small"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    <ChevronLeft size={20} />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                  >
                    <ChevronRight size={20} />
                  </IconButton>
                </Stack>
              </Stack>
            )}
            <Button
              variant="contained"
              startIcon={<Plus size={18} />}
              onClick={() => router.push("/entities/create")}
              sx={{ flex: { xs: 1, md: "none" } }}
            >
              Add Entity
            </Button>
          </Box>
        }
      />

      {entities.length > itemsPerPage && (
        <Box
          sx={{
            display: { xs: "flex", md: "none" },
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Typography variant="body2" color="text.secondary">
            {(page - 1) * itemsPerPage + 1}–
            {Math.min(page * itemsPerPage, entities.length)} of{" "}
            {entities.length}
          </Typography>
          <Stack direction="row" spacing={0.5}>
            <IconButton
              size="small"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              <ChevronLeft size={20} />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              <ChevronRight size={20} />
            </IconButton>
          </Stack>
        </Box>
      )}

      {loading ? (
        <Loader message="Loading entities..." />
      ) : entities.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No entities found"
          description="Manage people or organizations you pay for expenses by adding your first entity."
        />
      ) : (
        <Grid container spacing={2}>
          {paginatedEntities.map((entity) => (
            <Grid key={entity.id} size={{ xs: 12, sm: 4 }}>
              <Card
                sx={{
                  p: 2,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  transition: "all 0.2s",
                  borderRadius: 3,
                  border: "1px solid",
                  borderColor: "divider",
                  height: "100%",
                  "&:hover": {
                    bgcolor: (theme) => alpha(theme.palette.primary.main, 0.04),
                    transform: "translateY(-2px)",
                    boxShadow: (theme) =>
                      `0 4px 12px ${alpha(theme.palette.common.black, 0.05)}`,
                  },
                }}
              >
                <Stack
                  direction="row"
                  spacing={2}
                  alignItems="center"
                  sx={{ overflow: "hidden", width: "100%" }}
                >
                  <Box
                    sx={{
                      p: 1,
                      bgcolor: (theme) =>
                        theme.palette.mode === "light"
                          ? alpha(theme.palette.primary.main, 0.1)
                          : alpha(theme.palette.primary.main, 0.2),
                      borderRadius: 1.5,
                      color: "primary.main",
                      display: "flex",
                      flexShrink: 0,
                    }}
                  >
                    {entity.type === "ORGANIZATION" ? (
                      <Building2 size={18} />
                    ) : (
                      <User size={18} />
                    )}
                  </Box>
                  <Box sx={{ overflow: "hidden" }}>
                    <Typography
                      variant="subtitle2"
                      sx={{
                        fontWeight: 600,
                        lineHeight: 1.2,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {entity.name}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{
                        textTransform: "capitalize",
                        display: "block",
                      }}
                    >
                      {entity.type?.toLowerCase() || "Individual"}
                    </Typography>
                  </Box>
                </Stack>
                <Stack direction="row" spacing={0.5} sx={{ ml: 1 }}>
                  <IconButton
                    size="small"
                    onClick={() => router.push(`/entities/${entity.id}/edit`)}
                    sx={{
                      color: "text.secondary",
                      "&:hover": {
                        color: "primary.main",
                        bgcolor: (theme) =>
                          alpha(theme.palette.primary.main, 0.08),
                      },
                    }}
                  >
                    <Pencil size={18} />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleDelete(entity)}
                    sx={{
                      color: "text.secondary",
                      "&:hover": {
                        color: "error.main",
                        bgcolor: (theme) =>
                          alpha(theme.palette.error.main, 0.08),
                      },
                    }}
                  >
                    <Trash2 size={18} />
                  </IconButton>
                </Stack>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
      <ConfirmDialog
        open={isDeleteDialogOpen}
        title="Delete Entity?"
        message={`Are you sure you want to delete "${entityToDelete?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setIsDeleteDialogOpen(false);
          setEntityToDelete(null);
        }}
        loading={isDeleting}
      />
    </DashboardLayout>
  );
}
