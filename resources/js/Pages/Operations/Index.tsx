import Button from '@/Components/Button';
import { Card, CardContent, CardTitle } from '@/Components/Card';
import CurrencyDisplay from '@/Components/CurrencyDisplay';
import DataTable, { type DataTableColumn } from '@/Components/DataTable';
import EmptyState from '@/Components/EmptyState';
import FormField from '@/Components/FormField';
import PageHeader from '@/Components/PageHeader';
import SelectInput from '@/Components/SelectInput';
import TextInput from '@/Components/TextInput';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { type FormEventHandler, useState } from 'react';

type Category = {
    id: number;
    name: string;
};

type Expense = {
    id: number;
    transaction_date: string;
    category: string | null;
    amount: number;
    description: string | null;
    proof_original_name: string | null;
    proof_download_url: string;
};

type OperationsProps = PageProps<{
    expenses: {
        data: Expense[];
    };
    filters: {
        date_from: string;
        date_to: string;
        category_id: string;
    };
    summary: {
        month_total: number;
        filtered_total: number;
    };
    categories: Category[];
}>;

export default function OperationsIndex({
    expenses,
    filters,
    summary,
    categories,
}: OperationsProps) {
    const { auth, flash } = usePage<PageProps>().props;
    const isAdmin = auth.user.role === 'admin';
    const [filterData, setFilterData] = useState(filters);
    const form = useForm<{
        category_id: string;
        transaction_date: string;
        amount: string;
        description: string;
        proof: File | null;
    }>({
        category_id: '',
        transaction_date: new Date().toISOString().slice(0, 10),
        amount: '',
        description: '',
        proof: null,
    });

    const submit: FormEventHandler = (event) => {
        event.preventDefault();

        form.post(route('operations.store'), {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => form.reset('amount', 'description', 'proof'),
        });
    };

    const filter: FormEventHandler = (event) => {
        event.preventDefault();

        router.get(route('operations.index'), filterData, {
            preserveState: true,
            replace: true,
        });
    };

    const clearFilters = () => {
        setFilterData({ date_from: '', date_to: '', category_id: '' });
        router.get(route('operations.index'), {}, { replace: true });
    };

    const expenseColumns: Array<DataTableColumn<Expense>> = [
        {
            key: 'transaction_date',
            header: 'Tanggal',
            cellClassName: 'whitespace-nowrap',
            cell: (expense) => expense.transaction_date,
        },
        {
            key: 'category',
            header: 'Kategori',
            cellClassName: 'whitespace-nowrap font-medium text-neutral-950',
            cell: (expense) => expense.category ?? '-',
        },
        {
            key: 'description',
            header: 'Keterangan',
            cellClassName: 'text-neutral-600',
            cell: (expense) => expense.description ?? '-',
        },
        {
            key: 'proof',
            header: 'Bukti',
            cell: (expense) => (
                <a
                    className="font-medium text-neutral-950 underline"
                    href={expense.proof_download_url}
                >
                    {expense.proof_original_name ?? 'Unduh bukti'}
                </a>
            ),
        },
        {
            key: 'amount',
            header: 'Nominal',
            align: 'right',
            cellClassName: 'whitespace-nowrap font-semibold text-neutral-950',
            cell: (expense) => <CurrencyDisplay value={expense.amount} />,
        },
    ];

    return (
        <AuthenticatedLayout
            header={
                <PageHeader
                    title="Operasional"
                    description="Biaya operasional perusahaan"
                />
            }
        >
            <Head title="Operasional" />

            <div className="space-y-6">
                {flash?.success && (
                    <div className="rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                        {flash.success}
                    </div>
                )}

                <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                        <CardContent>
                            <div className="text-sm font-medium text-neutral-500">
                                Total Operasional Bulan Ini
                            </div>
                            <CurrencyDisplay
                                value={summary.month_total}
                                className="mt-2 block text-2xl font-bold text-neutral-950"
                            />
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent>
                            <div className="text-sm font-medium text-neutral-500">
                                Total Sesuai Filter
                            </div>
                            <CurrencyDisplay
                                value={summary.filtered_total}
                                className="mt-2 block text-2xl font-bold text-neutral-950"
                            />
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
                    {isAdmin && (
                        <Card>
                            <CardContent>
                                <form onSubmit={submit} className="space-y-5">
                                    <div>
                                        <CardTitle>Tambah Transaksi</CardTitle>
                                        <p className="mt-1 text-sm text-neutral-500">
                                            Biaya ini tidak menambah Modal Akhir
                                            kendaraan.
                                        </p>
                                    </div>

                                    <FormField
                                        label="Tanggal *"
                                        error={form.errors.transaction_date}
                                    >
                                        <TextInput
                                            type="date"
                                            className="block w-full"
                                            value={form.data.transaction_date}
                                            onChange={(event) =>
                                                form.setData('transaction_date', event.target.value)
                                            }
                                            required
                                        />
                                    </FormField>

                                    <FormField
                                        label="Kategori *"
                                        error={form.errors.category_id}
                                    >
                                        <SelectInput
                                            value={form.data.category_id}
                                            onChange={(event) =>
                                                form.setData('category_id', event.target.value)
                                            }
                                            required
                                        >
                                            <option value="">Pilih kategori</option>
                                            {categories.map((category) => (
                                                <option key={category.id} value={category.id}>
                                                    {category.name}
                                                </option>
                                            ))}
                                        </SelectInput>
                                    </FormField>

                                    <FormField
                                        label="Nominal *"
                                        error={form.errors.amount}
                                    >
                                        <TextInput
                                            type="number"
                                            min="0"
                                            className="block w-full"
                                            value={form.data.amount}
                                            onChange={(event) =>
                                                form.setData('amount', event.target.value)
                                            }
                                            required
                                        />
                                    </FormField>

                                    <FormField
                                        label="Bukti *"
                                        error={form.errors.proof}
                                    >
                                        <input
                                            type="file"
                                            accept=".jpg,.jpeg,.png,.webp,.pdf"
                                            className="block w-full rounded-md border border-neutral-300 bg-surface text-sm text-neutral-700 file:mr-4 file:border-0 file:bg-neutral-950 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-brand-yellow-500"
                                            onChange={(event) =>
                                                form.setData('proof', event.target.files?.[0] ?? null)
                                            }
                                            required
                                        />
                                    </FormField>

                                    <FormField
                                        label="Keterangan"
                                        error={form.errors.description}
                                    >
                                        <textarea
                                            className="block min-h-24 w-full rounded-md border-neutral-300 text-sm shadow-sm focus:border-brand-yellow-500 focus:ring-brand-yellow-500"
                                            value={form.data.description}
                                            onChange={(event) =>
                                                form.setData('description', event.target.value)
                                            }
                                        />
                                    </FormField>

                                    <Button
                                        type="submit"
                                        disabled={form.processing || categories.length === 0}
                                        isLoading={form.processing}
                                    >
                                        Simpan Transaksi
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    )}

                    <div className="space-y-6">
                        <Card className="p-4">
                            <form onSubmit={filter} className="grid gap-3 md:grid-cols-[1fr_1fr_1fr_auto_auto]">
                                <TextInput
                                    type="date"
                                    value={filterData.date_from}
                                    onChange={(event) =>
                                        setFilterData({ ...filterData, date_from: event.target.value })
                                    }
                                />
                                <TextInput
                                    type="date"
                                    value={filterData.date_to}
                                    onChange={(event) =>
                                        setFilterData({ ...filterData, date_to: event.target.value })
                                    }
                                />
                                <SelectInput
                                    value={filterData.category_id}
                                    onChange={(event) =>
                                        setFilterData({ ...filterData, category_id: event.target.value })
                                    }
                                >
                                    <option value="">Semua Kategori</option>
                                    {categories.map((category) => (
                                        <option key={category.id} value={category.id}>
                                            {category.name}
                                        </option>
                                    ))}
                                </SelectInput>
                                <Button type="submit" variant="secondary">
                                    Filter
                                </Button>
                                <Button type="button" variant="outline" onClick={clearFilters}>
                                    Bersihkan
                                </Button>
                            </form>
                        </Card>

                        <Card>
                            <CardContent className="p-0">
                                {expenses.data.length === 0 ? (
                                    <div className="p-5">
                                        <EmptyState
                                            title="Belum ada transaksi operasional."
                                            description="Transaksi operasional akan muncul setelah Admin menambahkan data."
                                        />
                                    </div>
                                ) : (
                                    <DataTable
                                        rows={expenses.data}
                                        columns={expenseColumns}
                                        getRowKey={(expense) => expense.id}
                                    />
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
