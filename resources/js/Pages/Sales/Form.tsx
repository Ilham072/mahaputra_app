import Button from '@/Components/Button';
import { Card, CardContent, CardTitle } from '@/Components/Card';
import CurrencyDisplay from '@/Components/CurrencyDisplay';
import FormField from '@/Components/FormField';
import PageHeader from '@/Components/PageHeader';
import SelectInput from '@/Components/SelectInput';
import StatusBadge from '@/Components/StatusBadge';
import TextInput from '@/Components/TextInput';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { cn } from '@/lib/classNames';
import { Head, Link, useForm } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import type { FormEventHandler, ReactNode } from 'react';
import type {
    PaymentType,
    SaleCustomerOption,
    SaleFormModel,
    SaleOption,
    SaleVehicleContext,
} from './types';

type SaleFormProps = {
    mode: 'create' | 'edit';
    vehicle: SaleVehicleContext;
    sale: SaleFormModel | null;
    options: {
        areas: SaleOption[];
        customers: SaleCustomerOption[];
        employees: SaleOption[];
        financingProviders: SaleOption[];
        paymentTypes: Array<{ value: PaymentType; label: string }>;
    };
};

export default function SaleForm({ mode, vehicle, sale, options }: SaleFormProps) {
    const [customerSearch, setCustomerSearch] = useState('');
    const [showCustomerForm, setShowCustomerForm] = useState(mode === 'edit');
    const form = useForm<{
        sale_date: string;
        employee_id: string;
        area_id: string;
        customer_name: string;
        customer_whatsapp: string;
        customer_alternative_whatsapp: string;
        customer_address: string;
        customer_ktp: File | null;
        payment_type: PaymentType;
        selling_price: string;
        financing_provider_id: string;
        dp: string;
        outstanding_dp: string;
        financing_disbursement: string;
        refund: string;
    }>({
        sale_date: sale?.sale_date ?? new Date().toISOString().slice(0, 10),
        employee_id: sale?.employee_id ? String(sale.employee_id) : '',
        area_id: sale?.area_id ? String(sale.area_id) : '',
        customer_name: sale?.customer_name ?? '',
        customer_whatsapp: sale?.customer_whatsapp ?? '',
        customer_alternative_whatsapp: sale?.customer_alternative_whatsapp ?? '',
        customer_address: sale?.customer_address ?? '',
        customer_ktp: null,
        payment_type: sale?.payment_type ?? 'CASH',
        selling_price: sale?.selling_price
            ? String(sale.selling_price)
            : String(vehicle.asking_price),
        financing_provider_id: sale?.financing_provider_id
            ? String(sale.financing_provider_id)
            : '',
        dp: sale ? String(sale.dp) : '0',
        outstanding_dp: sale ? String(sale.outstanding_dp) : '0',
        financing_disbursement: sale ? String(sale.financing_disbursement) : '0',
        refund: sale ? String(sale.refund) : '0',
    });

    const sellingPrice = Number(form.data.selling_price || 0);
    const creditTotal =
        Number(form.data.dp || 0) +
        Number(form.data.outstanding_dp || 0) +
        Number(form.data.financing_disbursement || 0) +
        Number(form.data.refund || 0);
    const transactionValue =
        form.data.payment_type === 'CREDIT' ? creditTotal : sellingPrice;
    const profit = transactionValue - vehicle.final_capital;
    const hasSummaryValue = transactionValue > 0;
    const normalizedCustomerSearch = customerSearch.trim().toLowerCase();
    const canSearchCustomers = normalizedCustomerSearch.length >= 2;
    const filteredCustomers = useMemo(() => {
        if (!canSearchCustomers) {
            return [];
        }

        return options.customers
            .filter((customer) => {
                const haystack = [
                    customer.name,
                    customer.whatsapp,
                    customer.alternative_whatsapp ?? '',
                    customer.address,
                ]
                    .join(' ')
                    .toLowerCase();

                return haystack.includes(normalizedCustomerSearch);
            })
            .slice(0, 6);
    }, [canSearchCustomers, normalizedCustomerSearch, options.customers]);

    const selectCustomer = (customer: SaleCustomerOption) => {
        form.setData({
            ...form.data,
            customer_name: customer.name,
            customer_whatsapp: customer.whatsapp,
            customer_alternative_whatsapp: customer.alternative_whatsapp ?? '',
            customer_address: customer.address,
        });
        setCustomerSearch(`${customer.name} - ${customer.whatsapp}`);
        setShowCustomerForm(true);
    };

    const startNewCustomer = () => {
        form.setData({
            ...form.data,
            customer_name: '',
            customer_whatsapp: '',
            customer_alternative_whatsapp: '',
            customer_address: '',
            customer_ktp: null,
        });
        setCustomerSearch('');
        setShowCustomerForm(true);
    };

    const submit: FormEventHandler = (event) => {
        event.preventDefault();

        const data = {
            ...form.data,
            financing_provider_id:
                form.data.payment_type === 'CREDIT'
                    ? form.data.financing_provider_id
                    : '',
            dp: form.data.payment_type === 'CREDIT' ? form.data.dp : '',
            outstanding_dp:
                form.data.payment_type === 'CREDIT'
                    ? form.data.outstanding_dp
                    : '',
            financing_disbursement:
                form.data.payment_type === 'CREDIT'
                    ? form.data.financing_disbursement
                    : '',
            refund:
                form.data.payment_type === 'CREDIT' ? form.data.refund : '',
        };

        if (mode === 'edit' && sale) {
            form.transform(() => ({
                ...data,
                _method: 'patch',
            }));
            form.post(route('sales.update', sale.id), {
                forceFormData: true,
            });

            return;
        }

        form.transform(() => data);
        form.post(route('vehicles.sales.store', vehicle.id), {
            forceFormData: true,
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <PageHeader
                    title={
                        mode === 'edit'
                            ? 'Edit Penjualan'
                            : 'Transaksi Penjualan'
                    }
                    description="Catat dan kelola transaksi penjualan"
                />
            }
        >
            <Head
                title={
                    mode === 'edit' ? 'Edit Penjualan' : 'Transaksi Penjualan'
                }
            />

            <form onSubmit={submit} className="space-y-5 lg:space-y-6">
                <SelectedVehicleCard vehicle={vehicle} mode={mode} sale={sale} />

                <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_405px] xl:grid-cols-[minmax(0,1fr)_405px]">
                    <div className="space-y-5">
                        <Card>
                            <CardContent className="space-y-5 sm:p-6">
                                <StepTitle step="2">Data Pembeli</StepTitle>

                                <label className="relative block">
                                    <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-400" />
                                    <TextInput
                                        type="search"
                                        placeholder="Cari nama atau nomor WhatsApp..."
                                        className="h-12 pl-12"
                                        value={customerSearch}
                                        onChange={(event) => {
                                            setCustomerSearch(
                                                event.target.value,
                                            );
                                            setShowCustomerForm(false);
                                        }}
                                    />
                                </label>

                                {!showCustomerForm && (
                                    <div className="space-y-3">
                                        {!canSearchCustomers && (
                                            <div className="rounded-md bg-neutral-50 px-4 py-3 text-sm text-neutral-500">
                                                Ketik minimal 2 karakter untuk
                                                mencari customer.
                                            </div>
                                        )}

                                        {canSearchCustomers &&
                                            filteredCustomers.length === 0 && (
                                                <div className="rounded-md bg-neutral-50 px-4 py-3 text-sm text-neutral-500">
                                                    Customer tidak ditemukan.
                                                    Klik Customer Baru untuk
                                                    mengisi data pembeli.
                                                </div>
                                            )}

                                        {filteredCustomers.length > 0 && (
                                            <div className="space-y-2">
                                                {filteredCustomers.map(
                                                    (customer) => (
                                                        <button
                                                            type="button"
                                                            key={customer.id}
                                                            className="flex w-full items-center justify-between gap-4 rounded-md border border-neutral-200 bg-surface px-4 py-3 text-left transition hover:border-brand-yellow-300 hover:bg-brand-yellow-50 focus:outline-none focus:ring-2 focus:ring-brand-yellow-500 focus:ring-offset-2"
                                                            onClick={() =>
                                                                selectCustomer(
                                                                    customer,
                                                                )
                                                            }
                                                        >
                                                            <span className="min-w-0">
                                                                <span className="block font-semibold text-neutral-950">
                                                                    {
                                                                        customer.name
                                                                    }
                                                                </span>
                                                                <span className="mt-1 block truncate text-sm text-neutral-500">
                                                                    {
                                                                        customer.whatsapp
                                                                    }
                                                                </span>
                                                            </span>
                                                            <span className="text-sm font-semibold text-brand-yellow-700">
                                                                Pilih
                                                            </span>
                                                        </button>
                                                    ),
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}

                                <button
                                    type="button"
                                    className="inline-flex h-10 w-fit items-center gap-2 rounded-md border border-neutral-300 bg-surface px-4 text-sm font-semibold text-neutral-800 transition hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-brand-yellow-500 focus:ring-offset-2"
                                    onClick={startNewCustomer}
                                >
                                    <PlusIcon className="h-4 w-4" />
                                    Customer Baru
                                </button>

                                {showCustomerForm && (
                                    <div className="grid gap-5 md:grid-cols-2">
                                        <FormField
                                            label="Nama Pembeli *"
                                            error={form.errors.customer_name}
                                        >
                                            <TextInput
                                                className="block w-full"
                                                value={form.data.customer_name}
                                                onChange={(event) =>
                                                    form.setData(
                                                        'customer_name',
                                                        event.target.value,
                                                    )
                                                }
                                                required
                                            />
                                        </FormField>
                                        <FormField
                                            label="WhatsApp *"
                                            error={form.errors.customer_whatsapp}
                                        >
                                            <TextInput
                                                className="block w-full"
                                                value={
                                                    form.data.customer_whatsapp
                                                }
                                                onChange={(event) =>
                                                    form.setData(
                                                        'customer_whatsapp',
                                                        event.target.value,
                                                    )
                                                }
                                                required
                                            />
                                        </FormField>
                                        <FormField
                                            label="WhatsApp Alternatif"
                                            error={
                                                form.errors
                                                    .customer_alternative_whatsapp
                                            }
                                        >
                                            <TextInput
                                                className="block w-full"
                                                value={
                                                    form.data
                                                        .customer_alternative_whatsapp
                                                }
                                                onChange={(event) =>
                                                    form.setData(
                                                        'customer_alternative_whatsapp',
                                                        event.target.value,
                                                    )
                                                }
                                            />
                                        </FormField>
                                        <FormField
                                            label={
                                                mode === 'edit'
                                                    ? 'Ganti KTP'
                                                    : 'KTP *'
                                            }
                                            error={form.errors.customer_ktp}
                                            helpText={
                                                mode === 'edit' &&
                                                sale?.customer_ktp_original_name
                                                    ? `File saat ini: ${sale.customer_ktp_original_name}`
                                                    : undefined
                                            }
                                        >
                                            <input
                                                type="file"
                                                accept=".jpg,.jpeg,.png,.webp,.pdf"
                                                className="block w-full rounded-md border border-neutral-300 bg-surface text-sm text-neutral-700 file:mr-4 file:border-0 file:bg-neutral-950 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-brand-yellow-500"
                                                onChange={(event) =>
                                                    form.setData(
                                                        'customer_ktp',
                                                        event.target.files?.[0] ??
                                                            null,
                                                    )
                                                }
                                                required={mode === 'create'}
                                            />
                                        </FormField>
                                        <div className="md:col-span-2">
                                            <FormField
                                                label="Alamat *"
                                                error={
                                                    form.errors.customer_address
                                                }
                                            >
                                                <textarea
                                                    className="block min-h-24 w-full rounded-md border-neutral-300 text-sm shadow-sm focus:border-brand-yellow-500 focus:ring-brand-yellow-500"
                                                    value={
                                                        form.data
                                                            .customer_address
                                                    }
                                                    onChange={(event) =>
                                                        form.setData(
                                                            'customer_address',
                                                            event.target.value,
                                                        )
                                                    }
                                                    required
                                                />
                                            </FormField>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="space-y-5 sm:p-6">
                                <StepTitle step="3">
                                    Informasi Penjualan
                                </StepTitle>
                                <div className="grid gap-5 md:grid-cols-2">
                                    <FormField
                                        label="Tanggal Penjualan *"
                                        error={form.errors.sale_date}
                                    >
                                        <TextInput
                                            type="date"
                                            className="block w-full"
                                            value={form.data.sale_date}
                                            onChange={(event) =>
                                                form.setData(
                                                    'sale_date',
                                                    event.target.value,
                                                )
                                            }
                                            required
                                        />
                                    </FormField>
                                    <FormField
                                        label="PIC *"
                                        error={form.errors.employee_id}
                                    >
                                        <SelectInput
                                            value={form.data.employee_id}
                                            onChange={(event) =>
                                                form.setData(
                                                    'employee_id',
                                                    event.target.value,
                                                )
                                            }
                                            required
                                        >
                                            <option value="">Pilih Karyawan</option>
                                            {options.employees.map((employee) => (
                                                <option
                                                    key={employee.id}
                                                    value={employee.id}
                                                >
                                                    {employee.name}
                                                </option>
                                            ))}
                                        </SelectInput>
                                    </FormField>
                                    <FormField
                                        label="Area *"
                                        error={form.errors.area_id}
                                    >
                                        <SelectInput
                                            value={form.data.area_id}
                                            onChange={(event) =>
                                                form.setData(
                                                    'area_id',
                                                    event.target.value,
                                                )
                                            }
                                            required
                                        >
                                            <option value="">Pilih Area</option>
                                            {options.areas.map((area) => (
                                                <option
                                                    key={area.id}
                                                    value={area.id}
                                                >
                                                    {area.name}
                                                </option>
                                            ))}
                                        </SelectInput>
                                    </FormField>
                                    <FormField
                                        label="Harga Jual *"
                                        error={form.errors.selling_price}
                                        helpText={`Harga Penawaran: ${formatRupiah(vehicle.asking_price)}`}
                                    >
                                        <TextInput
                                            type="number"
                                            min="0"
                                            className="block w-full"
                                            value={form.data.selling_price}
                                            onChange={(event) =>
                                                form.setData(
                                                    'selling_price',
                                                    event.target.value,
                                                )
                                            }
                                            required
                                        />
                                    </FormField>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-5">
                        <Card>
                            <CardContent className="space-y-5 sm:p-6">
                                <StepTitle step="4">
                                    Metode Pembayaran
                                </StepTitle>
                                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-2">
                                    {options.paymentTypes.map((type) => (
                                        <PaymentOption
                                            key={type.value}
                                            active={
                                                form.data.payment_type ===
                                                type.value
                                            }
                                            label={type.label}
                                            eyebrow={
                                                type.value === 'CASH'
                                                    ? 'Tunai'
                                                    : 'Non-tunai'
                                            }
                                            onClick={() =>
                                                form.setData(
                                                    'payment_type',
                                                    type.value,
                                                )
                                            }
                                        />
                                    ))}
                                </div>

                                {form.data.payment_type === 'CREDIT' && (
                                    <div className="space-y-4 border-t border-neutral-200 pt-5">
                                        <FormField
                                            label="Pembiayaan *"
                                            error={
                                                form.errors
                                                    .financing_provider_id
                                            }
                                        >
                                            <SelectInput
                                                value={
                                                    form.data
                                                        .financing_provider_id
                                                }
                                                onChange={(event) =>
                                                    form.setData(
                                                        'financing_provider_id',
                                                        event.target.value,
                                                    )
                                                }
                                                required
                                            >
                                                <option value="">
                                                    Pilih pembiayaan
                                                </option>
                                                {options.financingProviders.map(
                                                    (provider) => (
                                                        <option
                                                            key={provider.id}
                                                            value={provider.id}
                                                        >
                                                            {provider.name}
                                                        </option>
                                                    ),
                                                )}
                                            </SelectInput>
                                        </FormField>
                                        <MoneyField
                                            label="DP *"
                                            value={form.data.dp}
                                            error={form.errors.dp}
                                            onChange={(value) =>
                                                form.setData('dp', value)
                                            }
                                        />
                                        <MoneyField
                                            label="DP Terutang *"
                                            value={form.data.outstanding_dp}
                                            error={form.errors.outstanding_dp}
                                            onChange={(value) =>
                                                form.setData(
                                                    'outstanding_dp',
                                                    value,
                                                )
                                            }
                                        />
                                        <MoneyField
                                            label="Cair Pembiayaan *"
                                            value={
                                                form.data.financing_disbursement
                                            }
                                            error={
                                                form.errors
                                                    .financing_disbursement
                                            }
                                            onChange={(value) =>
                                                form.setData(
                                                    'financing_disbursement',
                                                    value,
                                                )
                                            }
                                        />
                                        <MoneyField
                                            label="Refund *"
                                            value={form.data.refund}
                                            error={form.errors.refund}
                                            onChange={(value) =>
                                                form.setData('refund', value)
                                            }
                                        />
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="space-y-5 sm:p-6">
                                <CardTitle className="text-base">
                                    Ringkasan Transaksi
                                </CardTitle>
                                {hasSummaryValue ? (
                                    <div className="space-y-3">
                                        {form.data.payment_type === 'CREDIT' && (
                                            <Summary
                                                label="Total Kredit"
                                                value={
                                                    <CurrencyDisplay
                                                        value={creditTotal}
                                                    />
                                                }
                                            />
                                        )}
                                        <Summary
                                            label="Harga Jual"
                                            value={
                                                <CurrencyDisplay
                                                    value={sellingPrice}
                                                />
                                            }
                                        />
                                        <Summary
                                            label="Modal Kendaraan"
                                            value={
                                                <CurrencyDisplay
                                                    value={vehicle.final_capital}
                                                />
                                            }
                                        />
                                        <Summary
                                            label="Preview Laba"
                                            value={
                                                <CurrencyDisplay
                                                    value={profit}
                                                    className={
                                                        profit < 0
                                                            ? 'text-red-600'
                                                            : 'text-green-700'
                                                    }
                                                />
                                            }
                                        />
                                    </div>
                                ) : (
                                    <div className="flex min-h-24 items-center justify-center text-center text-sm text-neutral-400">
                                        Isi harga jual untuk melihat ringkasan.
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-2">
                            <Link
                                href={
                                    mode === 'edit' && sale
                                        ? route('sales.show', sale.id)
                                        : route('sales.index')
                                }
                            >
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="w-full"
                                >
                                    Batal
                                </Button>
                            </Link>
                            <Button
                                type="submit"
                                className="w-full"
                                disabled={form.processing}
                                isLoading={form.processing}
                            >
                                {mode === 'edit'
                                    ? 'Simpan Perubahan'
                                    : 'Simpan Penjualan'}
                            </Button>
                        </div>
                    </div>
                </div>
            </form>
        </AuthenticatedLayout>
    );
}

function SelectedVehicleCard({
    vehicle,
    mode,
    sale,
}: {
    vehicle: SaleVehicleContext;
    mode: 'create' | 'edit';
    sale: SaleFormModel | null;
}) {
    return (
        <Card className="overflow-hidden border-l-4 border-l-brand-yellow-500">
            <CardContent className="p-0">
                <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start sm:justify-between sm:p-6">
                    <div className="min-w-0">
                        <div className="text-xs font-bold uppercase tracking-wide text-brand-yellow-700">
                            / Kendaraan Dipilih
                        </div>
                        <h2 className="mt-3 text-xl font-bold text-neutral-950">
                            {vehicle.brand ?? 'Tanpa merk'} {vehicle.type}
                        </h2>
                        <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-neutral-500">
                            <span className="rounded bg-neutral-100 px-2 py-1 font-semibold text-neutral-950">
                                {vehicle.plate_number}
                            </span>
                            <span>
                                {vehicle.year} · {vehicle.color}
                            </span>
                        </div>
                        <div className="mt-3 flex flex-wrap gap-2">
                            <StatusBadge
                                type="capital"
                                value={vehicle.capital_type}
                            />
                            <StatusBadge type="vehicle" value={vehicle.status} />
                        </div>
                    </div>

                    {mode === 'create' && (
                        <Link href={route('sales.index')}>
                            <Button type="button" variant="outline">
                                Ganti Kendaraan
                            </Button>
                        </Link>
                    )}
                    {mode === 'edit' && sale && (
                        <Link href={route('sales.show', sale.id)}>
                            <Button type="button" variant="outline">
                                Detail Penjualan
                            </Button>
                        </Link>
                    )}
                </div>

                <div className="grid gap-5 border-t border-neutral-200 bg-neutral-50 px-5 py-4 sm:grid-cols-2 sm:px-6">
                    <Summary
                        label="Modal Kendaraan"
                        value={
                            <CurrencyDisplay value={vehicle.final_capital} />
                        }
                    />
                    <Summary
                        label="Harga Penawaran"
                        value={
                            <CurrencyDisplay value={vehicle.asking_price} />
                        }
                    />
                </div>
            </CardContent>
        </Card>
    );
}

function StepTitle({
    step,
    children,
}: {
    step: string;
    children: ReactNode;
}) {
    return (
        <div className="flex items-center gap-3">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-yellow-500 text-sm font-bold text-brand-black">
                {step}
            </span>
            <CardTitle className="text-base font-bold uppercase tracking-wide text-neutral-700">
                {children}
            </CardTitle>
        </div>
    );
}

function PaymentOption({
    active,
    label,
    eyebrow,
    onClick,
}: {
    active: boolean;
    label: string;
    eyebrow: string;
    onClick: () => void;
}) {
    return (
        <button
            type="button"
            className={cn(
                'flex min-h-32 flex-col items-center justify-center rounded-md border px-4 py-5 text-center transition focus:outline-none focus:ring-2 focus:ring-brand-yellow-500 focus:ring-offset-2',
                active
                    ? 'border-brand-yellow-500 bg-brand-yellow-50 text-brand-black'
                    : 'border-neutral-200 bg-surface text-neutral-500 hover:border-neutral-300 hover:bg-neutral-50',
            )}
            onClick={onClick}
        >
            <span className="text-xs font-bold uppercase tracking-wide text-neutral-400">
                {eyebrow}
            </span>
            <span className="mt-3 text-xl font-bold uppercase text-neutral-950">
                {label}
            </span>
            {active && (
                <span className="mt-3 flex h-6 w-6 items-center justify-center rounded-full bg-brand-yellow-500 text-brand-black">
                    <CheckIcon className="h-4 w-4" />
                </span>
            )}
        </button>
    );
}

function MoneyField({
    label,
    value,
    error,
    onChange,
}: {
    label: string;
    value: string;
    error?: string;
    onChange: (value: string) => void;
}) {
    return (
        <FormField label={label} error={error}>
            <TextInput
                type="number"
                min="0"
                className="block w-full"
                value={value}
                onChange={(event) => onChange(event.target.value)}
                required
            />
        </FormField>
    );
}

function Summary({ label, value }: { label: string; value: ReactNode }) {
    return (
        <div>
            <div className="text-xs font-bold uppercase tracking-wide text-neutral-400">
                {label}
            </div>
            <div className="mt-2 text-lg font-bold tabular-nums text-neutral-950">
                {value}
            </div>
        </div>
    );
}

function formatRupiah(value: number) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    })
        .format(value)
        .replace('IDR', 'Rp');
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

function PlusIcon({ className = '' }: { className?: string }) {
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
            <path d="M12 5v14" />
            <path d="M5 12h14" />
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
