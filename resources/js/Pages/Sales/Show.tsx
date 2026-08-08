import Button from '@/Components/Button';
import { Card, CardContent, CardTitle } from '@/Components/Card';
import CurrencyDisplay from '@/Components/CurrencyDisplay';
import PageHeader from '@/Components/PageHeader';
import StatusBadge from '@/Components/StatusBadge';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { ReactNode } from 'react';
import { SaleDetail } from './types';

type SaleShowProps = {
    sale: SaleDetail;
};

export default function SaleShow({ sale }: SaleShowProps) {
    const { flash } = usePage<PageProps>().props;

    return (
        <AuthenticatedLayout
            header={
                <PageHeader
                    title="Detail Penjualan"
                    description={`${sale.vehicle} / ${sale.plate_number}`}
                    actions={
                        <Link href={route('sales.index')}>
                            <Button type="button" variant="outline">Kembali</Button>
                        </Link>
                    }
                />
            }
        >
            <Head title="Detail Penjualan" />

            <div className="space-y-6">
                {flash?.success && <div className="rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">{flash.success}</div>}

                <div className="grid gap-6 xl:grid-cols-2">
                    <Card>
                        <CardContent className="space-y-5">
                            <CardTitle>Transaksi</CardTitle>
                            <div className="flex"><StatusBadge type="payment" value={sale.payment_type} /></div>
                            <InfoGrid items={[
                                ['Tanggal', sale.sale_date],
                                ['Area', sale.area],
                                ['PIC', sale.employee],
                                ['Harga Terjual', <CurrencyDisplay key="selling" value={sale.selling_price} />],
                                ['Modal Akhir Snapshot', <CurrencyDisplay key="final" value={sale.final_capital_snapshot} />],
                                ['Laba Snapshot', <CurrencyDisplay key="profit" value={sale.profit_snapshot} />],
                            ]} />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="space-y-5">
                            <CardTitle>Pembeli</CardTitle>
                            <InfoGrid items={[
                                ['Nama', sale.customer.name],
                                ['WhatsApp', sale.customer.whatsapp],
                                ['WhatsApp Alternatif', sale.customer.alternative_whatsapp ?? '-'],
                                ['Alamat', sale.customer.address],
                                ['KTP', sale.customer.ktp_original_name ?? '-'],
                            ]} />
                            <a href={sale.customer.ktp_download_url}>
                                <Button type="button" variant="outline">Unduh KTP</Button>
                            </a>
                        </CardContent>
                    </Card>
                </div>

                {sale.payment_type === 'CREDIT' && (
                    <Card>
                        <CardContent className="space-y-5">
                            <CardTitle>Detail Kredit</CardTitle>
                            <InfoGrid items={[
                                ['Pembiayaan', sale.payment.financing_provider ?? '-'],
                                ['DP', <CurrencyDisplay key="dp" value={sale.payment.dp} />],
                                ['DP Terutang', <CurrencyDisplay key="odp" value={sale.payment.outstanding_dp} />],
                                ['Cair Pembiayaan', <CurrencyDisplay key="fd" value={sale.payment.financing_disbursement} />],
                                ['Refund', <CurrencyDisplay key="refund" value={sale.payment.refund} />],
                                ['Total Kredit', <CurrencyDisplay key="total" value={sale.credit_total} />],
                            ]} />
                        </CardContent>
                    </Card>
                )}
            </div>
        </AuthenticatedLayout>
    );
}

function InfoGrid({ items }: { items: Array<[string, ReactNode]> }) {
    return (
        <dl className="grid gap-4 sm:grid-cols-2">
            {items.map(([label, value]) => (
                <div key={label}>
                    <dt className="text-sm font-medium text-neutral-500">{label}</dt>
                    <dd className="mt-1 text-sm font-semibold text-neutral-900">{value}</dd>
                </div>
            ))}
        </dl>
    );
}
