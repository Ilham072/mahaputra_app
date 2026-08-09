import { Card } from '@/Components/Card';
import { ReactNode } from 'react';

type KpiCardProps = {
    label: string;
    value: ReactNode;
    caption?: string;
};

export default function KpiCard({ label, value, caption }: KpiCardProps) {
    return (
        <Card className="min-w-0 p-5 sm:p-4 2xl:p-5">
            <div className="text-sm font-medium text-neutral-500">{label}</div>
            <div className="mt-3 text-2xl font-bold leading-8 tabular-nums text-neutral-950">
                {value}
            </div>
            {caption && (
                <div className="mt-2 text-xs text-neutral-500">{caption}</div>
            )}
        </Card>
    );
}
