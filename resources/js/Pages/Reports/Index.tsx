import Button from '@/Components/Button';
import { Card } from '@/Components/Card';
import CurrencyDisplay from '@/Components/CurrencyDisplay';
import DataTable, { type DataTableColumn } from '@/Components/DataTable';
import EmptyState from '@/Components/EmptyState';
import PageHeader from '@/Components/PageHeader';
import StatusBadge from '@/Components/StatusBadge';
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
    useState,
} from 'react';
import type {
    ReportFilters,
    ReportPdfPayload,
    ReportSummary,
    SaleReportRow,
} from './ReportPdfDocument';

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
};

export default function ReportsIndex({
    filters,
    summary,
    sales,
}: ReportProps) {
    const [filterData, setFilterData] = useState(filters);
    const [pdfPayload, setPdfPayload] = useState<ReportPdfPayload | null>(null);
    const [pdfLoading, setPdfLoading] = useState(false);
    const [pdfError, setPdfError] = useState<string | null>(null);

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
                <Link
                    href={route('sales.show', sale.id)}
                    aria-label={`Lihat detail transaksi ${sale.vehicle}`}
                    title={`Lihat detail transaksi ${sale.vehicle}`}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-neutral-300 bg-surface text-neutral-700 transition hover:bg-neutral-50 hover:text-neutral-950 focus:outline-none focus:ring-2 focus:ring-brand-yellow-500 focus:ring-offset-2"
                >
                    <EyeIcon className="h-4 w-4" />
                </Link>
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

        router.get(route('reports.index'), filterData, {
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
        router.get(route('reports.index'), cleared, { replace: true });
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
