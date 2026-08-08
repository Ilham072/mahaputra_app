import Button from '@/Components/Button';
import { Card, CardContent } from '@/Components/Card';
import CurrencyDisplay from '@/Components/CurrencyDisplay';
import DataTable from '@/Components/DataTable';
import type { DataTableColumn } from '@/Components/DataTable';
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
    const columns: Array<DataTableColumn<SaleSummary>> = [
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
                    {sale.vehicle}
                    <div className="text-xs font-normal text-neutral-500">
                        {sale.plate_number}
                    </div>
                </>
            ),
        },
        {
            key: 'customer',
            header: 'Pembeli',
            cell: (sale) => sale.customer_name,
        },
        {
            key: 'area',
            header: 'Area',
            cell: (sale) => sale.area,
        },
        {
            key: 'employee',
            header: 'PIC',
            cell: (sale) => sale.employee,
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
        {
            key: 'actions',
            header: '',
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
                    title="Rekap Penjualan"
                    description="Data transaksi kendaraan"
                />
            }
        >
            <Head title="Rekap Penjualan" />

            <Card>
                <CardContent className="p-0">
                    {sales.data.length === 0 ? (
                        <div className="p-5">
                            <EmptyState
                                title="Belum ada penjualan."
                                description="Transaksi akan muncul setelah kendaraan ditandai terjual."
                            />
                        </div>
                    ) : (
                        <DataTable
                            rows={sales.data}
                            columns={columns}
                            getRowKey={(sale) => sale.id}
                        />
                    )}
                </CardContent>
            </Card>
        </AuthenticatedLayout>
    );
}
