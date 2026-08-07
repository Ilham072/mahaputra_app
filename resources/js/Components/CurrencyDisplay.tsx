import { cn } from '@/lib/classNames';
import { formatRupiah } from '@/lib/format';

type CurrencyDisplayProps = {
    value: number | string | null | undefined;
    className?: string;
};

export default function CurrencyDisplay({
    value,
    className,
}: CurrencyDisplayProps) {
    return (
        <span className={cn('tabular-nums', className)}>
            {formatRupiah(value)}
        </span>
    );
}
