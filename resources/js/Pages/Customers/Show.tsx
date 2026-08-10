import Button from '@/Components/Button';
import { Card, CardContent, CardTitle } from '@/Components/Card';
import CurrencyDisplay from '@/Components/CurrencyDisplay';
import DataTable, { type DataTableColumn } from '@/Components/DataTable';
import EmptyState from '@/Components/EmptyState';
import KpiCard from '@/Components/KpiCard';
import PageHeader from '@/Components/PageHeader';
import StatusBadge from '@/Components/StatusBadge';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import type { ReactNode } from 'react';
import type { CustomerDetail } from './types';

type CustomerShowProps = {
    customer: CustomerDetail;
};

export default function CustomerShow({ customer }: CustomerShowProps) {
    const { auth, flash } = usePage<PageProps>().props;
    const isAdmin = auth.user.role === 'admin';
    const saleColumns: Array<DataTableColumn<CustomerDetail['sales'][number]>> =
        [
            {
                key: 'sale_date',
                header: 'Tanggal',
                cell: (sale) => formatDate(sale.sale_date),
            },
            {
                key: 'vehicle',
                header: 'Kendaraan',
                cell: (sale) => <VehicleCell sale={sale} />,
            },
            {
                key: 'payment_type',
                header: 'Pembayaran',
                cell: (sale) => <PaymentCell sale={sale} />,
            },
            {
                key: 'selling_price',
                header: 'Harga Jual',
                align: 'right',
                cellClassName: 'font-semibold text-neutral-950',
                cell: (sale) => (
                    <CurrencyDisplay value={sale.selling_price} />
                ),
            },
            {
                key: 'employee',
                header: 'PIC',
                cell: (sale) => sale.employee,
            },
            {
                key: 'actions',
                header: 'Aksi',
                align: 'right',
                cell: (sale) => (
                    <Link href={route('sales.show', sale.id)}>
                        <Button type="button" variant="outline" size="sm">
                            Detail
                        </Button>
                    </Link>
                ),
            },
        ];

    return (
        <AuthenticatedLayout
            header={
                <PageHeader
                    title="Detail Customer"
                    description="Data customer dan riwayat pembelian"
                />
            }
        >
            <Head title={customer.name} />

            <div className="space-y-5 lg:space-y-6">
                <Link
                    href={route('customers.index')}
                    className="inline-flex text-sm font-semibold text-neutral-600 hover:text-neutral-950"
                >
                    &larr; Kembali ke Customer
                </Link>

                {flash?.success && (
                    <div className="rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                        {flash.success}
                    </div>
                )}

                <Card>
                    <CardContent className="p-5 sm:p-6">
                        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                            <div className="flex min-w-0 gap-4">
                                <InitialAvatar name={customer.name} />
                                <div className="min-w-0">
                                    <h2 className="truncate text-2xl font-bold text-neutral-950">
                                        {customer.name}
                                    </h2>
                                    <div className="mt-2">
                                        <WhatsAppValue
                                            value={customer.whatsapp}
                                        />
                                    </div>
                                    <p className="mt-2 max-w-3xl text-sm text-neutral-500">
                                        {customer.address}
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-col gap-2 sm:flex-row lg:justify-end">
                                <a
                                    href={whatsAppUrl(customer.whatsapp)}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex h-10 items-center justify-center rounded-md border border-green-200 bg-green-50 px-4 text-sm font-semibold text-green-700 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                                >
                                    WhatsApp
                                </a>
                                {isAdmin && (
                                    <Link
                                        href={route(
                                            'customers.edit',
                                            customer.id,
                                        )}
                                    >
                                        <Button
                                            type="button"
                                            variant="outline"
                                            className="w-full sm:w-auto"
                                        >
                                            Edit Customer
                                        </Button>
                                    </Link>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <KpiCard
                        label="Total Transaksi"
                        value={customer.sales_count}
                        caption="Riwayat pembelian customer"
                    />
                    <KpiCard
                        label="Total Pembelian"
                        value={
                            <CurrencyDisplay value={customer.total_purchase} />
                        }
                        caption="Akumulasi harga jual"
                    />
                    <KpiCard
                        label="Transaksi Terakhir"
                        value={formatDate(customer.last_sale_date)}
                        caption="Berdasarkan tanggal penjualan"
                    />
                    <KpiCard
                        label="Area"
                        value={customer.latest_area ?? '-'}
                        caption="Area transaksi terbaru"
                    />
                </div>

                <Card>
                    <CardContent className="space-y-4 p-5 sm:p-6">
                        <CardTitle className="text-base">
                            Informasi Tambahan
                        </CardTitle>
                        <div className="grid gap-4 sm:grid-cols-3">
                            <InfoItem
                                label="WhatsApp Alternatif"
                                value={
                                    customer.alternative_whatsapp
                                        ? formatWhatsApp(
                                              customer.alternative_whatsapp,
                                          )
                                        : '-'
                                }
                            />
                            <InfoItem
                                label="KTP"
                                value={customer.ktp_original_name ?? '-'}
                            />
                            <div className="flex items-end">
                                {customer.ktp_original_name ? (
                                    <a href={customer.ktp_download_url}>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                        >
                                            Unduh KTP
                                        </Button>
                                    </a>
                                ) : (
                                    <span className="text-sm text-neutral-500">
                                        File KTP belum tersedia.
                                    </span>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="space-y-5 p-0">
                        <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-4 sm:px-6">
                            <CardTitle className="text-base">
                                Riwayat Pembelian
                            </CardTitle>
                        </div>

                        {customer.sales.length === 0 ? (
                            <div className="p-5 sm:p-6">
                                <EmptyState
                                    title="Belum ada riwayat pembelian."
                                    description="Transaksi customer akan tampil di sini."
                                />
                            </div>
                        ) : (
                            <>
                                <div className="hidden lg:block">
                                    <DataTable
                                        rows={customer.sales}
                                        columns={saleColumns}
                                        getRowKey={(sale) => sale.id}
                                        minWidth="min-w-[900px]"
                                    />
                                </div>
                                <div className="grid gap-3 p-4 lg:hidden">
                                    {customer.sales.map((sale) => (
                                        <PurchaseCard
                                            key={sale.id}
                                            sale={sale}
                                        />
                                    ))}
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AuthenticatedLayout>
    );
}

function PurchaseCard({ sale }: { sale: CustomerDetail['sales'][number] }) {
    return (
        <div className="rounded-md border border-neutral-200 bg-surface p-4">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <div className="text-sm font-semibold text-neutral-950">
                        {formatDate(sale.sale_date)}
                    </div>
                    <VehicleCell sale={sale} />
                </div>
                <Link href={route('sales.show', sale.id)}>
                    <Button type="button" variant="outline" size="sm">
                        Detail
                    </Button>
                </Link>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <InfoItem label="Pembayaran" value={<PaymentCell sale={sale} />} />
                <InfoItem
                    label="Harga Jual"
                    value={<CurrencyDisplay value={sale.selling_price} />}
                />
                <InfoItem label="PIC" value={sale.employee} />
                <InfoItem label="Area" value={sale.area} />
            </div>
        </div>
    );
}

function VehicleCell({ sale }: { sale: CustomerDetail['sales'][number] }) {
    return (
        <div className="min-w-0">
            <div className="font-semibold text-neutral-950">{sale.vehicle}</div>
            <div className="text-xs text-neutral-500">
                {sale.plate_number} - {sale.year}
            </div>
        </div>
    );
}

function PaymentCell({ sale }: { sale: CustomerDetail['sales'][number] }) {
    return (
        <div className="space-y-1">
            <StatusBadge type="payment" value={sale.payment_type} />
            {sale.payment_type === 'CREDIT' && sale.financing_provider && (
                <div className="text-xs text-neutral-500">
                    {sale.financing_provider}
                </div>
            )}
        </div>
    );
}

function InfoItem({
    label,
    value,
}: {
    label: string;
    value: ReactNode;
}) {
    return (
        <div>
            <div className="text-xs font-semibold uppercase text-neutral-400">
                {label}
            </div>
            <div className="mt-1 font-semibold text-neutral-950">{value}</div>
        </div>
    );
}

function InitialAvatar({ name }: { name: string }) {
    return (
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-md bg-brand-yellow-500 text-lg font-bold uppercase text-brand-black">
            {initials(name)}
        </span>
    );
}

function WhatsAppValue({ value }: { value: string }) {
    return (
        <span className="inline-flex items-center gap-2 font-medium text-neutral-800">
            <span className="h-2 w-2 rounded-full bg-green-500" />
            {formatWhatsApp(value)}
        </span>
    );
}

function initials(name: string) {
    return name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0])
        .join('');
}

function normalizePhone(value: string) {
    const digits = value.replace(/\D/g, '');

    if (digits.startsWith('0')) {
        return `62${digits.slice(1)}`;
    }

    if (digits.startsWith('62')) {
        return digits;
    }

    return digits;
}

function formatWhatsApp(value: string) {
    const normalized = normalizePhone(value);

    if (!normalized.startsWith('62')) {
        return value;
    }

    const local = normalized.slice(2);
    const first = local.slice(0, 3);
    const second = local.slice(3, 7);
    const rest = local.slice(7);

    return ['+62', first, second, rest].filter(Boolean).join(' ');
}

function whatsAppUrl(value: string) {
    return `https://wa.me/${normalizePhone(value)}`;
}

function formatDate(value: string | null) {
    if (!value) {
        return '-';
    }

    return new Intl.DateTimeFormat('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    }).format(new Date(value));
}
