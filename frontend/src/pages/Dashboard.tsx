import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, subDays } from 'date-fns';
import { useGetDailyExpensesQuery, useGetCategoryTotalsQuery, useGetRecentExpensesQuery } from '../api/baseApi';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/Card/Card';
import { Button } from '../components/ui/button';
import { Spinner } from '../components/ui/spinner';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/Table/Table';
import { useNavigate } from 'react-router-dom';
import { GenerateReportParams } from '../types';


interface BackendDailyExpense {
  _id?: string;
  date?: string;
  amount: number;
}

interface BackendCategoryTotal {
  category: string;
  total?: number;
  amount?: number;
  color?: string;
}

const Dashboard: React.FC = () => {
  const [startDate] = useState<string>(format(subDays(new Date(), 30), 'yyyy-MM-dd'));
  const [endDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const navigate = useNavigate();
 
  const reportParams: GenerateReportParams = { startDate, endDate };
  
  const { data: dailyExpenses, isLoading: isLoadingExpenses, error: dailyExpensesError } = useGetDailyExpensesQuery(reportParams, {
    skip: !isAuthenticated,
    refetchOnMountOrArgChange: true
  });
  const { data: categoryTotals, isLoading: isLoadingCategories, error: categoryTotalsError } = useGetCategoryTotalsQuery(reportParams, {
    skip: !isAuthenticated,
    refetchOnMountOrArgChange: true
  });
  const { data: recentExpenses, isLoading: isLoadingRecentExpenses } = useGetRecentExpensesQuery(undefined, {
    skip: !isAuthenticated,
    refetchOnMountOrArgChange: true
  });

  // Format data for charts - using proper type conversion
  const formattedDailyExpenses = dailyExpenses ? dailyExpenses.map((item: BackendDailyExpense) => ({
    date: format(new Date(item.date || item._id || ''), 'MMM dd'),
    amount: item.amount
  })) : [];

  const formattedCategoryTotals = categoryTotals ? categoryTotals.map((item: BackendCategoryTotal) => ({
    category: item.category,
    amount: item.total || item.amount || 0,
    color: item.color || '#4f46e5'
  })) : [];

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-8">
          <h2 className="text-xl font-semibold mb-2">Please log in to view your dashboard</h2>
          <Button onClick={() => navigate('/login')}>Log In</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <Button onClick={() => navigate('/expenses')} variant="outline">
          View All Expenses
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Total Spending</CardTitle>
            <CardDescription>Last 30 days</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingExpenses ? (
              <div className="flex justify-center items-center h-64">
                <Spinner />
              </div>
            ) : dailyExpensesError ? (
              <div className="text-center py-8 text-red-500">
                Error loading data. Please try refreshing the page.
              </div>
            ) : formattedDailyExpenses.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No expense data available
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={formattedDailyExpenses}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="amount" fill="#4f46e5" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Spending by Category</CardTitle>
            <CardDescription>Last 30 days</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingCategories ? (
              <div className="flex justify-center items-center h-64">
                <Spinner />
              </div>
            ) : categoryTotalsError ? (
              <div className="text-center py-8 text-red-500">
                Error loading data. Please try refreshing the page.
              </div>
            ) : formattedCategoryTotals.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No category data available
              </div>
            ) : (
              <div className="space-y-4">
                {formattedCategoryTotals.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div
                        className="w-4 h-4 rounded-full mr-2"
                        style={{ backgroundColor: item.color }}
                      />
                      <span>{item.category}</span>
                    </div>
                    <span className="font-medium">${item.amount.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

     
      <Card>
        <CardHeader>
          <CardTitle>Recent Expenses</CardTitle>
          <CardDescription>Your latest transactions</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingRecentExpenses ? (
            <div className="flex justify-center items-center h-32">
              <Spinner />
            </div>
          ) : !recentExpenses || recentExpenses.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No recent expenses
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentExpenses.map((expense) => (
                  <TableRow key={expense._id}>
                    <TableCell>{format(new Date(expense.date), 'MMM dd, yyyy')}</TableCell>
                    <TableCell>{expense.description}</TableCell>
                    <TableCell>
                      {typeof expense.category === 'string' 
                        ? expense.category 
                        : expense.category?.name || 'Uncategorized'}
                    </TableCell>
                    <TableCell>${expense.amount.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
