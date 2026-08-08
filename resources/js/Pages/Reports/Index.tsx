import Button from '@/Components/Button';
import { Card, CardContent, CardTitle } from '@/Components/Card';
import CurrencyDisplay from '@/Components/CurrencyDisplay';
import EmptyState from '@/Components/EmptyState';
import PageHeader from '@/Components/PageHeader';
import StatusBadge from '@/Components/StatusBadge';
import TextInput from '@/Components/TextInput';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import axios from 'axios';
import { FormEventHandler, ReactNode, useState } from 'react';
import ReportPdfDocument, {
    ReportFilters,
    ReportPdfPayload,
    ReportSummary,
    SaleReportRow,
} from './ReportPdfDocument';

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
    operations,
    options,
}: ReportProps) {
    const [filterData, setFilterData] = useState(filters);
    const [pdfPayload, setPdfPayload] = useState<ReportPdfPayload | null>(null);
    const [pdfLoading, setPdfLoading] = useState(false);
    const [pdfError, setPdfError] = useState<string | null>(null);
    const summaryCards: Array<{
        label: string;
        value: ReactNode;
        caption: string;
    }> = [
        {
            label: 'Transaksi',
            value: summary.sales_count,
            caption: 'Penjualan sesuai filter',
        },
        {
            label: 'Nilai Penjualan',
            value: <CurrencyDisplay value={summary.sales_value} />,
            caption: 'Cash memakai harga jual, kredit memakai total kredit',
        },
        {
            label: 'Laba Kendaraan',
            value: <CurrencyDisplay value={summary.profit_total} />,
            caption: 'Berdasarkan snapshot transaksi',
        },
        {
            label: 'Operasional',
            value: <CurrencyDisplay value={summary.operational_total} />,
            caption: 'Biaya operasional periode',
        },
        {
            label: 'Selisih Laba - Operasional',
            value: <CurrencyDisplay value={summary.profit_minus_operational} />,
            caption: 'Bukan formula final keuntungan perusahaan',
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
            area_id: '',
            employee_id: '',
            payment_type: '',
            capital_type: '',
        };

        setFilterData(cleared);
        setPdfPayload(null);
        setPdfError(null);
        router.get(route('reports.index'), cleared, { replace: true });
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
                    title="Laporan"
                    description="Rekap penjualan, kendaraan, operasional, dan laba"
                />
            }
        >
            <Head title="Laporan" />

            <div className="space-y-6">
                <Card className="p-4">
                    <form
                        onSubmit={submit}
                        className="grid gap-3 lg:grid-cols-[1fr_1fr_1.2fr_1fr_1fr_1fr_1fr_auto_auto]"
                    >
                        <TextInput
                            type="date"
                            value={filterData.date_from}
                            onChange={(event) =>
                                setFilterData({
                                    ...filterData,
                                    date_from: event.target.value,
                                })
                            }
                        />
                        <TextInput
                            type="date"
                            value={filterData.date_to}
                            onChange={(event) =>
                                setFilterData({
                                    ...filterData,
                                    date_to: event.target.value,
                                })
                            }
                        />
                        <TextInput
                            type="search"
                            placeholder="Cari kendaraan, polisi, pembeli"
                            value={filterData.search}
                            onChange={(event) =>
                                setFilterData({
                                    ...filterData,
                                    search: event.target.value,
                                })
                            }
                        />
                        <Select
                            value={filterData.area_id}
                            onChange={(value) =>
                                setFilterData({ ...filterData, area_id: value })
                            }
                        >
                            <option value="">Semua Area</option>
                            {options.areas.map((area) => (
                                <option key={area.id} value={area.id}>
                                    {area.name}
                                </option>
                            ))}
                        </Select>
                        <Select
                            value={filterData.employee_id}
                            onChange={(value) =>
                                setFilterData({
                                    ...filterData,
                                    employee_id: value,
                                })
                            }
                        >
                            <option value="">Semua PIC</option>
                            {options.employees.map((employee) => (
                                <option key={employee.id} value={employee.id}>
                                    {employee.name}
                                </option>
                            ))}
                        </Select>
                        <Select
                            value={filterData.payment_type}
                            onChange={(value) =>
                                setFilterData({
                                    ...filterData,
                                    payment_type: value,
                                })
                            }
                        >
                            <option value="">Semua Bayar</option>
                            {options.paymentTypes.map((type) => (
                                <option key={type.value} value={type.value}>
                                    {type.label}
                                </option>
                            ))}
                        </Select>
                        <Select
                            value={filterData.capital_type}
                            onChange={(value) =>
                                setFilterData({
                                    ...filterData,
                                    capital_type: value,
                                })
                            }
                        >
                            <option value="">UMUM/KHUSUS</option>
                            {options.capitalTypes.map((type) => (
                                <option key={type.value} value={type.value}>
                                    {type.label}
                                </option>
                            ))}
                        </Select>
                        <Button type="submit" variant="secondary">
                            Filter
                        </Button>
                        <Button type="button" variant="outline" onClick={clearFilters}>
                            Bersihkan
                        </Button>
                    </form>
                </Card>

                <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
                    {summaryCards.map((item) => (
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

                <div className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
                    <Card>
                        <CardContent className="p-0">
                            <div className="flex flex-col gap-3 border-b border-neutral-200 p-5 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <CardTitle>Rekap Penjualan</CardTitle>
                                    <p className="mt-1 text-sm text-neutral-500">
                                        Preview laporan berdasarkan filter aktif.
                                    </p>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    <PdfExportButton
                                        payload={pdfPayload}
                                        isLoading={pdfLoading}
                                        error={pdfError}
                                        onPrepare={loadPdfData}
                                        disabled={summary.sales_count === 0}
                                    />
                                    <a href={route('reports.export.excel', filterData)}>
                                        <Button type="button" variant="outline" size="sm">
                                            Excel
                                        </Button>
                                    </a>
                                </div>
                            </div>

                            {sales.data.length === 0 ? (
                                <div className="p-5">
                                    <EmptyState
                                        title="Belum ada data laporan."
                                        description="Ubah filter tanggal atau buat transaksi penjualan terlebih dahulu."
                                    />
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="min-w-[1320px] divide-y divide-neutral-200">
                                        <thead className="bg-neutral-50">
                                            <tr>
                                                {[
                                                    'Tanggal',
                                                    'Area',
                                                    'PIC',
                                                    'Kendaraan',
                                                    'Tahun',
                                                    'Modal',
                                                    'Bayar',
                                                    'Harga Jual',
                                                    'DP',
                                                    'DP Terutang',
                                                    'Modal Awal',
                                                    'Total Biaya Kendaraan',
                                                    'Modal Akhir',
                                                    'Laba',
                                                    '',
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
                                            {sales.data.map((sale) => (
                                                <tr key={sale.id}>
                                                    <Cell>{sale.sale_date}</Cell>
                                                    <Cell>{sale.area}</Cell>
                                                    <Cell>{sale.employee}</Cell>
                                                    <td className="px-4 py-3 text-sm font-medium text-neutral-950">
                                                        {sale.vehicle}
                                                        <div className="text-xs text-neutral-500">
                                                            {sale.plate_number}
                                                        </div>
                                                        <div className="text-xs text-neutral-500">
                                                            Beli {sale.purchase_date}
                                                        </div>
                                                    </td>
                                                    <Cell>{sale.year}</Cell>
                                                    <td className="px-4 py-3">
                                                        <StatusBadge
                                                            type="capital"
                                                            value={sale.capital_type}
                                                        />
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <StatusBadge
                                                            type="payment"
                                                            value={sale.payment_type}
                                                        />
                                                    </td>
                                                    <Money value={sale.selling_price} />
                                                    <Money value={sale.dp} />
                                                    <Money value={sale.outstanding_dp} />
                                                    <Money value={sale.initial_capital_snapshot} />
                                                    <Money value={sale.vehicle_cost_snapshot} />
                                                    <Money value={sale.final_capital_snapshot} />
                                                    <Money value={sale.profit_snapshot} />
                                                    <td className="px-4 py-3 text-right">
                                                        <Link href={route('sales.show', sale.id)}>
                                                            <Button
                                                                type="button"
                                                                variant="outline"
                                                                size="sm"
                                                            >
                                                                Detail
                                                            </Button>
                                                        </Link>
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
                            <div className="border-b border-neutral-200 p-5">
                                <CardTitle>Operasional Periode</CardTitle>
                                <CurrencyDisplay
                                    value={operations.total}
                                    className="mt-3 block text-2xl font-bold text-neutral-950"
                                />
                            </div>
                            {operations.recent.length === 0 ? (
                                <div className="p-5">
                                    <EmptyState title="Tidak ada biaya operasional pada periode ini." />
                                </div>
                            ) : (
                                <div className="divide-y divide-neutral-200">
                                    {operations.recent.map((expense) => (
                                        <div key={expense.id} className="p-4">
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="min-w-0">
                                                    <div className="text-sm font-semibold text-neutral-950">
                                                        {expense.category ?? 'Tanpa kategori'}
                                                    </div>
                                                    <div className="mt-1 text-xs text-neutral-500">
                                                        {expense.transaction_date}
                                                    </div>
                                                </div>
                                                <CurrencyDisplay
                                                    value={expense.amount}
                                                    className="shrink-0 text-sm font-semibold text-neutral-950"
                                                />
                                            </div>
                                            {expense.description && (
                                                <p className="mt-2 text-sm text-neutral-600">
                                                    {expense.description}
                                                </p>
                                            )}
                                        </div>
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
            <PDFDownloadLink
                document={<ReportPdfDocument payload={payload} />}
                fileName={`laporan-penjualan-${payload.filters.date_from}-${payload.filters.date_to}.pdf`}
            >
                {({ loading }) => (
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={loading}
                    >
                        {loading ? 'Membuat PDF' : 'Unduh PDF'}
                    </Button>
                )}
            </PDFDownloadLink>
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
                PDF
            </Button>
            {error && <span className="text-xs text-red-600">{error}</span>}
        </div>
    );
}

function Select({
    value,
    onChange,
    children,
}: {
    value: string;
    onChange: (value: string) => void;
    children: ReactNode;
}) {
    return (
        <select
            className="h-10 rounded-md border-neutral-300 text-sm shadow-sm focus:border-yellow-500 focus:ring-yellow-500"
            value={value}
            onChange={(event) => onChange(event.target.value)}
        >
            {children}
        </select>
    );
}

function Cell({ children }: { children: ReactNode }) {
    return (
        <td className="whitespace-nowrap px-4 py-3 text-sm text-neutral-700">
            {children}
        </td>
    );
}

function Money({ value }: { value: number }) {
    return (
        <td className="whitespace-nowrap px-4 py-3 text-right text-sm font-semibold text-neutral-950">
            <CurrencyDisplay value={value} />
        </td>
    );
}
