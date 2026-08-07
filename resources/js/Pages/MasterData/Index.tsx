import Badge from '@/Components/Badge';
import Button from '@/Components/Button';
import { Card, CardContent } from '@/Components/Card';
import EmptyState from '@/Components/EmptyState';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PageHeader from '@/Components/PageHeader';
import TextInput from '@/Components/TextInput';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';

type MasterResource = {
    key: string;
    label: string;
    href: string;
};

type MasterItem = {
    id: number;
    name: string;
    is_active: boolean;
};

type MasterDataPageProps = PageProps<{
    resource: string;
    title: string;
    description: string;
    resources: MasterResource[];
    items: MasterItem[];
}>;

export default function MasterDataIndex({
    resource,
    title,
    description,
    resources,
    items,
}: MasterDataPageProps) {
    const { flash } = usePage<PageProps>().props;
    const [editingItem, setEditingItem] = useState<MasterItem | null>(null);
    const form = useForm({
        name: '',
        is_active: true,
    });

    const submit: FormEventHandler = (event) => {
        event.preventDefault();

        if (editingItem) {
            form.patch(route('master.update', [resource, editingItem.id]), {
                preserveScroll: true,
                onSuccess: () => {
                    setEditingItem(null);
                    form.reset();
                },
            });

            return;
        }

        form.post(route('master.store', resource), {
            preserveScroll: true,
            onSuccess: () => form.reset(),
        });
    };

    const startEditing = (item: MasterItem) => {
        setEditingItem(item);
        form.clearErrors();
        form.setData({
            name: item.name,
            is_active: item.is_active,
        });
    };

    const cancelEditing = () => {
        setEditingItem(null);
        form.clearErrors();
        form.reset();
    };

    const deactivate = (item: MasterItem) => {
        router.delete(route('master.destroy', [resource, item.id]), {
            preserveScroll: true,
        });
    };

    return (
        <AuthenticatedLayout
            header={<PageHeader title={title} description={description} />}
        >
            <Head title={title} />

            <div className="space-y-6">
                {flash?.success && (
                    <div className="rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                        {flash.success}
                    </div>
                )}

                <div className="flex gap-2 overflow-x-auto pb-1">
                    {resources.map((item) => (
                        <Link
                            key={item.key}
                            href={item.href}
                            className={
                                item.key === resource
                                    ? 'inline-flex h-10 shrink-0 items-center rounded-md bg-neutral-950 px-4 text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-yellow-500'
                                    : 'inline-flex h-10 shrink-0 items-center rounded-md border border-neutral-200 bg-white px-4 text-sm font-medium text-neutral-700 hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-yellow-500'
                            }
                        >
                            {item.label}
                        </Link>
                    ))}
                </div>

                <div className="grid gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
                    <Card>
                        <CardContent>
                            <form onSubmit={submit} className="space-y-5">
                                <div>
                                    <h2 className="text-lg font-semibold text-neutral-950">
                                        {editingItem
                                            ? 'Edit Data'
                                            : 'Tambah Data'}
                                    </h2>
                                    <p className="mt-1 text-sm text-neutral-500">
                                        Data aktif akan muncul pada dropdown
                                        modul terkait.
                                    </p>
                                </div>

                                <div>
                                    <InputLabel htmlFor="name" value="Nama *" />
                                    <TextInput
                                        id="name"
                                        className="mt-1 block w-full"
                                        value={form.data.name}
                                        onChange={(event) =>
                                            form.setData(
                                                'name',
                                                event.target.value,
                                            )
                                        }
                                        required
                                    />
                                    <InputError
                                        className="mt-2"
                                        message={form.errors.name}
                                    />
                                </div>

                                {editingItem && (
                                    <label className="flex items-center gap-3 rounded-md border border-neutral-200 bg-neutral-50 px-3 py-2">
                                        <input
                                            type="checkbox"
                                            className="rounded border-neutral-300 text-yellow-500 focus:ring-yellow-500"
                                            checked={form.data.is_active}
                                            onChange={(event) =>
                                                form.setData(
                                                    'is_active',
                                                    event.target.checked,
                                                )
                                            }
                                        />
                                        <span className="text-sm font-medium text-neutral-800">
                                            Aktif
                                        </span>
                                    </label>
                                )}

                                <div className="flex flex-wrap gap-3">
                                    <Button
                                        type="submit"
                                        disabled={form.processing}
                                        isLoading={form.processing}
                                    >
                                        {editingItem
                                            ? 'Simpan Perubahan'
                                            : 'Tambah Data'}
                                    </Button>

                                    {editingItem && (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={cancelEditing}
                                        >
                                            Batal
                                        </Button>
                                    )}
                                </div>
                            </form>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-0">
                            {items.length === 0 ? (
                                <div className="p-5">
                                    <EmptyState
                                        title="Belum ada master data."
                                        description="Tambahkan data pertama melalui form di samping."
                                    />
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-neutral-200">
                                        <thead className="bg-neutral-50">
                                            <tr>
                                                <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-neutral-500">
                                                    Nama
                                                </th>
                                                <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-neutral-500">
                                                    Status
                                                </th>
                                                <th className="px-5 py-3 text-right text-xs font-semibold uppercase text-neutral-500">
                                                    Aksi
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-neutral-200 bg-white">
                                            {items.map((item) => (
                                                <tr key={item.id}>
                                                    <td className="whitespace-nowrap px-5 py-4 text-sm font-medium text-neutral-950">
                                                        {item.name}
                                                    </td>
                                                    <td className="whitespace-nowrap px-5 py-4">
                                                        <Badge
                                                            variant={
                                                                item.is_active
                                                                    ? 'success'
                                                                    : 'neutral'
                                                            }
                                                        >
                                                            {item.is_active
                                                                ? 'Aktif'
                                                                : 'Nonaktif'}
                                                        </Badge>
                                                    </td>
                                                    <td className="whitespace-nowrap px-5 py-4 text-right">
                                                        <div className="flex justify-end gap-2">
                                                            <Button
                                                                type="button"
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() =>
                                                                    startEditing(
                                                                        item,
                                                                    )
                                                                }
                                                            >
                                                                Edit
                                                            </Button>
                                                            {item.is_active && (
                                                                <Button
                                                                    type="button"
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() =>
                                                                        deactivate(
                                                                            item,
                                                                        )
                                                                    }
                                                                >
                                                                    Nonaktifkan
                                                                </Button>
                                                            )}
                                                        </div>
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
            </div>
        </AuthenticatedLayout>
    );
}
