import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold transition-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
    {
        variants: {
            variant: {
                primary:
                    "bg-brand-red text-white hover:bg-red-700 focus-visible:ring-brand-red shadow-md hover:shadow-lg hover:-translate-y-0.5",
                secondary:
                    "bg-brand-blue text-white hover:bg-blue-800 focus-visible:ring-brand-blue shadow-md hover:shadow-lg hover:-translate-y-0.5",
                outline:
                    "border-2 border-brand-red text-brand-red hover:bg-brand-red hover:text-white focus-visible:ring-brand-red",
                ghost:
                    "hover:bg-gray-100 hover:text-gray-900 focus-visible:ring-gray-300",
                link: "text-brand-blue underline-offset-4 hover:underline",
                success:
                    "bg-green-600 text-white hover:bg-green-700 focus-visible:ring-green-600 shadow-md hover:shadow-lg",
                danger:
                    "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-600 shadow-md hover:shadow-lg",
            },
            size: {
                sm: "h-9 px-3 text-xs",
                md: "h-10 px-4 py-2",
                lg: "h-12 px-6 text-base",
                xl: "h-14 px-8 text-lg",
                icon: "h-10 w-10",
            },
        },
        defaultVariants: {
            variant: "primary",
            size: "md",
        },
    }
);

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
    asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, ...props }, ref) => {
        return (
            <button
                className={cn(buttonVariants({ variant, size, className }))}
                ref={ref}
                {...props}
            />
        );
    }
);
Button.displayName = "Button";

export { Button, buttonVariants };
