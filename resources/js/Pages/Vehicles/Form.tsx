import Button from '@/Components/Button';
import { Card, CardContent, CardTitle } from '@/Components/Card';
import FormField from '@/Components/FormField';
import PageHeader from '@/Components/PageHeader';
import SelectInput from '@/Components/SelectInput';
import TextInput from '@/Components/TextInput';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import type { FormEventHandler, ReactNode } from 'react';
import type { VehicleDetail, VehicleOptions } from './types';

type VehicleFormProps = {
    mode: 'create' | 'edit';
    vehicle: VehicleDetail | null;
    options: VehicleOptions;
};

type VehicleFormData = {
    purchase_date: string;
    brand_id: string;
    type: string;
    plate_number: string;
    year: string;
    color: string;
    capital_type: 'UMUM' | 'KHUSUS';
    showroom_capital: string;
    collaborator_name: string;
    collaborator_capital: string;
    tax_status: 'ON' | 'OFF';
    tax_amount: string;
    asking_price: string;
    status: 'PREPARATION' | 'READY' | 'BOOKING' | 'SOLD';
    photos: File[];
};

export default function VehicleForm({
    mode,
    vehicle,
    options,
}: VehicleFormProps) {
    const form = useForm<VehicleFormData>({
        purchase_date: vehicle?.purchase_date ?? '',
        brand_id: vehicle?.brand_id ? String(vehicle.brand_id) : '',
        type: vehicle?.type ?? '',
        plate_number: vehicle?.plate_number ?? '',
        year: vehicle?.year ? String(vehicle.year) : '',
        color: vehicle?.color ?? '',
        capital_type: vehicle?.capital_type ?? 'KHUSUS',
        showroom_capital: vehicle?.showroom_capital
            ? String(vehicle.showroom_capital)
            : '',
        collaborator_name: vehicle?.collaborator_name ?? '',
        collaborator_capital: vehicle?.collaborator_capital
            ? String(vehicle.collaborator_capital)
            : '',
        tax_status: vehicle?.tax_status ?? 'ON',
        tax_amount: vehicle?.tax_amount ? String(vehicle.tax_amount) : '0',
        asking_price: vehicle?.asking_price ? String(vehicle.asking_price) : '',
        status: vehicle?.status ?? 'PREPARATION',
        photos: [],
    });

    const submit: FormEventHandler = (event) => {
        event.preventDefault();

        const data = {
            ...form.data,
            collaborator_name:
                form.data.capital_type === 'KHUSUS'
                    ? form.data.collaborator_name
                    : '',
            collaborator_capital:
                form.data.capital_type === 'KHUSUS'
                    ? form.data.collaborator_capital
                    : '',
        };

        form.transform(() => data);

        if (mode === 'edit' && vehicle) {
            form.patch(route('vehicles.update', vehicle.id));

            return;
        }

        form.post(route('vehicles.store'), {
            forceFormData: true,
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <PageHeader
                    title={
                        mode === 'edit'
                            ? 'Edit Kendaraan'
                            : 'Tambah Kendaraan'
                    }
                    description={
                        mode === 'edit'
                            ? 'Perbarui data kendaraan showroom.'
                            : 'Tambahkan kendaraan baru ke inventory showroom.'
                    }
                    actions={
                        <Link href={route('vehicles.index')}>
                            <Button type="button" variant="outline">
                                <BackIcon className="h-4 w-4" />
                                Inventory
                            </Button>
                        </Link>
                    }
                />
            }
        >
            <Head
                title={
                    mode === 'edit' ? 'Edit Kendaraan' : 'Tambah Kendaraan'
                }
            />

            <form
                onSubmit={submit}
                className="mx-auto max-w-4xl space-y-5 lg:space-y-6"
            >
                <Card>
                    <CardContent className="space-y-5 sm:p-6">
                        <SectionTitle>Informasi Kendaraan</SectionTitle>
                        <div className="grid gap-5 md:grid-cols-2">
                            <FormField
                                label="Tanggal Pembelian *"
                                error={form.errors.purchase_date}
                            >
                                <TextInput
                                    type="date"
                                    className="block w-full"
                                    value={form.data.purchase_date}
                                    onChange={(event) =>
                                        form.setData(
                                            'purchase_date',
                                            event.target.value,
                                        )
                                    }
                                    required
                                />
                            </FormField>

                            <FormField label="Merk *" error={form.errors.brand_id}>
                                <SelectInput
                                    value={form.data.brand_id}
                                    onChange={(event) =>
                                        form.setData(
                                            'brand_id',
                                            event.target.value,
                                        )
                                    }
                                    required
                                >
                                    <option value="">Pilih merk</option>
                                    {options.brands.map((brand) => (
                                        <option key={brand.id} value={brand.id}>
                                            {brand.name}
                                        </option>
                                    ))}
                                </SelectInput>
                            </FormField>

                            <FormField label="Tipe / Model *" error={form.errors.type}>
                                <TextInput
                                    className="block w-full"
                                    placeholder="Avanza G MT"
                                    value={form.data.type}
                                    onChange={(event) =>
                                        form.setData('type', event.target.value)
                                    }
                                    required
                                />
                            </FormField>

                            <FormField
                                label="Nomor Polisi *"
                                error={form.errors.plate_number}
                            >
                                <TextInput
                                    className="block w-full uppercase"
                                    placeholder="DD 1234 GT"
                                    value={form.data.plate_number}
                                    onChange={(event) =>
                                        form.setData(
                                            'plate_number',
                                            event.target.value.toUpperCase(),
                                        )
                                    }
                                    required
                                />
                            </FormField>

                            <FormField label="Tahun *" error={form.errors.year}>
                                <TextInput
                                    type="number"
                                    className="block w-full"
                                    placeholder="2020"
                                    value={form.data.year}
                                    onChange={(event) =>
                                        form.setData('year', event.target.value)
                                    }
                                    required
                                />
                            </FormField>

                            <FormField label="Warna *" error={form.errors.color}>
                                <TextInput
                                    className="block w-full"
                                    placeholder="Putih"
                                    value={form.data.color}
                                    onChange={(event) =>
                                        form.setData('color', event.target.value)
                                    }
                                    required
                                />
                            </FormField>
                        </div>
                    </CardContent>
                </Card>

                {mode === 'create' && (
                    <Card>
                        <CardContent className="space-y-5 sm:p-6">
                            <SectionTitle>Foto Kendaraan</SectionTitle>
                            <FormField
                                label="Upload foto"
                                error={form.errors.photos}
                                className="sr-only"
                            >
                                <span />
                            </FormField>
                            <label className="flex min-h-40 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-neutral-300 bg-neutral-50 px-6 py-8 text-center transition hover:border-brand-yellow-500 hover:bg-brand-yellow-50/50 focus-within:border-brand-yellow-500 focus-within:ring-2 focus-within:ring-brand-yellow-500">
                                <input
                                    type="file"
                                    accept=".jpg,.jpeg,.png,.webp"
                                    multiple
                                    className="sr-only"
                                    onChange={(event) =>
                                        form.setData(
                                            'photos',
                                            Array.from(
                                                event.target.files ?? [],
                                            ),
                                        )
                                    }
                                />
                                <ImageIcon className="h-8 w-8 text-neutral-400" />
                                <span className="mt-3 text-sm font-semibold text-neutral-700">
                                    Upload Foto Kendaraan
                                </span>
                                <span className="mt-1 text-sm text-neutral-500">
                                    Tarik foto ke sini atau{' '}
                                    <span className="font-semibold text-brand-yellow-700">
                                        pilih dari perangkat
                                    </span>
                                </span>
                                <span className="mt-2 text-xs text-neutral-400">
                                    Maksimal 5 foto. JPG/PNG/WebP. Maks. 5 MB per
                                    foto.
                                </span>
                            </label>
                            {form.errors.photos && (
                                <p className="text-sm text-red-600">
                                    {form.errors.photos}
                                </p>
                            )}
                        </CardContent>
                    </Card>
                )}

                <Card>
                    <CardContent className="space-y-5 sm:p-6">
                        <SectionTitle>Dokumen & Pajak</SectionTitle>
                        <FormField
                            label="Status Pajak *"
                            error={form.errors.tax_status}
                        >
                            <div className="grid gap-3 md:grid-cols-2">
                                {options.taxStatuses.map((status) => (
                                    <OptionCard
                                        key={status.value}
                                        active={
                                            form.data.tax_status ===
                                            status.value
                                        }
                                        title={`Pajak ${status.label}`}
                                        description={
                                            status.value === 'ON'
                                                ? 'Tidak ada tunggakan pajak'
                                                : 'Ada tunggakan pajak'
                                        }
                                        onClick={() =>
                                            form.setData(
                                                'tax_status',
                                                status.value as VehicleFormData['tax_status'],
                                            )
                                        }
                                    />
                                ))}
                            </div>
                        </FormField>

                        {form.data.tax_status === 'OFF' && (
                            <FormField
                                label="Nominal Pajak"
                                error={form.errors.tax_amount}
                            >
                                <TextInput
                                    type="number"
                                    min="0"
                                    className="block w-full"
                                    value={form.data.tax_amount}
                                    onChange={(event) =>
                                        form.setData(
                                            'tax_amount',
                                            event.target.value,
                                        )
                                    }
                                />
                            </FormField>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="space-y-5 sm:p-6">
                        <SectionTitle>Sumber Modal</SectionTitle>
                        <FormField
                            label="Jenis Modal *"
                            error={form.errors.capital_type}
                        >
                            <div className="grid gap-3 md:grid-cols-2">
                                {options.capitalTypes.map((type) => (
                                    <OptionCard
                                        key={type.value}
                                        active={
                                            form.data.capital_type ===
                                            type.value
                                        }
                                        title={type.label}
                                        description={capitalTypeDescription(
                                            type.value,
                                        )}
                                        onClick={() =>
                                            form.setData(
                                                'capital_type',
                                                type.value as VehicleFormData['capital_type'],
                                            )
                                        }
                                    />
                                ))}
                            </div>
                        </FormField>

                        <div className="grid gap-5 md:grid-cols-2">
                            <FormField
                                label="Modal Showroom *"
                                error={form.errors.showroom_capital}
                                className="md:col-span-2"
                            >
                                <TextInput
                                    type="number"
                                    min="0"
                                    className="block w-full"
                                    placeholder="95000000"
                                    value={form.data.showroom_capital}
                                    onChange={(event) =>
                                        form.setData(
                                            'showroom_capital',
                                            event.target.value,
                                        )
                                    }
                                    required
                                />
                            </FormField>

                            {form.data.capital_type === 'KHUSUS' && (
                                <>
                                    <FormField
                                        label="Nama Kolaborator *"
                                        error={form.errors.collaborator_name}
                                    >
                                        <TextInput
                                            className="block w-full"
                                            value={form.data.collaborator_name}
                                            onChange={(event) =>
                                                form.setData(
                                                    'collaborator_name',
                                                    event.target.value,
                                                )
                                            }
                                            required
                                        />
                                    </FormField>

                                    <FormField
                                        label="Modal Kolaborator *"
                                        error={form.errors.collaborator_capital}
                                    >
                                        <TextInput
                                            type="number"
                                            min="1"
                                            className="block w-full"
                                            value={form.data.collaborator_capital}
                                            onChange={(event) =>
                                                form.setData(
                                                    'collaborator_capital',
                                                    event.target.value,
                                                )
                                            }
                                            required
                                        />
                                    </FormField>
                                </>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="space-y-5 sm:p-6">
                        <SectionTitle>Harga & Status</SectionTitle>
                        <div className="grid gap-5 md:grid-cols-2">
                            <FormField
                                label="Harga Penawaran *"
                                error={form.errors.asking_price}
                            >
                                <TextInput
                                    type="number"
                                    min="0"
                                    className="block w-full"
                                    placeholder="145000000"
                                    value={form.data.asking_price}
                                    onChange={(event) =>
                                        form.setData(
                                            'asking_price',
                                            event.target.value,
                                        )
                                    }
                                    required
                                />
                            </FormField>

                            <FormField
                                label="Status Kendaraan *"
                                error={form.errors.status}
                                helpText="Kendaraan baru biasanya dimulai dari Persiapan."
                            >
                                <div className="grid gap-3 sm:grid-cols-2">
                                    {options.statuses.map((status) => (
                                        <OptionCard
                                            key={status.value}
                                            active={
                                                form.data.status ===
                                                status.value
                                            }
                                            title={status.label}
                                            description={statusDescription(
                                                status.value,
                                            )}
                                            onClick={() =>
                                                form.setData(
                                                    'status',
                                                    status.value as VehicleFormData['status'],
                                                )
                                            }
                                        />
                                    ))}
                                </div>
                            </FormField>
                        </div>
                    </CardContent>
                </Card>

                <div className="sticky bottom-0 flex justify-end gap-3 border-t border-neutral-200 bg-neutral-50/95 py-4 backdrop-blur">
                    <Link
                        href={
                            vehicle
                                ? route('vehicles.show', vehicle.id)
                                : route('vehicles.index')
                        }
                    >
                        <Button type="button" variant="outline">
                            Batal
                        </Button>
                    </Link>
                    <Button
                        type="submit"
                        disabled={form.processing || options.brands.length === 0}
                        isLoading={form.processing}
                    >
                        Simpan Kendaraan
                    </Button>
                </div>
            </form>
        </AuthenticatedLayout>
    );
}

function SectionTitle({ children }: { children: ReactNode }) {
    return (
        <div className="border-b border-neutral-200 pb-4">
            <CardTitle className="text-sm font-bold uppercase tracking-wide text-neutral-600">
                {children}
            </CardTitle>
        </div>
    );
}

function OptionCard({
    active,
    title,
    description,
    onClick,
}: {
    active: boolean;
    title: string;
    description: string;
    onClick: () => void;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={[
                'flex min-h-20 flex-col items-center justify-center rounded-md border px-4 py-3 text-center transition focus:outline-none focus:ring-2 focus:ring-brand-yellow-500 focus:ring-offset-2',
                active
                    ? 'border-brand-yellow-500 bg-brand-yellow-50 text-brand-black'
                    : 'border-neutral-200 bg-surface text-neutral-500 hover:border-neutral-300 hover:bg-neutral-50',
            ].join(' ')}
        >
            <span className="text-sm font-bold uppercase text-neutral-950">
                {title}
            </span>
            <span className="mt-1 text-xs text-neutral-500">{description}</span>
            {active && (
                <span className="mt-2 flex h-5 w-5 items-center justify-center rounded-full bg-brand-yellow-500 text-brand-black">
                    <CheckIcon className="h-3.5 w-3.5" />
                </span>
            )}
        </button>
    );
}

function capitalTypeDescription(value: string) {
    if (value === 'UMUM') {
        return 'Modal dari showroom';
    }

    return 'Showroom + kolaborator';
}

function statusDescription(value: string) {
    const descriptions: Record<string, string> = {
        PREPARATION: 'Belum siap dipasarkan',
        READY: 'Siap ditawarkan',
        BOOKING: 'Sedang dibooking',
        SOLD: 'Sudah terjual',
    };

    return descriptions[value] ?? 'Status kendaraan';
}

function BackIcon({ className = '' }: { className?: string }) {
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
            <path d="M19 12H5" />
            <path d="m12 19-7-7 7-7" />
        </svg>
    );
}

function ImageIcon({ className = '' }: { className?: string }) {
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
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="9" cy="9" r="2" />
            <path d="m21 15-3.1-3.1a2 2 0 0 0-2.8 0L6 21" />
        </svg>
    );
}

function CheckIcon({ className = '' }: { className?: string }) {
    return (
        <svg
            aria-hidden="true"
            viewBox="0 0 20 20"
            fill="currentColor"
            className={className}
        >
            <path
                fillRule="evenodd"
                d="M16.7 5.3a1 1 0 0 1 0 1.4l-7.5 7.5a1 1 0 0 1-1.4 0L3.3 9.7a1 1 0 0 1 1.4-1.4l3.8 3.8 6.8-6.8a1 1 0 0 1 1.4 0Z"
                clipRule="evenodd"
            />
        </svg>
    );
}
