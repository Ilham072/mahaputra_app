import Button from '@/Components/Button';
import { Card, CardContent, CardTitle } from '@/Components/Card';
import CurrencyDisplay from '@/Components/CurrencyDisplay';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PageHeader from '@/Components/PageHeader';
import TextInput from '@/Components/TextInput';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler, ReactNode } from 'react';
import { VehicleDetail, VehicleOptions } from './types';

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

    const showroomCapital = Number(form.data.showroom_capital || 0);
    const collaboratorCapital =
        form.data.capital_type === 'UMUM'
            ? Number(form.data.collaborator_capital || 0)
            : 0;
    const initialCapital = showroomCapital + collaboratorCapital;

    const submit: FormEventHandler = (event) => {
        event.preventDefault();

        const data = {
            ...form.data,
            collaborator_name:
                form.data.capital_type === 'UMUM'
                    ? form.data.collaborator_name
                    : '',
            collaborator_capital:
                form.data.capital_type === 'UMUM'
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
                    description="Input data inventory kendaraan showroom"
                />
            }
        >
            <Head
                title={
                    mode === 'edit' ? 'Edit Kendaraan' : 'Tambah Kendaraan'
                }
            />

            <form onSubmit={submit} className="space-y-6">
                <Card>
                    <CardContent className="space-y-5">
                        <CardTitle>Informasi Kendaraan</CardTitle>
                        <div className="grid gap-5 md:grid-cols-2">
                            <Field label="Tanggal Pembelian" error={form.errors.purchase_date}>
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
                            </Field>

                            <Field label="Merk" error={form.errors.brand_id}>
                                <select
                                    className="block w-full rounded-md border-neutral-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500"
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
                                </select>
                            </Field>

                            <Field label="Tipe" error={form.errors.type}>
                                <TextInput
                                    className="block w-full"
                                    value={form.data.type}
                                    onChange={(event) =>
                                        form.setData('type', event.target.value)
                                    }
                                    required
                                />
                            </Field>

                            <Field label="No Polisi" error={form.errors.plate_number}>
                                <TextInput
                                    className="block w-full uppercase"
                                    value={form.data.plate_number}
                                    onChange={(event) =>
                                        form.setData(
                                            'plate_number',
                                            event.target.value.toUpperCase(),
                                        )
                                    }
                                    required
                                />
                            </Field>

                            <Field label="Tahun" error={form.errors.year}>
                                <TextInput
                                    type="number"
                                    className="block w-full"
                                    value={form.data.year}
                                    onChange={(event) =>
                                        form.setData('year', event.target.value)
                                    }
                                    required
                                />
                            </Field>

                            <Field label="Warna" error={form.errors.color}>
                                <TextInput
                                    className="block w-full"
                                    value={form.data.color}
                                    onChange={(event) =>
                                        form.setData('color', event.target.value)
                                    }
                                    required
                                />
                            </Field>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="space-y-5">
                        <CardTitle>Dokumen dan Pajak</CardTitle>
                        <div className="grid gap-5 md:grid-cols-2">
                            <Field label="Status Pajak" error={form.errors.tax_status}>
                                <select
                                    className="block w-full rounded-md border-neutral-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500"
                                    value={form.data.tax_status}
                                    onChange={(event) =>
                                        form.setData(
                                            'tax_status',
                                            event.target
                                                .value as VehicleFormData['tax_status'],
                                        )
                                    }
                                >
                                    {options.taxStatuses.map((status) => (
                                        <option
                                            key={status.value}
                                            value={status.value}
                                        >
                                            {status.label}
                                        </option>
                                    ))}
                                </select>
                            </Field>

                            <Field label="Nominal Pajak" error={form.errors.tax_amount}>
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
                            </Field>
                        </div>

                        {mode === 'create' && (
                            <Field label="Foto Kendaraan" error={form.errors.photos}>
                                <input
                                    type="file"
                                    accept=".jpg,.jpeg,.png,.webp"
                                    multiple
                                    className="block w-full rounded-md border border-neutral-300 bg-white text-sm text-neutral-700 file:mr-4 file:border-0 file:bg-neutral-950 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                    onChange={(event) =>
                                        form.setData(
                                            'photos',
                                            Array.from(
                                                event.target.files ?? [],
                                            ),
                                        )
                                    }
                                />
                                <p className="mt-2 text-xs text-neutral-500">
                                    Maksimal 5 foto, 5 MB per foto. Foto pertama
                                    menjadi cover.
                                </p>
                            </Field>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="space-y-5">
                        <CardTitle>Sumber Modal</CardTitle>
                        <div className="grid gap-5 md:grid-cols-2">
                            <Field label="Jenis Modal" error={form.errors.capital_type}>
                                <select
                                    className="block w-full rounded-md border-neutral-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500"
                                    value={form.data.capital_type}
                                    onChange={(event) =>
                                        form.setData(
                                            'capital_type',
                                            event.target
                                                .value as VehicleFormData['capital_type'],
                                        )
                                    }
                                >
                                    {options.capitalTypes.map((type) => (
                                        <option key={type.value} value={type.value}>
                                            {type.label}
                                        </option>
                                    ))}
                                </select>
                            </Field>

                            <Field
                                label="Modal Showroom"
                                error={form.errors.showroom_capital}
                            >
                                <TextInput
                                    type="number"
                                    min="0"
                                    className="block w-full"
                                    value={form.data.showroom_capital}
                                    onChange={(event) =>
                                        form.setData(
                                            'showroom_capital',
                                            event.target.value,
                                        )
                                    }
                                    required
                                />
                            </Field>

                            {form.data.capital_type === 'UMUM' && (
                                <>
                                    <Field
                                        label="Nama Kolaborator"
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
                                    </Field>

                                    <Field
                                        label="Modal Kolaborator"
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
                                    </Field>
                                </>
                            )}
                        </div>

                        <div className="rounded-md border border-neutral-200 bg-neutral-50 p-4">
                            <div className="text-sm font-medium text-neutral-500">
                                Total Modal Awal
                            </div>
                            <CurrencyDisplay
                                value={initialCapital}
                                className="mt-1 block text-2xl font-bold text-neutral-950"
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="space-y-5">
                        <CardTitle>Harga dan Status</CardTitle>
                        <div className="grid gap-5 md:grid-cols-2">
                            <Field
                                label="Harga Penawaran"
                                error={form.errors.asking_price}
                            >
                                <TextInput
                                    type="number"
                                    min="0"
                                    className="block w-full"
                                    value={form.data.asking_price}
                                    onChange={(event) =>
                                        form.setData(
                                            'asking_price',
                                            event.target.value,
                                        )
                                    }
                                    required
                                />
                            </Field>

                            <Field label="Status" error={form.errors.status}>
                                <select
                                    className="block w-full rounded-md border-neutral-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500"
                                    value={form.data.status}
                                    onChange={(event) =>
                                        form.setData(
                                            'status',
                                            event.target
                                                .value as VehicleFormData['status'],
                                        )
                                    }
                                >
                                    {options.statuses.map((status) => (
                                        <option
                                            key={status.value}
                                            value={status.value}
                                        >
                                            {status.label}
                                        </option>
                                    ))}
                                </select>
                            </Field>
                        </div>
                    </CardContent>
                </Card>

                <div className="sticky bottom-0 flex justify-end gap-3 border-t border-neutral-200 bg-neutral-50 py-4">
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

function Field({
    label,
    error,
    children,
}: {
    label: string;
    error?: string;
    children: ReactNode;
}) {
    return (
        <div>
            <InputLabel value={label} />
            <div className="mt-1">{children}</div>
            <InputError className="mt-2" message={error} />
        </div>
    );
}
