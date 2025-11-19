"use client"

import * as AccordionPrimitive from "@radix-ui/react-accordion"
import { ChevronDownIcon } from "lucide-react"
import * as React from "react"

import { cn } from "@/lib/utils"

function Accordion({
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Root>) {
  return <AccordionPrimitive.Root data-slot="accordion" {...props} />
}

function AccordionItem({
  className = '',
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Item>) {
  return (
    <AccordionPrimitive.Item
      data-slot="accordion-item"
      className={cn("border-b last:border-b-0", className)}
      {...props}
    />
  )
}

interface AccordionTriggerProps extends React.ComponentProps<typeof AccordionPrimitive.Trigger> {
  downIconPosition?: 'left' | 'right';
  downIconClassName?: string;
  triggerOnIcon?: boolean; // New prop to control trigger behavior
}

const ChevronButton = ({
  position,
  className,
  onClick,
  dataState
}: {
  position: 'left' | 'right';
  className: string;
  onClick?: () => void;
  dataState?: string;
}) => (
  <div
    onClick={onClick}
    className="h-auto w-auto p-1 cursor-pointer"
    aria-label={`Toggle accordion from ${position} side`}
  >
    <ChevronDownIcon
      data-state={dataState}
      className={cn(
        "text-muted-foreground size-4 shrink-0 translate-y-0.5 transition-transform duration-200 data-[state=open]:rotate-180",
        className
      )}
    />
  </div>
);

function AccordionTrigger({
  className = '',
  children,
  downIconPosition = 'right',
  downIconClassName = '',
  triggerOnIcon = false,
  ...props
}: AccordionTriggerProps) {
  const triggerRef = React.useRef<HTMLButtonElement>(null);

  const handleChevronClick = React.useCallback(() => {
    triggerRef.current?.click();
  }, []);

  const baseClasses = cn(
    "flex flex-1 items-start justify-between gap-4 rounded-md py-4 text-left text-sm font-medium transition-all outline-none",
    className
  );

  const triggerClasses = cn(
    "focus-visible:border-ring focus-visible:ring-ring/50 flex flex-1 items-start justify-between gap-4 rounded-md py-4 text-left text-sm font-medium transition-all outline-none focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 [&[data-state=open]>svg]:rotate-180",
    className
  );

  if (triggerOnIcon) {
    return (
      <AccordionPrimitive.Header className="flex border-b border-b-[#222222]">
        <div className={baseClasses}>
          {downIconPosition === 'left' && (
            <ChevronButton
              position={downIconPosition}
              className={downIconClassName}
              onClick={handleChevronClick}
              dataState={(props as { 'data-state'?: string })['data-state']}
            />
          )}
          <div className="flex-1 pointer-events-none">
            {children}
          </div>
          {downIconPosition === 'right' && (
            <ChevronButton
              position={downIconPosition}
              className={downIconClassName}
              onClick={handleChevronClick}
              dataState={(props as { 'data-state'?: string })['data-state']}
            />
          )}
        </div>
        <AccordionPrimitive.Trigger
          ref={triggerRef}
          data-slot="accordion-trigger"
          className="sr-only"
          {...props}
        />
      </AccordionPrimitive.Header>
    );
  }

  return (
    <AccordionPrimitive.Header className="flex border-b border-b-[#222222]">
      <AccordionPrimitive.Trigger
        data-slot="accordion-trigger"
        className={triggerClasses}
        {...props}
      >
        {downIconPosition === 'left' && (
          <ChevronButton
            position={downIconPosition}
            className={downIconClassName}
          />
        )}
        <div className="flex-1">
          {children}
        </div>
        {downIconPosition === 'right' && (
          <ChevronButton
            position={downIconPosition}
            className={downIconClassName}
          />
        )}
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  );
}

function AccordionContent({
  className = '',
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Content>) {
  return (
    <AccordionPrimitive.Content
      data-slot="accordion-content"
      className="data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down overflow-hidden text-sm"
      {...props}
    >
      <div className={cn("pt-0 pb-4", className)}>{children}</div>
    </AccordionPrimitive.Content>
  )
}

export { Accordion, AccordionContent, AccordionItem, AccordionTrigger }

