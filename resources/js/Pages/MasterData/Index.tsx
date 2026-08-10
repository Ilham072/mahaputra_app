import Badge from '@/Components/Badge';
import Button from '@/Components/Button';
import { Card, CardContent } from '@/Components/Card';
import Checkbox from '@/Components/Checkbox';
import DataTable, { type DataTableColumn } from '@/Components/DataTable';
import EmptyState from '@/Components/EmptyState';
import FormField from '@/Components/FormField';
import PageHeader from '@/Components/PageHeader';
import TextInput from '@/Components/TextInput';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import {
    type FormEventHandler,
    type ReactNode,
    useEffect,
    useState,
} from 'react';

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

type MasterFilters = {
    search?: string;
    status?: string;
};

type MasterDataPageProps = PageProps<{
    resource: string;
    pageTitle: string;
    pageDescription: string;
    title: string;
    label: string;
    description: string;
    fieldLabel: string;
    addLabel: string;
    resources: MasterResource[];
    items: MasterItem[];
    filters: MasterFilters;
}>;

type IconName = 'plus' | 'search' | 'more' | 'edit' | 'power' | 'trash';

function Icon({ name }: { name: IconName }) {
    const paths: Record<IconName, ReactNode> = {
        plus: (
            <>
                <path d="M12 5v14" />
                <path d="M5 12h14" />
            </>
        ),
        search: (
            <>
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" />
            </>
        ),
        more: (
            <>
                <circle cx="12" cy="12" r="1" />
                <circle cx="19" cy="12" r="1" />
                <circle cx="5" cy="12" r="1" />
            </>
        ),
        edit: (
            <>
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
            </>
        ),
        power: (
            <>
                <path d="M12 2v10" />
                <path d="M18.4 6.6a9 9 0 1 1-12.8 0" />
            </>
        ),
        trash: (
            <>
                <path d="M3 6h18" />
                <path d="M8 6V4h8v2" />
                <path d="M19 6l-1 14H6L5 6" />
                <path d="M10 11v5" />
                <path d="M14 11v5" />
            </>
        ),
    };

    return (
        <svg
            viewBox="0 0 24 24"
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            {paths[name]}
        </svg>
    );
}

function cleanParams(params: Record<string, string>) {
    return Object.fromEntries(
        Object.entries(params).filter(([, value]) => value.trim() !== ''),
    );
}

function searchPlaceholder(label: string) {
    return `Cari ${label.toLowerCase()}...`;
}

