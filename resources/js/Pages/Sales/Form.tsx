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
import {
    PaymentType,
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
        employees: SaleOption[];
        financingProviders: SaleOption[];
        paymentTypes: Array<{ value: PaymentType; label: string }>;
    };
};

export default function SaleForm({ mode, vehicle, sale, options }: SaleFormProps) {
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

    const creditTotal =
        Number(form.data.dp || 0) +
        Number(form.data.outstanding_dp || 0) +
        Number(form.data.financing_disbursement || 0) +
        Number(form.data.refund || 0);
    const profit =
        form.data.payment_type === 'CREDIT'
            ? creditTotal - vehicle.final_capital
            : Number(form.data.selling_price || 0) - vehicle.final_capital;

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
                            : 'Form Penjualan'
                    }
                    description={`${vehicle.brand} ${vehicle.type} / ${vehicle.plate_number}`}
                />
            }
        >
            <Head
                title={
                    mode === 'edit' ? 'Edit Penjualan' : 'Form Penjualan'
                }
            />

            <form onSubmit={submit} className="space-y-6">
                <Card>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-4">
                            <Summary label="Harga Penawaran" value={<CurrencyDisplay value={vehicle.asking_price} />} />
                            <Summary label="Modal Awal" value={<CurrencyDisplay value={vehicle.initial_capital} />} />
                            <Summary label="Biaya Kendaraan" value={<CurrencyDisplay value={vehicle.vehicle_cost} />} />
                            <Summary label="Modal Akhir" value={<CurrencyDisplay value={vehicle.final_capital} />} />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="space-y-5">
                        <CardTitle>Informasi Pembeli</CardTitle>
                        <div className="grid gap-5 md:grid-cols-2">
                            <Field label="Nama Pembeli *" error={form.errors.customer_name}>
                                <TextInput className="block w-full" value={form.data.customer_name} onChange={(e) => form.setData('customer_name', e.target.value)} required />
                            </Field>
                            <Field label="WhatsApp *" error={form.errors.customer_whatsapp}>
                                <TextInput className="block w-full" value={form.data.customer_whatsapp} onChange={(e) => form.setData('customer_whatsapp', e.target.value)} required />
                            </Field>
                            <Field label="WhatsApp Alternatif" error={form.errors.customer_alternative_whatsapp}>
                                <TextInput className="block w-full" value={form.data.customer_alternative_whatsapp} onChange={(e) => form.setData('customer_alternative_whatsapp', e.target.value)} />
                            </Field>
                            <Field
                                label={
                                    mode === 'edit'
                                        ? 'Ganti KTP'
                                        : 'KTP *'
                                }
                                error={form.errors.customer_ktp}
                            >
                                <input type="file" accept=".jpg,.jpeg,.png,.webp,.pdf" className="block w-full rounded-md border border-neutral-300 bg-white text-sm file:mr-4 file:border-0 file:bg-neutral-950 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white" onChange={(e) => form.setData('customer_ktp', e.target.files?.[0] ?? null)} required={mode === 'create'} />
                                {mode === 'edit' && sale?.customer_ktp_original_name && (
                                    <p className="mt-2 text-xs text-neutral-500">
                                        File saat ini: {sale.customer_ktp_original_name}
                                    </p>
                                )}
                            </Field>
                            <div className="md:col-span-2">
                                <Field label="Alamat *" error={form.errors.customer_address}>
                                    <textarea className="block min-h-24 w-full rounded-md border-neutral-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500" value={form.data.customer_address} onChange={(e) => form.setData('customer_address', e.target.value)} required />
                                </Field>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="space-y-5">
                        <CardTitle>Informasi Transaksi</CardTitle>
                        <div className="grid gap-5 md:grid-cols-2">
                            <Field label="Tanggal Penjualan *" error={form.errors.sale_date}>
                                <TextInput type="date" className="block w-full" value={form.data.sale_date} onChange={(e) => form.setData('sale_date', e.target.value)} required />
                            </Field>
                            <Field label="Harga Terjual *" error={form.errors.selling_price}>
                                <TextInput type="number" min="0" className="block w-full" value={form.data.selling_price} onChange={(e) => form.setData('selling_price', e.target.value)} required />
                            </Field>
                            <Field label="Area *" error={form.errors.area_id}>
                                <select className="block w-full rounded-md border-neutral-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500" value={form.data.area_id} onChange={(e) => form.setData('area_id', e.target.value)} required>
                                    <option value="">Pilih area</option>
                                    {options.areas.map((area) => <option key={area.id} value={area.id}>{area.name}</option>)}
                                </select>
                            </Field>
                            <Field label="PIC *" error={form.errors.employee_id}>
                                <select className="block w-full rounded-md border-neutral-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500" value={form.data.employee_id} onChange={(e) => form.setData('employee_id', e.target.value)} required>
                                    <option value="">Pilih PIC</option>
                                    {options.employees.map((employee) => <option key={employee.id} value={employee.id}>{employee.name}</option>)}
                                </select>
                            </Field>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="space-y-5">
                        <CardTitle>Metode Pembayaran</CardTitle>
                        <div className="grid gap-3 sm:grid-cols-2">
                            {options.paymentTypes.map((type) => (
                                <button
                                    key={type.value}
                                    type="button"
                                    className={form.data.payment_type === type.value ? 'rounded-md border border-yellow-500 bg-yellow-50 p-4 text-left font-semibold text-neutral-950' : 'rounded-md border border-neutral-200 bg-white p-4 text-left font-semibold text-neutral-700 hover:bg-neutral-50'}
                                    onClick={() => form.setData('payment_type', type.value)}
                                >
                                    {type.label}
                                </button>
                            ))}
                        </div>

                        {form.data.payment_type === 'CREDIT' && (
                            <div className="grid gap-5 md:grid-cols-2">
                                <Field label="Pembiayaan *" error={form.errors.financing_provider_id}>
                                    <select className="block w-full rounded-md border-neutral-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500" value={form.data.financing_provider_id} onChange={(e) => form.setData('financing_provider_id', e.target.value)} required>
                                        <option value="">Pilih pembiayaan</option>
                                        {options.financingProviders.map((provider) => <option key={provider.id} value={provider.id}>{provider.name}</option>)}
                                    </select>
                                </Field>
                                <Field label="DP *" error={form.errors.dp}>
                                    <TextInput type="number" min="0" className="block w-full" value={form.data.dp} onChange={(e) => form.setData('dp', e.target.value)} required />
                                </Field>
                                <Field label="DP Terutang *" error={form.errors.outstanding_dp}>
                                    <TextInput type="number" min="0" className="block w-full" value={form.data.outstanding_dp} onChange={(e) => form.setData('outstanding_dp', e.target.value)} required />
                                </Field>
                                <Field label="Cair Pembiayaan *" error={form.errors.financing_disbursement}>
                                    <TextInput type="number" min="0" className="block w-full" value={form.data.financing_disbursement} onChange={(e) => form.setData('financing_disbursement', e.target.value)} required />
                                </Field>
                                <Field label="Refund *" error={form.errors.refund}>
                                    <TextInput type="number" min="0" className="block w-full" value={form.data.refund} onChange={(e) => form.setData('refund', e.target.value)} required />
                                </Field>
                            </div>
                        )}

                        <div className="rounded-md border border-neutral-200 bg-neutral-50 p-4">
                            <div className="grid gap-4 md:grid-cols-3">
                                {form.data.payment_type === 'CREDIT' && <Summary label="Total Kredit" value={<CurrencyDisplay value={creditTotal} />} />}
                                <Summary label="Modal Akhir" value={<CurrencyDisplay value={vehicle.final_capital} />} />
                                <Summary label="Preview Laba" value={<CurrencyDisplay value={profit} className={profit < 0 ? 'text-red-600' : 'text-green-700'} />} />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="sticky bottom-0 flex justify-end gap-3 border-t border-neutral-200 bg-neutral-50 py-4">
                    <Link
                        href={
                            mode === 'edit' && sale
                                ? route('sales.show', sale.id)
                                : route('vehicles.show', vehicle.id)
                        }
                    >
                        <Button type="button" variant="outline">Batal</Button>
                    </Link>
                    <Button type="submit" disabled={form.processing} isLoading={form.processing}>
                        {mode === 'edit'
                            ? 'Simpan Perubahan'
                            : 'Simpan & Tandai Terjual'}
                    </Button>
                </div>
            </form>
        </AuthenticatedLayout>
    );
}

function Summary({ label, value }: { label: string; value: ReactNode }) {
    return (
        <div>
            <div className="text-sm font-medium text-neutral-500">{label}</div>
            <div className="mt-1 text-lg font-bold tabular-nums text-neutral-950">{value}</div>
        </div>
    );
}

function Field({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
    return (
        <div>
            <InputLabel value={label} />
            <div className="mt-1">{children}</div>
            <InputError className="mt-2" message={error} />
        </div>
    );
}
