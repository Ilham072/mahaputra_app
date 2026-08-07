import { cn } from '@/lib/classNames';
import { ButtonHTMLAttributes } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: ButtonVariant;
    size?: ButtonSize;
    isLoading?: boolean;
};

const variantClasses: Record<ButtonVariant, string> = {
    primary:
        'border-transparent bg-yellow-500 text-neutral-950 hover:bg-yellow-600 focus:ring-yellow-500',
    secondary:
        'border-transparent bg-neutral-950 text-white hover:bg-neutral-800 focus:ring-yellow-500',
    outline:
        'border-neutral-300 bg-white text-neutral-900 hover:bg-neutral-50 focus:ring-yellow-500',
    ghost:
        'border-transparent bg-transparent text-neutral-700 hover:bg-neutral-100 focus:ring-yellow-500',
    danger:
        'border-transparent bg-red-600 text-white hover:bg-red-500 focus:ring-red-500',
};

const sizeClasses: Record<ButtonSize, string> = {
    sm: 'h-8 px-3 text-sm',
    md: 'h-10 px-4 text-sm',
    lg: 'h-11 px-5 text-base',
};

export default function Button({
    type = 'button',
    variant = 'primary',
    size = 'md',
    className,
    disabled,
    isLoading = false,
    children,
    ...props
}: ButtonProps) {
    return (
        <button
            {...props}
            type={type}
            className={cn(
                'inline-flex items-center justify-center gap-2 rounded-md border font-medium transition duration-150 ease-out focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
                variantClasses[variant],
                sizeClasses[size],
                className,
            )}
            disabled={disabled || isLoading}
        >
            {isLoading && (
                <span
                    className="h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent"
                    aria-hidden="true"
                />
            )}
            {children}
        </button>
    );
}
