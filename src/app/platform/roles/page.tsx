"use client";

import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import { User as UserIcon, Code2 } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import PageHeader from "@/components/layout/PageHeader";

export default function RolesPermissionsPage() {
  const roles = [
    {
      name: "User",
      description: "Standard platform user.",
      icon: <UserIcon size={20} />,
      color: "default" as const,
      permissions: [
        "Manage own properties",
        "Add, edit, delete expenses",
        "Add, edit, delete payouts",
        "Manage dictionary words",
        "Update own profile and password",
      ],
      restrictions: [
        "Cannot access Platform Management",
        "Cannot view or edit other users",
      ],
    },
    {
      name: "Developer",
      description: "Administrator with full access to platform settings.",
      icon: <Code2 size={20} />,
      color: "primary" as const,
      permissions: [
        "All User permissions",
        "Access Platform Management",
        "View all users in the system",
        "Modify user roles (User/Developer)",
        "Modify user status (Active/Inactive/Pending/Deleted)",
        "Modify account types (Trial/Standard/Pro)",
      ],
      restrictions: [],
    },
  ];

  return (
    <DashboardLayout>
      <Box sx={{ maxWidth: 1000, mx: "auto", width: "100%" }}>
        <PageHeader
          title="Roles & Permissions"
          subtitle="Overview of the access levels and permissions for different user roles in Ntorra."
        />

        <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {roles.map((role) => (
            <Paper
              key={role.name}
              elevation={0}
              sx={{
                p: 4,
                borderRadius: 4,
                border: "1px solid",
                borderColor: "divider",
                bgcolor: "background.paper",
                boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 48,
                    height: 48,
                    borderRadius: 3,
                    bgcolor: role.color === "primary" ? "primary.lighter" : "rgba(0,0,0,0.04)",
                    color: role.color === "primary" ? "primary.main" : "text.secondary",
                  }}
                >
                  {role.icon}
                </Box>
                <Box>
                  <Typography variant="h6" fontWeight={700}>
                    {role.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {role.description}
                  </Typography>
                </Box>
              </Box>

              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600, width: "50%" }}>
                        Permissions (Can Do)
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, width: "50%" }}>
                        Restrictions (Cannot Do)
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell sx={{ verticalAlign: "top", pt: 2 }}>
                        <ul style={{ margin: 0, paddingLeft: 20 }}>
                          {role.permissions.map((perm, idx) => (
                            <li key={idx}>
                              <Typography variant="body2" sx={{ mb: 1 }}>
                                {perm}
                              </Typography>
                            </li>
                          ))}
                        </ul>
                      </TableCell>
                      <TableCell sx={{ verticalAlign: "top", pt: 2 }}>
                        {role.restrictions.length > 0 ? (
                          <ul style={{ margin: 0, paddingLeft: 20 }}>
                            {role.restrictions.map((rest, idx) => (
                              <li key={idx}>
                                <Typography
                                  variant="body2"
                                  sx={{ mb: 1, color: "error.main" }}
                                >
                                  {rest}
                                </Typography>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <Typography
                            variant="body2"
                            sx={{ color: "text.secondary", fontStyle: "italic" }}
                          >
                            No significant restrictions applied to this role.
                          </Typography>
                        )}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          ))}
        </Box>
      </Box>
    </DashboardLayout>
  );
}
