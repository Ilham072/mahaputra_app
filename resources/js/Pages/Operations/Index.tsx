import Button from '@/Components/Button';
import { Card, CardContent } from '@/Components/Card';
import CurrencyDisplay from '@/Components/CurrencyDisplay';
import DataTable, { type DataTableColumn } from '@/Components/DataTable';
import Dropdown from '@/Components/Dropdown';
import EmptyState from '@/Components/EmptyState';
import FormField from '@/Components/FormField';
import KpiCard from '@/Components/KpiCard';
import PageHeader from '@/Components/PageHeader';
import SelectInput from '@/Components/SelectInput';
import TextInput from '@/Components/TextInput';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import {
    type FormEventHandler,
    type ReactNode,
    useEffect,
    useState,
} from 'react';

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

type OperationFilters = {
    date_from: string;
    date_to: string;
    search: string;
    category_id: string;
};

type OperationsProps = PageProps<{
    expenses: {
        data: Expense[];
    };
    filters: OperationFilters;
    summary: {
        month_total: number;
        filtered_total: number;
        transaction_count: number;
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
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [filterData, setFilterData] = useState({
        search: filters.search,
        category_id: filters.category_id,
        period: monthValue(filters.date_from),
    });
    const [fileInputKey, setFileInputKey] = useState(0);
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

    const hasActiveFilter =
        filterData.search !== '' ||
        filterData.category_id !== '' ||
        filterData.period !== currentMonthValue();
    const isFilteredEmpty = expenses.data.length === 0 && hasActiveFilter;

    const applyFilters = (nextFilters = filterData) => {
        router.get(route('operations.index'), queryFromFilters(nextFilters), {
            preserveState: true,
            replace: true,
        });
    };

    const submitFilters: FormEventHandler = (event) => {
        event.preventDefault();
        applyFilters();
    };

    const clearFilters = () => {
        const cleared = {
            search: '',
            category_id: '',
            period: currentMonthValue(),
        };

        setFilterData(cleared);
        applyFilters(cleared);
    };

    const submit: FormEventHandler = (event) => {
        event.preventDefault();

        form.post(route('operations.store'), {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                form.reset('category_id', 'amount', 'description', 'proof');
                setFileInputKey((key) => key + 1);
                setDrawerOpen(false);
            },
        });
    };

    const expenseColumns: Array<DataTableColumn<Expense>> = [
        {
            key: 'transaction_date',
            header: 'Tanggal',
            cellClassName: 'whitespace-nowrap',
            cell: (expense) => formatDate(expense.transaction_date),
        },
        {
            key: 'category',
            header: 'Kategori',
            cell: (expense) => <CategoryBadge>{expense.category ?? '-'}</CategoryBadge>,
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
            cell: (expense) => <ProofLink expense={expense} />,
        },
        {
            key: 'amount',
            header: 'Nominal',
            align: 'right',
            cellClassName: 'whitespace-nowrap font-semibold text-neutral-950',
            cell: (expense) => <CurrencyDisplay value={expense.amount} />,
        },
        {
            key: 'actions',
            header: 'Aksi',
            align: 'right',
            cell: (expense) => <ExpenseActions expense={expense} />,
        },
    ];

    return (
        <AuthenticatedLayout
            header={
                <PageHeader
                    title="Pengeluaran"
                    description="Kelola pengeluaran operasional"
                    actions={
                        isAdmin ? (
                            <Button
                                type="button"
                                onClick={() => setDrawerOpen(true)}
                            >
                                + Catat Pengeluaran
                            </Button>
                        ) : undefined
                    }
                />
            }
        >
            <Head title="Pengeluaran" />

            <div className="space-y-5 lg:space-y-6">
                {flash?.success && (
                    <div className="rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                        {flash.success}
                    </div>
                )}

                <div className="grid gap-4 sm:grid-cols-2">
                    <KpiCard
                        label="Total Pengeluaran"
                        value={
                            <CurrencyDisplay value={summary.filtered_total} />
                        }
                        caption={formatMonthLabel(filterData.period)}
                    />
                    <KpiCard
                        label="Jumlah Transaksi"
                        value={summary.transaction_count}
                        caption="transaksi tercatat"
                    />
                </div>

                <Card>
                    <CardContent className="p-4 sm:p-5">
                        <form
                            onSubmit={submitFilters}
                            className="grid gap-3 lg:grid-cols-[minmax(260px,1fr)_200px_220px_auto]"
                        >
                            <label className="relative block">
                                <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-400" />
                                <TextInput
                                    placeholder="Cari kategori atau keterangan..."
                                    className="h-11 pl-12"
                                    value={filterData.search}
                                    onChange={(event) =>
                                        setFilterData({
                                            ...filterData,
                                            search: event.target.value,
                                        })
                                    }
                                />
                            </label>
                            <TextInput
                                type="month"
                                value={filterData.period}
                                onChange={(event) => {
                                    const next = {
                                        ...filterData,
                                        period: event.target.value,
                                    };
                                    setFilterData(next);
                                    applyFilters(next);
                                }}
                            />
                            <SelectInput
                                value={filterData.category_id}
                                onChange={(event) => {
                                    const next = {
                                        ...filterData,
                                        category_id: event.target.value,
                                    };
                                    setFilterData(next);
                                    applyFilters(next);
                                }}
                            >
                                <option value="">Semua Kategori</option>
                                {categories.map((category) => (
                                    <option key={category.id} value={category.id}>
                                        {category.name}
                                    </option>
                                ))}
                            </SelectInput>
                            <div className="flex gap-2">
                                <Button
                                    type="submit"
                                    variant="secondary"
                                    className="w-full lg:w-auto"
                                >
                                    Cari
                                </Button>
                                {hasActiveFilter && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        onClick={clearFilters}
                                        className="w-full lg:w-auto"
                                    >
                                        Reset
                                    </Button>
                                )}
                            </div>
                        </form>
                    </CardContent>
                </Card>

                {expenses.data.length === 0 ? (
                    <Card>
                        <CardContent className="p-5">
                            <EmptyState
                                title={
                                    isFilteredEmpty
                                        ? 'Tidak ada pengeluaran yang sesuai'
                                        : 'Belum ada pengeluaran'
                                }
                                description={
                                    isFilteredEmpty
                                        ? 'Coba ubah periode, kategori, atau pencarian.'
                                        : 'Catat pengeluaran operasional pertama perusahaan.'
                                }
                            />
                            {!isFilteredEmpty && isAdmin && (
                                <div className="mt-5 flex justify-center">
                                    <Button
                                        type="button"
                                        onClick={() => setDrawerOpen(true)}
                                    >
                                        + Catat Pengeluaran
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ) : (
                    <>
                        <Card className="hidden lg:block">
                            <CardContent className="p-0">
                                <DataTable
                                    rows={expenses.data}
                                    columns={expenseColumns}
                                    getRowKey={(expense) => expense.id}
                                    minWidth="min-w-[860px]"
                                />
                            </CardContent>
                        </Card>

                        <div className="grid gap-3 lg:hidden">
                            {expenses.data.map((expense) => (
                                <ExpenseMobileCard
                                    key={expense.id}
                                    expense={expense}
                                />
                            ))}
                        </div>
                    </>
                )}
            </div>

            {isAdmin && (
                <ExpenseDrawer
                    open={drawerOpen}
                    onClose={() => setDrawerOpen(false)}
                    form={form}
                    submit={submit}
                    categories={categories}
                    fileInputKey={fileInputKey}
                    clearProof={() => {
                        form.setData('proof', null);
                        setFileInputKey((key) => key + 1);
                    }}
                />
            )}
        </AuthenticatedLayout>
    );
}

function ExpenseDrawer({
    open,
    onClose,
    form,
    submit,
    categories,
    fileInputKey,
    clearProof,
}: {
    open: boolean;
    onClose: () => void;
    form: ReturnType<typeof useForm<{
        category_id: string;
        transaction_date: string;
        amount: string;
        description: string;
        proof: File | null;
    }>>;
    submit: FormEventHandler;
    categories: Category[];
    fileInputKey: number;
    clearProof: () => void;
}) {
    useEffect(() => {
        if (!open) {
            return;
        }

        const closeOnEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        document.addEventListener('keydown', closeOnEscape);

        return () => document.removeEventListener('keydown', closeOnEscape);
    }, [onClose, open]);

    if (!open) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-50">
            <button
                type="button"
                className="absolute inset-0 bg-black/40"
                aria-label="Tutup drawer"
                onClick={onClose}
            />
            <aside className="absolute inset-x-0 bottom-0 flex max-h-[92vh] flex-col rounded-t-lg bg-surface shadow-floating sm:inset-y-0 sm:left-auto sm:right-0 sm:max-h-none sm:w-[clamp(380px,16.666vw,420px)] sm:rounded-none">
                <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-4">
                    <div>
                        <h2 className="text-lg font-bold text-neutral-950">
                            Catat Pengeluaran
                        </h2>
                        <p className="mt-1 text-sm text-neutral-500">
                            Biaya operasional perusahaan.
                        </p>
                    </div>
                    <button
                        type="button"
                        className="flex h-10 w-10 items-center justify-center rounded-md text-2xl leading-none text-neutral-500 hover:bg-neutral-100 hover:text-neutral-950 focus:outline-none focus:ring-2 focus:ring-brand-yellow-500"
                        onClick={onClose}
                        aria-label="Tutup"
                    >
                        ×
                    </button>
                </div>

                <form
                    onSubmit={submit}
                    className="flex min-h-0 flex-1 flex-col"
                >
                    <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-5 py-5">
                        <FormField
                            label="Tanggal *"
                            error={form.errors.transaction_date}
                        >
                            <TextInput
                                type="date"
                                className="block w-full"
                                value={form.data.transaction_date}
                                onChange={(event) =>
                                    form.setData(
                                        'transaction_date',
                                        event.target.value,
                                    )
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
                                    form.setData(
                                        'category_id',
                                        event.target.value,
                                    )
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

                        <FormField label="Nominal *" error={form.errors.amount}>
                            <TextInput
                                inputMode="numeric"
                                className="block w-full"
                                value={
                                    form.data.amount
                                        ? formatRupiahInput(form.data.amount)
                                        : ''
                                }
                                onChange={(event) =>
                                    form.setData(
                                        'amount',
                                        event.target.value.replace(/\D/g, ''),
                                    )
                                }
                                placeholder="Rp 750.000"
                                required
                            />
                        </FormField>

                        <FormField
                            label="Bukti *"
                            error={form.errors.proof}
                            helpText="JPG, PNG, WEBP, atau PDF. Maks. 10 MB."
                        >
                            <label className="flex min-h-32 cursor-pointer flex-col items-center justify-center rounded-md border border-dashed border-neutral-300 bg-neutral-50 px-4 py-6 text-center transition hover:border-brand-yellow-400 hover:bg-brand-yellow-50">
                                <input
                                    key={fileInputKey}
                                    type="file"
                                    accept=".jpg,.jpeg,.png,.webp,.pdf"
                                    className="sr-only"
                                    onChange={(event) =>
                                        form.setData(
                                            'proof',
                                            event.target.files?.[0] ?? null,
                                        )
                                    }
                                    required={!form.data.proof}
                                />
                                <UploadIcon className="h-7 w-7 text-neutral-400" />
                                <span className="mt-3 font-semibold text-neutral-800">
                                    Upload Bukti
                                </span>
                                <span className="mt-1 text-sm text-neutral-500">
                                    Pilih foto atau dokumen
                                </span>
                            </label>
                            {form.data.proof && (
                                <div className="mt-3 flex items-center justify-between gap-3 rounded-md border border-neutral-200 bg-surface px-3 py-2 text-sm">
                                    <span className="min-w-0 truncate text-neutral-700">
                                        {form.data.proof.name}
                                    </span>
                                    <button
                                        type="button"
                                        className="font-semibold text-red-600 hover:text-red-700"
                                        onClick={clearProof}
                                    >
                                        Hapus
                                    </button>
                                </div>
                            )}
                        </FormField>

                        <FormField
                            label="Keterangan (opsional)"
                            error={form.errors.description}
                        >
                            <textarea
                                className="block min-h-28 w-full rounded-md border-neutral-300 text-sm shadow-sm focus:border-brand-yellow-500 focus:ring-brand-yellow-500"
                                value={form.data.description}
                                onChange={(event) =>
                                    form.setData(
                                        'description',
                                        event.target.value,
                                    )
                                }
                                placeholder="Pembelian perlengkapan kantor..."
                            />
                        </FormField>
                    </div>

                    <div className="grid gap-3 border-t border-neutral-200 bg-surface px-5 py-4 sm:grid-cols-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                        >
                            Batal
                        </Button>
                        <Button
                            type="submit"
                            disabled={form.processing || categories.length === 0}
                            isLoading={form.processing}
                        >
                            Simpan Pengeluaran
                        </Button>
                    </div>
                </form>
            </aside>
        </div>
    );
}

function ExpenseMobileCard({ expense }: { expense: Expense }) {
    return (
        <Card>
            <CardContent className="space-y-3 p-4">
                <div className="flex items-start justify-between gap-3">
                    <div>
                        <div className="text-sm font-semibold text-neutral-950">
                            {formatDate(expense.transaction_date)}
                        </div>
                        <div className="mt-2">
                            <CategoryBadge>
                                {expense.category ?? '-'}
                            </CategoryBadge>
                        </div>
                    </div>
                    <ExpenseActions expense={expense} />
                </div>
                <div className="text-sm text-neutral-600">
                    {expense.description ?? '-'}
                </div>
                <div className="flex items-center justify-between gap-3">
                    <ProofLink expense={expense} />
                    <CurrencyDisplay
                        value={expense.amount}
                        className="font-bold text-neutral-950"
                    />
                </div>
            </CardContent>
        </Card>
    );
}

function ExpenseActions({ expense }: { expense: Expense }) {
    return (
        <Dropdown>
            <Dropdown.Trigger>
                <button
                    type="button"
                    className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-neutral-300 bg-surface text-lg font-bold leading-none text-neutral-700 hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-brand-yellow-500 focus:ring-offset-2"
                    aria-label={`Aksi pengeluaran ${expense.id}`}
                >
                    ...
                </button>
            </Dropdown.Trigger>
            <Dropdown.Content>
                <a
                    href={expense.proof_download_url}
                    className="block w-full px-4 py-2 text-start text-sm leading-5 text-neutral-700 transition duration-150 ease-in-out hover:bg-neutral-100 focus:bg-neutral-100 focus:outline-none"
                >
                    Lihat Bukti
                </a>
            </Dropdown.Content>
        </Dropdown>
    );
}

function ProofLink({ expense }: { expense: Expense }) {
    if (!expense.proof_download_url) {
        return <span className="text-neutral-400">-</span>;
    }

    return (
        <a
            className="font-semibold text-brand-yellow-700 hover:text-brand-yellow-800"
            href={expense.proof_download_url}
        >
            Lihat Bukti →
        </a>
    );
}

function CategoryBadge({ children }: { children: ReactNode }) {
    return (
        <span className="inline-flex rounded-md bg-neutral-100 px-2 py-1 text-xs font-semibold text-neutral-700">
            {children}
        </span>
    );
}

function queryFromFilters(filters: {
    search: string;
    category_id: string;
    period: string;
}) {
    const [year, month] = filters.period.split('-').map(Number);
    const dateFrom = `${filters.period}-01`;
    const lastDate = new Date(year, month, 0).getDate();
    const dateTo = `${filters.period}-${String(lastDate).padStart(2, '0')}`;

    return Object.fromEntries(
        Object.entries({
            search: filters.search,
            category_id: filters.category_id,
            date_from: dateFrom,
            date_to: dateTo,
        }).filter(([, value]) => value !== ''),
    );
}

function monthValue(date: string) {
    return date ? date.slice(0, 7) : currentMonthValue();
}

function currentMonthValue() {
    return new Date().toISOString().slice(0, 7);
}

function formatMonthLabel(value: string) {
    return new Intl.DateTimeFormat('id-ID', {
        month: 'long',
        year: 'numeric',
    }).format(new Date(`${value}-01T00:00:00`));
}

function formatDate(value: string) {
    return new Intl.DateTimeFormat('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    }).format(new Date(value));
}

function formatRupiahInput(value: string) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    })
        .format(Number(value || 0))
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

function UploadIcon({ className = '' }: { className?: string }) {
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
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <path d="M17 8 12 3 7 8" />
            <path d="M12 3v12" />
        </svg>
    );
}
