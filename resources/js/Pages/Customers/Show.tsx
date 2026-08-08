import Button from '@/Components/Button';
import { Card, CardContent, CardTitle } from '@/Components/Card';
import CurrencyDisplay from '@/Components/CurrencyDisplay';
import EmptyState from '@/Components/EmptyState';
import PageHeader from '@/Components/PageHeader';
import StatusBadge from '@/Components/StatusBadge';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { ReactNode } from 'react';
import { CustomerDetail } from './types';

type CustomerShowProps = {
    customer: CustomerDetail;
};

export default function CustomerShow({ customer }: CustomerShowProps) {
    const { auth, flash } = usePage<PageProps>().props;
    const isAdmin = auth.user.role === 'admin';

    return (
        <AuthenticatedLayout
            header={
                <PageHeader
                    title={customer.name}
                    description="Detail customer dan riwayat pembelian"
                    actions={
                        <div className="flex gap-2">
                            <Link href={route('customers.index')}>
                                <Button type="button" variant="outline">
                                    Kembali
                                </Button>
                            </Link>
                            {isAdmin && (
                                <Link href={route('customers.edit', customer.id)}>
                                    <Button type="button">Edit</Button>
                                </Link>
                            )}
                        </div>
                    }
                />
            }
        >
            <Head title={customer.name} />

            <div className="space-y-6">
                {flash?.success && (
                    <div className="rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                        {flash.success}
                    </div>
                )}

                <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
                    <Card>
                        <CardContent className="space-y-5">
                            <CardTitle>Data Customer</CardTitle>
                            <InfoGrid
                                items={[
                                    ['Nama', customer.name],
                                    ['WhatsApp', customer.whatsapp],
                                    [
                                        'WhatsApp Alternatif',
                                        customer.alternative_whatsapp ?? '-',
                                    ],
                                    ['Alamat', customer.address],
                                    [
                                        'KTP',
                                        customer.ktp_original_name ?? '-',
                                    ],
                                    [
                                        'Total Transaksi',
                                        String(customer.sales_count),
                                    ],
                                ]}
                            />

                            {customer.ktp_original_name && (
                                <a href={customer.ktp_download_url}>
                                    <Button type="button" variant="outline">
                                        Unduh KTP
                                    </Button>
                                </a>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="space-y-5">
                            <CardTitle>Riwayat Pembelian</CardTitle>

                            {customer.sales.length === 0 ? (
                                <EmptyState
                                    title="Belum ada riwayat pembelian."
                                    description="Transaksi customer akan tampil di sini."
                                />
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-neutral-200">
                                        <thead className="bg-neutral-50">
                                            <tr>
                                                {[
                                                    'Tanggal',
                                                    'Kendaraan',
                                                    'Area',
                                                    'PIC',
                                                    'Pembayaran',
                                                    'Harga',
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
                                            {customer.sales.map((sale) => (
                                                <tr key={sale.id}>
                                                    <td className="px-4 py-3 text-sm text-neutral-700">
                                                        {sale.sale_date}
                                                    </td>
                                                    <td className="px-4 py-3 text-sm font-medium text-neutral-950">
                                                        {sale.vehicle}
                                                        <div className="text-xs text-neutral-500">
                                                            {sale.plate_number}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 text-sm text-neutral-700">
                                                        {sale.area}
                                                    </td>
                                                    <td className="px-4 py-3 text-sm text-neutral-700">
                                                        {sale.employee}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <StatusBadge
                                                            type="payment"
                                                            value={
                                                                sale.payment_type
                                                            }
                                                        />
                                                    </td>
                                                    <td className="px-4 py-3 text-sm font-semibold text-neutral-950">
                                                        <CurrencyDisplay
                                                            value={
                                                                sale.selling_price
                                                            }
                                                        />
                                                    </td>
                                                    <td className="px-4 py-3 text-right">
                                                        <Link
                                                            href={route(
                                                                'sales.show',
                                                                sale.id,
                                                            )}
                                                        >
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
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

function InfoGrid({ items }: { items: Array<[string, ReactNode]> }) {
    return (
        <dl className="grid gap-4">
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
