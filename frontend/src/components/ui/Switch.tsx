"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface SwitchProps extends React.InputHTMLAttributes<HTMLInputElement> {
    onCheckedChange?: (checked: boolean) => void
}

const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
    ({ className, checked, onCheckedChange, ...props }, ref) => (
        <div className="relative inline-flex items-center">
            <input
                type="checkbox"
                className="sr-only peer"
                ref={ref}
                checked={checked}
                onChange={(e) => onCheckedChange?.(e.target.checked)}
                {...props}
            />
            <div
                onClick={(e) => {
                    // Trigger click on input
                    e.currentTarget.previousElementSibling?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
                }}
                className={cn(
                    "w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-red cursor-pointer",
                    className
                )}
            ></div>
        </div>
    )
)
Switch.displayName = "Switch"

export { Switch }
