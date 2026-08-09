import Button from '@/Components/Button';
import { Card } from '@/Components/Card';
import CurrencyDisplay from '@/Components/CurrencyDisplay';
import DataTable from '@/Components/DataTable';
import type { DataTableColumn } from '@/Components/DataTable';
import Dropdown from '@/Components/Dropdown';
import EmptyState from '@/Components/EmptyState';
import FormField from '@/Components/FormField';
import PageHeader from '@/Components/PageHeader';
import SelectInput from '@/Components/SelectInput';
import StatusBadge from '@/Components/StatusBadge';
import TextInput from '@/Components/TextInput';
import VehicleCard from '@/Components/VehicleCard';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { FormEventHandler, ReactNode, useState } from 'react';
import { VehicleOptions, VehicleSummary } from './types';

type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

type VehicleIndexProps = PageProps<{
    vehicles: {
        data: VehicleSummary[];
        links: PaginationLink[];
    };
    filters: {
        search: string;
        status: string;
        brand_id: string;
        capital_type: string;
    };
    options: VehicleOptions;
}>;

export default function VehicleIndex({
    vehicles,
    filters,
    options,
}: VehicleIndexProps) {
    const { auth } = usePage<PageProps>().props;
    const [filterData, setFilterData] = useState(filters);
    const [viewMode, setViewMode] = useState<'table' | 'gallery'>('table');
    const isAdmin = auth.user.role === 'admin';

    const submit: FormEventHandler = (event) => {
        event.preventDefault();

        router.get(route('vehicles.index'), filterData, {
            preserveState: true,
            replace: true,
        });
    };

    const clearFilters = () => {
        setFilterData({
            search: '',
            status: '',
            brand_id: '',
            capital_type: '',
        });

        router.get(route('vehicles.index'), {}, { replace: true });
    };

    const applyStatusFilter = (status: string) => {
        const nextFilters = { ...filterData, status };

        setFilterData(nextFilters);
        router.get(route('vehicles.index'), nextFilters, {
            preserveState: true,
            replace: true,
        });
    };

    const vehicleColumns: Array<DataTableColumn<VehicleSummary>> = [
        {
            key: 'vehicle',
            header: 'Kendaraan',
            cellClassName: 'font-medium text-neutral-950',
            cell: (vehicle) => (
                <Link
                    href={route('vehicles.show', vehicle.id)}
                    className="underline-offset-2 hover:underline"
                >
                    {vehicle.brand ?? 'Tanpa merk'} {vehicle.type}
                    <div className="text-xs font-normal text-neutral-500">
                        {vehicle.plate_number}
                    </div>
                </Link>
            ),
        },
        {
            key: 'year',
            header: 'Tahun',
            cellClassName: 'whitespace-nowrap',
            cell: (vehicle) => vehicle.year,
        },
        {
            key: 'color',
            header: 'Warna',
            cellClassName: 'whitespace-nowrap',
            cell: (vehicle) => vehicle.color,
        },
        {
            key: 'capital_type',
            header: 'Jenis Modal',
            cellClassName: 'whitespace-nowrap',
            cell: (vehicle) => (
                <StatusBadge type="capital" value={vehicle.capital_type} />
            ),
        },
        {
            key: 'status',
            header: 'Status',
            cellClassName: 'whitespace-nowrap',
            cell: (vehicle) => (
                <StatusBadge type="vehicle" value={vehicle.status} />
            ),
        },
        {
            key: 'asking_price',
            header: 'Harga',
            align: 'right',
            cellClassName: 'whitespace-nowrap font-semibold text-neutral-950',
            cell: (vehicle) => <CurrencyDisplay value={vehicle.asking_price} />,
        },
        {
            key: 'actions',
            header: '',
            align: 'right',
            cellClassName: 'overflow-visible whitespace-nowrap',
            cell: (vehicle) => (
                <VehicleActionDropdown vehicle={vehicle} isAdmin={isAdmin} />
            ),
        },
    ];

    return (
        <AuthenticatedLayout
            header={
                <PageHeader
                    title="Inventory Kendaraan"
                    description="Daftar kendaraan tersedia & status stok"
                    actions={
                        isAdmin && (
                            <Link href={route('vehicles.create')}>
                                <Button>Tambah Kendaraan</Button>
                            </Link>
                        )
                    }
                />
            }
        >
            <Head title="Data Kendaraan" />

            <div className="space-y-5 lg:space-y-6">
                <Card className="p-4 sm:p-5">
                    <form
                        onSubmit={submit}
                        className="grid gap-3 xl:grid-cols-[minmax(260px,1fr)_auto_auto_auto_auto_auto_auto_auto]"
                    >
                        <FormField label="Pencarian" className="xl:min-w-0">
                            <TextInput
                                type="search"
                                placeholder="Cari merek, model, plat nomor..."
                                value={filterData.search}
                                onChange={(event) =>
                                    setFilterData({
                                        ...filterData,
                                        search: event.target.value,
                                    })
                                }
                            />
                        </FormField>

                        <div className="flex flex-wrap items-end gap-2 xl:col-span-3">
                            <StatusFilterButton
                                active={filterData.status === ''}
                                onClick={() => applyStatusFilter('')}
                            >
                                Semua
                            </StatusFilterButton>
                            {options.statuses.map((status) => (
                                <StatusFilterButton
                                    key={status.value}
                                    active={filterData.status === status.value}
                                    onClick={() =>
                                        applyStatusFilter(status.value)
                                    }
                                >
                                    {status.label}
                                </StatusFilterButton>
                            ))}
                        </div>

                        <FormField label="Merk">
                            <SelectInput
                                value={filterData.brand_id}
                                onChange={(event) =>
                                    setFilterData({
                                        ...filterData,
                                        brand_id: event.target.value,
                                    })
                                }
                            >
                                <option value="">Semua Merk</option>
                                {options.brands.map((brand) => (
                                    <option key={brand.id} value={brand.id}>
                                        {brand.name}
                                    </option>
                                ))}
                            </SelectInput>
                        </FormField>

                        <FormField label="Modal">
                            <SelectInput
                                value={filterData.capital_type}
                                onChange={(event) =>
                                    setFilterData({
                                        ...filterData,
                                        capital_type: event.target.value,
                                    })
                                }
                            >
                                <option value="">Semua Modal</option>
                                {options.capitalTypes.map((type) => (
                                    <option key={type.value} value={type.value}>
                                        {type.label}
                                    </option>
                                ))}
                            </SelectInput>
                        </FormField>

                        <Button
                            type="submit"
                            variant="secondary"
                            className="w-full self-end"
                        >
                            Filter
                        </Button>
                        <div className="flex items-end gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={clearFilters}
                                className="w-full"
                            >
                                Bersihkan
                            </Button>
                            <ViewModeButton
                                active={viewMode === 'table'}
                                label="Mode table"
                                onClick={() => setViewMode('table')}
                            >
                                <svg
                                    viewBox="0 0 24 24"
                                    className="h-4 w-4"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    aria-hidden="true"
                                >
                                    <path d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            </ViewModeButton>
                            <ViewModeButton
                                active={viewMode === 'gallery'}
                                label="Mode gallery"
                                onClick={() => setViewMode('gallery')}
                            >
                                <svg
                                    viewBox="0 0 24 24"
                                    className="h-4 w-4"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    aria-hidden="true"
                                >
                                    <rect x="4" y="4" width="6" height="6" />
                                    <rect x="14" y="4" width="6" height="6" />
                                    <rect x="4" y="14" width="6" height="6" />
                                    <rect x="14" y="14" width="6" height="6" />
                                </svg>
                            </ViewModeButton>
                        </div>
                    </form>
                </Card>

                <div className="text-sm text-neutral-500">
                    Menampilkan{' '}
                    <span className="font-semibold text-neutral-950">
                        {vehicles.data.length}
                    </span>{' '}
                    kendaraan
                </div>

                {vehicles.data.length === 0 ? (
                    <EmptyState
                        title="Belum ada kendaraan."
                        description={
                            isAdmin
                                ? 'Tambahkan kendaraan pertama untuk mulai mengelola inventory.'
                                : 'Data kendaraan akan muncul setelah Admin menambahkan inventory.'
                        }
                        action={
                            isAdmin && (
                                <Link href={route('vehicles.create')}>
                                    <Button>Tambah Kendaraan</Button>
                                </Link>
                            )
                        }
                    />
                ) : viewMode === 'table' ? (
                    <Card>
                        <DataTable
                            rows={vehicles.data}
                            columns={vehicleColumns}
                            getRowKey={(vehicle) => vehicle.id}
                            minWidth="min-w-[980px] lg:min-w-full"
                        />
                    </Card>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                        {vehicles.data.map((vehicle) => (
                            <VehicleCard
                                key={vehicle.id}
                                vehicle={vehicle}
                                isAdmin={isAdmin}
                            />
                        ))}
                    </div>
                )}

                {vehicles.links.length > 3 && (
                    <div className="flex flex-wrap justify-end gap-2">
                        {vehicles.links.map((link) => (
                            <Link
                                key={`${link.label}-${link.url}`}
                                href={link.url ?? '#'}
                                className={
                                    link.active
                                        ? 'inline-flex h-9 min-w-9 items-center justify-center rounded-md bg-brand-black px-3 text-sm font-medium text-white'
                                        : 'inline-flex h-9 min-w-9 items-center justify-center rounded-md border border-neutral-200 bg-surface px-3 text-sm font-medium text-neutral-700 hover:bg-neutral-50'
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

function VehicleActionDropdown({
    vehicle,
    isAdmin,
}: {
    vehicle: VehicleSummary;
    isAdmin: boolean;
}) {
    const canSell = isAdmin && vehicle.status !== 'SOLD';

    return (
        <div className="flex justify-end">
            <Dropdown>
                <Dropdown.Trigger>
                    <button
                        type="button"
                        className="inline-flex min-h-9 items-center gap-2 rounded-md border border-neutral-300 bg-surface px-3 py-2 text-sm font-medium text-neutral-900 shadow-sm transition hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-brand-yellow focus:ring-offset-2"
                    >
                        Aksi
                        <ChevronDownIcon className="h-4 w-4 text-neutral-500" />
                    </button>
                </Dropdown.Trigger>

                <Dropdown.Content
                    align="right"
                    contentClasses="bg-surface py-1"
                >
                    <ActionDropdownLink href={route('vehicles.show', vehicle.id)}>
                        <EyeIcon className="h-4 w-4 text-neutral-500" />
                        <span>Lihat Detail</span>
                    </ActionDropdownLink>

                    {isAdmin && (
                        <ActionDropdownLink
                            href={route('vehicles.edit', vehicle.id)}
                        >
                            <EditIcon className="h-4 w-4 text-neutral-500" />
                            <span>Edit Kendaraan</span>
                        </ActionDropdownLink>
                    )}

                    {canSell && (
                        <ActionDropdownLink
                            href={route('vehicles.sales.create', vehicle.id)}
                            className="text-neutral-950"
                        >
                            <SellIcon className="h-4 w-4 text-brand-yellow" />
                            <span>Jual Kendaraan</span>
                        </ActionDropdownLink>
                    )}
                </Dropdown.Content>
            </Dropdown>
        </div>
    );
}

function ActionDropdownLink({
    href,
    className = '',
    children,
}: {
    href: string;
    className?: string;
    children: ReactNode;
}) {
    return (
        <Dropdown.Link
            href={href}
            className={[
                'flex items-center gap-3 px-4 py-2.5 text-sm font-medium',
                className,
            ].join(' ')}
        >
            {children}
        </Dropdown.Link>
    );
}

function ChevronDownIcon({ className = '' }: { className?: string }) {
    return (
        <svg
            aria-hidden="true"
            viewBox="0 0 20 20"
            fill="currentColor"
            className={className}
        >
            <path
                fillRule="evenodd"
                d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.17l3.71-3.94a.75.75 0 1 1 1.08 1.04l-4.25 4.5a.75.75 0 0 1-1.08 0l-4.25-4.5a.75.75 0 0 1 .02-1.06Z"
                clipRule="evenodd"
            />
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

function SellIcon({ className = '' }: { className?: string }) {
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
            <path d="M20 12V8H4v8h7" />
            <path d="M6 16v4h8" />
            <path d="M6 8V4h12v4" />
            <path d="M16 19h6" />
            <path d="M19 16v6" />
        </svg>
    );
}

function StatusFilterButton({
    active,
    onClick,
    children,
}: {
    active: boolean;
    onClick: () => void;
    children: string;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={[
                'inline-flex h-10 items-center rounded-md border px-4 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-brand-yellow-500 focus:ring-offset-2',
                active
                    ? 'border-brand-black bg-brand-black text-white'
                    : 'border-neutral-200 bg-surface text-neutral-700 hover:bg-neutral-50',
            ].join(' ')}
        >
            {children}
        </button>
    );
}

function ViewModeButton({
    active,
    label,
    onClick,
    children,
}: {
    active: boolean;
    label: string;
    onClick: () => void;
    children: ReactNode;
}) {
    return (
        <button
            type="button"
            aria-label={label}
            onClick={onClick}
            className={[
                'inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md border transition focus:outline-none focus:ring-2 focus:ring-brand-yellow-500 focus:ring-offset-2',
                active
                    ? 'border-brand-black bg-brand-black text-white'
                    : 'border-neutral-200 bg-surface text-neutral-700 hover:bg-neutral-50',
            ].join(' ')}
        >
            {children}
        </button>
    );
}
