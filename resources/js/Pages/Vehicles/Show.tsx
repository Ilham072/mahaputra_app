import Button from '@/Components/Button';
import { Card, CardContent, CardTitle } from '@/Components/Card';
import CurrencyDisplay from '@/Components/CurrencyDisplay';
import PageHeader from '@/Components/PageHeader';
import StatusBadge from '@/Components/StatusBadge';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { ReactNode } from 'react';
import { VehicleDetail } from './types';

type VehicleShowProps = {
    vehicle: VehicleDetail;
};

export default function VehicleShow({ vehicle }: VehicleShowProps) {
    const { auth, flash } = usePage<PageProps>().props;
    const isAdmin = auth.user.role === 'admin';

    return (
        <AuthenticatedLayout
            header={
                <PageHeader
                    title={`${vehicle.brand} ${vehicle.type}`}
                    description={vehicle.plate_number}
                    actions={
                        <div className="flex gap-2">
                            <Link href={route('vehicles.index')}>
                                <Button type="button" variant="outline">
                                    Kembali
                                </Button>
                            </Link>
                            {isAdmin && (
                                <Link href={route('vehicles.edit', vehicle.id)}>
                                    <Button type="button">Edit</Button>
                                </Link>
                            )}
                        </div>
                    }
                />
            }
        >
            <Head title={`${vehicle.brand} ${vehicle.type}`} />

            <div className="space-y-6">
                {flash?.success && (
                    <div className="rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                        {flash.success}
                    </div>
                )}

                <div className="grid gap-6 xl:grid-cols-[minmax(0,1.3fr)_minmax(360px,0.7fr)]">
                    <Card className="overflow-hidden">
                        <div className="flex aspect-[4/3] items-center justify-center bg-neutral-100 text-sm font-medium text-neutral-500">
                            Foto kendaraan belum tersedia
                        </div>
                    </Card>

                    <div className="space-y-6">
                        <Card>
                            <CardContent className="space-y-5">
                                <div className="flex flex-wrap gap-2">
                                    <StatusBadge
                                        type="vehicle"
                                        value={vehicle.status}
                                    />
                                    <StatusBadge
                                        type="capital"
                                        value={vehicle.capital_type}
                                    />
                                </div>

                                <InfoGrid
                                    items={[
                                        ['Tanggal Pembelian', vehicle.purchase_date],
                                        ['Merk', vehicle.brand ?? '-'],
                                        ['Tipe', vehicle.type],
                                        ['Tahun', String(vehicle.year)],
                                        ['Warna', vehicle.color],
                                        [
                                            'Harga Penawaran',
                                            <CurrencyDisplay
                                                key="asking"
                                                value={vehicle.asking_price}
                                            />,
                                        ],
                                    ]}
                                />
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="space-y-5">
                                <CardTitle>Modal Kendaraan</CardTitle>
                                <InfoGrid
                                    items={[
                                        [
                                            'Modal Showroom',
                                            <CurrencyDisplay
                                                key="showroom"
                                                value={vehicle.showroom_capital}
                                            />,
                                        ],
                                        [
                                            'Kolaborator',
                                            vehicle.collaborator_name ?? '-',
                                        ],
                                        [
                                            'Modal Kolaborator',
                                            <CurrencyDisplay
                                                key="collaborator"
                                                value={
                                                    vehicle.collaborator_capital
                                                }
                                            />,
                                        ],
                                        [
                                            'Total Modal Awal',
                                            <CurrencyDisplay
                                                key="initial"
                                                value={vehicle.initial_capital}
                                                className="font-semibold text-neutral-950"
                                            />,
                                        ],
                                    ]}
                                />
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="space-y-5">
                                <CardTitle>Pajak</CardTitle>
                                <InfoGrid
                                    items={[
                                        ['Status Pajak', vehicle.tax_status],
                                        [
                                            'Nominal Pajak',
                                            <CurrencyDisplay
                                                key="tax"
                                                value={vehicle.tax_amount}
                                            />,
                                        ],
                                    ]}
                                />
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

function InfoGrid({
    items,
}: {
    items: Array<[string, ReactNode]>;
}) {
    return (
        <dl className="grid gap-4 sm:grid-cols-2">
            {items.map(([label, value]) => (
                <div key={label}>
                    <dt className="text-sm font-medium text-neutral-500">
                        {label}
                    </dt>
                    <dd className="mt-1 text-sm font-semibold text-neutral-900">
                        {value}
                    </dd>
                </div>
            ))}
        </dl>
    );
}
