import Button from '@/Components/Button';
import { Card, CardContent, CardTitle } from '@/Components/Card';
import CurrencyDisplay from '@/Components/CurrencyDisplay';
import DataTable from '@/Components/DataTable';
import type { DataTableColumn } from '@/Components/DataTable';
import EmptyState from '@/Components/EmptyState';
import FormField from '@/Components/FormField';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PageHeader from '@/Components/PageHeader';
import SelectInput from '@/Components/SelectInput';
import StatusBadge from '@/Components/StatusBadge';
import TextInput from '@/Components/TextInput';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import axios from 'axios';
import { FormEventHandler, lazy, ReactNode, Suspense, useState } from 'react';
import type {
    VehicleCost,
    VehicleCostCategoryOption,
    VehicleDetail,
    VehicleDocument,
    VehiclePhoto,
} from './types';
import type { VehiclePdfPayload } from './VehiclePdfDocument';

const VehiclePdfDownloadAction = lazy(
    () => import('./VehiclePdfDownloadAction'),
);

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
    const [pdfPayload, setPdfPayload] = useState<VehiclePdfPayload | null>(
        null,
    );
    const [pdfLoading, setPdfLoading] = useState(false);
    const [pdfError, setPdfError] = useState<string | null>(null);
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

    const costColumns: Array<DataTableColumn<VehicleCost>> = [
        {
            key: 'cost_date',
            header: 'Tanggal',
            cellClassName: 'whitespace-nowrap',
            cell: (cost) => cost.cost_date,
        },
        {
            key: 'category',
            header: 'Kategori',
            cellClassName: 'whitespace-nowrap font-medium text-neutral-900',
            cell: (cost) => cost.category_label,
        },
        {
            key: 'description',
            header: 'Keterangan',
            cellClassName: 'text-neutral-600',
            cell: (cost) => cost.description ?? '-',
        },
        {
            key: 'amount',
            header: 'Nominal',
            align: 'right',
            cellClassName: 'whitespace-nowrap font-semibold text-neutral-950',
            cell: (cost) => <CurrencyDisplay value={cost.amount} />,
        },
    ];

    const loadPdfData = async () => {
        setPdfLoading(true);
        setPdfError(null);

        try {
            const response = await axios.get<VehiclePdfPayload>(
                route('vehicles.pdf-data', vehicle.id),
            );
            setPdfPayload(response.data);
        } catch {
            setPdfError('Data PDF gagal disiapkan.');
        } finally {
            setPdfLoading(false);
        }
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
                            <VehiclePdfExportButton
                                payload={pdfPayload}
                                isLoading={pdfLoading}
                                error={pdfError}
                                onPrepare={loadPdfData}
                            />
                            {isAdmin && (
                                <>
                                    <Link href={route('vehicles.edit', vehicle.id)}>
                                        <Button type="button" variant="outline">
                                            Edit
                                        </Button>
                                    </Link>
                                    {vehicle.status !== 'SOLD' && (
                                        <Link
                                            href={route(
                                                'vehicles.sales.create',
                                                vehicle.id,
                                            )}
                                        >
                                            <Button type="button">
                                                Terjual
                                            </Button>
                                        </Link>
                                    )}
                                </>
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
                        {vehicle.cover_photo_url ? (
                            <img
                                src={vehicle.cover_photo_url}
                                alt={`${vehicle.brand} ${vehicle.type} ${vehicle.plate_number}`}
                                className="aspect-[4/3] w-full object-cover"
                            />
                        ) : (
                            <div className="flex aspect-[4/3] items-center justify-center bg-neutral-100 text-sm font-medium text-neutral-500">
                                Foto kendaraan belum tersedia
                            </div>
                        )}
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

                                    <FormField
                                        label="Tanggal Biaya *"
                                        htmlFor="cost_date"
                                        error={costForm.errors.cost_date}
                                    >
                                        <TextInput
                                            id="cost_date"
                                            type="date"
                                            value={costForm.data.cost_date}
                                            onChange={(event) =>
                                                costForm.setData(
                                                    'cost_date',
                                                    event.target.value,
                                                )
                                            }
                                            required
                                        />
                                    </FormField>

                                    <FormField
                                        label="Kategori *"
                                        htmlFor="category"
                                        error={costForm.errors.category}
                                    >
                                        <SelectInput
                                            id="category"
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
                                        </SelectInput>
                                    </FormField>

                                    <FormField
                                        label="Nominal *"
                                        htmlFor="amount"
                                        error={costForm.errors.amount}
                                    >
                                        <TextInput
                                            id="amount"
                                            type="number"
                                            min="0"
                                            value={costForm.data.amount}
                                            onChange={(event) =>
                                                costForm.setData(
                                                    'amount',
                                                    event.target.value,
                                                )
                                            }
                                            required
                                        />
                                    </FormField>

                                    <FormField
                                        label="Keterangan"
                                        htmlFor="description"
                                        error={costForm.errors.description}
                                    >
                                        <textarea
                                            id="description"
                                            className="block min-h-24 w-full rounded-md border-neutral-300 shadow-sm focus:border-brand-yellow-500 focus:ring-brand-yellow-500"
                                            value={costForm.data.description}
                                            onChange={(event) =>
                                                costForm.setData(
                                                    'description',
                                                    event.target.value,
                                                )
                                            }
                                        />
                                    </FormField>

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
                                <DataTable
                                    rows={vehicle.costs}
                                    columns={costColumns}
                                    getRowKey={(cost) => cost.id}
                                    minWidth="min-w-[720px]"
                                />
                            )}
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-6 xl:grid-cols-2">
                    <PhotoGallery
                        vehicleId={vehicle.id}
                        photos={vehicle.photos}
                        canManage={isAdmin}
                    />

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

function VehiclePdfExportButton({
    payload,
    isLoading,
    error,
    onPrepare,
}: {
    payload: VehiclePdfPayload | null;
    isLoading: boolean;
    error: string | null;
    onPrepare: () => void;
}) {
    if (payload) {
        return (
            <Suspense
                fallback={
                    <span className={pdfLinkClasses('pointer-events-none opacity-70')}>
                        Menyiapkan PDF
                    </span>
                }
            >
                <VehiclePdfDownloadAction
                    payload={payload}
                    className={pdfLinkClasses()}
                />
            </Suspense>
        );
    }

    return (
        <div className="flex items-center gap-2">
            <Button
                type="button"
                variant="outline"
                onClick={onPrepare}
                disabled={isLoading}
                isLoading={isLoading}
            >
                PDF Internal
            </Button>
            {error && <span className="text-xs text-red-600">{error}</span>}
        </div>
    );
}

function pdfLinkClasses(extra = '') {
    return [
        'inline-flex h-10 items-center justify-center rounded-md border border-neutral-300 bg-surface px-4 text-sm font-medium text-neutral-900 transition duration-150 hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-brand-yellow-500 focus:ring-offset-2',
        extra,
    ]
        .filter(Boolean)
        .join(' ');
}

function PhotoGallery({
    vehicleId,
    photos,
    canManage,
}: {
    vehicleId: number;
    photos: VehiclePhoto[];
    canManage: boolean;
}) {
    const form = useForm<{ photos: File[] }>({
        photos: [],
    });

    const submit: FormEventHandler = (event) => {
        event.preventDefault();

        form.post(route('vehicles.photos.store', vehicleId), {
            preserveScroll: true,
            forceFormData: true,
            onSuccess: () => form.reset('photos'),
        });
    };

    return (
        <Card>
            <CardContent className="space-y-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <CardTitle>Foto Kendaraan</CardTitle>
                        <p className="mt-1 text-sm text-neutral-500">
                            Foto internal untuk inventory showroom.
                        </p>
                    </div>
                    <span className="inline-flex rounded-md border border-neutral-200 bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-700">
                        {photos.length}/5 foto
                    </span>
                </div>

                {photos.length === 0 ? (
                    <EmptyState
                        title="Belum ada foto kendaraan."
                        description="Foto kendaraan akan tampil sebagai cover di daftar kendaraan."
                    />
                ) : (
                    <div className="grid gap-3 sm:grid-cols-2">
                        {photos.map((photo) => (
                            <PhotoCard
                                key={photo.id}
                                vehicleId={vehicleId}
                                photo={photo}
                                canManage={canManage}
                            />
                        ))}
                    </div>
                )}

                {canManage && photos.length < 5 && (
                    <form
                        onSubmit={submit}
                        className="space-y-4 border-t border-neutral-200 pt-5"
                    >
                        <div>
                            <InputLabel
                                htmlFor="vehicle-photos"
                                value="Tambah Foto"
                            />
                            <input
                                id="vehicle-photos"
                                type="file"
                                accept=".jpg,.jpeg,.png,.webp"
                                multiple
                                className="mt-1 block w-full rounded-md border border-neutral-300 bg-surface text-sm text-neutral-700 file:mr-4 file:border-0 file:bg-brand-black file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-brand-black-soft focus:outline-none focus:ring-2 focus:ring-brand-yellow-500"
                                onChange={(event) =>
                                    form.setData(
                                        'photos',
                                        Array.from(event.target.files ?? []),
                                    )
                                }
                            />
                            <InputError
                                className="mt-2"
                                message={form.errors.photos}
                            />
                            <p className="mt-2 text-xs text-neutral-500">
                                Maksimal 5 foto, 5 MB per foto.
                            </p>
                        </div>

                        <Button
                            type="submit"
                            disabled={
                                form.processing || form.data.photos.length === 0
                            }
                            isLoading={form.processing}
                        >
                            Tambah Foto
                        </Button>
                    </form>
                )}
            </CardContent>
        </Card>
    );
}

function PhotoCard({
    vehicleId,
    photo,
    canManage,
}: {
    vehicleId: number;
    photo: VehiclePhoto;
    canManage: boolean;
}) {
    const coverForm = useForm({});
    const deleteForm = useForm({});

    return (
        <div className="overflow-hidden rounded-md border border-neutral-200 bg-surface">
            <img
                src={photo.view_url}
                alt={photo.original_name ?? 'Foto kendaraan'}
                className="aspect-[4/3] w-full object-cover"
            />
            <div className="space-y-3 p-3">
                <div className="flex items-center justify-between gap-3">
                    <p className="truncate text-sm font-medium text-neutral-800">
                        {photo.original_name ?? 'Foto kendaraan'}
                    </p>
                    {photo.is_cover && (
                        <span className="shrink-0 rounded-md border border-brand-yellow-400/40 bg-brand-yellow-400/20 px-2 py-0.5 text-xs font-medium text-brand-black">
                            Cover
                        </span>
                    )}
                </div>

                {canManage && (
                    <div className="flex flex-wrap gap-2">
                        {!photo.is_cover && (
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                disabled={coverForm.processing}
                                isLoading={coverForm.processing}
                                onClick={() =>
                                    coverForm.patch(
                                        route('vehicles.photos.cover', [
                                            vehicleId,
                                            photo.id,
                                        ]),
                                        { preserveScroll: true },
                                    )
                                }
                            >
                                Jadikan Cover
                            </Button>
                        )}
                        <Button
                            type="button"
                            variant="danger"
                            size="sm"
                            disabled={deleteForm.processing}
                            isLoading={deleteForm.processing}
                            onClick={() =>
                                deleteForm.delete(
                                    route('vehicles.photos.destroy', [
                                        vehicleId,
                                        photo.id,
                                    ]),
                                    { preserveScroll: true },
                                )
                            }
                        >
                            Hapus
                        </Button>
                    </div>
                )}
            </div>
        </div>
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
                                className="rounded-sm border-neutral-300 text-brand-yellow-500 focus:ring-brand-yellow-500"
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
                                className="mt-1 block w-full rounded-md border border-neutral-300 bg-surface text-sm text-neutral-700 file:mr-4 file:border-0 file:bg-brand-black file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-brand-black-soft focus:outline-none focus:ring-2 focus:ring-brand-yellow-500"
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
                                className="mt-1 block min-h-20 w-full rounded-md border-neutral-300 shadow-sm focus:border-brand-yellow-500 focus:ring-brand-yellow-500"
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
