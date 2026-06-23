"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface StepIndicatorProps {
  steps: string[];
  currentStep: number; // 1-indexed to match wizard step numbering
  className?: string;
}

export function StepIndicator({ steps, currentStep, className }: StepIndicatorProps) {
  return (
    <div className={cn("flex items-start w-full", className)}>
      {steps.map((label, idx) => {
        const stepNum = idx + 1;
        const isCompleted = stepNum < currentStep;
        const isActive = stepNum === currentStep;

        return (
          <div key={label} className="flex items-start flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1.5 min-w-0">
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-[0.6875rem] font-bold transition-all duration-[250ms]",
                  isCompleted && "bg-[var(--color-blood)] text-white",
                  isActive &&
                    "bg-[var(--color-blood)] text-white ring-4 ring-[rgba(214,58,58,0.14)]",
                  !isCompleted &&
                    !isActive &&
                    "bg-[var(--color-base-100)] text-[var(--color-base-400)] border border-[var(--color-base-200)]"
                )}
              >
                {isCompleted ? (
                  <Check className="w-3.5 h-3.5" aria-hidden="true" />
                ) : (
                  stepNum
                )}
              </div>
              <span
                className={cn(
                  "hidden sm:block text-[0.625rem] font-semibold leading-none text-center whitespace-nowrap transition-colors duration-[250ms]",
                  isActive && "text-[var(--color-blood)]",
                  isCompleted && "text-[var(--color-base-500)]",
                  !isCompleted && !isActive && "text-[var(--color-base-400)]"
                )}
              >
                {label}
              </span>
            </div>

            {idx < steps.length - 1 && (
              <div
                className={cn(
                  "flex-1 h-px mt-4 mx-2 transition-colors duration-[250ms]",
                  isCompleted
                    ? "bg-[var(--color-blood)]"
                    : "bg-[var(--color-base-200)]"
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
