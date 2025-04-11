import React, { ReactNode, useState } from 'react';

interface TabsProps {
  children: ReactNode;
  defaultValue?: string;
  className?: string;
}

interface TabsListProps {
  children: ReactNode;
  className?: string;
}

interface TabsTriggerProps {
  value: string;
  children: ReactNode;
  className?: string;
  activeClassName?: string;
  onClick?: () => void;
}

interface TabsContentProps {
  value: string;
  children: ReactNode;
  className?: string;
}

interface TabsContextType {
  value: string;
  onChange: (value: string) => void;
}

const TabsContext = React.createContext<TabsContextType | undefined>(undefined);

export const Tabs: React.FC<TabsProps> = ({ 
  children, 
  defaultValue = '', 
  className = '' 
}) => {
  const [value, setValue] = useState(defaultValue);

  return (
    <TabsContext.Provider value={{ value, onChange: setValue }}>
      <div className={`w-full ${className}`}>
        {children}
      </div>
    </TabsContext.Provider>
  );
};

export const TabsList: React.FC<TabsListProps> = ({ 
  children, 
  className = '' 
}) => {
  return (
    <div className={`flex space-x-1 border-b border-gray-200 mb-4 ${className}`}>
      {children}
    </div>
  );
};

export const TabsTrigger: React.FC<TabsTriggerProps> = ({ 
  value, 
  children, 
  className = '',
  activeClassName = '',
  onClick
}) => {
  const context = React.useContext(TabsContext);
  
  if (!context) {
    throw new Error('TabsTrigger must be used within a Tabs component');
  }
  
  const isActive = context.value === value;
  const baseClasses = 'px-4 py-2 text-sm font-medium transition-colors focus:outline-none';
  const activeClasses = isActive 
    ? `text-blue-600 border-b-2 border-blue-600 ${activeClassName}` 
    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-t-md';
  
  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      className={`${baseClasses} ${activeClasses} ${className}`}
      onClick={() => {
        context.onChange(value);
        if (onClick) onClick();
      }}
    >
      {children}
    </button>
  );
};

export const TabsContent: React.FC<TabsContentProps> = ({ 
  value, 
  children, 
  className = '' 
}) => {
  const context = React.useContext(TabsContext);
  
  if (!context) {
    throw new Error('TabsContent must be used within a Tabs component');
  }
  
  return context.value === value ? (
    <div className={`mt-2 ${className}`}>
      {children}
    </div>
  ) : null;
};
