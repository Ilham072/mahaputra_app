import Button from '@/Components/Button';
import { Card, CardContent } from '@/Components/Card';
import EmptyState from '@/Components/EmptyState';
import PageHeader from '@/Components/PageHeader';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';
import { CustomerSummary } from './types';

type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

type CustomerIndexProps = {
    customers: {
        data: CustomerSummary[];
        links: PaginationLink[];
    };
    filters: {
        search: string;
    };
};

export default function CustomerIndex({
    customers,
    filters,
}: CustomerIndexProps) {
    const [filterData, setFilterData] = useState(filters);

    const submit: FormEventHandler = (event) => {
        event.preventDefault();

        router.get(route('customers.index'), filterData, {
            preserveState: true,
            replace: true,
        });
    };

    const clearFilters = () => {
        setFilterData({ search: '' });
        router.get(route('customers.index'), {}, { replace: true });
    };

    return (
        <AuthenticatedLayout
            header={
                <PageHeader
                    title="Customer"
                    description="Data pembeli dan riwayat transaksi"
                />
            }
        >
            <Head title="Customer" />

            <div className="space-y-6">
                <Card>
                    <CardContent>
                        <form
                            onSubmit={submit}
                            className="grid gap-3 md:grid-cols-[minmax(180px,1fr)_auto_auto]"
                        >
                            <input
                                className="rounded-md border-neutral-300 text-sm shadow-sm focus:border-yellow-500 focus:ring-yellow-500"
                                placeholder="Cari nama atau WhatsApp"
                                value={filterData.search}
                                onChange={(event) =>
                                    setFilterData({
                                        search: event.target.value,
                                    })
                                }
                            />
                            <Button type="submit" variant="secondary">
                                Filter
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={clearFilters}
                            >
                                Bersihkan
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-0">
                        {customers.data.length === 0 ? (
                            <div className="p-5">
                                <EmptyState
                                    title="Belum ada customer."
                                    description="Customer akan muncul setelah transaksi penjualan disimpan."
                                />
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-neutral-200">
                                    <thead className="bg-neutral-50">
                                        <tr>
                                            {[
                                                'Nama',
                                                'WhatsApp',
                                                'Alamat',
                                                'Transaksi',
                                                'Terakhir',
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
                                        {customers.data.map((customer) => (
                                            <tr key={customer.id}>
                                                <td className="px-4 py-3 text-sm font-medium text-neutral-950">
                                                    {customer.name}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-neutral-700">
                                                    {customer.whatsapp}
                                                    {customer.alternative_whatsapp && (
                                                        <div className="text-xs text-neutral-500">
                                                            {
                                                                customer.alternative_whatsapp
                                                            }
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="max-w-xs truncate px-4 py-3 text-sm text-neutral-700">
                                                    {customer.address}
                                                </td>
                                                <td className="px-4 py-3 text-sm font-semibold text-neutral-950">
                                                    {customer.sales_count}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-neutral-700">
                                                    {customer.last_sale_date ??
                                                        '-'}
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <Link
                                                        href={route(
                                                            'customers.show',
                                                            customer.id,
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

                {customers.links.length > 3 && (
                    <div className="flex flex-wrap justify-end gap-2">
                        {customers.links.map((link) => (
                            <Link
                                key={`${link.label}-${link.url}`}
                                href={link.url ?? '#'}
                                className={
                                    link.active
                                        ? 'inline-flex h-9 min-w-9 items-center justify-center rounded-md bg-neutral-950 px-3 text-sm font-medium text-white'
                                        : 'inline-flex h-9 min-w-9 items-center justify-center rounded-md border border-neutral-200 bg-white px-3 text-sm font-medium text-neutral-700 hover:bg-neutral-50'
                                }
                                preserveScroll
                                dangerouslySetInnerHTML={{
                                    __html: link.label,
                                }}
                            />
                        ))}
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
