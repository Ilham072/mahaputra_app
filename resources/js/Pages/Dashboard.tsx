import { Card, CardContent, CardTitle } from '@/Components/Card';
import CurrencyDisplay from '@/Components/CurrencyDisplay';
import EmptyState from '@/Components/EmptyState';
import PageHeader from '@/Components/PageHeader';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { ReactNode } from 'react';

export default function Dashboard() {
    const kpis: Array<{ label: string; value: ReactNode }> = [
        { label: 'Total Kendaraan', value: '0' },
        { label: 'Kendaraan Ready', value: '0' },
        { label: 'Penjualan Bulan Ini', value: '0' },
        { label: 'Laba Kendaraan', value: <CurrencyDisplay value={0} /> },
    ];

    return (
        <AuthenticatedLayout
            header={
                <PageHeader
                    title="Dashboard"
                    description="Ringkasan performa Mahaputra Group"
                />
            }
        >
            <Head title="Dashboard" />

            <div className="space-y-6">
                <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {kpis.map((item) => (
                        <Card key={item.label} className="p-5">
                            <div className="text-sm font-medium text-neutral-500">
                                {item.label}
                            </div>
                            <div className="mt-3 text-2xl font-bold tabular-nums text-neutral-950">
                                {item.value}
                            </div>
                        </Card>
                    ))}
                </section>

                <div className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
                    <Card>
                        <CardContent className="p-6">
                            <CardTitle>Tren Penjualan</CardTitle>
                            <div className="mt-6">
                                <EmptyState title="Belum ada data penjualan untuk periode ini." />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <CardTitle>Aktivitas Terbaru</CardTitle>
                            <div className="mt-6">
                                <EmptyState title="Aktivitas akan muncul setelah data transaksi dibuat." />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
