import Button from '@/Components/Button';
import { Card, CardContent } from '@/Components/Card';
import CurrencyDisplay from '@/Components/CurrencyDisplay';
import EmptyState from '@/Components/EmptyState';
import PageHeader from '@/Components/PageHeader';
import StatusBadge from '@/Components/StatusBadge';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { SaleSummary } from './types';

type SaleIndexProps = {
    sales: {
        data: SaleSummary[];
    };
};

export default function SaleIndex({ sales }: SaleIndexProps) {
    return (
        <AuthenticatedLayout
            header={<PageHeader title="Rekap Penjualan" description="Data transaksi kendaraan" />}
        >
            <Head title="Rekap Penjualan" />

            <Card>
                <CardContent className="p-0">
                    {sales.data.length === 0 ? (
                        <div className="p-5">
                            <EmptyState title="Belum ada penjualan." description="Transaksi akan muncul setelah kendaraan ditandai terjual." />
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-neutral-200">
                                <thead className="bg-neutral-50">
                                    <tr>
                                        {['Tanggal', 'Kendaraan', 'Pembeli', 'Area', 'PIC', 'Pembayaran', 'Harga', 'Laba', ''].map((heading) => (
                                            <th key={heading} className="px-4 py-3 text-left text-xs font-semibold uppercase text-neutral-500">{heading}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-200 bg-white">
                                    {sales.data.map((sale) => (
                                        <tr key={sale.id}>
                                            <td className="px-4 py-3 text-sm text-neutral-700">{sale.sale_date}</td>
                                            <td className="px-4 py-3 text-sm font-medium text-neutral-950">{sale.vehicle}<div className="text-xs text-neutral-500">{sale.plate_number}</div></td>
                                            <td className="px-4 py-3 text-sm text-neutral-700">{sale.customer_name}</td>
                                            <td className="px-4 py-3 text-sm text-neutral-700">{sale.area}</td>
                                            <td className="px-4 py-3 text-sm text-neutral-700">{sale.employee}</td>
                                            <td className="px-4 py-3"><StatusBadge type="payment" value={sale.payment_type} /></td>
                                            <td className="px-4 py-3 text-sm font-semibold text-neutral-950"><CurrencyDisplay value={sale.selling_price} /></td>
                                            <td className="px-4 py-3 text-sm font-semibold text-neutral-950"><CurrencyDisplay value={sale.profit_snapshot} /></td>
                                            <td className="px-4 py-3 text-right">
                                                <Link href={route('sales.show', sale.id)}>
                                                    <Button type="button" variant="outline" size="sm">Detail</Button>
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
        </AuthenticatedLayout>
    );
}
