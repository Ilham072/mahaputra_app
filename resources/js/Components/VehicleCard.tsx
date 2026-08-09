import Button from '@/Components/Button';
import { Card } from '@/Components/Card';
import CurrencyDisplay from '@/Components/CurrencyDisplay';
import StatusBadge, {
    type CapitalType,
    type VehicleStatus,
} from '@/Components/StatusBadge';
import { Link } from '@inertiajs/react';

export type VehicleCardVehicle = {
    id: number;
    brand: string | null;
    type: string;
    plate_number: string;
    year: number;
    color: string;
    capital_type: CapitalType;
    asking_price: number;
    status: VehicleStatus;
    cover_photo_url: string | null;
};

type VehicleCardProps = {
    vehicle: VehicleCardVehicle;
    isAdmin: boolean;
};

export default function VehicleCard({ vehicle, isAdmin }: VehicleCardProps) {
    const title = `${vehicle.brand ?? 'Tanpa merk'} ${vehicle.type}`;
    const canSell = isAdmin && vehicle.status !== 'SOLD';

    return (
        <Card className="overflow-hidden transition duration-150 hover:border-neutral-300">
            {vehicle.cover_photo_url ? (
                <img
                    src={vehicle.cover_photo_url}
                    alt={`${title} ${vehicle.plate_number}`}
                    className="aspect-[4/3] w-full object-cover"
                />
            ) : (
                <div className="flex aspect-[4/3] items-center justify-center bg-neutral-100 px-4 text-center text-sm font-medium text-neutral-500">
                    Foto kendaraan belum tersedia
                </div>
            )}

            <div className="space-y-4 p-5">
                <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                        <h2 className="truncate text-lg font-semibold leading-7 text-neutral-950">
                            {title}
                        </h2>
                        <p className="text-sm text-neutral-500">
                            {vehicle.plate_number} / {vehicle.year} /{' '}
                            {vehicle.color}
                        </p>
                    </div>
                    <StatusBadge type="vehicle" value={vehicle.status} />
                </div>

                <div className="flex items-center justify-between gap-4">
                    <StatusBadge type="capital" value={vehicle.capital_type} />
                    <CurrencyDisplay
                        value={vehicle.asking_price}
                        className="text-lg font-bold text-neutral-950"
                    />
                </div>

                <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                    <Link href={route('vehicles.show', vehicle.id)}>
                        <Button
                            type="button"
                            variant="outline"
                            className="w-full sm:w-auto"
                        >
                            Detail
                        </Button>
                    </Link>

                    {isAdmin && (
                        <Link href={route('vehicles.edit', vehicle.id)}>
                            <Button
                                type="button"
                                variant="ghost"
                                className="w-full sm:w-auto"
                            >
                                Edit
                            </Button>
                        </Link>
                    )}

                    {canSell && (
                        <Link href={route('vehicles.sales.create', vehicle.id)}>
                            <Button type="button" className="w-full sm:w-auto">
                                Terjual
                            </Button>
                        </Link>
                    )}
                </div>
            </div>
        </Card>
    );
}
