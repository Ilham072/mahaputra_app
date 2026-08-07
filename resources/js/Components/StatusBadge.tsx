import Badge from '@/Components/Badge';

type VehicleStatus = 'PREPARATION' | 'READY' | 'BOOKING' | 'SOLD';
type CapitalType = 'UMUM' | 'KHUSUS';
type PaymentType = 'CASH' | 'CREDIT';

type StatusBadgeProps =
    | {
          type: 'vehicle';
          value: VehicleStatus;
      }
    | {
          type: 'capital';
          value: CapitalType;
      }
    | {
          type: 'payment';
          value: PaymentType;
      };

const vehicleStatus = {
    PREPARATION: { label: 'Persiapan', variant: 'warning' },
    READY: { label: 'Ready', variant: 'success' },
    BOOKING: { label: 'Booking', variant: 'info' },
    SOLD: { label: 'Terjual', variant: 'neutral' },
} as const;

const capitalStatus = {
    UMUM: { label: 'UMUM', variant: 'info' },
    KHUSUS: { label: 'KHUSUS', variant: 'primary' },
} as const;

const paymentStatus = {
    CASH: { label: 'Cash', variant: 'success' },
    CREDIT: { label: 'Kredit', variant: 'info' },
} as const;

export default function StatusBadge({ type, value }: StatusBadgeProps) {
    const status =
        type === 'vehicle'
            ? vehicleStatus[value]
            : type === 'capital'
              ? capitalStatus[value]
              : paymentStatus[value];

    return <Badge variant={status.variant}>{status.label}</Badge>;
}
