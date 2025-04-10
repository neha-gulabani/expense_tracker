import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { logout } from '../../features/auth/authSlice';
import {
  LayoutDashboard,
  Receipt,
  FolderTree,
  RepeatIcon,
  BarChart3,
  LogOut,
  Menu,
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { ScrollArea } from '../ui/scroll-area';
import { Sheet, SheetContent, SheetTrigger } from '../ui/sheet';

const MainLayout: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const menuItems = [
    { text: 'Dashboard', icon: <LayoutDashboard className="h-5 w-5" />, path: '/dashboard' },
    { text: 'Expenses', icon: <Receipt className="h-5 w-5" />, path: '/expenses' },
    { text: 'Categories', icon: <FolderTree className="h-5 w-5" />, path: '/categories' },
    { text: 'Recurring Expenses', icon: <RepeatIcon className="h-5 w-5" />, path: '/recurring-expenses' },
    { text: 'Reports', icon: <BarChart3 className="h-5 w-5" />, path: '/reports' },
  ];

  const SideNav = () => (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b">
        <h2 className="text-xl font-semibold">Expense Tracker</h2>
      </div>
      <ScrollArea className="flex-1">
        <nav className="px-2 py-4">
          <ul className="space-y-1">
            {menuItems.map((item) => (
              <li key={item.text}>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start" 
                  onClick={() => navigate(item.path)}
                >
                  <span className="mr-2">{item.icon}</span>
                  {item.text}
                </Button>
              </li>
            ))}
          </ul>
        </nav>
        <div className="px-2 py-4 border-t">
          <Button 
            variant="ghost" 
            className="w-full justify-start" 
            onClick={handleLogout}
          >
            <LogOut className="h-5 w-5 mr-2" />
            Logout
          </Button>
        </div>
      </ScrollArea>
    </div>
  );

  return (
    <div className="flex min-h-screen">
      {/* Desktop Sidebar */}
      <div className="hidden md:block w-[240px] border-r">
        <SideNav />
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetTrigger asChild className="md:hidden">
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-[240px]">
          <SideNav />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="flex-1">
        <header className="h-14 border-b flex items-center px-4 sticky top-0 bg-background z-10">
          <div className="md:hidden mr-2">
            <Button variant="ghost" size="icon" onClick={handleDrawerToggle}>
              <Menu className="h-5 w-5" />
            </Button>
          </div>
          <div className="flex-1">
            <h1 className="text-lg font-medium">
              {user?.name ? `Welcome, ${user.name}` : 'Expense Tracker'}
            </h1>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </header>
        <main className="p-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
