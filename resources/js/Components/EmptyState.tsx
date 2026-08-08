import { ReactNode } from 'react';

type EmptyStateProps = {
    title: string;
    description?: string;
    action?: ReactNode;
};

export default function EmptyState({
    title,
    description,
    action,
}: EmptyStateProps) {
    return (
        <div className="flex min-h-56 flex-col items-center justify-center rounded-lg border border-dashed border-neutral-300 bg-neutral-50 px-4 py-10 text-center">
            <div className="text-sm font-semibold text-neutral-900">
                {title}
            </div>
            {description && (
                <p className="mt-1 max-w-sm text-sm text-neutral-500">
                    {description}
                </p>
            )}
            {action && <div className="mt-5">{action}</div>}
        </div>
    );
}
