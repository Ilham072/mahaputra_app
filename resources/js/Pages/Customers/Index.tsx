import Button from '@/Components/Button';
import { Card, CardContent } from '@/Components/Card';
import DataTable, { type DataTableColumn } from '@/Components/DataTable';
import EmptyState from '@/Components/EmptyState';
import PageHeader from '@/Components/PageHeader';
import TextInput from '@/Components/TextInput';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { type FormEventHandler, useState } from 'react';
import type { CustomerSummary } from './types';

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

    const customerColumns: Array<DataTableColumn<CustomerSummary>> = [
        {
            key: 'name',
            header: 'Nama',
            cellClassName: 'font-medium text-neutral-950',
            cell: (customer) => customer.name,
        },
        {
            key: 'whatsapp',
            header: 'WhatsApp',
            cell: (customer) => (
                <>
                    {customer.whatsapp}
                    {customer.alternative_whatsapp && (
                        <div className="text-xs text-neutral-500">
                            {customer.alternative_whatsapp}
                        </div>
                    )}
                </>
            ),
        },
        {
            key: 'address',
            header: 'Alamat',
            cellClassName: 'max-w-xs truncate',
            cell: (customer) => customer.address,
        },
        {
            key: 'sales_count',
            header: 'Transaksi',
            cellClassName: 'font-semibold text-neutral-950',
            cell: (customer) => customer.sales_count,
        },
        {
            key: 'last_sale_date',
            header: 'Terakhir',
            cell: (customer) => customer.last_sale_date ?? '-',
        },
        {
            key: 'actions',
            header: '',
            align: 'right',
            cell: (customer) => (
                <Link href={route('customers.show', customer.id)}>
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
                    title="Customer"
                    description="Data pembeli dan riwayat transaksi"
                />
            }
        >
            <Head title="Customer" />

            <div className="space-y-5 lg:space-y-6">
                <Card>
                    <CardContent className="p-4 sm:p-5">
                        <form
                            onSubmit={submit}
                            className="grid gap-3 sm:grid-cols-[minmax(180px,1fr)_auto_auto]"
                        >
                            <TextInput
                                placeholder="Cari nama atau WhatsApp"
                                value={filterData.search}
                                onChange={(event) =>
                                    setFilterData({
                                        search: event.target.value,
                                    })
                                }
                            />
                            <Button
                                type="submit"
                                variant="secondary"
                                className="w-full sm:w-auto"
                            >
                                Filter
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={clearFilters}
                                className="w-full sm:w-auto"
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
                            <DataTable
                                rows={customers.data}
                                columns={customerColumns}
                                getRowKey={(customer) => customer.id}
                                minWidth="min-w-[640px]"
                            />
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
                                        ? 'inline-flex h-9 min-w-9 items-center justify-center rounded-md bg-neutral-950 px-3 text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-brand-yellow-500 focus:ring-offset-2'
                                        : 'inline-flex h-9 min-w-9 items-center justify-center rounded-md border border-neutral-200 bg-surface px-3 text-sm font-medium text-neutral-700 hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-brand-yellow-500 focus:ring-offset-2'
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
