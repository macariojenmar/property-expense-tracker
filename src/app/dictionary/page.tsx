"use client";

import * as React from "react";
import {
  Box,
  Typography,
  Card,
  Button,
  TextField,
  Stack,
  IconButton,
  alpha,
  Grid,
} from "@mui/material";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Plus, Trash2, BookText } from "lucide-react";

export default function DictionaryPage() {
  const [words, setWords] = React.useState<string[]>([]);
  const [newWord, setNewWord] = React.useState("");

  React.useEffect(() => {
    const saved = localStorage.getItem("propertyTracker_dictionary");
    if (saved) {
      try {
        setWords(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse dictionary", e);
      }
    } else {
      // Default words
      const defaults = [
        "Internet",
        "Rent",
        "Transportation",
        "Water Bill",
        "Electricity Bill",
        "Cleaning Fee",
        "Maintenance",
        "Property Tax",
      ];
      setWords(defaults);
      localStorage.setItem(
        "propertyTracker_dictionary",
        JSON.stringify(defaults),
      );
    }
  }, []);

  const saveWords = (newWords: string[]) => {
    setWords(newWords);
    localStorage.setItem(
      "propertyTracker_dictionary",
      JSON.stringify(newWords),
    );
  };

  const handleAddWord = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = newWord.trim();
    if (trimmed && !words.includes(trimmed)) {
      saveWords([...words, trimmed]);
      setNewWord("");
    }
  };

  const handleDeleteWord = (wordToDelete: string) => {
    saveWords(words.filter((w) => w !== wordToDelete));
  };

  return (
    <DashboardLayout>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ mb: 1 }}>
          Dictionary
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Manage frequently used words for expenses and payouts.
        </Typography>
      </Box>

      <Card sx={{ p: 3, mb: 4 }}>
        <form onSubmit={handleAddWord}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            alignItems="center"
          >
            <TextField
              fullWidth
              label="New Word"
              placeholder="e.g. Repairs, Salaries"
              value={newWord}
              onChange={(e) => setNewWord(e.target.value)}
            />
            <Button
              variant="contained"
              startIcon={<Plus size={18} />}
              type="submit"
              disabled={!newWord.trim()}
              sx={{ minWidth: 120, height: 56 }}
            >
              Add Word
            </Button>
          </Stack>
        </form>
      </Card>

      <Grid container spacing={2}>
        {words.map((word) => (
          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={word}>
            <Card
              sx={{
                p: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                transition: "all 0.2s",
                "&:hover": {
                  bgcolor: (theme) => alpha(theme.palette.primary.main, 0.04),
                },
              }}
            >
              <Stack
                direction="row"
                spacing={2}
                alignItems="center"
                sx={{ overflow: "hidden" }}
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
                  }}
                >
                  <BookText size={18} />
                </Box>
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontWeight: 600,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {word}
                </Typography>
              </Stack>
              <IconButton
                size="small"
                onClick={() => handleDeleteWord(word)}
                sx={{ color: "error.main", ml: 1 }}
              >
                <Trash2 size={16} />
              </IconButton>
            </Card>
          </Grid>
        ))}
        {words.length === 0 && (
          <Grid size={12}>
            <Box sx={{ textAlign: "center", py: 4 }}>
              <Typography color="text.secondary">
                No words in dictionary yet.
              </Typography>
            </Box>
          </Grid>
        )}
      </Grid>
    </DashboardLayout>
  );
}
