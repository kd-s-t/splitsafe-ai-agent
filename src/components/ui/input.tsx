import * as React from 'react'
import { cn } from '@/lib/utils'

type InputProps = React.InputHTMLAttributes<HTMLInputElement>

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', type = 'text', ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'text-[#FAFAFA] flex h-10 w-full rounded-md border border-input border-[#5A5E5E] bg-[#3D3D3D] px-3 py-2 text-sm',
          'ring-offset-background placeholder:text-[#A1A1AA] placeholder:font-normal placeholder:text-sm',
          'focus-visible:outline-none focus-visible:bg-[#09090B] focus-visible:border-[#FEB64D] ',
          'disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)

Input.displayName = 'Input'

export { Input }
