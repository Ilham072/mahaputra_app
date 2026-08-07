import Button from '@/Components/Button';
import { Card, CardContent, CardTitle } from '@/Components/Card';
import CurrencyDisplay from '@/Components/CurrencyDisplay';
import EmptyState from '@/Components/EmptyState';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PageHeader from '@/Components/PageHeader';
import StatusBadge from '@/Components/StatusBadge';
import TextInput from '@/Components/TextInput';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { FormEventHandler, ReactNode } from 'react';
import {
    VehicleCostCategoryOption,
    VehicleDetail,
    VehicleDocument,
} from './types';

type VehicleShowProps = {
    vehicle: VehicleDetail;
    costCategoryOptions: VehicleCostCategoryOption[];
};

export default function VehicleShow({
    vehicle,
    costCategoryOptions,
}: VehicleShowProps) {
    const { auth, flash } = usePage<PageProps>().props;
    const isAdmin = auth.user.role === 'admin';
    const costForm = useForm({
        cost_date: new Date().toISOString().slice(0, 10),
        category: costCategoryOptions[0]?.value ?? 'DICO',
        amount: '',
        description: '',
    });

    const submitCost: FormEventHandler = (event) => {
        event.preventDefault();

        costForm.post(route('vehicles.costs.store', vehicle.id), {
            preserveScroll: true,
            onSuccess: () =>
                costForm.reset('amount', 'description'),
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <PageHeader
                    title={`${vehicle.brand} ${vehicle.type}`}
                    description={vehicle.plate_number}
                    actions={
                        <div className="flex gap-2">
                            <Link href={route('vehicles.index')}>
                                <Button type="button" variant="outline">
                                    Kembali
                                </Button>
                            </Link>
                            {isAdmin && (
                                <Link href={route('vehicles.edit', vehicle.id)}>
                                    <Button type="button">Edit</Button>
                                </Link>
                            )}
                        </div>
                    }
                />
            }
        >
            <Head title={`${vehicle.brand} ${vehicle.type}`} />

            <div className="space-y-6">
                {flash?.success && (
                    <div className="rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                        {flash.success}
                    </div>
                )}

                <div className="grid gap-6 xl:grid-cols-[minmax(0,1.3fr)_minmax(360px,0.7fr)]">
                    <Card className="overflow-hidden">
                        <div className="flex aspect-[4/3] items-center justify-center bg-neutral-100 text-sm font-medium text-neutral-500">
                            Foto kendaraan belum tersedia
                        </div>
                    </Card>

                    <div className="space-y-6">
                        <Card>
                            <CardContent className="space-y-5">
                                <div className="flex flex-wrap gap-2">
                                    <StatusBadge
                                        type="vehicle"
                                        value={vehicle.status}
                                    />
                                    <StatusBadge
                                        type="capital"
                                        value={vehicle.capital_type}
                                    />
                                </div>

                                <InfoGrid
                                    items={[
                                        ['Tanggal Pembelian', vehicle.purchase_date],
                                        ['Merk', vehicle.brand ?? '-'],
                                        ['Tipe', vehicle.type],
                                        ['Tahun', String(vehicle.year)],
                                        ['Warna', vehicle.color],
                                        [
                                            'Harga Penawaran',
                                            <CurrencyDisplay
                                                key="asking"
                                                value={vehicle.asking_price}
                                            />,
                                        ],
                                    ]}
                                />
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="space-y-5">
                                <CardTitle>Modal Kendaraan</CardTitle>
                                <InfoGrid
                                    items={[
                                        [
                                            'Modal Showroom',
                                            <CurrencyDisplay
                                                key="showroom"
                                                value={vehicle.showroom_capital}
                                            />,
                                        ],
                                        [
                                            'Kolaborator',
                                            vehicle.collaborator_name ?? '-',
                                        ],
                                        [
                                            'Modal Kolaborator',
                                            <CurrencyDisplay
                                                key="collaborator"
                                                value={
                                                    vehicle.collaborator_capital
                                                }
                                            />,
                                        ],
                                        [
                                            'Total Modal Awal',
                                            <CurrencyDisplay
                                                key="initial"
                                                value={vehicle.initial_capital}
                                                className="font-semibold text-neutral-950"
                                            />,
                                        ],
                                        [
                                            'Total Biaya Kendaraan',
                                            <CurrencyDisplay
                                                key="costs"
                                                value={
                                                    vehicle.total_vehicle_cost
                                                }
                                            />,
                                        ],
                                        [
                                            'Modal Akhir',
                                            <CurrencyDisplay
                                                key="final"
                                                value={vehicle.final_capital}
                                                className="font-semibold text-neutral-950"
                                            />,
                                        ],
                                    ]}
                                />
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="space-y-5">
                                <CardTitle>Pajak</CardTitle>
                                <InfoGrid
                                    items={[
                                        ['Status Pajak', vehicle.tax_status],
                                        [
                                            'Nominal Pajak',
                                            <CurrencyDisplay
                                                key="tax"
                                                value={vehicle.tax_amount}
                                            />,
                                        ],
                                    ]}
                                />
                            </CardContent>
                        </Card>
                    </div>
                </div>

                <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
                    {isAdmin && (
                        <Card>
                            <CardContent>
                                <form
                                    onSubmit={submitCost}
                                    className="space-y-5"
                                >
                                    <div>
                                        <CardTitle>Tambah Biaya</CardTitle>
                                        <p className="mt-1 text-sm text-neutral-500">
                                            Biaya ini menambah Modal Akhir
                                            kendaraan.
                                        </p>
                                    </div>

                                    <div>
                                        <InputLabel
                                            htmlFor="cost_date"
                                            value="Tanggal Biaya *"
                                        />
                                        <TextInput
                                            id="cost_date"
                                            type="date"
                                            className="mt-1 block w-full"
                                            value={costForm.data.cost_date}
                                            onChange={(event) =>
                                                costForm.setData(
                                                    'cost_date',
                                                    event.target.value,
                                                )
                                            }
                                            required
                                        />
                                        <InputError
                                            className="mt-2"
                                            message={
                                                costForm.errors.cost_date
                                            }
                                        />
                                    </div>

                                    <div>
                                        <InputLabel
                                            htmlFor="category"
                                            value="Kategori *"
                                        />
                                        <select
                                            id="category"
                                            className="mt-1 block w-full rounded-md border-neutral-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500"
                                            value={costForm.data.category}
                                            onChange={(event) =>
                                                costForm.setData(
                                                    'category',
                                                    event.target
                                                        .value as VehicleCostCategoryOption['value'],
                                                )
                                            }
                                        >
                                            {costCategoryOptions.map(
                                                (category) => (
                                                    <option
                                                        key={category.value}
                                                        value={category.value}
                                                    >
                                                        {category.label}
                                                    </option>
                                                ),
                                            )}
                                        </select>
                                        <InputError
                                            className="mt-2"
                                            message={costForm.errors.category}
                                        />
                                    </div>

                                    <div>
                                        <InputLabel
                                            htmlFor="amount"
                                            value="Nominal *"
                                        />
                                        <TextInput
                                            id="amount"
                                            type="number"
                                            min="0"
                                            className="mt-1 block w-full"
                                            value={costForm.data.amount}
                                            onChange={(event) =>
                                                costForm.setData(
                                                    'amount',
                                                    event.target.value,
                                                )
                                            }
                                            required
                                        />
                                        <InputError
                                            className="mt-2"
                                            message={costForm.errors.amount}
                                        />
                                    </div>

                                    <div>
                                        <InputLabel
                                            htmlFor="description"
                                            value="Keterangan"
                                        />
                                        <textarea
                                            id="description"
                                            className="mt-1 block min-h-24 w-full rounded-md border-neutral-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500"
                                            value={costForm.data.description}
                                            onChange={(event) =>
                                                costForm.setData(
                                                    'description',
                                                    event.target.value,
                                                )
                                            }
                                        />
                                        <InputError
                                            className="mt-2"
                                            message={
                                                costForm.errors.description
                                            }
                                        />
                                    </div>

                                    <Button
                                        type="submit"
                                        disabled={costForm.processing}
                                        isLoading={costForm.processing}
                                    >
                                        Tambah Biaya
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    )}

                    <Card>
                        <CardContent className="space-y-5">
                            <div className="flex flex-wrap items-start justify-between gap-4">
                                <div>
                                    <CardTitle>Biaya Kendaraan</CardTitle>
                                    <p className="mt-1 text-sm text-neutral-500">
                                        Pajak kendaraan ditambah biaya tambahan.
                                    </p>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm text-neutral-500">
                                        Total
                                    </div>
                                    <CurrencyDisplay
                                        value={vehicle.total_vehicle_cost}
                                        className="text-xl font-bold text-neutral-950"
                                    />
                                </div>
                            </div>

                            <div className="rounded-md border border-neutral-200 bg-neutral-50 p-4">
                                <div className="flex items-center justify-between gap-4 text-sm">
                                    <span className="font-medium text-neutral-600">
                                        Pajak Kendaraan
                                    </span>
                                    <CurrencyDisplay
                                        value={vehicle.tax_amount}
                                        className="font-semibold text-neutral-950"
                                    />
                                </div>
                            </div>

                            {vehicle.costs.length === 0 ? (
                                <EmptyState
                                    title="Belum ada biaya tambahan."
                                    description="Biaya dico, kelistrikan/kaki-kaki, dan biaya lainnya akan muncul di sini."
                                />
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-neutral-200">
                                        <thead className="bg-neutral-50">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-neutral-500">
                                                    Tanggal
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-neutral-500">
                                                    Kategori
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-neutral-500">
                                                    Keterangan
                                                </th>
                                                <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-neutral-500">
                                                    Nominal
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-neutral-200 bg-white">
                                            {vehicle.costs.map((cost) => (
                                                <tr key={cost.id}>
                                                    <td className="whitespace-nowrap px-4 py-3 text-sm text-neutral-700">
                                                        {cost.cost_date}
                                                    </td>
                                                    <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-neutral-900">
                                                        {cost.category_label}
                                                    </td>
                                                    <td className="px-4 py-3 text-sm text-neutral-600">
                                                        {cost.description ??
                                                            '-'}
                                                    </td>
                                                    <td className="whitespace-nowrap px-4 py-3 text-right text-sm font-semibold text-neutral-950">
                                                        <CurrencyDisplay
                                                            value={cost.amount}
                                                        />
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-6 xl:grid-cols-2">
                    {vehicle.documents.map((document) => (
                        <DocumentCard
                            key={document.document_type}
                            vehicleId={vehicle.id}
                            document={document}
                            canManage={isAdmin}
                        />
                    ))}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

function InfoGrid({
    items,
}: {
    items: Array<[string, ReactNode]>;
}) {
    return (
        <dl className="grid gap-4 sm:grid-cols-2">
            {items.map(([label, value]) => (
                <div key={label}>
                    <dt className="text-sm font-medium text-neutral-500">
                        {label}
                    </dt>
                    <dd className="mt-1 text-sm font-semibold text-neutral-900">
                        {value}
                    </dd>
                </div>
            ))}
        </dl>
    );
}

function DocumentCard({
    vehicleId,
    document,
    canManage,
}: {
    vehicleId: number;
    document: VehicleDocument;
    canManage: boolean;
}) {
    const form = useForm<{
        is_available: boolean;
        document: File | null;
        note: string;
    }>({
        is_available: document.is_available,
        document: null,
        note: document.note ?? '',
    });

    const submit: FormEventHandler = (event) => {
        event.preventDefault();

        form.post(
            route('vehicles.documents.update', [
                vehicleId,
                document.document_type,
            ]),
            {
                preserveScroll: true,
                forceFormData: true,
                onSuccess: () => form.reset('document'),
            },
        );
    };

    return (
        <Card>
            <CardContent className="space-y-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <CardTitle>{document.document_label}</CardTitle>
                        <p className="mt-1 text-sm text-neutral-500">
                            Dokumen internal kendaraan
                        </p>
                    </div>
                    <span
                        className={
                            document.is_available
                                ? 'inline-flex rounded-md border border-green-200 bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700'
                                : 'inline-flex rounded-md border border-neutral-200 bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-700'
                        }
                    >
                        {document.is_available ? 'Tersedia' : 'Belum tersedia'}
                    </span>
                </div>

                <InfoGrid
                    items={[
                        ['File', document.original_name ?? '-'],
                        ['Tipe File', document.mime_type ?? '-'],
                        ['Catatan', document.note ?? '-'],
                    ]}
                />

                {document.download_url && (
                    <a href={document.download_url}>
                        <Button type="button" variant="outline">
                            Unduh Dokumen
                        </Button>
                    </a>
                )}

                {canManage && (
                    <form onSubmit={submit} className="space-y-4 border-t border-neutral-200 pt-5">
                        <label className="flex items-center gap-3 rounded-md border border-neutral-200 bg-neutral-50 px-3 py-2">
                            <input
                                type="checkbox"
                                className="rounded border-neutral-300 text-yellow-500 focus:ring-yellow-500"
                                checked={form.data.is_available}
                                onChange={(event) =>
                                    form.setData(
                                        'is_available',
                                        event.target.checked,
                                    )
                                }
                            />
                            <span className="text-sm font-medium text-neutral-800">
                                Dokumen tersedia
                            </span>
                        </label>

                        <div>
                            <InputLabel
                                htmlFor={`${document.document_type}-file`}
                                value="File Dokumen"
                            />
                            <input
                                id={`${document.document_type}-file`}
                                type="file"
                                accept=".jpg,.jpeg,.png,.webp,.pdf"
                                className="mt-1 block w-full rounded-md border border-neutral-300 bg-white text-sm text-neutral-700 file:mr-4 file:border-0 file:bg-neutral-950 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                onChange={(event) =>
                                    form.setData(
                                        'document',
                                        event.target.files?.[0] ?? null,
                                    )
                                }
                            />
                            <InputError
                                className="mt-2"
                                message={form.errors.document}
                            />
                        </div>

                        <div>
                            <InputLabel
                                htmlFor={`${document.document_type}-note`}
                                value="Catatan"
                            />
                            <textarea
                                id={`${document.document_type}-note`}
                                className="mt-1 block min-h-20 w-full rounded-md border-neutral-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500"
                                value={form.data.note}
                                onChange={(event) =>
                                    form.setData('note', event.target.value)
                                }
                            />
                            <InputError
                                className="mt-2"
                                message={form.errors.note}
                            />
                        </div>

                        <Button
                            type="submit"
                            disabled={form.processing}
                            isLoading={form.processing}
                        >
                            Simpan {document.document_label}
                        </Button>
                    </form>
                )}
            </CardContent>
        </Card>
    );
}
