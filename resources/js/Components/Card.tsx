import { cn } from '@/lib/classNames';
import { HTMLAttributes, PropsWithChildren } from 'react';

export function Card({
    className,
    children,
    ...props
}: PropsWithChildren<HTMLAttributes<HTMLDivElement>>) {
    return (
        <div
            {...props}
            className={cn(
                'rounded-lg border border-neutral-200 bg-surface shadow-card',
                className,
            )}
        >
            {children}
        </div>
    );
}

export function CardHeader({
    className,
    children,
    ...props
}: PropsWithChildren<HTMLAttributes<HTMLDivElement>>) {
    return (
        <div {...props} className={cn('p-5 pb-0', className)}>
            {children}
        </div>
    );
}

export function CardContent({
    className,
    children,
    ...props
}: PropsWithChildren<HTMLAttributes<HTMLDivElement>>) {
    return (
        <div {...props} className={cn('p-5', className)}>
            {children}
        </div>
    );
}

export function CardTitle({
    className,
    children,
    ...props
}: PropsWithChildren<HTMLAttributes<HTMLHeadingElement>>) {
    return (
        <h2
            {...props}
            className={cn('text-lg font-semibold leading-7 text-neutral-950', className)}
        >
            {children}
        </h2>
    );
}

export function CardDescription({
    className,
    children,
    ...props
}: PropsWithChildren<HTMLAttributes<HTMLParagraphElement>>) {
    return (
        <p {...props} className={cn('mt-1 text-sm text-neutral-500', className)}>
            {children}
        </p>
    );
}
