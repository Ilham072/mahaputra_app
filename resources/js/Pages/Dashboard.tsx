import Button from '@/Components/Button';
import { Card, CardContent, CardTitle } from '@/Components/Card';
import CurrencyDisplay from '@/Components/CurrencyDisplay';
import EmptyState from '@/Components/EmptyState';
import PageHeader from '@/Components/PageHeader';
import StatusBadge from '@/Components/StatusBadge';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { ReactNode, useState } from 'react';

type TrendPoint = {
    month: string;
    label: string;
    sales_count: number;
    profit_total: number;
};

type RecentSale = {
    id: number;
    sale_date: string;
    vehicle: string;
    plate_number: string;
    customer_name: string;
    area: string;
    payment_type: 'CASH' | 'CREDIT';
    selling_price: number;
    profit_snapshot: number;
};

type RecentVehicle = {
    id: number;
    vehicle: string;
    plate_number: string;
    status: 'PREPARATION' | 'READY' | 'BOOKING' | 'SOLD';
    asking_price: number;
};

type DashboardProps = {
    period: {
        month: string;
        from: string;
        to: string;
        label: string;
    };
    metrics: {
        vehicles_total: number;
        vehicles_ready: number;
        vehicles_preparation: number;
        sales_count: number;
        vehicle_profit: number;
        operational_total: number;
    };
    salesTrend: TrendPoint[];
    recentSales: RecentSale[];
    recentVehicles: RecentVehicle[];
};

