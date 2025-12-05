import { HTMLAttributes, forwardRef } from 'react';
import { cn } from './Button';

const Card = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={cn(
                    'bg-surface rounded-xl p-6 border border-gray-700 shadow-2xl backdrop-blur-sm',
                    className
                )}
                {...props}
            />
        );
    }
);

Card.displayName = 'Card';

export { Card };