export default function MasterDataIndex({
    resource,
    pageTitle,
    pageDescription,
    title,
    label,
    description,
    fieldLabel,
    addLabel,
    resources,
    items,
    filters,
}: MasterDataPageProps) {
    const { flash } = usePage<PageProps>().props;
    const [search, setSearch] = useState(filters.search ?? '');
    const [status, setStatus] = useState(filters.status ?? '');
    const [modalOpen, setModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<MasterItem | null>(null);
    const form = useForm({
        name: '',
        is_active: true,
    });

    const hasFilter = Boolean((filters.search ?? '') || (filters.status ?? ''));

    useEffect(() => {
        setSearch(filters.search ?? '');
        setStatus(filters.status ?? '');
    }, [filters.search, filters.status]);

    useEffect(() => {
        if (!modalOpen) {
            return;
        }

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                closeModal();
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [modalOpen]);

    const applyFilters = (nextStatus = status) => {
        router.get(
            route('master-data.index'),
            cleanParams({
                type: resource,
                search,
                status: nextStatus,
            }),
            {
                preserveScroll: true,
                preserveState: true,
                replace: true,
            },
        );
    };

    const submitFilters: FormEventHandler = (event) => {
        event.preventDefault();
        applyFilters();
    };

    const clearFilters = () => {
        setSearch('');
        setStatus('');
        router.get(
            route('master-data.index'),
            { type: resource },
            {
                preserveScroll: true,
                preserveState: true,
                replace: true,
            },
        );
    };

    const openCreate = () => {
        setEditingItem(null);
        form.clearErrors();
        form.setData({
            name: '',
            is_active: true,
        });
        setModalOpen(true);
    };

    const openEdit = (item: MasterItem) => {
        setEditingItem(item);
        form.clearErrors();
        form.setData({
            name: item.name,
            is_active: item.is_active,
        });
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setEditingItem(null);
        form.clearErrors();
        form.reset();
    };

    const submit: FormEventHandler = (event) => {
        event.preventDefault();

        if (editingItem) {
            form.patch(route('master.update', [resource, editingItem.id]), {
                preserveScroll: true,
                onSuccess: closeModal,
            });

            return;
        }

        form.post(route('master.store', resource), {
            preserveScroll: true,
            onSuccess: closeModal,
        });
    };

    const deactivate = (item: MasterItem) => {
        if (!window.confirm(`Nonaktifkan ${item.name}?`)) {
            return;
        }

        router.delete(route('master.destroy', [resource, item.id]), {
            preserveScroll: true,
        });
    };

    const remove = (item: MasterItem) => {
        if (!window.confirm(`Hapus ${item.name}?`)) {
            return;
        }

        router.delete(route('master.destroy', [resource, item.id]), {
            preserveScroll: true,
        });
    };

    const activate = (item: MasterItem) => {
        router.patch(
            route('master.update', [resource, item.id]),
            {
                name: item.name,
                is_active: true,
            },
            {
                preserveScroll: true,
            },
        );
    };

    const actionMenu = (item: MasterItem) => (
        <div className="flex justify-end gap-2">
            <IconActionButton
                label={`Edit ${item.name}`}
                onClick={() => openEdit(item)}
            >
                <Icon name="edit" />
            </IconActionButton>
            <IconActionButton
                label={
                    item.is_active
                        ? `Nonaktifkan ${item.name}`
                        : `Aktifkan ${item.name}`
                }
                onClick={() => (item.is_active ? deactivate(item) : activate(item))}
            >
                <Icon name="power" />
            </IconActionButton>
            <IconActionButton
                label={`Hapus ${item.name}`}
                onClick={() => remove(item)}
                className="text-red-600 hover:bg-red-50 hover:text-red-700"
            >
                <Icon name="trash" />
            </IconActionButton>
        </div>
    );

    const itemColumns: Array<DataTableColumn<MasterItem>> = [
        {
            key: 'name',
            header: fieldLabel,
            cellClassName: 'whitespace-nowrap font-medium text-neutral-950',
            cell: (item) => item.name,
        },
        {
            key: 'status',
            header: 'Status',
            cellClassName: 'whitespace-nowrap',
            cell: (item) => (
                <Badge variant={item.is_active ? 'success' : 'neutral'}>
                    {item.is_active ? 'Aktif' : 'Nonaktif'}
                </Badge>
            ),
        },
        {
            key: 'actions',
            header: 'Aksi',
            align: 'right',
            cellClassName: 'whitespace-nowrap',
            cell: (item) => actionMenu(item),
        },
    ];

    return (
        <AuthenticatedLayout
            header={
                <PageHeader title={pageTitle} description={pageDescription} />
            }
        >
            <Head title={pageTitle} />

            <div className="space-y-5 lg:space-y-6">
                {flash?.success && (
                    <div className="rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                        {flash.success}
                    </div>
                )}

                <div className="-mx-4 overflow-x-auto px-4 pb-1 sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0">
                    <div className="flex min-w-max gap-2">
                        {resources.map((item) => (
                            <Link
                                key={item.key}
                                href={item.href}
                                className={
                                    item.key === resource
                                        ? 'inline-flex h-10 shrink-0 items-center rounded-md bg-neutral-950 px-4 text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-brand-yellow-500 focus:ring-offset-2'
                                        : 'inline-flex h-10 shrink-0 items-center rounded-md border border-neutral-200 bg-surface px-4 text-sm font-medium text-neutral-700 hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-brand-yellow-500 focus:ring-offset-2'
                                }
                            >
                                {item.label}
                            </Link>
                        ))}
                    </div>
                </div>

                <Card>
                    <CardContent>
                        <div className="flex flex-col gap-4 border-b border-neutral-200 pb-5 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                                <h2 className="text-lg font-semibold text-neutral-950">
                                    {title}
                                </h2>
                                <p className="mt-1 text-sm text-neutral-500">
                                    {description}
                                </p>
                            </div>

                            <Button
                                type="button"
                                className="w-full sm:w-auto"
                                onClick={openCreate}
                            >
                                <Icon name="plus" />
                                {addLabel}
                            </Button>
                        </div>

                        <form
                            onSubmit={submitFilters}
                            className="grid gap-3 py-5 sm:grid-cols-[minmax(0,1fr)_220px_auto]"
                        >
                            <label className="relative block">
                                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">
                                    <Icon name="search" />
                                </span>
                                <TextInput
                                    value={search}
                                    onChange={(event) =>
                                        setSearch(event.target.value)
                                    }
                                    className="pl-10"
                                    placeholder={searchPlaceholder(label)}
                                />
                            </label>

                            <select
                                value={status}
                                onChange={(event) => {
                                    setStatus(event.target.value);
                                    applyFilters(event.target.value);
                                }}
                                className="h-10 rounded-md border-neutral-300 text-sm shadow-sm focus:border-brand-yellow-500 focus:ring-brand-yellow-500"
                                aria-label="Filter status"
                            >
                                <option value="">Semua Status</option>
                                <option value="active">Aktif</option>
                                <option value="inactive">Nonaktif</option>
                            </select>

                            <div className="flex gap-2">
                                <Button
                                    type="submit"
                                    variant="secondary"
                                    className="flex-1 sm:flex-none"
                                >
                                    Filter
                                </Button>
                                {hasFilter && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="flex-1 sm:flex-none"
                                        onClick={clearFilters}
                                    >
                                        Bersihkan
                                    </Button>
                                )}
                            </div>
                        </form>

                        {items.length === 0 ? (
                            <EmptyState
                                title={
                                    hasFilter
                                        ? 'Data tidak ditemukan.'
                                        : 'Belum ada master data.'
                                }
                                description={
                                    hasFilter
                                        ? 'Ubah kata kunci atau status untuk melihat data lain.'
                                        : `Tambahkan data pertama untuk ${label.toLowerCase()}.`
                                }
                            />
                        ) : (
                            <>
                                <div className="hidden lg:block">
                                    <DataTable
                                        rows={items}
                                        columns={itemColumns}
                                        getRowKey={(item) => item.id}
                                        minWidth="min-w-[640px]"
                                    />
                                </div>

                                <div className="space-y-3 lg:hidden">
                                    {items.map((item) => (
                                        <div
                                            key={item.id}
                                            className="rounded-md border border-neutral-200 bg-surface p-4"
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="min-w-0">
                                                    <p className="truncate text-sm font-semibold text-neutral-950">
                                                        {item.name}
                                                    </p>
                                                    <div className="mt-2">
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
                                                    </div>
                                                </div>

                                                {actionMenu(item)}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>

            {modalOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-end justify-center bg-brand-black/50 p-0 sm:items-center sm:p-4"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="master-data-form-title"
                >
                    <button
                        type="button"
                        className="absolute inset-0 h-full w-full"
                        aria-label="Tutup form"
                        onClick={closeModal}
                    />
                    <form
                        onSubmit={submit}
                        className="relative w-full rounded-t-lg border border-neutral-200 bg-surface p-5 shadow-floating sm:max-w-md sm:rounded-lg"
                    >
                        <div className="border-b border-neutral-200 pb-4">
                            <h2
                                id="master-data-form-title"
                                className="text-lg font-semibold text-neutral-950"
                            >
                                {editingItem ? 'Edit Data' : addLabel}
                            </h2>
                            <p className="mt-1 text-sm text-neutral-500">
                                Data aktif akan muncul pada dropdown modul
                                terkait.
                            </p>
                        </div>

                        <div className="space-y-5 py-5">
                            <FormField
                                htmlFor="name"
                                label={`${fieldLabel} *`}
                                error={form.errors.name}
                            >
                                <TextInput
                                    id="name"
                                    className="block w-full"
                                    value={form.data.name}
                                    onChange={(event) =>
                                        form.setData(
                                            'name',
                                            event.target.value,
                                        )
                                    }
                                    required
                                    isFocused
                                />
                            </FormField>

                            {editingItem && (
                                <label className="flex items-center gap-3 rounded-md border border-neutral-200 bg-neutral-50 px-3 py-2">
                                    <Checkbox
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
                        </div>

                        <div className="flex flex-col-reverse gap-3 border-t border-neutral-200 pt-4 sm:flex-row sm:justify-end">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={closeModal}
                            >
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                disabled={form.processing}
                                isLoading={form.processing}
                            >
                                {editingItem ? 'Simpan Perubahan' : addLabel}
                            </Button>
                        </div>
                    </form>
                </div>
            )}
        </AuthenticatedLayout>
    );
}

function IconActionButton({
    label,
    onClick,
    className = '',
    children,
}: {
    label: string;
    onClick: () => void;
    className?: string;
    children: ReactNode;
}) {
    return (
        <button
            type="button"
            aria-label={label}
            title={label}
            onClick={onClick}
            className={[
                'inline-flex h-9 w-9 items-center justify-center rounded-md border border-neutral-300 bg-surface text-neutral-700 transition hover:bg-neutral-50 hover:text-neutral-950 focus:outline-none focus:ring-2 focus:ring-brand-yellow-500 focus:ring-offset-2',
                className,
            ].join(' ')}
        >
            {children}
        </button>
    );
}
