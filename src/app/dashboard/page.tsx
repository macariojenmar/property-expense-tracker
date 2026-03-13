'use client';

import * as React from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  Stack
} from '@mui/material';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { TrendingUp, Wallet, Calculator } from 'lucide-react';
import { useTheme } from '@mui/material/styles';
import { useCurrency } from '@/components/CurrencyContext';
import MonthFilter from '@/components/MonthFilter';

const StatCard = ({ title, value, icon, color, trend }: { title: string, value: string, icon: React.ReactNode, color?: string, trend?: string }) => {
  const theme = useTheme();
  const defaultColor = theme.palette.mode === 'light' ? '#000000' : '#ffffff';
  const activeColor = color || defaultColor;

  return (
    <Card>
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2 }}>
          <Box sx={{ p: 1, bgcolor: `${activeColor}20`, color: activeColor, borderRadius: 2, display: 'flex' }}>
            {icon}
          </Box>
          {trend && (
            <Typography variant="caption" sx={{ color: trend.startsWith('+') ? 'success.main' : 'error.main', fontWeight: 600, bgcolor: trend.startsWith('+') ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', px: 1, py: 0.5, borderRadius: 1 }}>
              {trend}
            </Typography>
          )}
        </Stack>
        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500, mb: 0.5 }}>
          {title}
        </Typography>
        <Typography variant="h4" sx={{ fontWeight: 700, letterSpacing: '-0.02em' }}>
          {value}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default function DashboardPage() {
  const { formatAmount } = useCurrency();
  const [filterDate, setFilterDate] = React.useState<Date | null>(new Date());

  return (
    <DashboardLayout>
      <Box sx={{ mb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box>
            <Typography variant="h4" sx={{ mb: 0.5 }}>Overview</Typography>
            <Typography variant="body2" color="text.secondary">Welcome back! Here&apos;s how your properties are performing.</Typography>
          </Box>
          <MonthFilter value={filterDate} onChange={setFilterDate} />
        </Box>
      </Box>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard 
            title="Current Funds" 
            value={formatAmount(45250)} 
            icon={<Wallet size={20} />} 
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard 
            title="Estimated Funds" 
            value={formatAmount(52100)} 
            icon={<Calculator size={20} />} 
            trend="+15%"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard 
            title="Current Profit" 
            value={formatAmount(12400)} 
            icon={<TrendingUp size={20} />} 
            color="#10b981"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard 
            title="Estimated Profit" 
            value={formatAmount(18200)} 
            icon={<TrendingUp size={20} />} 
            color="#3b82f6"
            trend="+48%"
          />
        </Grid>
      </Grid>

      {/* Recent Activity or Chart Placeholder */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Recent Expenses</Typography>
        <Card sx={{ p: 4, textAlign: 'center', bgcolor: 'transparent', borderStyle: 'dashed' }}>
          <Typography color="text.secondary">No recent expenses recorded. Start by adding one!</Typography>
        </Card>
      </Box>
    </DashboardLayout>
  );
}
