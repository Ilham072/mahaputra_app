import Badge from '@/Components/Badge';
import Button from '@/Components/Button';
import { Card, CardContent, CardTitle } from '@/Components/Card';
import CurrencyDisplay from '@/Components/CurrencyDisplay';
import DataTable from '@/Components/DataTable';
import type { DataTableColumn } from '@/Components/DataTable';
import EmptyState from '@/Components/EmptyState';
import PageHeader from '@/Components/PageHeader';
import StatusBadge from '@/Components/StatusBadge';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { ReactNode } from 'react';

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
    const { auth } = usePage<PageProps>().props;
    const isAdmin = auth.user.role === 'admin';
    const previousMonth = getPreviousMonth(period.month);

    const metricCards: Array<{
        label: string;
        value: ReactNode;
        caption: string;
        accent?: boolean;
        note?: string;
    }> = [
        {
            label: 'Penjualan',
            value: `${metrics.sales_count} unit`,
            caption: period.label,
        },
        {
            label: 'Omzet Penjualan',
            value: 'Belum tersedia',
            caption: 'Perlu data total nilai penjualan',
            note: 'Data backend belum dikirim',
        },
        {
            label: 'Laba Kendaraan',
            value: formatShortCurrency(metrics.vehicle_profit),
            caption: 'Berdasarkan snapshot penjualan',
            accent: true,
        },
        {
            label: 'Total Inventory',
            value: `${metrics.vehicles_total} unit`,
            caption: `${metrics.vehicles_ready} Ready - ${metrics.vehicles_preparation} Persiapan`,
        },
        {
            label: 'Pengeluaran',
            value: formatShortCurrency(metrics.operational_total),
            caption: period.label,
        },
    ];

    const recentSaleColumns: Array<DataTableColumn<RecentSale>> = [
        {
            key: 'sale_date',
            header: 'Tanggal',
            cellClassName: 'whitespace-nowrap',
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
            header: 'Harga Jual',
            align: 'right',
            cellClassName: 'font-semibold text-neutral-950',
            cell: (sale) => <CurrencyDisplay value={sale.selling_price} />,
        },
        {
            key: 'profit',
            header: 'Laba Kendaraan',
            align: 'right',
            cellClassName: 'font-semibold text-green-700',
            cell: (sale) => <CurrencyDisplay value={sale.profit_snapshot} />,
        },
    ];

    const recentVehicleColumns: Array<DataTableColumn<RecentVehicle>> = [
        {
            key: 'vehicle',
            header: 'Kendaraan',
            cellClassName: 'font-medium text-neutral-950',
            cell: (vehicle) => (
                <Link
                    href={route('vehicles.show', vehicle.id)}
                    className="underline-offset-2 hover:underline"
                >
                    {vehicle.vehicle}
                    <div className="text-xs font-normal text-neutral-500">
                        {vehicle.plate_number}
                    </div>
                </Link>
            ),
        },
        {
            key: 'status',
            header: 'Status',
            cell: (vehicle) => (
                <StatusBadge type="vehicle" value={vehicle.status} />
            ),
        },
        {
            key: 'asking_price',
            header: 'Harga Penawaran',
            align: 'right',
            cellClassName: 'font-semibold text-neutral-950',
            cell: (vehicle) => <CurrencyDisplay value={vehicle.asking_price} />,
        },
    ];

    return (
        <AuthenticatedLayout
            header={
                <PageHeader
                    title="Dashboard"
                    description="Ringkasan operasional hari ini"
                />
            }
        >
            <Head title="Dashboard" />

            <div className="space-y-5">
                <PeriodPills
                    currentMonth={period.month}
                    previousMonth={previousMonth}
                    currentLabel={`Bulan Ini (${period.label})`}
                    previousLabel={`Bulan Sebelumnya (${formatMonthLabel(previousMonth)})`}
                />

                <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
                    {metricCards.map((card) => (
                        <MetricCard key={card.label} {...card} />
                    ))}
                </section>

                <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_280px]">
                    <SalesBarChart items={salesTrend} />

                    <div className="space-y-4">
                        <InventoryStatusCard
                            ready={metrics.vehicles_ready}
                            preparation={metrics.vehicles_preparation}
                            total={metrics.vehicles_total}
                            soldThisMonth={metrics.sales_count}
                        />
                        <StockAgeCard />
                    </div>
                </section>

                <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_280px]">
                    <ProfitLineCard items={salesTrend} />

                    <div className="space-y-4">
                        <ExpenseSummaryCard total={metrics.operational_total} />
                        <QuickActionsCard isAdmin={isAdmin} />
                    </div>
                </section>

                <DashboardTableCard
                    title="Penjualan Terbaru"
                    href={route('sales.index')}
                    linkLabel="Lihat Semua Penjualan"
                >
                    {recentSales.length === 0 ? (
                        <EmptyState title="Belum ada penjualan terbaru." />
                    ) : (
                        <>
                            <RecentSalesCards sales={recentSales} />
                            <div className="hidden sm:block">
                                <DataTable
                                    rows={recentSales}
                                    columns={recentSaleColumns}
                                    getRowKey={(sale) => sale.id}
                                    minWidth="min-w-full"
                                />
                            </div>
                        </>
                    )}
                </DashboardTableCard>

                <DashboardTableCard
                    title="Kendaraan Terbaru"
                    href={route('vehicles.index')}
                    linkLabel="Lihat Inventory"
                >
                    {recentVehicles.length === 0 ? (
                        <EmptyState title="Belum ada kendaraan." />
                    ) : (
                        <DataTable
                            rows={recentVehicles}
                            columns={recentVehicleColumns}
                            getRowKey={(vehicle) => vehicle.id}
                            minWidth="min-w-full"
                        />
                    )}
                </DashboardTableCard>
            </div>
        </AuthenticatedLayout>
    );
}

