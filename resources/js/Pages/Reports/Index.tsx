import Button from '@/Components/Button';
import { Card } from '@/Components/Card';
import CurrencyDisplay from '@/Components/CurrencyDisplay';
import DataTable, { type DataTableColumn } from '@/Components/DataTable';
import EmptyState from '@/Components/EmptyState';
import PageHeader from '@/Components/PageHeader';
import StatusBadge, { type PaymentType as BadgePaymentType } from '@/Components/StatusBadge';
import TextInput from '@/Components/TextInput';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { cn } from '@/lib/classNames';
import { Head, Link, router } from '@inertiajs/react';
import axios from 'axios';
import {
    type FormEventHandler,
    lazy,
    type ReactNode,
    Suspense,
    useEffect,
    useState,
} from 'react';
import type {
    ReportFilters,
    ReportPdfPayload,
    ReportSummary,
    SaleReportRow,
} from './ReportPdfDocument';
import type { SaleDetail } from '../Sales/types';

const PdfDownloadAction = lazy(() => import('./PdfDownloadAction'));

type Option = {
    id: number;
    name: string;
};

type ValueOption<T extends string = string> = {
    value: T;
    label: string;
};

type OperationPreview = {
    id: number;
    transaction_date: string;
    category: string | null;
    amount: number;
    description: string | null;
};

type ReportProps = {
    filters: ReportFilters;
    summary: ReportSummary;
    sales: {
        data: SaleReportRow[];
    };
    operations: {
        total: number;
        recent: OperationPreview[];
    };
    options: {
        areas: Option[];
        employees: Option[];
        paymentTypes: Array<ValueOption<'CASH' | 'CREDIT'>>;
        capitalTypes: Array<ValueOption<'UMUM' | 'KHUSUS'>>;
    };
    dashboard?: ReportDashboardData;
};

type ReportDashboardData = {
    payment: Array<{ type: string; count: number; percentage: number }>;
    areas: Array<{ name: string; count: number; value: number }>;
    employees: Array<{ name: string; count: number; value: number }>;
};

