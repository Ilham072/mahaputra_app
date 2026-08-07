import { cn } from '@/lib/classNames';
import { HTMLAttributes, PropsWithChildren } from 'react';

type BadgeVariant =
    | 'neutral'
    | 'primary'
    | 'success'
    | 'warning'
    | 'danger'
    | 'info';

type BadgeProps = PropsWithChildren<HTMLAttributes<HTMLSpanElement>> & {
    variant?: BadgeVariant;
};

const variantClasses: Record<BadgeVariant, string> = {
    neutral: 'border-neutral-200 bg-neutral-100 text-neutral-700',
    primary: 'border-yellow-200 bg-yellow-100 text-neutral-950',
    success: 'border-green-200 bg-green-50 text-green-700',
    warning: 'border-amber-200 bg-amber-50 text-amber-700',
    danger: 'border-red-200 bg-red-50 text-red-700',
    info: 'border-blue-200 bg-blue-50 text-blue-700',
};

export default function Badge({
    variant = 'neutral',
    className,
    children,
    ...props
}: BadgeProps) {
    return (
        <span
            {...props}
            className={cn(
                'inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium',
                variantClasses[variant],
                className,
            )}
        >
            {children}
        </span>
    );
}
