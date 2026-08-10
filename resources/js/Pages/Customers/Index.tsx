import Button from '@/Components/Button';
import { Card, CardContent } from '@/Components/Card';
import CurrencyDisplay from '@/Components/CurrencyDisplay';
import DataTable, { type DataTableColumn } from '@/Components/DataTable';
import EmptyState from '@/Components/EmptyState';
import KpiCard from '@/Components/KpiCard';
import PageHeader from '@/Components/PageHeader';
import SelectInput from '@/Components/SelectInput';
import TextInput from '@/Components/TextInput';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { type FormEventHandler, type ReactNode, useState } from 'react';
import type { CustomerSummary } from './types';

type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

type AreaOption = {
    id: number;
    name: string;
};

type CustomerFilters = {
    search: string;
    area_id: string;
    customer_status: string;
};

type CustomerIndexProps = {
    customers: {
        data: CustomerSummary[];
        links: PaginationLink[];
    };
    filters: CustomerFilters;
    summary: {
        total_customers: number;
        new_customers_this_month: number;
    };
    options: {
        areas: AreaOption[];
    };
};

export default function CustomerIndex({
    customers,
    filters,
    summary,
    options,
}: CustomerIndexProps) {
    const { auth } = usePage<PageProps>().props;
    const isAdmin = auth.user.role === 'admin';
    const [filterData, setFilterData] = useState<CustomerFilters>(filters);

    const submit: FormEventHandler = (event) => {
        event.preventDefault();

        router.get(route('customers.index'), cleanFilters(filterData), {
            preserveState: true,
            replace: true,
        });
    };

    const clearFilters = () => {
        const emptyFilters = {
            search: '',
            area_id: '',
            customer_status: '',
        };

        setFilterData(emptyFilters);
        router.get(route('customers.index'), {}, { replace: true });
    };

    const customerColumns: Array<DataTableColumn<CustomerSummary>> = [
        {
            key: 'customer',
            header: 'Customer',
            cell: (customer) => <CustomerIdentity customer={customer} />,
        },
        {
            key: 'whatsapp',
            header: 'WhatsApp',
            cell: (customer) => <WhatsAppValue value={customer.whatsapp} />,
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
            cell: (customer) => transactionLabel(customer.sales_count),
        },
        {
            key: 'total_purchase',
            header: 'Total Pembelian',
            align: 'right',
            cellClassName: 'font-semibold text-neutral-950',
            cell: (customer) => (
                <CurrencyDisplay value={customer.total_purchase} />
            ),
        },
        {
            key: 'last_sale_date',
            header: 'Terakhir',
            cell: (customer) => formatDate(customer.last_sale_date),
        },
        {
            key: 'actions',
            header: 'Aksi',
            align: 'right',
            cell: (customer) => (
                <CustomerActions customer={customer} isAdmin={isAdmin} />
            ),
        },
    ];

    return (
        <AuthenticatedLayout
            header={
                <PageHeader
                    title="Customer"
                    description="Data dan riwayat customer showroom"
                    actions={
                        isAdmin ? (
                            <Link href={route('sales.index')}>
                                <Button type="button">
                                    + Tambah Customer
                                </Button>
                            </Link>
                        ) : undefined
                    }
                />
            }
        >
            <Head title="Customer" />

            <div className="space-y-5 lg:space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                    <KpiCard
                        label="Total Customer"
                        value={summary.total_customers}
                        caption="Seluruh data customer"
                    />
                    <KpiCard
                        label="Customer Baru Bulan Ini"
                        value={summary.new_customers_this_month}
                        caption="Berdasarkan tanggal dibuat"
                    />
                </div>

                <Card>
                    <CardContent className="p-4 sm:p-5">
                        <form onSubmit={submit} className="space-y-4">
                            <div className="grid gap-3 lg:grid-cols-[minmax(240px,1fr)_220px_220px_auto_auto]">
                                <label className="relative block">
                                    <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-400" />
                                    <TextInput
                                        placeholder="Cari nama atau nomor WhatsApp..."
                                        className="h-11 pl-12"
                                        value={filterData.search}
                                        onChange={(event) =>
                                            setFilterData({
                                                ...filterData,
                                                search: event.target.value,
                                            })
                                        }
                                    />
                                </label>
                                <SelectInput
                                    value={filterData.area_id}
                                    onChange={(event) =>
                                        setFilterData({
                                            ...filterData,
                                            area_id: event.target.value,
                                        })
                                    }
                                >
                                    <option value="">Semua Area</option>
                                    {options.areas.map((area) => (
                                        <option key={area.id} value={area.id}>
                                            {area.name}
                                        </option>
                                    ))}
                                </SelectInput>
                                <SelectInput
                                    value={filterData.customer_status}
                                    onChange={(event) =>
                                        setFilterData({
                                            ...filterData,
                                            customer_status:
                                                event.target.value,
                                        })
                                    }
                                >
                                    <option value="">Semua Customer</option>
                                    <option value="with_transactions">
                                        Sudah Pernah Transaksi
                                    </option>
                                    <option value="without_transactions">
                                        Belum Ada Transaksi
                                    </option>
                                </SelectInput>
                                <Button
                                    type="submit"
                                    variant="secondary"
                                    className="w-full lg:w-auto"
                                >
                                    Filter
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={clearFilters}
                                    className="w-full lg:w-auto"
                                >
                                    Bersihkan
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                {customers.data.length === 0 ? (
                    <Card>
                        <CardContent>
                            <EmptyState
                                title="Belum ada customer."
                                description="Customer akan muncul setelah transaksi penjualan disimpan."
                            />
                        </CardContent>
                    </Card>
                ) : (
                    <>
                        <Card className="hidden lg:block">
                            <CardContent className="p-0">
                                <DataTable
                                    rows={customers.data}
                                    columns={customerColumns}
                                    getRowKey={(customer) => customer.id}
                                    minWidth="min-w-[980px]"
                                />
                            </CardContent>
                        </Card>

                        <div className="grid gap-3 lg:hidden">
                            {customers.data.map((customer) => (
                                <CustomerMobileCard
                                    key={customer.id}
                                    customer={customer}
                                    isAdmin={isAdmin}
                                />
                            ))}
                        </div>
                    </>
                )}

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

function CustomerMobileCard({
    customer,
    isAdmin,
}: {
    customer: CustomerSummary;
    isAdmin: boolean;
}) {
    return (
        <Card>
            <CardContent className="space-y-4 p-4">
                <div className="flex items-start justify-between gap-3">
                    <CustomerIdentity customer={customer} />
                    <CustomerActions customer={customer} isAdmin={isAdmin} />
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                    <MobileMetric
                        label="WhatsApp"
                        value={<WhatsAppValue value={customer.whatsapp} />}
                    />
                    <MobileMetric
                        label="Area"
                        value={customer.latest_area ?? '-'}
                    />
                    <MobileMetric
                        label="Transaksi"
                        value={transactionLabel(customer.sales_count)}
                    />
                    <MobileMetric
                        label="Total Pembelian"
                        value={
                            <CurrencyDisplay value={customer.total_purchase} />
                        }
                    />
                    <MobileMetric
                        label="Terakhir"
                        value={formatDate(customer.last_sale_date)}
                    />
                </div>
                <div className="flex gap-2">
                    <a
                        href={whatsAppUrl(customer.whatsapp)}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex h-10 flex-1 items-center justify-center rounded-md border border-green-200 bg-green-50 px-3 text-sm font-semibold text-green-700"
                    >
                        WhatsApp
                    </a>
                    <Link
                        href={route('customers.show', customer.id)}
                        className="inline-flex h-10 flex-1 items-center justify-center rounded-md border border-neutral-300 bg-surface px-3 text-sm font-semibold text-neutral-900"
                    >
                        Detail
                    </Link>
                </div>
            </CardContent>
        </Card>
    );
}

function CustomerActions({
    customer,
    isAdmin,
}: {
    customer: CustomerSummary;
    isAdmin: boolean;
}) {
    return (
        <div className="flex justify-end gap-2">
            <IconActionLink
                href={route('customers.show', customer.id)}
                label={`Lihat detail ${customer.name}`}
            >
                <EyeIcon className="h-4 w-4" />
            </IconActionLink>
            {isAdmin && (
                <IconActionLink
                    href={route('customers.edit', customer.id)}
                    label={`Edit customer ${customer.name}`}
                >
                    <EditIcon className="h-4 w-4" />
                </IconActionLink>
            )}
            <IconActionAnchor
                href={whatsAppUrl(customer.whatsapp)}
                label={`Hubungi WhatsApp ${customer.name}`}
                className="text-green-700 hover:bg-green-50 hover:text-green-800"
            >
                <WhatsAppIcon className="h-4 w-4" />
            </IconActionAnchor>
        </div>
    );
}

function IconActionLink({
    href,
    label,
    className = '',
    children,
}: {
    href: string;
    label: string;
    className?: string;
    children: ReactNode;
}) {
    return (
        <Link
            href={href}
            aria-label={label}
            title={label}
            className={[
                'inline-flex h-9 w-9 items-center justify-center rounded-md border border-neutral-300 bg-surface text-neutral-700 transition hover:bg-neutral-50 hover:text-neutral-950 focus:outline-none focus:ring-2 focus:ring-brand-yellow-500 focus:ring-offset-2',
                className,
            ].join(' ')}
        >
            {children}
        </Link>
    );
}

function IconActionAnchor({
    href,
    label,
    className = '',
    children,
}: {
    href: string;
    label: string;
    className?: string;
    children: ReactNode;
}) {
    return (
        <a
            href={href}
            target="_blank"
            rel="noreferrer"
            aria-label={label}
            title={label}
            className={[
                'inline-flex h-9 w-9 items-center justify-center rounded-md border border-neutral-300 bg-surface text-neutral-700 transition hover:bg-neutral-50 hover:text-neutral-950 focus:outline-none focus:ring-2 focus:ring-brand-yellow-500 focus:ring-offset-2',
                className,
            ].join(' ')}
        >
            {children}
        </a>
    );
}

function CustomerIdentity({ customer }: { customer: CustomerSummary }) {
    return (
        <div className="flex min-w-0 items-center gap-3">
            <InitialAvatar name={customer.name} />
            <div className="min-w-0">
                <div className="truncate font-semibold text-neutral-950">
                    {customer.name}
                </div>
                <div className="truncate text-xs text-neutral-500">
                    {customer.latest_area ?? 'Area belum tersedia'}
                </div>
            </div>
        </div>
    );
}

function InitialAvatar({ name }: { name: string }) {
    return (
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-brand-yellow-500 text-sm font-bold uppercase text-brand-black">
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

function MobileMetric({
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

function cleanFilters(filters: CustomerFilters) {
    return Object.fromEntries(
        Object.entries(filters).filter(([, value]) => value !== ''),
    );
}

function transactionLabel(count: number) {
    return `${count} transaksi`;
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

function SearchIcon({ className = '' }: { className?: string }) {
    return (
        <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
        </svg>
    );
}

function EyeIcon({ className = '' }: { className?: string }) {
    return (
        <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
            <circle cx="12" cy="12" r="3" />
        </svg>
    );
}

function EditIcon({ className = '' }: { className?: string }) {
    return (
        <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
        </svg>
    );
}

function WhatsAppIcon({ className = '' }: { className?: string }) {
    return (
        <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <path d="M20 11.5a8 8 0 0 1-11.7 7.1L4 20l1.4-4.1A8 8 0 1 1 20 11.5Z" />
            <path d="M9 9.5c.5 2 2 3.5 4 4l1.2-1.2 1.8.5" />
        </svg>
    );
}