function RecentSalesCards({ sales }: { sales: RecentSale[] }) {
    return (
        <div className="divide-y divide-neutral-200 sm:hidden">
            {sales.map((sale) => (
                <Link
                    key={sale.id}
                    href={route('sales.show', sale.id)}
                    className="block p-4 transition hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-brand-yellow-500"
                >
                    <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                            <div className="text-xs font-medium text-neutral-500">
                                {sale.sale_date}
                            </div>
                            <div className="mt-2 text-sm font-semibold text-neutral-950">
                                {sale.vehicle}
                            </div>
                            <div className="mt-1 text-xs text-neutral-500">
                                {sale.plate_number}
                            </div>
                        </div>
                        <StatusBadge
                            type="payment"
                            value={sale.payment_type}
                        />
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                        <div>
                            <div className="text-xs font-medium uppercase text-neutral-500">
                                Pembeli
                            </div>
                            <div className="mt-1 font-medium text-neutral-950">
                                {sale.customer_name}
                            </div>
                            <div className="text-xs text-neutral-500">
                                {sale.area}
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-xs font-medium uppercase text-neutral-500">
                                Harga Jual
                            </div>
                            <CurrencyDisplay
                                value={sale.selling_price}
                                className="mt-1 block font-semibold text-neutral-950"
                            />
                        </div>
                        <div className="col-span-2 flex items-center justify-between rounded-md bg-green-50 px-3 py-2">
                            <span className="text-xs font-medium uppercase text-green-700">
                                Laba Kendaraan
                            </span>
                            <CurrencyDisplay
                                value={sale.profit_snapshot}
                                className="font-semibold text-green-700"
                            />
                        </div>
                    </div>
                </Link>
            ))}
        </div>
    );
}

function PeriodPills({
    currentMonth,
    previousMonth,
    currentLabel,
    previousLabel,
}: {
    currentMonth: string;
    previousMonth: string;
    currentLabel: string;
    previousLabel: string;
}) {
    return (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                Periode:
            </div>
            <div className="flex flex-wrap gap-2">
                <Link
                    href={route('dashboard', { month: currentMonth })}
                    className="inline-flex h-9 items-center rounded-md bg-brand-black px-4 text-sm font-semibold text-white shadow-card focus:outline-none focus:ring-2 focus:ring-brand-yellow-500 focus:ring-offset-2"
                >
                    {currentLabel}
                </Link>
                <Link
                    href={route('dashboard', { month: previousMonth })}
                    className="inline-flex h-9 items-center rounded-md border border-neutral-200 bg-surface px-4 text-sm font-semibold text-neutral-700 shadow-card hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-brand-yellow-500 focus:ring-offset-2"
                >
                    {previousLabel}
                </Link>
            </div>
        </div>
    );
}

