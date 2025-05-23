import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SimpleSelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

interface SimpleSelectItemProps {
  value: string;
  children: React.ReactNode;
  onSelect?: (value: string) => void;
}

const SimpleSelectContext = React.createContext<{
  value?: string;
  onValueChange?: (value: string) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}>({
  isOpen: false,
  setIsOpen: () => {},
});

export function SimpleSelect({ value, onValueChange, placeholder, children, className, disabled }: SimpleSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState('');
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const selectRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    // Update selected label when value changes
    if (value && selectRef.current) {
      const items = selectRef.current.querySelectorAll('[data-value]');
      items.forEach((item) => {
        if (item.getAttribute('data-value') === value) {
          setSelectedLabel(item.textContent || '');
        }
      });
    }
  }, [value]);

  const calculatePosition = () => {
    if (selectRef.current) {
      const rect = selectRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY + 4,
        left: rect.left + window.scrollX,
        width: rect.width
      });
    }
  };

  const handleToggle = () => {
    if (!disabled) {
      if (!isOpen) {
        calculatePosition();
      }
      setIsOpen(!isOpen);
    }
  };

  const handleValueChange = (newValue: string) => {
    onValueChange?.(newValue);
    setIsOpen(false);
  };

  const dropdownContent = isOpen ? (
    <div
      className="fixed z-[99999] rounded-md border bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-2xl"
      style={{
        top: dropdownPosition.top,
        left: dropdownPosition.left,
        width: dropdownPosition.width,
        minWidth: 'max-content'
      }}
    >
      <div className="max-h-60 overflow-y-auto p-1">
        {children}
      </div>
    </div>
  ) : null;

  return (
    <SimpleSelectContext.Provider value={{ value, onValueChange: handleValueChange, isOpen, setIsOpen }}>
      <div ref={selectRef} className={cn("relative", className)}>
        <button
          type="button"
          onClick={handleToggle}
          disabled={disabled}
          className={cn(
            "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            isOpen && "ring-2 ring-ring ring-offset-2"
          )}
        >
          <span className={cn(selectedLabel ? "text-foreground" : "text-muted-foreground")}>
            {selectedLabel || placeholder}
          </span>
          <ChevronDown className={cn("h-4 w-4 opacity-50 transition-transform", isOpen && "rotate-180")} />
        </button>

        {typeof document !== 'undefined' && createPortal(dropdownContent, document.body)}
      </div>
    </SimpleSelectContext.Provider>
  );
}

export function SimpleSelectItem({ value, children, onSelect }: SimpleSelectItemProps) {
  const context = React.useContext(SimpleSelectContext);
  
  const handleClick = () => {
    context.onValueChange?.(value);
    onSelect?.(value);
  };

  const isSelected = context.value === value;

  return (
    <div
      data-value={value}
      onClick={handleClick}
      className={cn(
        "relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 px-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
        isSelected && "bg-accent text-accent-foreground font-medium"
      )}
    >
      {children}
    </div>
  );
}

export { SimpleSelectContext };