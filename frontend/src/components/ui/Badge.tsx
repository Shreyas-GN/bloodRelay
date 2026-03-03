import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
    "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold transition-smooth",
    {
        variants: {
            variant: {
                default: "bg-gray-100 text-gray-800 border border-gray-300",
                primary: "bg-red-100 text-red-800 border border-red-300",
                secondary: "bg-blue-100 text-blue-800 border border-blue-300",
                success: "bg-green-100 text-green-800 border border-green-300",
                warning: "bg-yellow-100 text-yellow-800 border border-yellow-300",
                danger: "bg-red-100 text-red-800 border border-red-300",
                info: "bg-blue-100 text-blue-800 border border-blue-300",
                outline: "border-2 border-gray-300 text-gray-700 bg-transparent",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    }
);

export interface BadgeProps
    extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> { }

function Badge({ className, variant, ...props }: BadgeProps) {
    return (
        <div className={cn(badgeVariants({ variant }), className)} {...props} />
    );
}

export { Badge, badgeVariants };
