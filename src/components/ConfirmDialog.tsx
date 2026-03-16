"use client";

import * as React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from "@mui/material";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
  loading = false,
}: ConfirmDialogProps) {
  return (
    <Dialog
      maxWidth="xs"
      open={open}
      onClose={onCancel}
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-description"
      PaperProps={{
        sx: {
          borderRadius: 2,
          padding: 1,
        },
      }}
    >
      <DialogTitle id="confirm-dialog-title" sx={{ fontWeight: 700 }}>
        {title}
      </DialogTitle>
      <DialogContent>
        <DialogContentText id="confirm-dialog-description">
          {message}
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button
          onClick={onCancel}
          disabled={loading}
          sx={{ borderRadius: 1.5, textTransform: "none", fontWeight: 600 }}
        >
          {cancelLabel}
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          disabled={loading}
          color="error"
          autoFocus
          sx={{
            borderRadius: 1.5,
            textTransform: "none",
            fontWeight: 600,
            boxShadow: "none",
            "&:hover": { boxShadow: "none" },
          }}
        >
          {loading ? "Processing..." : confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