function MetricCard({
    label,
    value,
    caption,
    accent = false,
    note,
}: {
    label: string;
    value: ReactNode;
    caption: string;
    accent?: boolean;
    note?: string;
}) {
    return (
        <Card
            className={[
                'min-h-[118px] p-5',
                accent ? 'border-l-4 border-l-brand-yellow-500' : '',
            ].join(' ')}
        >
            <div className="text-xs font-bold uppercase tracking-wide text-neutral-500">
                {label}
            </div>
            <div className="mt-3 text-2xl font-bold leading-8 tabular-nums text-neutral-950">
                {value}
            </div>
            <div className="mt-2 text-xs text-neutral-500">{caption}</div>
            {note && <div className="mt-2 text-xs text-amber-700">{note}</div>}
        </Card>
    );
}

function SalesBarChart({ items }: { items: TrendPoint[] }) {
    const maxValue = Math.max(...items.map((item) => item.sales_count), 1);

    return (
        <Card>
            <div className="border-b border-neutral-200 px-5 py-4">
                <CardTitle>Tren Penjualan</CardTitle>
                <p className="mt-2 text-xs text-neutral-500">
                    Unit terjual per bulan (6 bulan terakhir)
                </p>
            </div>
            <CardContent>
                <div className="grid h-72 grid-cols-6 items-end gap-3 border-b border-neutral-200 px-2 pt-4 sm:gap-7 sm:px-6">
                    {items.map((item) => {
                        const height = `${Math.max((item.sales_count / maxValue) * 100, item.sales_count > 0 ? 8 : 3)}%`;
                        const active = item.sales_count === maxValue && item.sales_count > 0;

                        return (
                            <div
                                key={item.month}
                                className="flex h-full min-w-0 flex-col items-center justify-end"
                            >
                                <div
                                    className={[
                                        'flex w-12 items-start justify-center rounded-t-md px-1 pt-2 text-sm font-bold sm:w-16',
                                        active
                                            ? 'bg-brand-yellow-500 text-brand-black'
                                            : 'bg-neutral-200 text-neutral-500',
                                    ].join(' ')}
                                    style={{ height }}
                                >
                                    {item.sales_count}
                                </div>
                            </div>
                        );
                    })}
                </div>
                <div className="grid grid-cols-6 gap-2 px-2 pt-3 sm:px-6">
                    {items.map((item) => (
                        <div
                            key={`${item.month}-label`}
                            className="truncate text-center text-sm font-semibold text-neutral-500"
                        >
                            {formatChartMonth(item.label)}
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

function InventoryStatusCard({
    ready,
    preparation,
    total,
    soldThisMonth,
}: {
    ready: number;
    preparation: number;
    total: number;
    soldThisMonth: number;
}) {
    return (
        <SideCard
            title="Status Inventory"
            href={route('vehicles.index')}
            linkLabel="Lihat Inventory"
        >
            <div className="space-y-2">
                <StatusRow label="Ready" value={ready} variant="success" />
                <StatusRow
                    label="Persiapan"
                    value={preparation}
                    variant="warning"
                />
                <div className="flex items-center justify-between border-t border-neutral-200 pt-3 text-sm font-semibold">
                    <span>Total Inventory</span>
                    <span>{total}</span>
                </div>
                <div className="flex items-center justify-between border-t border-neutral-200 pt-3 text-sm text-neutral-500">
                    <span>Terjual bulan ini</span>
                    <span className="font-semibold text-neutral-950">
                        {soldThisMonth}
                    </span>
                </div>
            </div>
        </SideCard>
    );
}

function StockAgeCard() {
    return (
        <SideCard
            title="Umur Stok"
            href={route('vehicles.index')}
            linkLabel="Lihat Inventory"
        >
            <UnavailableRows
                lines={[
                    '0-30 hari',
                    '31-60 hari',
                    '61-90 hari',
                    '> 90 hari',
                ]}
                note="Data umur stok belum tersedia dari backend."
            />
        </SideCard>
    );
}

function ProfitLineCard({ items }: { items: TrendPoint[] }) {
    const maxValue = Math.max(
        ...items.map((item) => Math.abs(item.profit_total)),
        1,
    );
    const points = items.map((item, index) => {
        const x = items.length === 1 ? 50 : (index / (items.length - 1)) * 100;
        const y = 100 - (Math.abs(item.profit_total) / maxValue) * 78 - 8;

        return { ...item, x, y };
    });
    const polyline = points.map((point) => `${point.x},${point.y}`).join(' ');

    return (
        <Card>
            <div className="flex items-center justify-between gap-4 border-b border-neutral-200 px-5 py-4">
                <div>
                    <CardTitle>Tren Omzet & Laba Kendaraan</CardTitle>
                    <p className="mt-2 text-xs text-neutral-500">
                        Laba kendaraan berdasarkan data yang tersedia
                    </p>
                </div>
                <div className="flex rounded-md bg-neutral-100 p-1 text-xs font-semibold">
                    <span className="rounded bg-surface px-3 py-1 text-neutral-500">
                        Omzet
                    </span>
                    <span className="rounded bg-surface px-3 py-1 text-neutral-950 shadow-card">
                        Laba
                    </span>
                </div>
            </div>
            <CardContent>
                <div className="relative h-72">
                    <div className="absolute inset-x-0 top-8 border-t border-neutral-100" />
                    <div className="absolute inset-x-0 top-1/2 border-t border-neutral-100" />
                    <div className="absolute inset-x-0 bottom-8 border-t border-neutral-100" />
                    <svg
                        viewBox="0 0 100 100"
                        preserveAspectRatio="none"
                        className="absolute inset-0 h-full w-full overflow-visible"
                        aria-hidden="true"
                    >
                        <polyline
                            points={polyline}
                            fill="none"
                            stroke="#EAB308"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            vectorEffect="non-scaling-stroke"
                        />
                    </svg>
                    {points.map((point) => (
                        <div
                            key={`${point.month}-dot`}
                            className="absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-brand-yellow-500 bg-surface"
                            style={{
                                left: `${point.x}%`,
                                top: `${point.y}%`,
                            }}
                        />
                    ))}
                </div>
                <div className="grid grid-cols-6 gap-2 pt-2">
                    {items.map((item) => (
                        <div
                            key={`${item.month}-profit-label`}
                            className="truncate text-center text-sm font-semibold text-neutral-500"
                        >
                            {formatChartMonth(item.label)}
                        </div>
                    ))}
                </div>
                <p className="mt-4 text-xs text-amber-700">
                    Omzet trend belum ditampilkan karena data omzet bulanan belum
                    tersedia dari backend.
                </p>
            </CardContent>
        </Card>
    );
}

function ExpenseSummaryCard({ total }: { total: number }) {
    return (
        <SideCard
            title="Pengeluaran Bulan Ini"
            href={route('operations.index')}
            linkLabel="Lihat Pengeluaran"
        >
            <CurrencyDisplay
                value={total}
                className="block text-2xl font-bold text-neutral-950"
            />
            <UnavailableRows
                lines={[
                    'Operasional Showroom',
                    'Transportasi',
                    'Perawatan',
                    'Lainnya',
                ]}
                note="Breakdown kategori belum tersedia pada props dashboard."
            />
        </SideCard>
    );
}

function QuickActionsCard({ isAdmin }: { isAdmin: boolean }) {
    return (
        <SideCard title="Aksi Cepat">
            <div className="space-y-2">
                {isAdmin ? (
                    <>
                        <Link href={route('vehicles.create')} className="block">
                            <Button type="button" className="w-full justify-start">
                                + Tambah Kendaraan
                            </Button>
                        </Link>
                        <Link href={route('vehicles.index')} className="block">
                            <Button
                                type="button"
                                variant="secondary"
                                className="w-full justify-start"
                            >
                                $ Transaksi Penjualan
                            </Button>
                        </Link>
                        <Link href={route('operations.index')} className="block">
                            <Button
                                type="button"
                                variant="outline"
                                className="w-full justify-start"
                            >
                                Catat Pengeluaran
                            </Button>
                        </Link>
                    </>
                ) : (
                    <>
                        <Link href={route('vehicles.index')} className="block">
                            <Button type="button" className="w-full justify-start">
                                Lihat Inventory
                            </Button>
                        </Link>
                        <Link href={route('reports.index')} className="block">
                            <Button
                                type="button"
                                variant="outline"
                                className="w-full justify-start"
                            >
                                Lihat Laporan
                            </Button>
                        </Link>
                    </>
                )}
            </div>
        </SideCard>
    );
}

function DashboardTableCard({
    title,
    href,
    linkLabel,
    children,
}: {
    title: string;
    href: string;
    linkLabel: string;
    children: ReactNode;
}) {
    return (
        <Card>
            <CardContent className="p-0">
                <div className="flex items-center justify-between gap-4 border-b border-neutral-200 px-5 py-4">
                    <CardTitle>{title}</CardTitle>
                    <Link
                        href={href}
                        className="text-sm font-semibold text-brand-yellow-700 hover:text-brand-black"
                    >
                        {linkLabel} -
                    </Link>
                </div>
                <div>{children}</div>
            </CardContent>
        </Card>
    );
}

function SideCard({
    title,
    href,
    linkLabel,
    children,
}: {
    title: string;
    href?: string;
    linkLabel?: string;
    children: ReactNode;
}) {
    return (
        <Card>
            <CardContent className="p-4">
                <div className="mb-4 flex items-center justify-between gap-3">
                    <h2 className="text-sm font-semibold text-neutral-950">
                        {title}
                    </h2>
                    {href && linkLabel && (
                        <Link
                            href={href}
                            className="text-xs font-semibold text-brand-yellow-700 hover:text-brand-black"
                        >
                            {linkLabel} -
                        </Link>
                    )}
                </div>
                {children}
            </CardContent>
        </Card>
    );
}

function StatusRow({
    label,
    value,
    variant,
}: {
    label: string;
    value: number;
    variant: 'success' | 'warning';
}) {
    return (
        <div
            className={[
                'flex items-center justify-between rounded-md px-3 py-2',
                variant === 'success' ? 'bg-green-50' : 'bg-amber-50',
            ].join(' ')}
        >
            <Badge variant={variant}>{label}</Badge>
            <span
                className={[
                    'text-lg font-bold',
                    variant === 'success' ? 'text-green-700' : 'text-amber-700',
                ].join(' ')}
            >
                {value}
            </span>
        </div>
    );
}

function UnavailableRows({
    lines,
    note,
}: {
    lines: string[];
    note: string;
}) {
    return (
        <div className="mt-4 space-y-3">
            {lines.map((line) => (
                <div
                    key={line}
                    className="flex items-center justify-between gap-3 text-xs text-neutral-500"
                >
                    <span>{line}</span>
                    <span className="h-1.5 w-20 rounded-full bg-neutral-200" />
                </div>
            ))}
            <p className="text-xs text-amber-700">{note}</p>
        </div>
    );
}

function getPreviousMonth(month: string) {
    const [year, monthNumber] = month.split('-').map(Number);
    const date = new Date(year, monthNumber - 2, 1);

    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function formatMonthLabel(month: string) {
    const [, monthNumber] = month.split('-').map(Number);
    const labels = [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'Mei',
        'Jun',
        'Jul',
        'Agu',
        'Sep',
        'Okt',
        'Nov',
        'Des',
    ];

    return labels[monthNumber - 1] ?? month;
}

function formatChartMonth(label: string) {
    return label.split(' ')[0] ?? label;
}

function formatShortCurrency(value: number) {
    const amount = Math.abs(value);

    if (amount >= 1_000_000_000) {
        return `Rp ${(value / 1_000_000_000).toLocaleString('id-ID', {
            maximumFractionDigits: 1,
        })} M`;
    }

    if (amount >= 1_000_000) {
        return `Rp ${Math.round(value / 1_000_000).toLocaleString('id-ID')} jt`;
    }

    return <CurrencyDisplay value={value} />;
}
