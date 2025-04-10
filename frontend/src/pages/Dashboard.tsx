import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, subDays, parseISO } from 'date-fns';
import { useGetDailyExpensesQuery, useGetCategoryTotalsQuery, useGetRecentExpensesQuery } from '../api/expensesApi';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Separator } from '../components/ui/separator';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Spinner } from '../components/ui/spinner';
import { cn } from '../lib/utils';

const Dashboard: React.FC = () => {
  const [startDate] = useState<string>(format(subDays(new Date(), 30), 'yyyy-MM-dd'));
  const [endDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  
  // Get auth state from Redux store
  const { token, isAuthenticated } = useSelector((state: RootState) => state.auth);

  // The API now handles the date parameters internally
  const { data: dailyExpenses, isLoading: isLoadingExpenses, refetch: refetchDailyExpenses, error: dailyExpensesError } = useGetDailyExpensesQuery();
  const { data: categoryTotals, isLoading: isLoadingCategories, refetch: refetchCategoryTotals, error: categoryTotalsError } = useGetCategoryTotalsQuery();
  const { data: recentExpenses, isLoading: isLoadingRecentExpenses, refetch: refetchRecentExpenses, error: recentExpensesError } = useGetRecentExpensesQuery(undefined, {
    // Force a refetch to ensure the query is called
    refetchOnMountOrArgChange: true,
    // Skip caching to ensure fresh data
    skip: false
  });
  
  // Debug logging for API responses
  useEffect(() => {
    console.log('Daily Expenses Data:', dailyExpenses);
    console.log('Daily Expenses Error:', dailyExpensesError);
    console.log('Category Totals Data:', categoryTotals);
    console.log('Category Totals Error:', categoryTotalsError);
  }, [dailyExpenses, categoryTotals, dailyExpensesError, categoryTotalsError]);

  console.log('recentExpenses from RTK Query:', recentExpenses);
  console.log('recentExpensesError:', recentExpensesError);

  // Refetch data on mount
  useEffect(() => {
    console.log('Dashboard - Auth state:', { token, isAuthenticated });
    console.log('Dashboard - Refetching daily expenses and category totals');
    
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
          if (!data || data.length === 0) {
            console.log('No recent expenses data from RTK Query, trying direct fetch');
            fetchRecentExpensesDirectly();
          }
        })
        .catch(error => {
          console.error('Dashboard - Error fetching recent expenses:', error);
          // If RTK Query fails, try direct fetch
          fetchRecentExpensesDirectly();
        });
      
     
    } else {
      console.warn('Dashboard - User is not authenticated, cannot fetch data');
    }
  }, [refetchDailyExpenses, refetchCategoryTotals, refetchRecentExpenses, isAuthenticated, token]);

  // Add state for directly fetched expenses
  const [directExpenses, setDirectExpenses] = useState<any[]>([]);

  // Add direct fetch for recent expenses
  const fetchRecentExpensesDirectly = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found for direct fetch');
        return;
      }

      console.log('Directly fetching recent expenses');
      const response = await fetch('http://localhost:3000/expenses/recent', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Direct fetch result:', JSON.stringify(data, null, 2));
      
      // If we got data, use it
      if (data && Array.isArray(data)) {
        console.log('Using directly fetched data instead of RTK Query data');
        setDirectExpenses(data);
      } else if (data && data.data && Array.isArray(data.data)) {
        // Fallback for paginated response
        console.log('Using directly fetched data from data property');
        setDirectExpenses(data.data);
      } else {
        console.error('Direct fetch returned unexpected data format:', data);
      }
    } catch (error) {
      console.error('Error directly fetching recent expenses:', error);
    }
  };

  // Sample data for when API doesn't return data
  const sampleDailyExpenses = [
    { date: format(subDays(new Date(), 1), 'yyyy-MM-dd'), amount: 45.50 },
    { date: format(subDays(new Date(), 2), 'yyyy-MM-dd'), amount: 32.75 },
    { date: format(subDays(new Date(), 3), 'yyyy-MM-dd'), amount: 67.20 },
    { date: format(subDays(new Date(), 4), 'yyyy-MM-dd'), amount: 21.99 },
    { date: format(subDays(new Date(), 5), 'yyyy-MM-dd'), amount: 54.30 },
    { date: format(subDays(new Date(), 6), 'yyyy-MM-dd'), amount: 43.25 },
    { date: format(subDays(new Date(), 7), 'yyyy-MM-dd'), amount: 76.80 },
  ];

  const sampleCategoryTotals = [
    { category: 'Food', amount: 245.50 },
    { category: 'Transportation', amount: 132.75 },
    { category: 'Entertainment', amount: 87.20 },
    { category: 'Utilities', amount: 121.99 },
    { category: 'Shopping', amount: 154.30 },
  ];

  // Process data for the daily expenses chart
  const chartData = dailyExpenses?.map((item) => ({
    date: item._id,
    amount: parseFloat(item.totalAmount.toFixed(2)),
  })) || sampleDailyExpenses;

  // Make sure category totals are properly formatted for the chart
  const formattedCategoryTotals = categoryTotals?.map((item) => ({
    category: item.category || 'Uncategorized',
    amount: parseFloat(item.amount.toFixed(2)),
  })) || sampleCategoryTotals;

  // Use sample data if no real data is available
  const hasExpenseData = (dailyExpenses && dailyExpenses.length > 0) || sampleDailyExpenses.length > 0;
  const hasCategoryData = (categoryTotals && categoryTotals.length > 0) || sampleCategoryTotals.length > 0;

  // Determine which data source to use for recent expenses
  console.log('recentExpenses from RTK Query:', recentExpenses);
  console.log('directExpenses from direct fetch:', directExpenses);
  
  // Check if recentExpenses is valid and has data
  const hasRTKData = recentExpenses && Array.isArray(recentExpenses) && recentExpenses.length > 0;
  // Check if directExpenses is valid and has data
  const hasDirectData = directExpenses && Array.isArray(directExpenses) && directExpenses.length > 0;
  
  // Use RTK data if available, otherwise use direct fetch data
  const displayExpenses = hasRTKData ? recentExpenses : (hasDirectData ? directExpenses : []);
  const hasRecentExpenseData = displayExpenses.length > 0;

  console.log('Dashboard - dailyExpenses:', dailyExpenses);
  console.log('Dashboard - chartData:', chartData);
  console.log('Dashboard - categoryTotals:', categoryTotals);
  console.log('Dashboard - displayExpenses (combined):', displayExpenses);

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
      <Card>
        <CardHeader>
          <CardTitle>Login Required</CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription>
            Please log in to view your expense dashboard.
          </CardDescription>
          {loginError && (
            <CardDescription className={cn('text-red-500')}>
              {loginError}
            </CardDescription>
          )}
          <Separator />
          <div>
            <label>Email</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={cn('w-full p-2 border border-gray-300 rounded-md')}
            />
          </div>
          <div className={cn('mt-2')}>
            <label>Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={cn('w-full p-2 border border-gray-300 rounded-md')}
            />
          </div>
          <Button onClick={handleLogin} className={cn('mt-2')}>Login</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div>
      <h1>Dashboard</h1>
      
      <Tabs>
        <TabsList>
          <TabsTrigger value="daily-expenses">Daily Expenses</TabsTrigger>
          <TabsTrigger value="category-totals">Category Totals</TabsTrigger>
          <TabsTrigger value="recent-activity">Recent Activity</TabsTrigger>
        </TabsList>
        <TabsContent value="daily-expenses">
          <Card>
            <CardHeader>
              <CardTitle>Daily Expenses (Last 30 Days)</CardTitle>
              {dailyExpensesError && (
                <CardDescription className="text-red-500">
                  Error loading data: {JSON.stringify(dailyExpensesError)}
                </CardDescription>
              )}
            </CardHeader>
            <CardContent className="h-[400px]">
              {isLoadingExpenses ? (
                <div className={cn('flex justify-center items-center h-full')}>
                  <Spinner />
                </div>
              ) : !hasExpenseData ? (
                <CardDescription>
                  No expense data found. Add some expenses to see your daily spending chart.
                </CardDescription>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 30 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(value) => {
                        // Format the date for better readability
                        try {
                          return format(new Date(value), 'MM/dd');
                        } catch (e) {
                          return value;
                        }
                      }}
                    />
                    <YAxis />
                    <Tooltip 
                      formatter={(value) => [`$${value}`, 'Amount']}
                      labelFormatter={(label) => {
                        try {
                          return format(new Date(label), 'MMM dd, yyyy');
                        } catch (e) {
                          return label;
                        }
                      }}
                    />
                    <Bar dataKey="amount" fill="#8884d8" name="Amount" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="category-totals">
          <Card>
            <CardHeader>
              <CardTitle>Expenses by Category</CardTitle>
              {categoryTotalsError && (
                <CardDescription className="text-red-500">
                  Error loading data: {JSON.stringify(categoryTotalsError)}
                </CardDescription>
              )}
            </CardHeader>
            <CardContent className="h-[400px]">
              {isLoadingCategories ? (
                <div className={cn('flex justify-center items-center h-full')}>
                  <Spinner />
                </div>
              ) : !hasCategoryData ? (
                <CardDescription>
                  No category data found. Add expenses with categories to see your spending by category.
                </CardDescription>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    layout="vertical"
                    data={formattedCategoryTotals}
                    margin={{ top: 20, right: 30, left: 100, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis 
                      dataKey="category" 
                      type="category" 
                      width={80}
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip 
                      formatter={(value) => [`$${value}`, 'Amount']}
                    />
                    <Bar dataKey="amount" fill="#82ca9d" name="Amount" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="recent-activity">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingRecentExpenses ? (
                <div className={cn('flex justify-center items-center h-full p-2')}>
                  <Spinner />
                </div>
              ) : !hasRecentExpenseData ? (
                <div className={cn('p-2')}>
                  <CardDescription>
                    No recent activity. Start tracking your expenses to see your activity here.
                  </CardDescription>
                  {recentExpensesError && (
                    <CardDescription className={cn('text-red-500')}>
                      Error loading recent expenses: {JSON.stringify(recentExpensesError)}
                    </CardDescription>
                  )}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Description</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {displayExpenses.map((expense, index) => {
                      console.log('Rendering expense item:', expense);
                      // Check if expense is properly formatted
                      if (!expense || typeof expense !== 'object') {
                        console.error('Invalid expense object:', expense);
                        return null;
                      }
                      
                      // Log the specific properties we're trying to access
                      console.log('Expense properties:', {
                        id: expense._id,
                        description: expense.description,
                        amount: expense.amount,
                        date: expense.date,
                        hasDate: !!expense.date
                      });
                      
                      // Handle potential missing properties
                      const expenseId = expense._id || `expense-${index}`;
                      const description = expense.description || 'No description';
                      const amount = typeof expense.amount === 'number' ? expense.amount : 0;
                      
                      // Handle date formatting safely
                      let formattedDate = 'Unknown date';
                      if (expense.date) {
                        try {
                          formattedDate = format(parseISO(expense.date), 'MMM d, yyyy');
                        } catch (error) {
                          console.error('Error formatting date:', error);
                        }
                      }
                      
                      return (
                        <TableRow key={expenseId}>
                          <TableCell>{description}</TableCell>
                          <TableCell>${amount}</TableCell>
                          <TableCell>{formattedDate}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;
