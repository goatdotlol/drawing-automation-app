import { ButtonHTMLAttributes, forwardRef } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg';
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
        return (
            <button
                ref={ref}
                className={cn(
                    'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none',
                    {
                        'bg-primary text-white hover:bg-primary-hover shadow-lg hover:shadow-xl hover:scale-105': variant === 'primary',
                        'bg-surface text-text hover:bg-gray-700 border border-gray-700': variant === 'secondary',
                        'hover:bg-gray-700/50 text-text': variant === 'ghost',
                        'bg-error text-white hover:bg-red-600': variant === 'danger',
                        'h-8 px-3 text-sm': size === 'sm',
                        'h-10 px-6': size === 'md',
                        'h-12 px-8 text-lg': size === 'lg',
                    },
                    className
                )}
                {...props}
            />
        );
    }
);

Button.displayName = 'Button';

export { Button, cn };
