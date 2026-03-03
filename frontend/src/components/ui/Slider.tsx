"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface SliderProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value'> {
    value: number[]
    max: number
    min: number
    step: number
    onValueChange?: (value: number[]) => void
}

const Slider = React.forwardRef<HTMLInputElement, SliderProps>(
    ({ className, value, max, min, step, onValueChange, ...props }, ref) => (
        <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value[0]}
            onChange={(e) => onValueChange?.([parseFloat(e.target.value)])}
            className={cn(
                "w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-brand-red",
                className
            )}
            ref={ref}
            {...props}
        />
    )
)
Slider.displayName = "Slider"

export { Slider }
