import React, { useState } from 'react';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { useGetExpensesQuery, useGenerateReportMutation } from '../api/baseApi';
import { Expense, GenerateReportParams } from '../types';
import { Button } from '../components/ui/button';
import { DatePicker } from '../components/ui/date-picker';
import { Spinner } from '../components/ui/spinner';
import { Alert, AlertDescription } from '../components/ui/alert'
import { Card, CardContent, CardHeader, CardTitle } from '../components/Card/Card';
import { COLORS } from '../../constants';


interface CategoryDataItem {
  name: string;
  value: number;
}

const ReportsPage: React.FC = () => {
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());
  const [loading, setLoading] = useState<boolean>(false);
  const [reportGenerated, setReportGenerated] = useState<boolean>(false);
  const [reportError, setReportError] = useState<string | null>(null);

  
  const startDate = format(startOfMonth(selectedMonth), 'yyyy-MM-dd');
  const endDate = format(endOfMonth(selectedMonth), 'yyyy-MM-dd');

  const { data: expensesData, isLoading, error: expenseError } = useGetExpensesQuery({
    page: 1,
    limit: 1000, 
    startDate,
    endDate
  });
  
  const [generateReport] = useGenerateReportMutation();

 
  const processCategoryData = (expenses: Expense[]): CategoryDataItem[] => {
    const categoryMap = new Map<string, number>();
    
    expenses.forEach(expense => {
      const categoryName = typeof expense.category === 'string'
        ? expense.category
        : expense.category?.name || 'Uncategorized';
      const currentAmount = categoryMap.get(categoryName) || 0;
      categoryMap.set(categoryName, currentAmount + expense.amount);
    });
    
    return Array.from(categoryMap.entries()).map(([name, value]) => ({
      name,
      value
    }));
  };

 
  const expenses = expensesData ? expensesData.data.filter((expense: Expense) => {
    const expenseDate = new Date(expense.date);
    const start = new Date(startDate);
    const end = new Date(endDate);
    return expenseDate >= start && expenseDate <= end;
  }) : [];

  const categoryData = expenses ? processCategoryData(expenses) : [];
  
  const handleGenerateReport = async () => {
    try {
      setLoading(true);
      const params: GenerateReportParams = {
        startDate,
        endDate
      };
      
      const response = await generateReport(params);
      
   
      if ('data' in response && response.data instanceof Blob) {
       
        const url = window.URL.createObjectURL(response.data);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `expense-report-${startDate}-to-${endDate}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        
        setReportGenerated(true);
      } else {
        setReportError("Failed to generate report. Please try again later.");
      }
      setLoading(false);
    } catch (error) {
      console.error('Failed to generate report:', error);
      setReportError("Failed to generate report. Please try again later.");
      setLoading(false);
    }
  };

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setSelectedMonth(date);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Expense Reports</h1>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Select Month</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <DatePicker
              date={selectedMonth}
              setDate={handleDateChange}
              placeholder="Select month"
            />
            <Button 
              onClick={handleGenerateReport}
              disabled={loading || !expenses || expenses.length === 0}
            >
              {loading ? <Spinner className="mr-2" /> : null}
              Generate PDF Report
            </Button>
          </div>
          
          {reportGenerated && (
            <Alert className="mt-4">
              <AlertDescription>
                Report generated successfully! Check your downloads folder.
              </AlertDescription>
            </Alert>
          )}
          {reportError && (
            <Alert variant="destructive" className="mt-4">
              <AlertDescription>
                {reportError}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Expenses by Category</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center p-8">
              <Spinner />
            </div>
          ) : expenseError ? (
            <Alert variant="destructive">
              <AlertDescription>
                Error loading expense data. Please try again.
              </AlertDescription>
            </Alert>
          ) : expenses && expenses.length > 0 ? (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => [`$${value.toFixed(2)}`, 'Amount']}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="text-center p-8 text-gray-500">
              No expense data available for the selected month.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportsPage;
