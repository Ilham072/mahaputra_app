import { cn } from '@/lib/classNames';
import { ReactNode } from 'react';

type PageHeaderProps = {
    title: string;
    description?: string;
    actions?: ReactNode;
    className?: string;
};

export default function PageHeader({
    title,
    description,
    actions,
    className,
}: PageHeaderProps) {
    return (
        <div
            className={cn(
                'flex min-w-0 items-center justify-between gap-4',
                className,
            )}
        >
            <div className="min-w-0">
                <h1 className="truncate text-lg font-bold leading-6 text-neutral-950 sm:text-2xl sm:leading-8">
                    {title}
                </h1>
                {description && (
                    <p className="hidden text-sm text-neutral-500 sm:block">
                        {description}
                    </p>
                )}
            </div>

            {actions && <div className="shrink-0">{actions}</div>}
        </div>
    );
}
