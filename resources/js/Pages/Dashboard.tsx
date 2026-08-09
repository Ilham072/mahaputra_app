import Button from '@/Components/Button';
import { Card, CardContent, CardTitle } from '@/Components/Card';
import CurrencyDisplay from '@/Components/CurrencyDisplay';
import DataTable from '@/Components/DataTable';
import type { DataTableColumn } from '@/Components/DataTable';
import EmptyState from '@/Components/EmptyState';
import FormField from '@/Components/FormField';
import KpiCard from '@/Components/KpiCard';
import PageHeader from '@/Components/PageHeader';
import StatusBadge from '@/Components/StatusBadge';
import TextInput from '@/Components/TextInput';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { FormEventHandler, ReactNode, useState } from 'react';

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

    const filterMonth: FormEventHandler = (event) => {
        event.preventDefault();
        router.get(route('dashboard'), { month }, { preserveState: true });
    };

    const recentSaleColumns: Array<DataTableColumn<RecentSale>> = [
        {
            key: 'sale_date',
            header: 'Tanggal',
            cell: (sale) => sale.sale_date,
        },
        {
            key: 'vehicle',
            header: 'Kendaraan',
            cellClassName: 'font-medium text-neutral-950',
            cell: (sale) => (
                <>
                    <Link
                        className="underline-offset-2 hover:underline"
                        href={route('sales.show', sale.id)}
                    >
                        {sale.vehicle}
                    </Link>
                    <div className="text-xs font-normal text-neutral-500">
                        {sale.plate_number}
                    </div>
                </>
            ),
        },
        {
            key: 'customer',
            header: 'Pembeli',
            cell: (sale) => (
                <>
                    {sale.customer_name}
                    <div className="text-xs text-neutral-500">{sale.area}</div>
                </>
            ),
        },
        {
            key: 'payment',
            header: 'Pembayaran',
            cell: (sale) => (
                <StatusBadge type="payment" value={sale.payment_type} />
            ),
        },
        {
            key: 'selling_price',
            header: 'Harga',
            align: 'right',
            cellClassName: 'font-semibold text-neutral-950',
            cell: (sale) => <CurrencyDisplay value={sale.selling_price} />,
        },
        {
            key: 'profit',
            header: 'Laba',
            align: 'right',
            cellClassName: 'font-semibold text-neutral-950',
            cell: (sale) => <CurrencyDisplay value={sale.profit_snapshot} />,
        },
    ];

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

            <div className="space-y-5 lg:space-y-6">
                <Card className="p-4 sm:p-5">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                        <div>
                            <div className="text-sm font-semibold text-neutral-950">
                                Periode {period.label}
                            </div>
                            <div className="mt-1 text-sm text-neutral-500">
                                {period.from} sampai {period.to}
                            </div>
                        </div>
                        <form
                            onSubmit={filterMonth}
                            className="grid gap-3 sm:grid-cols-[minmax(180px,220px)_auto] lg:min-w-[340px]"
                        >
                            <FormField label="Bulan">
                                <TextInput
                                    type="month"
                                    value={month}
                                    onChange={(event) =>
                                        setMonth(event.target.value)
                                    }
                                />
                            </FormField>
                            <Button
                                type="submit"
                                variant="secondary"
                                className="w-full self-end sm:w-auto"
                            >
                                Terapkan
                            </Button>
                        </form>
                    </div>
                </Card>

                <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
                    {kpis.map((item) => (
                        <KpiCard
                            key={item.label}
                            label={item.label}
                            value={item.value}
                            caption={item.caption}
                        />
                    ))}
                </section>

                <div className="grid gap-5 xl:grid-cols-2">
                    <TrendCard
                        title="Tren Penjualan"
                        items={salesTrend}
                        maxValue={maxSales}
                        getValue={(item) => item.sales_count}
                        getLabel={(item) => `${item.sales_count} transaksi`}
                        barClassName="bg-brand-yellow-500"
                    />
                    <TrendCard
                        title="Tren Laba Kendaraan"
                        items={salesTrend}
                        maxValue={maxProfit}
                        getValue={(item) => Math.abs(item.profit_total)}
                        getLabel={(item) => (
                            <CurrencyDisplay value={item.profit_total} />
                        )}
                        barClassName="bg-brand-black"
                    />
                </div>

                <div className="grid gap-5 xl:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
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
                                <DataTable
                                    rows={recentSales}
                                    columns={recentSaleColumns}
                                    getRowKey={(sale) => sale.id}
                                    minWidth="min-w-[560px] sm:min-w-[680px]"
                                />
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
                                            className="block p-4 transition hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-brand-yellow-500"
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
    barClassName,
}: {
    title: string;
    items: TrendPoint[];
    maxValue: number;
    getValue: (item: TrendPoint) => number;
    getLabel: (item: TrendPoint) => ReactNode;
    barClassName: string;
}) {
    const hasData = items.some((item) => getValue(item) > 0);

    return (
        <Card>
            <CardContent>
                <CardTitle>{title}</CardTitle>
                {hasData ? (
                    <div className="mt-5 space-y-3.5">
                        {items.map((item) => {
                            const value = getValue(item);
                            const width = `${Math.max((value / maxValue) * 100, value > 0 ? 4 : 0)}%`;

                            return (
                                <div
                                    key={`${title}-${item.month}`}
                                    className="grid grid-cols-[64px_minmax(0,1fr)] items-center gap-x-3 gap-y-1 sm:grid-cols-[72px_minmax(0,1fr)_120px]"
                                >
                                    <div className="text-xs font-medium text-neutral-500">
                                        {item.label}
                                    </div>
                                    <div className="h-3 overflow-hidden rounded-full bg-neutral-100">
                                        <div
                                            className={`h-full rounded-full ${barClassName}`}
                                            style={{ width }}
                                        />
                                    </div>
                                    <div className="col-start-2 text-right text-[11px] font-semibold leading-4 text-neutral-950 sm:col-start-auto sm:text-xs">
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