export default function Dashboard({
    period,
    metrics,
    salesTrend,
    recentSales,
    recentVehicles,
}: DashboardProps) {
    const [month, setMonth] = useState(period.month);
    const maxSales = Math.max(...salesTrend.map((item) => item.sales_count), 1);
    const maxProfit = Math.max(
        ...salesTrend.map((item) => Math.abs(item.profit_total)),
        1,
    );

    const kpis: Array<{ label: string; value: ReactNode; caption: string }> = [
        {
            label: 'Total Kendaraan',
            value: metrics.vehicles_total,
            caption: `${metrics.vehicles_preparation} dalam persiapan`,
        },
        {
            label: 'Kendaraan Ready',
            value: metrics.vehicles_ready,
            caption: 'Unit siap ditawarkan',
        },
        {
            label: 'Penjualan Bulan Ini',
            value: metrics.sales_count,
            caption: period.label,
        },
        {
            label: 'Laba Kendaraan',
            value: <CurrencyDisplay value={metrics.vehicle_profit} />,
            caption: 'Berdasarkan snapshot penjualan',
        },
        {
            label: 'Operasional',
            value: <CurrencyDisplay value={metrics.operational_total} />,
            caption: 'Biaya perusahaan bulan ini',
        },
    ];

    const filterMonth = () => {
        router.get(route('dashboard'), { month }, { preserveState: true });
    };

    return (
        <AuthenticatedLayout
            header={
                <PageHeader
                    title="Dashboard"
                    description="Ringkasan performa Mahaputra Group"
                />
            }
        >
            <Head title="Dashboard" />

            <div className="space-y-6">
                <Card className="p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <div className="text-sm font-semibold text-neutral-950">
                                Periode {period.label}
                            </div>
                            <div className="mt-1 text-sm text-neutral-500">
                                {period.from} sampai {period.to}
                            </div>
                        </div>
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                            <label className="sr-only" htmlFor="dashboard-month">
                                Bulan dashboard
                            </label>
                            <input
                                id="dashboard-month"
                                type="month"
                                className="h-10 rounded-md border-neutral-300 text-sm shadow-sm focus:border-yellow-500 focus:ring-yellow-500"
                                value={month}
                                onChange={(event) => setMonth(event.target.value)}
                            />
                            <Button type="button" variant="secondary" onClick={filterMonth}>
                                Terapkan
                            </Button>
                        </div>
                    </div>
                </Card>

                <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
                    {kpis.map((item) => (
                        <Card key={item.label} className="p-5">
                            <div className="text-sm font-medium text-neutral-500">
                                {item.label}
                            </div>
                            <div className="mt-3 text-2xl font-bold tabular-nums text-neutral-950">
                                {item.value}
                            </div>
                            <div className="mt-2 text-xs text-neutral-500">
                                {item.caption}
                            </div>
                        </Card>
                    ))}
                </section>

                <div className="grid gap-6 xl:grid-cols-2">
                    <TrendCard
                        title="Tren Penjualan"
                        items={salesTrend}
                        maxValue={maxSales}
                        getValue={(item) => item.sales_count}
                        getLabel={(item) => `${item.sales_count} transaksi`}
                    />
                    <TrendCard
                        title="Tren Laba Kendaraan"
                        items={salesTrend}
                        maxValue={maxProfit}
                        getValue={(item) => Math.abs(item.profit_total)}
                        getLabel={(item) => (
                            <CurrencyDisplay value={item.profit_total} />
                        )}
                    />
                </div>

                <div className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
                    <Card>
                        <CardContent className="p-0">
                            <div className="flex items-center justify-between gap-4 border-b border-neutral-200 p-5">
                                <CardTitle>Penjualan Terbaru</CardTitle>
                                <Link href={route('sales.index')}>
                                    <Button type="button" variant="outline" size="sm">
                                        Lihat Semua
                                    </Button>
                                </Link>
                            </div>
                            {recentSales.length === 0 ? (
                                <div className="p-5">
                                    <EmptyState title="Belum ada penjualan terbaru." />
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-neutral-200">
                                        <thead className="bg-neutral-50">
                                            <tr>
                                                {[
                                                    'Tanggal',
                                                    'Kendaraan',
                                                    'Pembeli',
                                                    'Pembayaran',
                                                    'Harga',
                                                    'Laba',
                                                ].map((heading) => (
                                                    <th
                                                        key={heading}
                                                        className="px-4 py-3 text-left text-xs font-semibold uppercase text-neutral-500"
                                                    >
                                                        {heading}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-neutral-200 bg-white">
                                            {recentSales.map((sale) => (
                                                <tr key={sale.id}>
                                                    <td className="whitespace-nowrap px-4 py-3 text-sm text-neutral-700">
                                                        {sale.sale_date}
                                                    </td>
                                                    <td className="px-4 py-3 text-sm font-medium text-neutral-950">
                                                        <Link
                                                            className="underline-offset-2 hover:underline"
                                                            href={route('sales.show', sale.id)}
                                                        >
                                                            {sale.vehicle}
                                                        </Link>
                                                        <div className="text-xs text-neutral-500">
                                                            {sale.plate_number}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 text-sm text-neutral-700">
                                                        {sale.customer_name}
                                                        <div className="text-xs text-neutral-500">
                                                            {sale.area}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <StatusBadge
                                                            type="payment"
                                                            value={sale.payment_type}
                                                        />
                                                    </td>
                                                    <td className="whitespace-nowrap px-4 py-3 text-sm font-semibold text-neutral-950">
                                                        <CurrencyDisplay value={sale.selling_price} />
                                                    </td>
                                                    <td className="whitespace-nowrap px-4 py-3 text-sm font-semibold text-neutral-950">
                                                        <CurrencyDisplay value={sale.profit_snapshot} />
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-0">
                            <div className="flex items-center justify-between gap-4 border-b border-neutral-200 p-5">
                                <CardTitle>Kendaraan Terbaru</CardTitle>
                                <Link href={route('vehicles.index')}>
                                    <Button type="button" variant="outline" size="sm">
                                        Stok
                                    </Button>
                                </Link>
                            </div>
                            {recentVehicles.length === 0 ? (
                                <div className="p-5">
                                    <EmptyState title="Belum ada kendaraan." />
                                </div>
                            ) : (
                                <div className="divide-y divide-neutral-200">
                                    {recentVehicles.map((vehicle) => (
                                        <Link
                                            key={vehicle.id}
                                            href={route('vehicles.show', vehicle.id)}
                                            className="block p-4 transition hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-yellow-500"
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="min-w-0">
                                                    <div className="truncate text-sm font-semibold text-neutral-950">
                                                        {vehicle.vehicle}
                                                    </div>
                                                    <div className="mt-1 text-xs text-neutral-500">
                                                        {vehicle.plate_number}
                                                    </div>
                                                </div>
                                                <StatusBadge
                                                    type="vehicle"
                                                    value={vehicle.status}
                                                />
                                            </div>
                                            <CurrencyDisplay
                                                value={vehicle.asking_price}
                                                className="mt-3 block text-sm font-semibold text-neutral-950"
                                            />
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

function TrendCard({
    title,
    items,
    maxValue,
    getValue,
    getLabel,
}: {
    title: string;
    items: TrendPoint[];
    maxValue: number;
    getValue: (item: TrendPoint) => number;
    getLabel: (item: TrendPoint) => ReactNode;
}) {
    const hasData = items.some((item) => getValue(item) > 0);

    return (
        <Card>
            <CardContent>
                <CardTitle>{title}</CardTitle>
                {hasData ? (
                    <div className="mt-5 space-y-4">
                        {items.map((item) => {
                            const value = getValue(item);
                            const width = `${Math.max((value / maxValue) * 100, value > 0 ? 4 : 0)}%`;

                            return (
                                <div
                                    key={`${title}-${item.month}`}
                                    className="grid grid-cols-[72px_minmax(0,1fr)_120px] items-center gap-3"
                                >
                                    <div className="text-xs font-medium text-neutral-500">
                                        {item.label}
                                    </div>
                                    <div className="h-3 overflow-hidden rounded-full bg-neutral-100">
                                        <div
                                            className="h-full rounded-full bg-yellow-500"
                                            style={{ width }}
                                        />
                                    </div>
                                    <div className="text-right text-xs font-semibold text-neutral-950">
                                        {getLabel(item)}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="mt-6">
                        <EmptyState title="Belum ada data untuk tren ini." />
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
