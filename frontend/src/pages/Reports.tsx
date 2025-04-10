import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Stack,
  CircularProgress,
  Alert,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { useGetExpensesQuery } from '../api/expensesApi';
import { Expense } from '../types';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#8DD1E1'];

interface CategoryDataItem {
  name: string;
  value: number;
}

const ReportsPage: React.FC = () => {
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());
  const [loading, setLoading] = useState<boolean>(false);
  const [reportGenerated, setReportGenerated] = useState<boolean>(false);

  // Calculate the start and end dates for the selected month
  const startDate = format(startOfMonth(selectedMonth), 'yyyy-MM-dd');
  const endDate = format(endOfMonth(selectedMonth), 'yyyy-MM-dd');

  // Updated to match the new API signature - removed pagination and filters
  const { data: expensesData, isLoading: isLoadingExpenses } = useGetExpensesQuery();

  // Process data for the category pie chart
  const categoryData = React.useMemo<CategoryDataItem[]>(() => {
    if (!expensesData || !Array.isArray(expensesData)) return [];

    // Filter expenses for the selected month
    const filteredExpenses = expensesData.filter((expense: Expense) => {
      const expenseDate = expense.date;
      return expenseDate >= startDate && expenseDate <= endDate;
    });

    const categoryMap = new Map<string, number>();

    filteredExpenses.forEach((expense: Expense) => {
      const categoryName = expense.category?.name || 'Uncategorized';
      const currentAmount = categoryMap.get(categoryName) || 0;
      categoryMap.set(categoryName, currentAmount + expense.amount);
    });

    return Array.from(categoryMap.entries()).map(([name, value]) => ({
      name,
      value,
    }));
  }, [expensesData, startDate, endDate]);

  // Calculate total expenses for the month
  const totalExpenses = React.useMemo(() => {
    if (!expensesData || !Array.isArray(expensesData)) return 0;
    
    // Filter expenses for the selected month
    const filteredExpenses = expensesData.filter((expense: Expense) => {
      const expenseDate = expense.date;
      return expenseDate >= startDate && expenseDate <= endDate;
    });
    
    return filteredExpenses.reduce((sum: number, expense: Expense) => sum + expense.amount, 0);
  }, [expensesData, startDate, endDate]);

  const handleGenerateReport = async () => {
    setLoading(true);
    // In a real app, this would call an API endpoint to generate and email the report
    // For now, we'll just simulate a delay
    setTimeout(() => {
      setLoading(false);
      setReportGenerated(true);
      // Reset the success message after 5 seconds
      setTimeout(() => setReportGenerated(false), 5000);
    }, 2000);
  };

  // Get the number of expenses for the selected month
  const expenseCount = React.useMemo(() => {
    if (!expensesData || !Array.isArray(expensesData)) return 0;
    
    return expensesData.filter((expense: Expense) => {
      const expenseDate = expense.date;
      return expenseDate >= startDate && expenseDate <= endDate;
    }).length;
  }, [expensesData, startDate, endDate]);

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Monthly Reports
      </Typography>

      {reportGenerated && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Report generated successfully! Check your email for the detailed report.
        </Alert>
      )}

      <Paper sx={{ p: 3, mb: 3 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center" sx={{ mb: 3 }}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label="Select Month"
              views={['year', 'month']}
              value={selectedMonth}
              onChange={(newValue: Date | null) => {
                if (newValue) setSelectedMonth(newValue);
              }}
            />
          </LocalizationProvider>
          <Button
            variant="contained"
            onClick={handleGenerateReport}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Generate & Email Report'}
          </Button>
        </Stack>

        <Typography variant="h6" gutterBottom>
          Expense Summary for {format(selectedMonth, 'MMMM yyyy')}
        </Typography>

        {isLoadingExpenses ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : !expensesData || categoryData.length === 0 ? (
          <Alert severity="info">
            No expenses found for this month. Try selecting a different month or add some expenses.
          </Alert>
        ) : (
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
            <Box sx={{ width: { xs: '100%', md: '50%' } }}>
              <Paper elevation={0} variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Total Expenses: ${totalExpenses.toFixed(2)}
                </Typography>
                <Typography variant="body2">
                  Number of Expenses: {expenseCount}
                </Typography>
              </Paper>
            </Box>

            <Box sx={{ width: { xs: '100%', md: '50%' } }}>
              <Paper elevation={0} variant="outlined" sx={{ p: 2, height: 300 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Expenses by Category
                </Typography>
                {categoryData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="90%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) =>
                          `${name}: ${(percent * 100).toFixed(0)}%`
                        }
                      >
                        {categoryData.map((_, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value) => [`$${Number(value).toFixed(2)}`, 'Amount']}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      height: '90%',
                    }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      No category data available
                    </Typography>
                  </Box>
                )}
              </Paper>
            </Box>
          </Stack>
        )}
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Previous Reports
        </Typography>
        <Stack spacing={2}>
          {[2, 3, 4].map((monthsAgo) => {
            const prevMonth = subMonths(new Date(), monthsAgo);
            return (
              <Box key={monthsAgo} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography>{format(prevMonth, 'MMMM yyyy')} Report</Typography>
                <Button variant="outlined" size="small">
                  View
                </Button>
              </Box>
            );
          })}
        </Stack>
      </Paper>
    </Box>
  );
};

export default ReportsPage;
