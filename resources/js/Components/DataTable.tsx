import { ReactNode } from 'react';

type DataTableAlign = 'left' | 'right' | 'center';

export type DataTableColumn<T> = {
    key: string;
    header: ReactNode;
    align?: DataTableAlign;
    headerClassName?: string;
    cellClassName?: string;
    cell: (row: T) => ReactNode;
};

type DataTableProps<T> = {
    rows: T[];
    columns: Array<DataTableColumn<T>>;
    getRowKey: (row: T) => string | number;
    minWidth?: string;
};

const alignClasses: Record<DataTableAlign, string> = {
    left: 'text-left',
    right: 'text-right',
    center: 'text-center',
};

export default function DataTable<T>({
    rows,
    columns,
    getRowKey,
    minWidth = 'min-w-full',
}: DataTableProps<T>) {
    return (
        <div className="overflow-x-auto">
            <table className={`${minWidth} divide-y divide-neutral-200`}>
                <thead className="bg-neutral-50">
                    <tr>
                        {columns.map((column) => (
                            <th
                                key={column.key}
                                className={[
                                    'px-3 py-3 text-xs font-semibold uppercase text-neutral-500 sm:px-4',
                                    alignClasses[column.align ?? 'left'],
                                    column.headerClassName ?? '',
                                ].join(' ')}
                            >
                                {column.header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200 bg-surface">
                    {rows.map((row) => (
                        <tr key={getRowKey(row)}>
                            {columns.map((column) => (
                                <td
                                    key={column.key}
                                    className={[
                                        'px-3 py-3 text-sm text-neutral-700 sm:px-4',
                                        alignClasses[column.align ?? 'left'],
                                        column.cellClassName ?? '',
                                    ].join(' ')}
                                >
                                    {column.cell(row)}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
