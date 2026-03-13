'use client';

import * as React from 'react';
import { 
  Box, 
  FormControl, 
  Select, 
  MenuItem, 
  SelectChangeEvent,
  ListSubheader,
  Divider,
  Typography
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { format } from 'date-fns';
import { ChevronDown } from 'lucide-react';

interface MonthFilterProps {
  value: Date | null;
  onChange: (date: Date | null) => void;
}

export default function MonthFilter({ value, onChange }: MonthFilterProps) {
  const [isPickerOpen, setIsPickerOpen] = React.useState(false);

  const now = new Date();
  const isThisMonth = value && 
                      value.getMonth() === now.getMonth() && 
                      value.getFullYear() === now.getFullYear();

  return (
    <Box sx={{ position: 'relative' }}>
      <FormControl size="small" sx={{ width: 220 }}>
        <Select
          value={isThisMonth ? 'this-month' : 'custom'}
          onChange={(e: SelectChangeEvent) => {
            if (e.target.value === 'custom') {
              setIsPickerOpen(true);
            } else {
              onChange(new Date());
            }
          }}
          IconComponent={(props) => (
            <Box {...props} sx={{ display: 'flex', alignItems: 'center', mr: 1, color: 'text.secondary' }}>
              <ChevronDown size={18} />
            </Box>
          )}
          renderValue={() => {
            return (
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {isThisMonth ? 'This Month' : (value ? format(value, 'MMMM yyyy') : 'Select Month')}
              </Typography>
            );
          }}
          MenuProps={{
            PaperProps: {
              sx: {
                bgcolor: 'background.paper',
                backgroundImage: 'none',
                mt: 1,
                borderRadius: '8px',
                border: '1px solid',
                borderColor: 'divider',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
                '& .MuiList-root': {
                  p: 1,
                },
              },
            },
          }}
          sx={{
            bgcolor: 'background.paper',
            borderRadius: '8px',
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: 'divider',
              transition: 'border-color 0.2s',
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: 'text.secondary',
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: 'primary.main',
              borderWidth: '1px',
            },
            '& .MuiSelect-select': {
              display: 'flex',
              alignItems: 'center',
              py: '10px',
              pr: '40px !important',
            }
          }}
        >
          <ListSubheader sx={{ 
            lineHeight: '32px', 
            bgcolor: 'transparent', 
            fontSize: '11px', 
            fontWeight: 700, 
            textTransform: 'uppercase', 
            letterSpacing: '0.05em',
            color: 'text.secondary',
            px: 1.5
          }}>
            Quick Select
          </ListSubheader>
          <MenuItem 
            value="this-month"
            sx={{
              borderRadius: '6px',
              mx: 0.5,
              fontSize: '14px',
              '&.Mui-selected': { bgcolor: 'action.hover' },
              '&:hover': { bgcolor: 'action.hover' }
            }}
          >
            This Month
          </MenuItem>
          
          <Divider sx={{ my: 1, mx: -1 }} />
          
          <ListSubheader sx={{ 
            lineHeight: '32px', 
            bgcolor: 'transparent', 
            fontSize: '11px', 
            fontWeight: 700, 
            textTransform: 'uppercase', 
            letterSpacing: '0.05em',
            color: 'text.secondary',
            px: 1.5
          }}>
            Custom
          </ListSubheader>
          <MenuItem 
            value="custom" 
            onClick={() => setIsPickerOpen(true)}
            sx={{
              borderRadius: '6px',
              mx: 0.5,
              fontSize: '14px',
              '&:hover': { bgcolor: 'action.hover' }
            }}
          >
            Select Month
          </MenuItem>
        </Select>
      </FormControl>
      
      <Box sx={{ position: 'absolute', top: 0, right: 0, opacity: 0, pointerEvents: 'none' }}>
        <DatePicker
          open={isPickerOpen}
          onClose={() => setIsPickerOpen(false)}
          views={['month', 'year']}
          format="MMMM yyyy"
          value={value}
          minDate={new Date('2026-01-01')}
          onChange={(newValue) => {
            if (newValue) {
              onChange(newValue);
            }
            setIsPickerOpen(false);
          }}
          slotProps={{ 
            textField: { size: 'small' },
            popper: {
              placement: 'bottom-end',
              sx: {
                '& .MuiPaper-root': {
                  mt: 1,
                  borderRadius: '12px',
                  boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)'
                }
              }
            }
          }}
        />
      </Box>
    </Box>
  );
}
