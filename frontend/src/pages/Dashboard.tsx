import React, { useState, useEffect } from 'react';
import { Box, Stack, Paper, Typography, CircularProgress, List, ListItem, ListItemText, Divider } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, subDays, parseISO } from 'date-fns';
import { useGetDailyExpensesQuery, useGetCategoryTotalsQuery, useGetExpensesQuery } from '../api/expensesApi';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

const Dashboard: React.FC = () => {
  const [startDate] = useState<string>(format(subDays(new Date(), 30), 'yyyy-MM-dd'));
  const [endDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  
  // Get auth state from Redux store
  const { token, isAuthenticated } = useSelector((state: RootState) => state.auth);

  // The API now handles the date parameters internally
  const { data: dailyExpenses, isLoading: isLoadingExpenses, refetch: refetchDailyExpenses } = useGetDailyExpensesQuery();
  const { data: categoryTotals, isLoading: isLoadingCategories, refetch: refetchCategoryTotals } = useGetCategoryTotalsQuery();
  const { data: recentExpenses, isLoading: isLoadingRecentExpenses, refetch: refetchRecentExpenses } = useGetExpensesQuery(undefined, {
    // Force a refetch to ensure the query is called
    refetchOnMountOrArgChange: true,
    // Skip caching to ensure fresh data
    skip: false
  });
  console.log('recentExpenses:', recentExpenses)

  // Refetch data on mount
  useEffect(() => {
    console.log('Dashboard - Auth state:', { token, isAuthenticated });
    console.log('Dashboard - Refetching data');
    
    if (isAuthenticated) {
      refetchDailyExpenses()
        .unwrap()
        .then(data => {
          console.log('Dashboard - Successfully fetched daily expenses:', data);
        })
        .catch(error => {
          console.error('Dashboard - Error fetching daily expenses:', error);
        });
      
      refetchCategoryTotals()
        .unwrap()
        .then(data => {
          console.log('Dashboard - Successfully fetched category totals:', data);
        })
        .catch(error => {
          console.error('Dashboard - Error fetching category totals:', error);
        });
      
      refetchRecentExpenses()
        .unwrap()
        .then(data => {
          console.log('Dashboard - Successfully fetched recent expenses:', data);
        })
        .catch(error => {
          console.error('Dashboard - Error fetching recent expenses:', error);
        });
    } else {
      console.warn('Dashboard - User is not authenticated, cannot fetch data');
    }
  }, [refetchDailyExpenses, refetchCategoryTotals, refetchRecentExpenses, isAuthenticated, token]);

  // Process data for the daily expenses chart
  const chartData = dailyExpenses?.map((item) => ({
    date: item._id,
    amount: item.totalAmount,
  }));

  // Extract recent expenses from paginated response
  const recentExpensesData = recentExpenses?.data || [];

  const hasExpenseData = dailyExpenses && dailyExpenses.length > 0;
  const hasCategoryData = categoryTotals && categoryTotals.length > 0;

  const hasRecentExpenseData = recentExpensesData.length > 0;

  console.log('Dashboard - dailyExpenses:', dailyExpenses);
  console.log('Dashboard - chartData:', chartData);
  console.log('Dashboard - categoryTotals:', categoryTotals);
  console.log('Dashboard - recentExpenses (paginated):', recentExpenses);
  console.log('Dashboard - recentExpensesData (extracted):', recentExpensesData);

  // Add login functionality
  const [email, setEmail] = useState<string>('user@example.com'); // Default value for testing
  const [password, setPassword] = useState<string>('password123'); // Default value for testing
  const [loginError, setLoginError] = useState<string>('');

  const handleLogin = async () => {
    try {
      const response = await fetch('http://localhost:3000/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // Store token in localStorage
        localStorage.setItem('token', data.access_token);
        // Reload the page to refresh Redux state
        window.location.reload();
      } else {
        setLoginError(data.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      setLoginError('Network error. Please try again.');
    }
  };

  // Show login form if not authenticated
  if (!isAuthenticated) {
    return (
      <Box sx={{ maxWidth: 400, mx: 'auto', mt: 4 }}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom>Login Required</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Please log in to view your expense dashboard.
          </Typography>
          
          {loginError && (
            <Typography color="error" sx={{ mb: 2 }}>
              {loginError}
            </Typography>
          )}
          
          <Stack spacing={2}>
            <Box>
              <Typography variant="subtitle2" gutterBottom>Email</Typography>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ 
                  width: '100%', 
                  padding: '8px',
                  border: '1px solid #ccc',
                  borderRadius: '4px'
                }}
              />
            </Box>
            
            <Box>
              <Typography variant="subtitle2" gutterBottom>Password</Typography>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ 
                  width: '100%', 
                  padding: '8px',
                  border: '1px solid #ccc',
                  borderRadius: '4px'
                }}
              />
            </Box>
            
            <button 
              onClick={handleLogin}
              style={{
                padding: '10px 16px',
                backgroundColor: '#1976d2',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              Login
            </button>
          </Stack>
        </Paper>
      </Box>
    );
  }

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
          {isLoadingCategories ? (
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
          {isLoadingRecentExpenses ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
              <CircularProgress />
            </Box>
          ) : !hasRecentExpenseData ? (
            <Typography color="text.secondary">
              No recent activity. Start tracking your expenses to see your activity here.
            </Typography>
          ) : (
            <List>
              {recentExpensesData.map((expense, index) => {
                console.log('Rendering expense:', expense);
                return (
                  <React.Fragment key={expense._id || index}>
                    <ListItem>
                      <ListItemText
                        primary={expense.description}
                        secondary={`$${expense.amount} on ${expense.date ? format(parseISO(expense.date), 'MMM d, yyyy') : 'Unknown date'}`}
                      />
                    </ListItem>
                    {index < (recentExpensesData.length - 1) && <Divider />}
                  </React.Fragment>
                );
              })}
            </List>
          )}
        </Paper>
      </Stack>
    </Box>
  );
};

export default Dashboard;
