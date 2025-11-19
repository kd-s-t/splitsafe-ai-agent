import * as React from 'react';
import { cn } from '@/lib/utils';

interface TabsContextProps {
  value: string;
  setValue: (value: string) => void;
}

const TabsContext = React.createContext<TabsContextProps | undefined>(undefined);

interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
  defaultValue: string;
  children: React.ReactNode;
}

export const Tabs: React.FC<TabsProps> = ({ defaultValue, children, className = '', ...props }) => {
  const [value, setValue] = React.useState(defaultValue);
  return (
    <TabsContext.Provider value={{ value, setValue }}>
      <div className={cn('w-full', className)} {...props}>{children}</div>
    </TabsContext.Provider>
  );
};

interface TabsListProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const TabsList: React.FC<TabsListProps> = ({ children, className = '', ...props }) => (
  <div
    role="tablist"
    className={cn('inline-flex items-center rounded-lg bg-muted p-1', className)}
    {...props}
  >
    {children}
  </div>
);

interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
  children: React.ReactNode;
}

export const TabsTrigger: React.FC<TabsTriggerProps> = ({ value, children, className = '', ...props }) => {
  const context = React.useContext(TabsContext);
  if (!context) throw new Error('TabsTrigger must be used within Tabs');
  const { value: activeValue, setValue } = context;

  // Keyboard navigation support
  const ref = React.useRef<HTMLButtonElement>(null);
  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (!ref.current) return;
    const list = ref.current.closest('[role="tablist"]');
    if (!list) return;
    const tabs = Array.from(list.querySelectorAll('button[role="tab"]')) as HTMLButtonElement[];
    const idx = tabs.indexOf(ref.current);
    if (e.key === 'ArrowRight') {
      tabs[(idx + 1) % tabs.length]?.focus();
    } else if (e.key === 'ArrowLeft') {
      tabs[(idx - 1 + tabs.length) % tabs.length]?.focus();
    }
  };

  return (
    <button
      ref={ref}
      role="tab"
      aria-selected={activeValue === value}
      className={cn(
        'px-3 py-1.5 text-sm font-normal cursor-pointer rounded-md transition-colors',
        activeValue === value
          ? 'bg-[#FEB64D] text-[#0D0D0D] shadow'
          : 'text-[#A1A1AA] hover:text-foreground',
        className
      )}
      tabIndex={activeValue === value ? 0 : -1}
      onClick={() => setValue(value)}
      onKeyDown={handleKeyDown}
      {...props}
    >
      {children}
    </button>
  );
};

interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
  children: React.ReactNode;
}

export const TabsContent: React.FC<TabsContentProps> = ({ value, children, className = '', ...props }) => {
  const context = React.useContext(TabsContext);
  if (!context) throw new Error('TabsContent must be used within Tabs');
  const { value: activeValue } = context;
  if (value !== activeValue) return null;
  return (
    <div
      role="tabpanel"
      className={cn('mt-2', className)}
      {...props}
    >
      {children}
    </div>
  );
};
