import { cn } from "@/lib/utils"
import * as React from "react"
function Textarea({ className = '', ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        'text-[#FAFAFA] flex field-sizing-content min-h-16 w-full rounded-md border border-input border-[#5A5E5E] bg-[#3D3D3D] px-3 py-2 text-sm',
        'ring-offset-background placeholder:text-[#A1A1AA] placeholder:font-normal placeholder:text-sm',
        'focus-visible:outline-none focus-visible:bg-[#09090B] focus-visible:border-[#FEB64D] ',
        'disabled:cursor-not-allowed disabled:opacity-50 transition-[color]',
        className
      )}
      {...props}
    />
  )
}
export { Textarea }