export default function ReportsIndex({
    filters,
    summary,
    sales,
    dashboard,
}: ReportProps) {
    const [filterData, setFilterData] = useState(filters);
    const [pdfPayload, setPdfPayload] = useState<ReportPdfPayload | null>(null);
    const [pdfLoading, setPdfLoading] = useState(false);
    const [pdfError, setPdfError] = useState<string | null>(null);
    const [selectedSale, setSelectedSale] = useState<SaleDetail | null>(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [detailError, setDetailError] = useState<string | null>(null);

    const averageProfit =
        summary.sales_count > 0
            ? Math.round(summary.profit_total / summary.sales_count)
            : 0;
    const monthValue = filterData.date_from.slice(0, 7);

    const saleColumns: Array<DataTableColumn<SaleReportRow>> = [
        {
            key: 'sale_date',
            header: 'Tanggal',
            cellClassName: 'whitespace-nowrap text-neutral-500',
            cell: (sale) => formatDate(sale.sale_date),
        },
        {
            key: 'vehicle',
            header: 'Kendaraan',
            cellClassName: 'font-medium text-neutral-950',
            cell: (sale) => (
                <>
                    {sale.vehicle}
                    <div className="text-xs font-normal text-neutral-500">
                        {sale.plate_number} · {sale.year}
                    </div>
                </>
            ),
        },
        {
            key: 'customer',
            header: 'Pembeli',
            cell: (sale) => (
                <>
                    <span className="font-medium text-neutral-950">
                        {sale.customer_name}
                    </span>
                    <div className="text-xs text-neutral-500">
                        {sale.customer_whatsapp}
                    </div>
                </>
            ),
        },
        {
            key: 'area_pic',
            header: 'Area / PIC',
            cell: (sale) => (
                <>
                    <span className="font-medium text-neutral-950">
                        {sale.area}
                    </span>
                    <div className="text-xs text-neutral-500">
                        {sale.employee}
                    </div>
                </>
            ),
        },
        {
            key: 'payment_type',
            header: 'Pembayaran',
            cell: (sale) => (
                <>
                    <StatusBadge type="payment" value={sale.payment_type} />
                    {sale.financing_provider && (
                        <div className="mt-1 text-xs text-neutral-500">
                            {sale.financing_provider}
                        </div>
                    )}
                </>
            ),
        },
        {
            key: 'selling_price',
            header: 'Harga Jual',
            align: 'right',
            cellClassName: 'whitespace-nowrap font-semibold text-neutral-950',
            cell: (sale) => <CurrencyDisplay value={sale.selling_price} />,
        },
        {
            key: 'profit_snapshot',
            header: 'Laba',
            align: 'right',
            cellClassName: 'whitespace-nowrap font-semibold text-green-700',
            cell: (sale) => <CurrencyDisplay value={sale.profit_snapshot} />,
        },
        {
            key: 'actions',
            header: '',
            align: 'right',
            cellClassName: 'whitespace-nowrap',
            cell: (sale) => (
                <button
                    type="button"
                    onClick={() => openSaleDetail(sale.id)}
                    aria-label={`Lihat detail transaksi ${sale.vehicle}`}
                    title={`Lihat detail transaksi ${sale.vehicle}`}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-neutral-300 bg-surface text-neutral-700 transition hover:bg-neutral-50 hover:text-neutral-950 focus:outline-none focus:ring-2 focus:ring-brand-yellow-500 focus:ring-offset-2"
                >
                    <EyeIcon className="h-4 w-4" />
                </button>
            ),
        },
    ];

    const summaryCards: Array<{
        label: string;
        value: ReactNode;
        caption: string;
        accent?: boolean;
    }> = [
        {
            label: 'Total Transaksi',
            value: `${summary.sales_count} transaksi`,
            caption: 'Sesuai filter aktif',
        },
        {
            label: 'Nilai Penjualan',
            value: <CurrencyDisplay value={summary.sales_value} />,
            caption: 'Sesuai filter aktif',
        },
        {
            label: 'Laba Kendaraan',
            value: <CurrencyDisplay value={summary.profit_total} />,
            caption: 'Sesuai filter aktif',
            accent: true,
        },
        {
            label: 'Rata-rata Laba/Unit',
            value: <CurrencyDisplay value={averageProfit} />,
            caption: 'Sesuai filter aktif',
        },
    ];

    const submit: FormEventHandler = (event) => {
        event.preventDefault();
        setPdfPayload(null);
        setPdfError(null);

        router.get(route('sales.recap'), filterData, {
            preserveState: true,
            replace: true,
        });
    };

    const clearFilters = () => {
        const cleared = {
            ...filters,
            search: '',
            payment_type: '',
            area_id: '',
            employee_id: '',
            capital_type: '',
        };

        setFilterData(cleared);
        setPdfPayload(null);
        setPdfError(null);
        router.get(route('sales.recap'), cleared, { replace: true });
    };

    const setMonth = (value: string) => {
        if (!value) {
            return;
        }

        setFilterData({
            ...filterData,
            date_from: `${value}-01`,
            date_to: monthEndDate(value),
        });
        setPdfPayload(null);
    };

    const setPaymentType = (paymentType: string) => {
        setFilterData({
            ...filterData,
            payment_type: paymentType,
        });
        setPdfPayload(null);
    };

    const loadPdfData = async () => {
        setPdfLoading(true);
        setPdfError(null);

        try {
            const response = await axios.get<ReportPdfPayload>(
                route('reports.export.pdf-data', filterData),
            );
            setPdfPayload(response.data);
        } catch {
            setPdfError('Data PDF gagal disiapkan.');
        } finally {
            setPdfLoading(false);
        }
    };

    const openSaleDetail = async (saleId: number) => {
        setSelectedSale(null);
        setDetailError(null);
        setDetailLoading(true);

        try {
            const response = await axios.get<{ sale: SaleDetail }>(
                route('sales.detail-data', saleId),
            );
            setSelectedSale(response.data.sale);
        } catch {
            setDetailError('Detail transaksi gagal dimuat.');
        } finally {
            setDetailLoading(false);
        }
    };

    if (dashboard) {
        return (
            <ReportsDashboard
                filters={filterData}
                summary={summary}
                dashboard={dashboard}
                onFilter={(nextFilters) => {
                    setFilterData(nextFilters);
                    router.get(route('reports.index'), nextFilters, {
                        preserveState: true,
                        replace: true,
                    });
                }}
            />
        );
    }

    return (
        <AuthenticatedLayout
            header={
                <PageHeader
                    title="Rekap Penjualan"
                    description="Rekapitulasi penjualan per periode"
                />
            }
        >
            <Head title="Rekap Penjualan" />

            <div className="space-y-5 lg:space-y-6">
                <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    {summaryCards.map((item) => (
                        <SummaryCard key={item.label} {...item} />
                    ))}
                </section>

                <Card className="p-4 sm:p-5">
                    <form onSubmit={submit} className="space-y-3">
                        <label className="relative block">
                            <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-400" />
                            <TextInput
                                type="search"
                                placeholder="Cari kendaraan, nomor polisi, atau pembeli..."
                                value={filterData.search}
                                onChange={(event) =>
                                    setFilterData({
                                        ...filterData,
                                        search: event.target.value,
                                    })
                                }
                                className="h-12 pl-12"
                            />
                        </label>

                        <TextInput
                            type="month"
                            value={monthValue}
                            onChange={(event) => setMonth(event.target.value)}
                            className="h-12"
                        />

                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex flex-wrap gap-2">
                                <PaymentFilterButton
                                    active={filterData.payment_type === ''}
                                    onClick={() => setPaymentType('')}
                                >
                                    Semua
                                </PaymentFilterButton>
                                <PaymentFilterButton
                                    active={filterData.payment_type === 'CASH'}
                                    onClick={() => setPaymentType('CASH')}
                                >
                                    Cash
                                </PaymentFilterButton>
                                <PaymentFilterButton
                                    active={filterData.payment_type === 'CREDIT'}
                                    onClick={() => setPaymentType('CREDIT')}
                                >
                                    Kredit
                                </PaymentFilterButton>
                            </div>

                            <div className="flex gap-2 sm:justify-end">
                                <Button type="submit" variant="secondary">
                                    <FilterIcon className="h-4 w-4" />
                                    Filter
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={clearFilters}
                                >
                                    Bersihkan
                                </Button>
                            </div>
                        </div>
                    </form>
                </Card>

                <Card>
                    <div className="flex flex-col gap-3 border-b border-neutral-200 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
                        <p className="text-sm text-neutral-500">
                            <span className="font-semibold text-neutral-950">
                                {summary.sales_count}
                            </span>{' '}
                            transaksi ditemukan
                        </p>
                        <div className="flex flex-wrap gap-2 sm:justify-end">
                            <PdfExportButton
                                payload={pdfPayload}
                                isLoading={pdfLoading}
                                error={pdfError}
                                onPrepare={loadPdfData}
                                disabled={summary.sales_count === 0}
                            />
                            <a
                                className={exportLinkClasses()}
                                href={route('reports.export.excel', filterData)}
                            >
                                Export Excel
                            </a>
                        </div>
                    </div>

                    {sales.data.length === 0 ? (
                        <div className="p-5">
                            <EmptyState
                                title="Belum ada transaksi."
                                description="Ubah filter atau buat transaksi penjualan terlebih dahulu."
                            />
                        </div>
                    ) : (
                        <DataTable
                            rows={sales.data}
                            columns={saleColumns}
                            getRowKey={(sale) => sale.id}
                            minWidth="min-w-[1120px] lg:min-w-full"
                        />
                    )}
                </Card>
                <SaleDetailDrawer
                    sale={selectedSale}
                    isLoading={detailLoading}
                    error={detailError}
                    onClose={() => {
                        setSelectedSale(null);
                        setDetailError(null);
                    }}
                />
            </div>
        </AuthenticatedLayout>
    );
}

function SummaryCard({
    label,
    value,
    caption,
    accent = false,
}: {
    label: string;
    value: ReactNode;
    caption: string;
    accent?: boolean;
}) {
    return (
        <Card
            className={cn(
                'min-h-36 p-5',
                accent ? 'border-l-4 border-l-brand-yellow-500' : '',
            )}
        >
            <div className="text-xs font-bold uppercase text-neutral-500">
                {label}
            </div>
            <div className="mt-4 text-2xl font-bold tracking-normal text-neutral-950">
                {value}
            </div>
            <div className="mt-4 text-sm font-medium text-brand-yellow-700">
                {caption}
            </div>
        </Card>
    );
}

function SaleDetailDrawer({
    sale,
    isLoading,
    error,
    onClose,
}: {
    sale: SaleDetail | null;
    isLoading: boolean;
    error: string | null;
    onClose: () => void;
}) {
    const open = Boolean(sale || isLoading || error);

    useEffect(() => {
        if (!open) {
            return;
        }

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [onClose, open]);

    if (!open) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Detail transaksi penjualan">
            <button type="button" aria-label="Tutup detail" onClick={onClose} className="absolute inset-0 h-full w-full cursor-default bg-brand-black/40" />
            <aside className="absolute right-0 top-0 flex h-full w-full max-w-xl flex-col bg-surface shadow-floating">
                <div className="flex items-start justify-between border-b border-neutral-200 px-5 py-4 sm:px-6">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-wide text-brand-yellow-700">Detail Penjualan</p>
                        <h2 className="mt-1 text-lg font-bold text-neutral-950">{sale?.vehicle ?? 'Memuat detail...'}</h2>
                        {sale && <p className="text-sm text-neutral-500">{sale.plate_number}</p>}
                    </div>
                    <button type="button" onClick={onClose} aria-label="Tutup detail" title="Tutup" className="inline-flex h-9 w-9 items-center justify-center rounded-md text-2xl leading-none text-neutral-500 hover:bg-neutral-100 hover:text-neutral-950">×</button>
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6">
                    {isLoading && <p className="py-10 text-center text-sm text-neutral-500">Memuat detail transaksi...</p>}
                    {error && <p className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
                    {sale && !isLoading && (
                        <div className="space-y-6">
                            <DetailSection title="Kendaraan">
                                <DetailGrid items={[
                                    ['Tahun', String(sale.vehicle_details.year)],
                                    ['Warna', sale.vehicle_details.color],
                                    ['Jenis Modal', <StatusBadge key="capital" type="capital" value={sale.vehicle_details.capital_type} />],
                                    ['Harga Jual', <CurrencyDisplay key="selling" value={sale.selling_price} />],
                                    ['Tanggal Transaksi', formatDate(sale.sale_date)],
                                ]} />
                            </DetailSection>

                            <DetailSection title="Data Pembeli">
                                <DetailGrid items={[
                                    ['Nama', sale.customer.name],
                                    ['WhatsApp', sale.customer.whatsapp],
                                    ['Alamat', sale.customer.address],
                                ]} />
                            </DetailSection>

                            <DetailSection title="Info Penjualan">
                                <DetailGrid items={[
                                    ['Tanggal', formatDate(sale.sale_date)],
                                    ['PIC', sale.employee],
                                    ['Area', sale.area],
                                    ['Pembayaran', <StatusBadge key="payment" type="payment" value={sale.payment_type} />],
                                    ['Pembiayaan', sale.payment.financing_provider ?? '-'],
                                    ['Nilai Kredit', <CurrencyDisplay key="credit" value={sale.credit_total} />],
                                    ['DP Customer', <CurrencyDisplay key="dp" value={sale.payment.dp} />],
                                ]} />
                            </DetailSection>

                            <div className="overflow-hidden rounded-lg border border-neutral-200">
                                <h3 className="border-b border-neutral-200 px-4 py-4 text-sm font-bold uppercase tracking-wide text-neutral-500">Ringkasan Finansial</h3>
                                <div className="divide-y divide-neutral-200 px-4">
                                    <FinancialRow label="Harga Penjualan" value={sale.selling_price} />
                                    <FinancialRow label="Modal Kendaraan" value={sale.initial_capital_snapshot} />
                                    <FinancialRow label="Laba Kendaraan" value={sale.profit_snapshot} highlight />
                                </div>
                                <p className="px-4 pb-4 pt-3 text-xs text-neutral-400">Laba ini belum termasuk biaya operasional dan komisi.</p>
                            </div>
                        </div>
                    )}
                </div>
            </aside>
        </div>
    );
}

function DetailSection({ title, children }: { title: string; children: ReactNode }) {
    return <section><h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-neutral-500">{title}</h3>{children}</section>;
}

function DetailGrid({ items }: { items: Array<[string, ReactNode]> }) {
    return <dl className="grid gap-x-5 gap-y-4 sm:grid-cols-2">{items.map(([label, value]) => <div key={label}><dt className="text-xs uppercase tracking-wide text-neutral-400">{label}</dt><dd className="mt-1 text-sm font-medium text-neutral-900">{value}</dd></div>)}</dl>;
}

function FinancialRow({ label, value, highlight = false }: { label: string; value: number; highlight?: boolean }) {
    return <div className="flex items-center justify-between gap-4 py-3 text-sm"><span className="text-neutral-500">{label}</span><CurrencyDisplay value={value} className={cn('font-semibold', highlight ? 'text-green-700' : 'text-neutral-950')} /></div>;
}

function ReportsDashboard({
    filters,
    summary,
    dashboard,
    onFilter,
}: {
    filters: ReportFilters;
    summary: ReportProps['summary'];
    dashboard: ReportDashboardData;
    onFilter: (filters: ReportFilters) => void;
}) {
    const month = filters.date_from.slice(0, 7);
    const maxAreaValue = Math.max(...dashboard.areas.map((item) => item.value), 1);
    const maxEmployeeValue = Math.max(
        ...dashboard.employees.map((item) => item.value),
        1,
    );
    const periodLabel = `${formatDate(filters.date_from)} - ${formatDate(filters.date_to)}`;
    const setPeriod = (dateFrom: string, dateTo: string) =>
        onFilter({ ...filters, date_from: dateFrom, date_to: dateTo });

    return (
        <AuthenticatedLayout
            header={
                <PageHeader
                    title="Laporan"
                    description="Laporan keuangan dan operasional"
                />
            }
        >
            <Head title="Laporan" />

            <div className="space-y-5 lg:space-y-6">
                <Card className="p-4 sm:p-5">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex flex-wrap items-center gap-2">
                            <PeriodButton
                                active={month === currentMonth()}
                                onClick={() => {
                                    const value = currentMonth();
                                    setPeriod(`${value}-01`, monthEndDate(value));
                                }}
                            >
                                Bulan Ini
                            </PeriodButton>
                            <PeriodButton
                                active={month === previousMonth()}
                                onClick={() => {
                                    const value = previousMonth();
                                    setPeriod(`${value}-01`, monthEndDate(value));
                                }}
                            >
                                Bulan Sebelumnya
                            </PeriodButton>
                            <PeriodButton
                                active={filters.date_from === `${new Date().getFullYear()}-01-01`}
                                onClick={() => {
                                    const year = new Date().getFullYear();
                                    setPeriod(`${year}-01-01`, `${year}-12-31`);
                                }}
                            >
                                Tahun Ini
                            </PeriodButton>
                            <span className="px-1 text-sm text-neutral-500">
                                {periodLabel}
                            </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                            <TextInput
                                type="month"
                                value={month}
                                onChange={(event) => {
                                    const value = event.target.value;
                                    if (value) {
                                        setPeriod(`${value}-01`, monthEndDate(value));
                                    }
                                }}
                                className="h-10 w-full sm:w-auto"
                                aria-label="Pilih periode laporan"
                            />
                            <Button type="button" variant="secondary">
                                <FilterIcon className="h-4 w-4" />
                                Filter
                            </Button>
                            <a
                                className={exportLinkClasses()}
                                href={route('reports.export.excel', filters)}
                            >
                                Export Laporan
                            </a>
                        </div>
                    </div>
                </Card>

                <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                    <ReportMetric label="Kendaraan Terjual" value={`${summary.sales_count} unit`} caption={monthLabel(filters.date_from)} />
                    <ReportMetric label="Omzet Penjualan" value={<CurrencyDisplay value={summary.sales_value} />} caption={monthLabel(filters.date_from)} />
                    <ReportMetric label="Laba Kendaraan" value={<CurrencyDisplay value={summary.profit_total} />} caption="Dari data yang ditampilkan" accent />
                    <ReportMetric label="Pengeluaran" value={<CurrencyDisplay value={summary.operational_total} />} caption={monthLabel(filters.date_from)} />
                    <ReportMetric label="Selisih Laba & Pengeluaran" value={<CurrencyDisplay value={summary.profit_minus_operational} />} caption="Bukan laba bersih akuntansi" />
                </section>

                <div className="inline-flex flex-wrap rounded-md bg-neutral-100 p-1">
                    <span className="rounded-md bg-surface px-4 py-2 text-sm font-semibold text-neutral-950 shadow-sm">Ringkasan</span>
                    <Link href={route('sales.recap')} className="px-4 py-2 text-sm text-neutral-600 hover:text-neutral-950">Penjualan</Link>
                    <Link href={route('operations.index')} className="px-4 py-2 text-sm text-neutral-600 hover:text-neutral-950">Pengeluaran</Link>
                </div>

                <Card>
                    <SectionTitle title="Komposisi Pembayaran" />
                    <div className="p-4 sm:p-5">
                        <div className="flex h-3 overflow-hidden rounded-full bg-neutral-100">
                            {dashboard.payment.map((item) => (
                                <div
                                    key={item.type}
                                    className={item.type === 'CASH' ? 'bg-green-600' : 'bg-blue-500'}
                                    style={{ width: `${item.percentage}%` }}
                                />
                            ))}
                        </div>
                        <div className="mt-4 grid gap-3 sm:grid-cols-2">
                            {dashboard.payment.map((item) => (
                                <div key={item.type} className="rounded-md bg-neutral-50 p-4">
                                    <StatusBadge type="payment" value={item.type as BadgePaymentType} />
                                    <p className="mt-3 text-2xl font-bold text-neutral-950">{item.count}</p>
                                    <p className="text-sm text-neutral-500">transaksi · {item.percentage}%</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </Card>

                <div className="grid gap-5 xl:grid-cols-2">
                    <BreakdownCard title="Penjualan per Area" items={dashboard.areas} maxValue={maxAreaValue} />
                    <BreakdownCard title="Penjualan per PIC" items={dashboard.employees} maxValue={maxEmployeeValue} />
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

function ReportMetric({
    label,
    value,
    caption,
    accent = false,
}: {
    label: string;
    value: ReactNode;
    caption: string;
    accent?: boolean;
}) {
    return (
        <Card className={cn('min-h-36 p-5', accent && 'border-l-4 border-l-brand-yellow-500')}>
            <p className="text-xs font-bold uppercase text-neutral-500">{label}</p>
            <p className="mt-4 text-2xl font-bold text-neutral-950">{value}</p>
            <p className="mt-2 text-sm text-neutral-500">{caption}</p>
        </Card>
    );
}

function BreakdownCard({
    title,
    items,
    maxValue,
}: {
    title: string;
    items: ReportDashboardData['areas'];
    maxValue: number;
}) {
    return (
        <Card>
            <SectionTitle title={title} />
            <div className="space-y-4 p-4 sm:p-5">
                {items.length === 0 ? (
                    <p className="text-sm text-neutral-500">Belum ada data pada periode ini.</p>
                ) : items.map((item) => (
                    <div key={item.name}>
                        <div className="flex items-center justify-between gap-3 text-sm">
                            <span className="min-w-0 truncate text-neutral-700">
                                {item.name} <span className="text-neutral-400">{item.count} kendaraan</span>
                            </span>
                            <CurrencyDisplay value={item.value} className="shrink-0 font-semibold text-neutral-950" />
                        </div>
                        <div className="mt-2 h-1.5 rounded-full bg-neutral-100">
                            <div className="h-full rounded-full bg-brand-yellow-500" style={{ width: `${(item.value / maxValue) * 100}%` }} />
                        </div>
                    </div>
                ))}
            </div>
        </Card>
    );
}

function SectionTitle({ title }: { title: string }) {
    return <h2 className="border-b border-neutral-200 px-4 py-4 text-base font-bold text-neutral-950 sm:px-5">{title}</h2>;
}

function ReportMetricPeriod(value: string) {
    return value.slice(0, 7);
}

function monthLabel(value: string) {
    return new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric' }).format(new Date(`${ReportMetricPeriod(value)}-01T00:00:00`));
}

function currentMonth() {
    return new Date().toISOString().slice(0, 7);
}

function previousMonth() {
    const date = new Date();
    date.setMonth(date.getMonth() - 1);
    return date.toISOString().slice(0, 7);
}

function PeriodButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: string }) {
    return <button type="button" onClick={onClick} className={cn('rounded-md px-3 py-2 text-sm font-medium', active ? 'bg-surface text-neutral-950 shadow-sm' : 'text-neutral-600 hover:text-neutral-950')}>{children}</button>;
}

function PaymentFilterButton({
    active,
    onClick,
    children,
}: {
    active: boolean;
    onClick: () => void;
    children: string;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={cn(
                'inline-flex h-10 items-center rounded-md border px-4 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-brand-yellow-500 focus:ring-offset-2',
                active
                    ? 'border-brand-black bg-brand-black text-white'
                    : 'border-neutral-200 bg-surface text-neutral-700 hover:bg-neutral-50',
            )}
        >
            {children}
        </button>
    );
}

function PdfExportButton({
    payload,
    isLoading,
    error,
    onPrepare,
    disabled,
}: {
    payload: ReportPdfPayload | null;
    isLoading: boolean;
    error: string | null;
    onPrepare: () => void;
    disabled: boolean;
}) {
    if (payload) {
        return (
            <Suspense
                fallback={
                    <span
                        className={exportLinkClasses(
                            'pointer-events-none opacity-70',
                        )}
                    >
                        Menyiapkan PDF
                    </span>
                }
            >
                <PdfDownloadAction
                    payload={payload}
                    className={exportLinkClasses()}
                />
            </Suspense>
        );
    }

    return (
        <div className="flex items-center gap-2">
            <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onPrepare}
                disabled={disabled || isLoading}
                isLoading={isLoading}
            >
                Export PDF
            </Button>
            {error && <span className="text-xs text-red-600">{error}</span>}
        </div>
    );
}

function exportLinkClasses(className?: string) {
    return cn(
        'inline-flex h-8 items-center justify-center rounded-md border border-neutral-300 bg-surface px-3 text-sm font-medium text-neutral-900 transition duration-150 ease-out',
        'hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-brand-yellow-500 focus:ring-offset-2',
        className,
    );
}

function monthEndDate(value: string) {
    const [year, month] = value.split('-').map(Number);
    const endDate = new Date(year, month, 0);
    const day = String(endDate.getDate()).padStart(2, '0');

    return `${value}-${day}`;
}

function formatDate(value: string) {
    return new Intl.DateTimeFormat('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    }).format(new Date(`${value}T00:00:00`));
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

function FilterIcon({ className = '' }: { className?: string }) {
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
            <path d="M4 6h16" />
            <path d="M7 12h10" />
            <path d="M10 18h4" />
        </svg>
    );
}

function EyeIcon({ className = '' }: { className?: string }) {
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
            <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
            <circle cx="12" cy="12" r="3" />
        </svg>
    );
}
