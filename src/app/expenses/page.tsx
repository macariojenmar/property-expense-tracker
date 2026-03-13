'use client';

import * as React from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  Button, 
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Stack,
  InputAdornment,
  IconButton,
  alpha
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Plus, BanknoteArrowDown, Calendar, FileText, ChevronRight, ChevronLeft } from 'lucide-react';
import { format, isSameMonth, parseISO } from 'date-fns';
import { useCurrency } from '@/components/CurrencyContext';
import NumericFormatInput from '@/components/NumericFormatInput';
import MonthFilter from '@/components/MonthFilter';

const mockExpenses = [
  { id: 1, name: 'Cleaning Fee', amount: 1500, note: 'Deep clean for Check-in', date: '2026-03-10' },
  { id: 2, name: 'Water Bill', amount: 800, note: 'February 2026', date: '2026-03-05' },
  { id: 3, name: 'Internet Subscription', amount: 1800, note: 'Fiber Plan 100Mbps', date: '2026-03-01' },
  { id: 4, name: 'Property Tax', amount: 5000, note: 'Annual payment', date: '2026-03-12' },
  { id: 5, name: 'Repair: Faucet', amount: 450, note: 'Kitchen sink leak fixed', date: '2026-03-15' },
  { id: 6, name: 'Electricity Bill', amount: 3200, note: 'Main house usage', date: '2026-03-18' },
];

export default function ExpensesPage() {
  const { formatAmount, currency } = useCurrency();
  const [open, setOpen] = React.useState(false);
  const [selectedDate, setSelectedDate] = React.useState<Date | null>(new Date());
  const [filterDate, setFilterDate] = React.useState<Date | null>(new Date());
  
  // Pagination state
  const [page, setPage] = React.useState(1);
  const itemsPerPage = 5;

  const filteredExpenses = React.useMemo(() => {
    if (!filterDate) return mockExpenses;
    return mockExpenses.filter(expense => isSameMonth(parseISO(expense.date), filterDate));
  }, [filterDate]);

  const totalPages = Math.ceil(filteredExpenses.length / itemsPerPage);
  const paginatedExpenses = filteredExpenses.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const totalAmount = React.useMemo(() => {
    return filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  }, [filteredExpenses]);


  return (
    <DashboardLayout>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" sx={{ mb: 1 }}>Expenses</Typography>
          <Typography variant="body2" color="text.secondary">Track and manage your property expenditures.</Typography>
        </Box>
        <Stack direction="row" spacing={2} alignItems="center">
          <MonthFilter value={filterDate} onChange={setFilterDate} />
          <Button variant="contained" startIcon={<Plus size={18} />} onClick={() => setOpen(true)}>
            Add Expense
          </Button>
        </Stack>
      </Box>

      {(totalPages > 1 || filteredExpenses.length > 0) && (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          mb: 3,
        }}>
          <Typography variant="h5" sx={{ fontWeight: 700, color: 'error.main' }}>
            Total: {formatAmount(totalAmount)}
          </Typography>
          
          {totalPages > 1 && (
            <Stack direction="row" spacing={2} alignItems="center">
              <Typography variant="body2" color="text.secondary">
                {(page - 1) * itemsPerPage + 1}–{Math.min(page * itemsPerPage, filteredExpenses.length)} of {filteredExpenses.length}
              </Typography>
              <Stack direction="row" spacing={1}>
                <IconButton 
                  size="small" 
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  sx={{ color: 'text.secondary' }}
                >
                  <ChevronLeft size={20} />
                </IconButton>
                <IconButton 
                  size="small" 
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  sx={{ color: 'text.secondary' }}
                >
                  <ChevronRight size={20} />
                </IconButton>
              </Stack>
            </Stack>
          )}
        </Box>
      )}

      <Stack spacing={2} sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', mb: 4 }}>
        {paginatedExpenses.map((expense) => (
          <Card 
            key={expense.id} 
            sx={{ 
              p: 2, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              transition: 'all 0.2s',
              cursor: 'pointer',
              '&:hover': {
                borderColor: 'error.main',
                bgcolor: (theme) => alpha(theme.palette.error.main, 0.02)
              }
            }}
          >
            <Stack direction="row" spacing={3} alignItems="center" sx={{ flexGrow: 1 }}>
              <Box sx={{ 
                p: 1.5, 
                bgcolor: (theme) => theme.palette.mode === 'light' ? alpha(theme.palette.error.main, 0.1) : alpha(theme.palette.error.main, 0.2), 
                borderRadius: 2, 
                color: 'error.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <BanknoteArrowDown size={22} />
              </Box>
              
              <Box sx={{ minWidth: 200 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{expense.name}</Typography>
                <Stack direction="row" spacing={2} sx={{ color: 'text.secondary', mt: 0.5 }}>
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    <Calendar size={14} />
                    <Typography variant="caption">{format(new Date(expense.date), 'MMMM d, yyyy')}</Typography>
                  </Stack>
                </Stack>
              </Box>

              <Box sx={{ flexGrow: 1, px: 2, display: { xs: 'none', md: 'block' } }}>
                <Stack direction="row" spacing={1} alignItems="flex-start">
                  <FileText size={14} color="gray" style={{ marginTop: 4 }} />
                  <Typography variant="body2" color="text.secondary" sx={{ 
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrientation: 'vertical',
                    overflow: 'hidden'
                  }}>
                    {expense.note}
                  </Typography>
                </Stack>
              </Box>

              <Box sx={{ textAlign: 'right', minWidth: 120 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: 'error.main' }}>
                  -{formatAmount(expense.amount)}
                </Typography>
              </Box>

              <ChevronRight size={20} color="gray" />
            </Stack>
          </Card>
        ))}

        {paginatedExpenses.length === 0 && (
          <Card sx={{ 
            flexGrow: 1, 
            display: 'flex', 
            flexDirection: 'column', 
            justifyContent: 'center', 
            alignItems: 'center', 
            p: 8, 
            textAlign: 'center', 
            bgcolor: 'transparent', 
            borderStyle: 'dashed' 
          }}>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>No expenses found</Typography>
            <Typography variant="body2" color="text.secondary">Try adjusting your filter or add a new expense.</Typography>
          </Card>
        )}
      </Stack>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Expense</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField fullWidth label="Expense Name" placeholder="e.g. Electricity Bill" />
            <NumericFormatInput 
              fullWidth 
              label="Amount" 
              InputProps={{ startAdornment: <InputAdornment position="start">{currency.symbol}</InputAdornment> }}
            />
            <DatePicker 
              label="Date" 
              value={selectedDate}
              onChange={(newValue) => setSelectedDate(newValue)}
              format="MMMM d, yyyy"
              slotProps={{ textField: { fullWidth: true } }}
            />
            <TextField fullWidth label="Note" multiline rows={3} placeholder="Add any additional details..." />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpen(false)} color="inherit">Cancel</Button>
          <Button onClick={() => setOpen(false)} variant="contained">Add Expense</Button>
        </DialogActions>
      </Dialog>
    </DashboardLayout>
  );
}
