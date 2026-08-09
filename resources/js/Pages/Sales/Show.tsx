import Button from '@/Components/Button';
import { Card, CardContent, CardTitle } from '@/Components/Card';
import CurrencyDisplay from '@/Components/CurrencyDisplay';
import PageHeader from '@/Components/PageHeader';
import StatusBadge from '@/Components/StatusBadge';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import axios from 'axios';
import { lazy, ReactNode, Suspense, useState } from 'react';
import type { InvoicePdfPayload } from './InvoicePdfDocument';
import type { SaleDetail } from './types';

const InvoicePdfDownloadAction = lazy(
    () => import('./InvoicePdfDownloadAction'),
);

type SaleShowProps = {
    sale: SaleDetail;
};

export default function SaleShow({ sale }: SaleShowProps) {
    const { auth, flash } = usePage<PageProps>().props;
    const isAdmin = auth.user.role === 'admin';
    const [invoicePayload, setInvoicePayload] =
        useState<InvoicePdfPayload | null>(null);
    const [invoiceLoading, setInvoiceLoading] = useState(false);
    const [invoiceError, setInvoiceError] = useState<string | null>(null);

    const loadInvoiceData = async () => {
        setInvoiceLoading(true);
        setInvoiceError(null);

        try {
            const response = await axios.get<InvoicePdfPayload>(
                route('sales.invoice-data', sale.id),
            );
            setInvoicePayload(response.data);
        } catch {
            setInvoiceError('Data invoice gagal disiapkan.');
        } finally {
            setInvoiceLoading(false);
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <PageHeader
                    title="Detail Penjualan"
                    description={`${sale.vehicle} / ${sale.plate_number}`}
                    actions={
                        <div className="flex flex-wrap justify-end gap-2">
                            <Link href={route('sales.index')}>
                                <Button type="button" variant="outline">
                                    Kembali
                                </Button>
                            </Link>
                            <InvoiceExportButton
                                payload={invoicePayload}
                                isLoading={invoiceLoading}
                                error={invoiceError}
                                onPrepare={loadInvoiceData}
                            />
                            {isAdmin && (
                                <Link href={route('sales.edit', sale.id)}>
                                    <Button type="button">Edit</Button>
                                </Link>
                            )}
                        </div>
                    }
                />
            }
        >
            <Head title="Detail Penjualan" />

            <div className="space-y-6">
                {flash?.success && (
                    <div className="rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                        {flash.success}
                    </div>
                )}

                <div className="grid gap-6 xl:grid-cols-2">
                    <Card>
                        <CardContent className="space-y-5">
                            <div className="flex flex-wrap items-start justify-between gap-4">
                                <CardTitle>Transaksi</CardTitle>
                                <StatusBadge
                                    type="payment"
                                    value={sale.payment_type}
                                />
                            </div>
                            <InfoGrid
                                items={[
                                    ['Tanggal', sale.sale_date],
                                    ['Area', sale.area],
                                    ['PIC', sale.employee],
                                    [
                                        'Harga Terjual',
                                        <CurrencyDisplay
                                            key="selling"
                                            value={sale.selling_price}
                                        />,
                                    ],
                                    [
                                        'Modal Akhir Snapshot',
                                        <CurrencyDisplay
                                            key="final"
                                            value={sale.final_capital_snapshot}
                                        />,
                                    ],
                                    [
                                        'Laba Snapshot',
                                        <CurrencyDisplay
                                            key="profit"
                                            value={sale.profit_snapshot}
                                        />,
                                    ],
                                ]}
                            />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="space-y-5">
                            <CardTitle>Pembeli</CardTitle>
                            <InfoGrid
                                items={[
                                    ['Nama', sale.customer.name],
                                    ['WhatsApp', sale.customer.whatsapp],
                                    [
                                        'WhatsApp Alternatif',
                                        sale.customer.alternative_whatsapp ??
                                            '-',
                                    ],
                                    ['Alamat', sale.customer.address],
                                    [
                                        'KTP',
                                        sale.customer.ktp_original_name ?? '-',
                                    ],
                                ]}
                            />
                            <a href={sale.customer.ktp_download_url}>
                                <Button type="button" variant="outline">
                                    Unduh KTP
                                </Button>
                            </a>
                        </CardContent>
                    </Card>
                </div>

                {sale.payment_type === 'CREDIT' && (
                    <Card>
                        <CardContent className="space-y-5">
                            <CardTitle>Detail Kredit</CardTitle>
                            <InfoGrid
                                items={[
                                    [
                                        'Pembiayaan',
                                        sale.payment.financing_provider ?? '-',
                                    ],
                                    [
                                        'DP',
                                        <CurrencyDisplay
                                            key="dp"
                                            value={sale.payment.dp}
                                        />,
                                    ],
                                    [
                                        'DP Terutang',
                                        <CurrencyDisplay
                                            key="odp"
                                            value={sale.payment.outstanding_dp}
                                        />,
                                    ],
                                    [
                                        'Cair Pembiayaan',
                                        <CurrencyDisplay
                                            key="fd"
                                            value={
                                                sale.payment
                                                    .financing_disbursement
                                            }
                                        />,
                                    ],
                                    [
                                        'Refund',
                                        <CurrencyDisplay
                                            key="refund"
                                            value={sale.payment.refund}
                                        />,
                                    ],
                                    [
                                        'Total Kredit',
                                        <CurrencyDisplay
                                            key="total"
                                            value={sale.credit_total}
                                            className="font-semibold text-neutral-950"
                                        />,
                                    ],
                                ]}
                            />
                        </CardContent>
                    </Card>
                )}
            </div>
        </AuthenticatedLayout>
    );
}

function InvoiceExportButton({
    payload,
    isLoading,
    error,
    onPrepare,
}: {
    payload: InvoicePdfPayload | null;
    isLoading: boolean;
    error: string | null;
    onPrepare: () => void;
}) {
    if (payload) {
        return (
            <Suspense
                fallback={
                    <span className={invoiceLinkClasses('pointer-events-none opacity-70')}>
                        Menyiapkan Invoice
                    </span>
                }
            >
                <InvoicePdfDownloadAction
                    payload={payload}
                    className={invoiceLinkClasses()}
                />
            </Suspense>
        );
    }

    return (
        <div className="flex items-center gap-2">
            <Button
                type="button"
                variant="outline"
                onClick={onPrepare}
                disabled={isLoading}
                isLoading={isLoading}
            >
                Invoice PDF
            </Button>
            {error && <span className="text-xs text-red-600">{error}</span>}
        </div>
    );
}

function invoiceLinkClasses(extra = '') {
    return [
        'inline-flex h-10 items-center justify-center rounded-md border border-neutral-300 bg-surface px-4 text-sm font-medium text-neutral-900 transition duration-150 hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-brand-yellow-500 focus:ring-offset-2',
        extra,
    ]
        .filter(Boolean)
        .join(' ');
}

function InfoGrid({ items }: { items: Array<[string, ReactNode]> }) {
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
