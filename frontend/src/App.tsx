import { Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store/index';
import { DatePickerProvider } from './components/ui/date-picker-provider';

// Layouts
import MainLayout from './components/Layout/MainLayout';
import AuthLayout from './components/Layout/AuthLayout';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Dashboard from './pages/Dashboard';
import Expenses from './pages/expenses/Expenses';
import Categories from './pages/categories/Categories';
import RecurringExpenses from './pages/recurringexpenses/RecurringExpenses';
import Reports from './pages/Reports';
import Login from './pages/Login';
import Register from './pages/Register';

// Theme provider
import { ThemeProvider } from './components/ui/theme-provider';

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider defaultTheme="light" storageKey="expense-tracker-theme">
        <DatePickerProvider>
          <Routes>
            {/* Auth Routes */}
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
            </Route>
            
            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route element={<MainLayout />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/expenses" element={<Expenses />} />
                <Route path="/categories" element={<Categories />} />
                <Route path="/recurring-expenses" element={<RecurringExpenses />} />
                <Route path="/reports" element={<Reports />} />
              </Route>
            </Route>
            
            {/* Redirect root to dashboard or login */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </DatePickerProvider>
      </ThemeProvider>
    </Provider>
  );
}

export default App;
