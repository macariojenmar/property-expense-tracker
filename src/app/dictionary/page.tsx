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
import PageHeader from "@/components/layout/PageHeader";
import { Plus, Trash2, BookText } from "lucide-react";
import {
  getDictionaryWords,
  addDictionaryWord,
  deleteDictionaryWord,
} from "@/lib/actions/dictionary";
import { usePropertyStore } from "@/store/usePropertyStore";
import ConfirmDialog from "@/components/ConfirmDialog";
import Loader from "@/components/Loader";
import EmptyState from "@/components/EmptyState";

interface Word {
  id: string;
  word: string;
}

export default function DictionaryPage() {
  const [words, setWords] = React.useState<Word[]>([]);
  const [newWord, setNewWord] = React.useState("");
  const { setIsSaving, isSaving } = usePropertyStore();
  const [initialLoading, setInitialLoading] = React.useState(true);

  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [wordToDelete, setWordToDelete] = React.useState<Word | null>(null);

  React.useEffect(() => {
    fetchWords(true);
  }, []);

  const fetchWords = async (isInitial = false) => {
    if (isInitial) setInitialLoading(true);
    setIsSaving(true);
    try {
      const data = await getDictionaryWords();
      setWords(data);
    } catch (error) {
      console.error("Failed to fetch words:", error);
    } finally {
      setIsSaving(false);
      if (isInitial) setInitialLoading(false);
    }
  };

  const handleAddWord = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = newWord.trim();
    if (
      trimmed &&
      !words.find((w) => w.word.toLowerCase() === trimmed.toLowerCase())
    ) {
      setIsSaving(true);
      try {
        await addDictionaryWord(trimmed);
        setNewWord("");
        await fetchWords();
      } catch (error) {
        console.error("Failed to add word:", error);
      } finally {
        setIsSaving(false);
      }
    }
  };

  const handleDeleteClick = (word: Word) => {
    setWordToDelete(word);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!wordToDelete) return;

    setIsSaving(true);
    const id = wordToDelete.id;
    try {
      await deleteDictionaryWord(id);
      setWords(words.filter((w) => w.id !== id));
      setDeleteDialogOpen(false);
      setWordToDelete(null);
    } catch (error) {
      console.error("Failed to delete word:", error);
      await fetchWords(); // Revert/Refresh on error
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <DashboardLayout>
      <Box sx={{ maxWidth: 800, mx: "auto" }}>
        <PageHeader
          title="Dictionary"
          subtitle="Manage frequently used words for expenses and payouts."
        />
        <Card sx={{ p: 3, mb: 4, borderRadius: 3 }}>
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
                disabled={!newWord.trim() || isSaving}
                sx={{ height: 56, width: { xs: "100%", sm: 200 } }}
              >
                Add Word
              </Button>
            </Stack>
          </form>
        </Card>

        {initialLoading ? (
          <Loader message="Loading dictionary..." />
        ) : (
          <Grid container spacing={2}>
            {words.map((item) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={item.id}>
                <Card
                  sx={{
                    p: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    transition: "all 0.2s",
                    borderRadius: 3,
                    "&:hover": {
                      bgcolor: (theme) =>
                        alpha(theme.palette.primary.main, 0.04),
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
                      {item.word}
                    </Typography>
                  </Stack>
                  <IconButton
                    size="small"
                    onClick={() => handleDeleteClick(item)}
                    sx={{
                      color: "text.secondary",
                      ml: 1,
                      "&:hover": {
                        color: "error.main",
                        bgcolor: (theme) =>
                          alpha(theme.palette.error.main, 0.08),
                      },
                    }}
                  >
                    <Trash2 size={18} />
                  </IconButton>
                </Card>
              </Grid>
            ))}
            {words.length === 0 && (
              <Grid size={12}>
                <EmptyState
                  icon={BookText}
                  title="No words found"
                  description="Start adding words to your dictionary."
                  fullHeight
                />
              </Grid>
            )}
          </Grid>
        )}

        <ConfirmDialog
          open={deleteDialogOpen}
          title="Delete Word?"
          message={`Are you sure you want to delete "${wordToDelete?.word}"? This action cannot be undone.`}
          confirmLabel="Delete"
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteDialogOpen(false)}
          loading={isSaving}
        />
      </Box>
    </DashboardLayout>
  );
}
