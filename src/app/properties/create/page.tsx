'use client';

import * as React from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Button, 
  TextField, 
  Grid, 
  Stack, 
  IconButton,
  InputAdornment
} from '@mui/material';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Plus, Trash2, ArrowLeft, Save } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCurrency } from '@/components/CurrencyContext';
import NumericFormatInput from '@/components/NumericFormatInput';

export default function CreatePropertyPage() {
  const router = useRouter();
  const { currency } = useCurrency();
  const [initialExpenses, setInitialExpenses] = React.useState([{ name: '', amount: '' }]);

  const handleAddInitialExpense = () => setInitialExpenses([...initialExpenses, { name: '', amount: '' }]);
  const handleRemoveInitialExpense = (index: number) => setInitialExpenses(initialExpenses.filter((_, i) => i !== index));

  return (
    <DashboardLayout>
      <Box sx={{ maxWidth: 800, mx: 'auto' }}>
        <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton onClick={() => router.back()} size="small">
            <ArrowLeft size={20} />
          </IconButton>
          <Box>
            <Typography variant="h4">Create New Property</Typography>
            <Typography variant="body2" color="text.secondary">Add details for your Airbnb listing.</Typography>
          </Box>
        </Box>

        <Stack spacing={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>Basic Information</Typography>
              <Grid container spacing={3}>
                <Grid size={12}>
                  <TextField fullWidth label="Property Name" placeholder="e.g. Cozy Beachfront Villa" />
                </Grid>
                <Grid size={12}>
                  <TextField fullWidth label="Location (Optional)" placeholder="Siargao, Philippines" />
                </Grid>
                <Grid size={12}>
                  <NumericFormatInput 
                    fullWidth 
                    label="Current Funds" 
                    InputProps={{ 
                      startAdornment: <InputAdornment position="start">{currency.symbol}</InputAdornment> 
                    }}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Recurring Expenses</Typography>
                <Button startIcon={<Plus size={16} />} onClick={handleAddInitialExpense} size="small">Add Expense</Button>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Monthly bills (Water, Electricity, Internet, etc.)</Typography>
              <Stack spacing={2}>
                {initialExpenses.map((exp, index) => (
                  <Grid container spacing={2} key={index} alignItems="center">
                    <Grid size={7}>
                      <TextField fullWidth placeholder="Expense Name (e.g. Electricity)" size="small" />
                    </Grid>
                    <Grid size={4}>
                      <NumericFormatInput 
                        fullWidth 
                        placeholder="Monthly Amount" 
                        size="small" 
                        InputProps={{ 
                          startAdornment: <InputAdornment position="start">{currency.symbol}</InputAdornment> 
                        }}
                      />
                    </Grid>
                    <Grid size={1}>
                      <IconButton color="error" onClick={() => handleRemoveInitialExpense(index)} size="small" disabled={initialExpenses.length === 1}>
                        <Trash2 size={18} />
                      </IconButton>
                    </Grid>
                  </Grid>
                ))}
              </Stack>
            </CardContent>
          </Card>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, pb: 4 }}>
            <Button variant="outlined" onClick={() => router.back()}>Cancel</Button>
            <Button variant="contained" startIcon={<Save size={18} />}>Create Property</Button>
          </Box>
        </Stack>
      </Box>
    </DashboardLayout>
  );
}
