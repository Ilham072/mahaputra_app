import Button from '@/Components/Button';
import { Card } from '@/Components/Card';
import EmptyState from '@/Components/EmptyState';
import FormField from '@/Components/FormField';
import PageHeader from '@/Components/PageHeader';
import SelectInput from '@/Components/SelectInput';
import TextInput from '@/Components/TextInput';
import VehicleCard from '@/Components/VehicleCard';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';
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

    return (
        <AuthenticatedLayout
            header={
                <PageHeader
                    title="Data Kendaraan"
                    description="Kelola inventory kendaraan Mahaputra Group"
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

            <div className="space-y-6">
                <Card className="p-4">
                    <form
                        onSubmit={submit}
                        className="grid gap-4 md:grid-cols-2 xl:grid-cols-[minmax(220px,1fr)_180px_180px_180px_auto_auto]"
                    >
                        <FormField label="Pencarian">
                            <TextInput
                                type="search"
                                placeholder="Cari no polisi atau tipe"
                                value={filterData.search}
                                onChange={(event) =>
                                    setFilterData({
                                        ...filterData,
                                        search: event.target.value,
                                    })
                                }
                            />
                        </FormField>

                        <FormField label="Status">
                            <SelectInput
                                value={filterData.status}
                                onChange={(event) =>
                                    setFilterData({
                                        ...filterData,
                                        status: event.target.value,
                                    })
                                }
                            >
                                <option value="">Semua Status</option>
                                {options.statuses.map((status) => (
                                    <option
                                        key={status.value}
                                        value={status.value}
                                    >
                                        {status.label}
                                    </option>
                                ))}
                            </SelectInput>
                        </FormField>

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

                        <FormField label="Tipe Modal">
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
                            className="self-end"
                        >
                            Filter
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={clearFilters}
                            className="self-end"
                        >
                            Bersihkan
                        </Button>
                    </form>
                </Card>

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
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
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
