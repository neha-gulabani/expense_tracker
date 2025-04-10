import React, { useState, useEffect } from 'react';
import { Box, Stack, Paper, Typography, CircularProgress } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, subDays } from 'date-fns';
import { useGetDailyExpensesQuery } from '../api/expensesApi';
import { useGetCategoriesQuery } from '../api/categoriesApi';
import { CategoryTotal } from '../types';

const Dashboard: React.FC = () => {
  const [startDate] = useState<string>(format(subDays(new Date(), 30), 'yyyy-MM-dd'));
  const [endDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [categoryTotals, setCategoryTotals] = useState<CategoryTotal[]>([]);

  // The API now handles the date parameters internally
  const { data: dailyExpenses, isLoading: isLoadingExpenses, refetch: refetchDailyExpenses } = useGetDailyExpensesQuery();

  const { data: categories } = useGetCategoriesQuery();

  // Refetch data on mount
  useEffect(() => {
    console.log('Dashboard - Refetching daily expenses');
    refetchDailyExpenses()
      .unwrap()
      .then(data => {
        console.log('Dashboard - Successfully fetched daily expenses:', data);
      })
      .catch(error => {
        console.error('Dashboard - Error fetching daily expenses:', error);
      });
  }, [refetchDailyExpenses]);

  // Process data for the chart
  const chartData = dailyExpenses?.map((item) => ({
    date: item._id,
    amount: item.totalAmount,
  }));

  // Calculate category totals when expenses data changes
  useEffect(() => {
    if (dailyExpenses && categories) {
      // This is a placeholder - in a real app, we would get category totals from the API
      // For now, we'll create some sample data
      const sampleCategoryTotals = categories.slice(0, 5).map((category) => ({
        category: category.name,
        amount: Math.floor(Math.random() * 1000) + 100,
      }));
      
      setCategoryTotals(sampleCategoryTotals);
    }
  }, [dailyExpenses, categories]);

  const hasExpenseData = dailyExpenses && dailyExpenses.length > 0;
  const hasCategoryData = categoryTotals && categoryTotals.length > 0;

  console.log('Dashboard - dailyExpenses:', dailyExpenses);
  console.log('Dashboard - chartData:', chartData);

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      
      <Stack spacing={3}>
        {/* Daily Expenses Chart */}
        <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 400 }}>
          <Typography variant="h6" gutterBottom>
            Daily Expenses (Last 30 Days)
          </Typography>
          {isLoadingExpenses ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
              <CircularProgress />
            </Box>
          ) : !hasExpenseData ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
              <Typography color="text.secondary">
                No expense data found. Add some expenses to see your daily spending chart.
              </Typography>
            </Box>
          ) : (
            <ResponsiveContainer width="100%" height="90%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 30 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="amount" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Paper>

        {/* Category Totals */}
        <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 400 }}>
          <Typography variant="h6" gutterBottom>
            Expenses by Category
          </Typography>
          {isLoadingExpenses ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
              <CircularProgress />
            </Box>
          ) : !hasCategoryData ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
              <Typography color="text.secondary">
                No category data found. Add expenses with categories to see your spending by category.
              </Typography>
            </Box>
          ) : (
            <ResponsiveContainer width="100%" height="90%">
              <BarChart
                layout="vertical"
                data={categoryTotals}
                margin={{ top: 20, right: 30, left: 40, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="category" type="category" />
                <Tooltip />
                <Bar dataKey="amount" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Paper>

        {/* Recent Activity */}
        <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
          <Typography variant="h6" gutterBottom>
            Recent Activity
          </Typography>
          {!hasExpenseData ? (
            <Typography color="text.secondary">
              No recent activity. Start tracking your expenses to see your activity here.
            </Typography>
          ) : (
            <Typography variant="body2" color="text.secondary">
              Your recent expense activities will appear here.
            </Typography>
          )}
        </Paper>
      </Stack>
    </Box>
  );
};

export default Dashboard;
