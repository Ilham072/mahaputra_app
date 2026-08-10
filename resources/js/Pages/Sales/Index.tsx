import { Card } from '@/Components/Card';
import CurrencyDisplay from '@/Components/CurrencyDisplay';
import EmptyState from '@/Components/EmptyState';
import PageHeader from '@/Components/PageHeader';
import StatusBadge from '@/Components/StatusBadge';
import TextInput from '@/Components/TextInput';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { cn } from '@/lib/classNames';
import { Head, Link, router } from '@inertiajs/react';
import { FormEventHandler, ReactNode, useEffect, useState } from 'react';
import { SaleVehicleSearchRow } from './types';

type SaleIndexProps = {
    vehicles: {
        data: SaleVehicleSearchRow[];
    };
    filters: {
        search: string;
        can_search: boolean;
    };
};

export default function SaleIndex({ vehicles, filters }: SaleIndexProps) {
    const [search, setSearch] = useState(filters.search);

    useEffect(() => {
        if (search === filters.search) {
            return;
        }

        const timeout = window.setTimeout(() => {
            router.get(
                route('sales.index'),
                { search },
                {
                    preserveState: true,
                    replace: true,
                },
            );
        }, 300);

        return () => window.clearTimeout(timeout);
    }, [filters.search, search]);

    const submit: FormEventHandler = (event) => {
        event.preventDefault();

        router.get(
            route('sales.index'),
            { search },
            {
                preserveState: true,
                replace: true,
            },
        );
    };

    return (
        <AuthenticatedLayout
            header={
                <PageHeader
                    title="Transaksi Penjualan"
                    description="Catat dan kelola transaksi penjualan"
                />
            }
        >
            <Head title="Transaksi Penjualan" />

            <Card className="p-4 sm:p-5">
                <form onSubmit={submit} className="space-y-3">
                    <div className="flex items-center gap-3">
                        <StepBadge>1</StepBadge>
                        <h2 className="text-sm font-bold uppercase tracking-wide text-neutral-700">
                            Cari Kendaraan
                        </h2>
                    </div>

                    <label className="relative block">
                        <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-400" />
                        <TextInput
                            type="search"
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Cari nomor polisi, merek, atau model..."
                            className="h-12 pl-12 focus:border-brand-yellow-500 focus:ring-brand-yellow-500"
                            autoFocus
                        />
                    </label>
                </form>

                <div className="mt-3 space-y-2">
                    {!filters.can_search ? (
                        <div className="rounded-md bg-neutral-50 px-4 py-3 text-sm text-neutral-500">
                            Ketik minimal 2 karakter untuk mencari kendaraan.
                        </div>
                    ) : vehicles.data.length === 0 ? (
                        <div className="rounded-md bg-neutral-50 px-4 py-3 text-sm text-neutral-500">
                            <EmptyState
                                title="Kendaraan tidak ditemukan."
                                description="Coba gunakan nomor polisi, merek, atau model lain."
                            />
                        </div>
                    ) : (
                        vehicles.data.map((vehicle) => (
                            <VehicleSaleRow
                                key={vehicle.id}
                                vehicle={vehicle}
                            />
                        ))
                    )}
                </div>
            </Card>
        </AuthenticatedLayout>
    );
}

function VehicleSaleRow({ vehicle }: { vehicle: SaleVehicleSearchRow }) {
    const content = (
        <>
            <div className="min-w-0">
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <span className="font-bold text-neutral-950">
                        {vehicle.plate_number}
                    </span>
                    <span className="text-neutral-700">
                        {vehicle.brand ?? 'Tanpa merk'} {vehicle.type}
                    </span>
                </div>
                <div className="mt-1 text-sm text-neutral-500">
                    {vehicle.year} · {vehicle.color}
                    {vehicle.sale_date && (
                        <span className="text-red-500">
                            {' '}
                            · Terjual pada {vehicle.sale_date}
                        </span>
                    )}
                </div>
            </div>

            <div className="flex shrink-0 flex-wrap items-center justify-end gap-2 sm:min-w-[320px]">
                <StatusBadge type="capital" value={vehicle.capital_type} />
                <StatusBadge type="vehicle" value={vehicle.status} />
                <CurrencyDisplay
                    value={vehicle.asking_price}
                    className="ml-1 text-sm font-bold text-neutral-950 sm:text-base"
                />
            </div>
        </>
    );

    const className = cn(
        'flex flex-col gap-3 rounded-md border border-neutral-200 bg-surface px-4 py-3 transition sm:flex-row sm:items-center sm:justify-between',
        vehicle.can_sell
            ? 'hover:border-brand-yellow-500 hover:bg-brand-yellow-50/30 focus:outline-none focus:ring-2 focus:ring-brand-yellow-500 focus:ring-offset-2'
            : 'cursor-not-allowed opacity-55',
    );

    if (!vehicle.can_sell) {
        return <div className={className}>{content}</div>;
    }

    return (
        <Link
            href={route('vehicles.sales.create', vehicle.id)}
            className={className}
        >
            {content}
        </Link>
    );
}

function StepBadge({ children }: { children: ReactNode }) {
    return (
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-yellow-500 text-sm font-bold text-brand-black">
            {children}
        </span>
    );
}

function SearchIcon({ className = '' }: { className?: string }) {
    return (
        <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
        </svg>
    );
}
