"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Box,
  Typography,
  Chip,
  IconButton,
  alpha,
  Alert,
  Card,
  CardContent,
  Grid,
  Stack,
  Divider,
  Button,
} from "@mui/material";
import {
  User as UserIcon,
  Mail,
  ShieldAlert,
  Calendar,
  Users,
  Search,
  ChevronLeft,
  ChevronRight,
  UserPlus,
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { getUsers, expireUserTrial } from "@/lib/actions/platform";
import { format, differenceInDays, isPast } from "date-fns";
import { useRouter } from "next/navigation";
import EmptyState from "@/components/EmptyState";
import Loader from "@/components/Loader";
import { InputAdornment, TextField } from "@mui/material";
import StandardSelect from "@/components/StandardSelect";
import PageHeader from "@/components/layout/PageHeader";
import { Clock, AlertTriangle } from "lucide-react";
import ConfirmDialog from "@/components/ConfirmDialog";

type UserData = {
  id: string;
  name: string | null;
  email: string | null;
  role: string;
  status: string;
  accountType: string;
  expiredAt: Date | null;
  createdAt: Date;
};

export default function UserManagementPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [accountTypeFilter, setAccountTypeFilter] = useState("all");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const itemsPerPage = 10;
  const router = useRouter();

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getUsers({
        page,
        limit: itemsPerPage,
        search: debouncedSearch,
        role: roleFilter === "all" ? undefined : (roleFilter as any),
        status: statusFilter === "all" ? undefined : (statusFilter as any),
        accountType:
          accountTypeFilter === "all" ? undefined : (accountTypeFilter as any),
      });
      if (res.success && res.data) {
        setUsers(res.data.users as any);
        setTotalPages(res.data.totalPages);
        setTotalCount(res.data.totalCount);
      } else {
        setError(res.message || "Failed to load users");
      }
    } catch (err) {
      console.error(err);
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }, [
    page,
    debouncedSearch,
    roleFilter,
    statusFilter,
    accountTypeFilter,
    itemsPerPage,
  ]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Handle search debouncing
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  // Reset to page 1 when filters or search change
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, roleFilter, statusFilter, accountTypeFilter]);

  const handleEditClick = (user: UserData) => {
    router.push(`/platform/users/${user.id}/edit`);
  };

  const handleExpireTrial = async (e: React.MouseEvent, userId: string) => {
    e.stopPropagation();
    setSelectedUserId(userId);
    setConfirmOpen(true);
  };

  const handleConfirmExpire = async () => {
    if (!selectedUserId) return;
    
    setLoading(true);
    try {
      const res = await expireUserTrial(selectedUserId);
      if (res?.success) {
        fetchUsers();
      } else {
        alert(res?.message || "Failed to expire trial");
      }
    } catch (err) {
      console.error(err);
      alert("An unexpected error occurred while expiring trial.");
    } finally {
      setConfirmOpen(false);
      setSelectedUserId(null);
      setLoading(false);
    }
  };

  const getStatusColors = (status: string) => {
    const statusColors: Record<string, { bg: string; text: string }> = {
      ACTIVE: { bg: "success.main", text: "success.main" },
      INACTIVE: { bg: "error.main", text: "error.main" },
      PENDING: { bg: "info.main", text: "info.main" },
      DELETED: { bg: "error.main", text: "error.main" },
    };
    return (
      statusColors[status] || {
        bg: "text.secondary",
        text: "text.secondary",
      }
    );
  };

  const getAccountTypeColors = (type: string) => {
    const typeColors: Record<
      string,
      { bg: string; text: string; border: string }
    > = {
      PRO: { bg: "#f3e8ff", text: "#9333ea", border: "#e9d5ff" }, // Purple
      STANDARD: { bg: "#eff6ff", text: "#2563eb", border: "#bfdbfe" }, // Blue
      TRIAL: { bg: "#fff7ed", text: "#ea580c", border: "#fed7aa" }, // Orange
    };
    return (
      typeColors[type.toUpperCase()] || {
        bg: "transparent",
        text: "text.secondary",
        border: "rgba(0,0,0,0.12)",
      }
    );
  };

  return (
    <DashboardLayout>
      <PageHeader
        title="User Management"
        subtitle="Manage system users, their roles, status, and account types."
        actions={
          <Button
            variant="contained"
            startIcon={<UserPlus size={18} />}
            onClick={() => router.push("/platform/users/create")}
            sx={{
              width: { xs: "100%", md: "auto" },
            }}
          >
            Create User
          </Button>
        }
      />
      <Box
        sx={{
          mb: 4,
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          gap: 2,
          alignItems: { xs: "stretch", md: "flex-end" },
        }}
      >
        <TextField
          size="small"
          placeholder="Search name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ flexGrow: 1 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search size={18} />
              </InputAdornment>
            ),
          }}
        />
        <Stack direction="row" spacing={2} sx={{ flexShrink: 0, flexGrow: 1 }}>
          <StandardSelect
            value={roleFilter}
            onChange={setRoleFilter}
            options={[
              {
                options: [
                  { value: "all", label: "All Roles" },
                  { value: "USER", label: "User" },
                  { value: "DEVELOPER", label: "Developer" },
                ],
              },
            ]}
            fullWidth
            sx={{ flex: 1 }}
          />
          <StandardSelect
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              {
                options: [
                  { value: "all", label: "All Status" },
                  { value: "ACTIVE", label: "Active" },
                  { value: "INACTIVE", label: "Inactive" },
                  { value: "PENDING", label: "Pending" },
                  { value: "DELETED", label: "Deleted" },
                ],
              },
            ]}
            fullWidth
            sx={{ flex: 1 }}
          />
          <StandardSelect
            value={accountTypeFilter}
            onChange={setAccountTypeFilter}
            options={[
              {
                options: [
                  { value: "all", label: "All Types" },
                  { value: "TRIAL", label: "Trial" },
                  { value: "STANDARD", label: "Standard" },
                  { value: "PRO", label: "Pro" },
                ],
              },
            ]}
            fullWidth
            sx={{ flex: 1 }}
          />
        </Stack>
      </Box>

      <Box sx={{ flexGrow: 1, minHeight: 400, width: "100%" }}>
        {loading ? (
          <Loader message="Fetching users..." />
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : users.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No users found"
            description="Manage system users, their roles, status, and account types by adding your first user."
          />
        ) : (
          <>
            {totalPages > 1 && (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "flex-end",
                  alignItems: "center",
                  gap: 2,
                  mb: 3,
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  {(page - 1) * itemsPerPage + 1}–
                  {Math.min(page * itemsPerPage, totalCount)} of {totalCount}
                </Typography>
                <Stack direction="row" spacing={1}>
                  <IconButton
                    size="small"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    sx={{ color: "text.secondary" }}
                  >
                    <ChevronLeft size={20} />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    sx={{ color: "text.secondary" }}
                  >
                    <ChevronRight size={20} />
                  </IconButton>
                </Stack>
              </Box>
            )}

            <Grid container spacing={3}>
              {users.map((user) => {
                const statusColor = getStatusColors(user.status);
                const accountColor = getAccountTypeColors(user.accountType);
                return (
                  <Grid size={{ xs: 12, sm: 6, md: 4 }} key={user.id}>
                    <Card
                      onClick={() => handleEditClick(user)}
                      elevation={0}
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        height: "100%",
                        transition: "all 0.2s",
                        border: "1px solid",
                        borderColor: "divider",
                        "&:hover": {
                          bgcolor: (theme: any) =>
                            alpha(theme.palette.primary.main, 0.04),
                          cursor: "pointer",
                        },
                      }}
                    >
                      <CardContent sx={{ flexGrow: 1, p: 3 }}>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                            mb: 2,
                          }}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              gap: 1,
                              flexDirection: "column",
                            }}
                          >
                            <Typography
                              variant="h6"
                              fontWeight={700}
                              sx={{ lineHeight: 1.2 }}
                            >
                              {user.name || "N/A"}
                            </Typography>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 0.5,
                                color: "text.secondary",
                              }}
                            >
                              <Mail size={14} />
                              <Typography variant="body2">
                                {user.email}
                              </Typography>
                            </Box>
                          </Box>
                        </Box>

                        <Divider sx={{ my: 2 }} />

                        <Stack spacing={2}>
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                            }}
                          >
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                                color: "text.secondary",
                              }}
                            >
                              <ShieldAlert size={16} />
                              <Typography variant="body2" fontWeight={500}>
                                Role
                              </Typography>
                            </Box>
                            <Chip
                              label={user.role}
                              size="small"
                              sx={{
                                fontWeight: 700,
                                fontSize: "0.72rem",
                                borderRadius: 2,
                              }}
                            />
                          </Box>

                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                            }}
                          >
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                                color: "text.secondary",
                              }}
                            >
                              <UserIcon size={16} />
                              <Typography variant="body2" fontWeight={500}>
                                Account
                              </Typography>
                            </Box>
                            <Chip
                              label={user.accountType}
                              size="small"
                              sx={{
                                bgcolor: alpha(accountColor.text, 0.2),
                                color: accountColor.text,
                                fontWeight: 700,
                                fontSize: "0.72rem",
                                borderRadius: 2,
                              }}
                            />
                          </Box>

                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                            }}
                          >
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                                color: "text.secondary",
                              }}
                            >
                              <Box
                                sx={{
                                  width: 8,
                                  height: 8,
                                  borderRadius: "50%",
                                  bgcolor: statusColor.bg,
                                  ml: 0.5,
                                  mr: 0.5,
                                }}
                              />
                              <Typography variant="body2" fontWeight={500}>
                                Status
                              </Typography>
                            </Box>
                            <Chip
                              label={user.status}
                              size="small"
                              sx={{
                                color: statusColor.text,
                                fontWeight: 700,
                                fontSize: "0.72rem",
                                borderRadius: 2,
                              }}
                            />
                          </Box>

                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              mt: 1,
                            }}
                          >
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                                color: "text.secondary",
                              }}
                            >
                              <Calendar size={16} />
                              <Typography variant="body2" fontWeight={500}>
                                Joined
                              </Typography>
                            </Box>
                            <Typography
                              variant="body2"
                              fontWeight={600}
                              color="text.primary"
                            >
                              {user.createdAt
                                ? format(
                                    new Date(user.createdAt),
                                    "MMM d, yyyy",
                                  )
                                : "N/A"}
                            </Typography>
                          </Box>
                          {user.accountType === "TRIAL" && user.expiredAt && (
                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                mt: 0.5,
                                p: 1,
                                bgcolor: (theme) =>
                                  alpha(theme.palette.warning.main, 0.08),
                                borderRadius: 1.5,
                              }}
                            >
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 1,
                                  color: "warning.main",
                                }}
                              >
                                <Clock size={16} />
                                <Typography variant="body2" fontWeight={600}>
                                  Trial Status
                                </Typography>
                              </Box>
                                <Box sx={{ textAlign: "right" }}>
                                  <Typography
                                    variant="body2"
                                    fontWeight={700}
                                    color={
                                      isPast(new Date(user.expiredAt))
                                        ? "error.main"
                                        : "warning.main"
                                    }
                                  >
                                    {isPast(new Date(user.expiredAt))
                                      ? "Expired"
                                      : `${differenceInDays(new Date(user.expiredAt), new Date())} days left`}
                                  </Typography>
                                  {!isPast(new Date(user.expiredAt)) && (
                                    <Button
                                      size="small"
                                      color="warning"
                                      onClick={(e) => handleExpireTrial(e, user.id)}
                                      sx={{ 
                                        p: 0, 
                                        minWidth: 0, 
                                        fontSize: "0.65rem", 
                                        height: "auto",
                                        "&:hover": { bgcolor: "transparent", textDecoration: "underline" }
                                      }}
                                    >
                                      Expire Today
                                    </Button>
                                  )}
                                </Box>
                            </Box>
                          )}
                        </Stack>
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          </>
        )}
      </Box>

      <ConfirmDialog
        open={confirmOpen}
        loading={loading}
        title="Expire Trial Immediately"
        message="Are you sure you want to expire this trial for this user today? This action cannot be undone."
        confirmLabel="Expire Now"
        onConfirm={handleConfirmExpire}
        onCancel={() => setConfirmOpen(false)}
      />
    </DashboardLayout>
  );
}
