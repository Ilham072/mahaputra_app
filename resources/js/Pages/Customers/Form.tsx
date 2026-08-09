import Button from '@/Components/Button';
import { Card, CardContent, CardTitle } from '@/Components/Card';
import FormField from '@/Components/FormField';
import PageHeader from '@/Components/PageHeader';
import TextInput from '@/Components/TextInput';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import type { FormEventHandler } from 'react';
import type { CustomerFormModel } from './types';

type CustomerFormProps = {
    customer: CustomerFormModel;
};

export default function CustomerForm({ customer }: CustomerFormProps) {
    const form = useForm({
        name: customer.name,
        whatsapp: customer.whatsapp,
        alternative_whatsapp: customer.alternative_whatsapp ?? '',
        address: customer.address,
    });

    const submit: FormEventHandler = (event) => {
        event.preventDefault();

        form.patch(route('customers.update', customer.id));
    };

    return (
        <AuthenticatedLayout
            header={
                <PageHeader
                    title="Edit Customer"
                    description="Perbarui data dasar customer"
                />
            }
        >
            <Head title="Edit Customer" />

            <form onSubmit={submit} className="space-y-6">
                <Card>
                    <CardContent className="space-y-5">
                        <CardTitle>Data Customer</CardTitle>
                        <div className="grid gap-5 md:grid-cols-2">
                            <FormField label="Nama *" error={form.errors.name}>
                                <TextInput
                                    className="block w-full"
                                    value={form.data.name}
                                    onChange={(event) =>
                                        form.setData(
                                            'name',
                                            event.target.value,
                                        )
                                    }
                                    required
                                />
                            </FormField>

                            <FormField
                                label="WhatsApp *"
                                error={form.errors.whatsapp}
                            >
                                <TextInput
                                    className="block w-full"
                                    value={form.data.whatsapp}
                                    onChange={(event) =>
                                        form.setData(
                                            'whatsapp',
                                            event.target.value,
                                        )
                                    }
                                    required
                                />
                            </FormField>

                            <FormField
                                label="WhatsApp Alternatif"
                                error={form.errors.alternative_whatsapp}
                            >
                                <TextInput
                                    className="block w-full"
                                    value={form.data.alternative_whatsapp}
                                    onChange={(event) =>
                                        form.setData(
                                            'alternative_whatsapp',
                                            event.target.value,
                                        )
                                    }
                                />
                            </FormField>

                            <div className="md:col-span-2">
                                <FormField
                                    label="Alamat *"
                                    error={form.errors.address}
                                >
                                    <textarea
                                        className="block min-h-28 w-full rounded-md border-neutral-300 text-sm shadow-sm focus:border-brand-yellow-500 focus:ring-brand-yellow-500"
                                        value={form.data.address}
                                        onChange={(event) =>
                                            form.setData(
                                                'address',
                                                event.target.value,
                                            )
                                        }
                                        required
                                    />
                                </FormField>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="sticky bottom-0 flex justify-end gap-3 border-t border-neutral-200 bg-neutral-50 py-4">
                    <Link href={route('customers.show', customer.id)}>
                        <Button type="button" variant="outline">
                            Batal
                        </Button>
                    </Link>
                    <Button
                        type="submit"
                        disabled={form.processing}
                        isLoading={form.processing}
                    >
                        Simpan Perubahan
                    </Button>
                </div>
            </form>
        </AuthenticatedLayout>
    );
}
