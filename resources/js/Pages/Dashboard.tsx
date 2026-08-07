import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

export default function Dashboard() {
    return (
        <AuthenticatedLayout
            header={
                <div>
                    <h1 className="truncate text-xl font-semibold leading-7 text-neutral-950">
                        Dashboard
                    </h1>
                    <p className="hidden text-sm text-neutral-500 sm:block">
                        Ringkasan performa Mahaputra Group
                    </p>
                </div>
            }
        >
            <Head title="Dashboard" />

            <div className="space-y-6">
                <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {[
                        ['Total Kendaraan', '0'],
                        ['Kendaraan Ready', '0'],
                        ['Penjualan Bulan Ini', '0'],
                        ['Laba Kendaraan', 'Rp 0'],
                    ].map(([label, value]) => (
                        <div
                            key={label}
                            className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm"
                        >
                            <div className="text-sm font-medium text-neutral-500">
                                {label}
                            </div>
                            <div className="mt-3 text-2xl font-bold tabular-nums text-neutral-950">
                                {value}
                            </div>
                        </div>
                    ))}
                </section>

                <div className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
                    <section className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
                        <h2 className="text-lg font-semibold text-neutral-950">
                            Tren Penjualan
                        </h2>
                        <div className="mt-6 flex min-h-72 items-center justify-center rounded-md border border-dashed border-neutral-300 bg-neutral-50 px-4 text-center text-sm text-neutral-500">
                            Belum ada data penjualan untuk periode ini.
                        </div>
                    </section>

                    <section className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
                        <h2 className="text-lg font-semibold text-neutral-950">
                            Aktivitas Terbaru
                        </h2>
                        <div className="mt-6 flex min-h-72 items-center justify-center rounded-md border border-dashed border-neutral-300 bg-neutral-50 px-4 text-center text-sm text-neutral-500">
                            Aktivitas akan muncul setelah data transaksi dibuat.
                        </div>
                    </section>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
