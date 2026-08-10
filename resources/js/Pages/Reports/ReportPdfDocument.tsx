import {
    Document,
    Page,
    StyleSheet,
    Text,
    View,
} from '@react-pdf/renderer';

export type SaleReportRow = {
    id: number;
    sale_date: string;
    area: string;
    employee: string;
    customer_name: string;
    customer_whatsapp: string;
    vehicle: string;
    plate_number: string;
    year: number;
    capital_type: 'UMUM' | 'KHUSUS';
    purchase_date: string;
    payment_type: 'CASH' | 'CREDIT';
    financing_provider: string | null;
    selling_price: number;
    credit_total: number;
    dp: number;
    outstanding_dp: number;
    initial_capital_snapshot: number;
    vehicle_cost_snapshot: number;
    final_capital_snapshot: number;
    profit_snapshot: number;
};

export type ReportFilters = {
    date_from: string;
    date_to: string;
    search: string;
    area_id: string;
    employee_id: string;
    payment_type: string;
    capital_type: string;
};

export type ReportSummary = {
    sales_count: number;
    sales_value: number;
    profit_total: number;
    final_capital_total: number;
    operational_total: number;
    profit_minus_operational: number;
};

export type ReportPdfPayload = {
    filters: ReportFilters;
    summary: ReportSummary;
    rows: SaleReportRow[];
    generated_at: string;
};

const styles = StyleSheet.create({
    page: {
        padding: 24,
        fontSize: 7,
        fontFamily: 'Helvetica',
        color: '#111111',
    },
    header: {
        marginBottom: 14,
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#EAB308',
    },
    title: {
        fontSize: 16,
        fontWeight: 700,
    },
    subtitle: {
        marginTop: 4,
        fontSize: 8,
        color: '#525252',
    },
    summaryGrid: {
        flexDirection: 'row',
        gap: 6,
        marginBottom: 12,
    },
    summaryCard: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#E5E5E5',
        padding: 6,
    },
    summaryLabel: {
        fontSize: 6,
        color: '#737373',
        marginBottom: 3,
    },
    summaryValue: {
        fontSize: 9,
        fontWeight: 700,
    },
    note: {
        marginBottom: 10,
        fontSize: 7,
        color: '#737373',
    },
    table: {
        borderWidth: 1,
        borderColor: '#D4D4D4',
    },
    row: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5E5',
        minHeight: 18,
    },
    headerRow: {
        backgroundColor: '#EAB308',
        fontWeight: 700,
    },
    cell: {
        padding: 3,
        borderRightWidth: 1,
        borderRightColor: '#E5E5E5',
    },
    numberCell: {
        textAlign: 'right',
    },
    footer: {
        position: 'absolute',
        left: 24,
        right: 24,
        bottom: 14,
        flexDirection: 'row',
        justifyContent: 'space-between',
        fontSize: 6,
        color: '#737373',
    },
});

const columns = [
    { label: 'No', width: '4%' },
    { label: 'Tanggal', width: '8%' },
    { label: 'Area', width: '7%' },
    { label: 'PIC', width: '8%' },
    { label: 'Kendaraan', width: '12%' },
    { label: 'Polisi', width: '8%' },
    { label: 'Modal', width: '6%' },
    { label: 'Bayar', width: '6%' },
    { label: 'Harga', width: '9%' },
    { label: 'DP', width: '8%' },
    { label: 'DP Trtg', width: '8%' },
    { label: 'Modal Akhir', width: '8%' },
    { label: 'Laba', width: '8%' },
] as const;

export default function ReportPdfDocument({
    payload,
}: {
    payload: ReportPdfPayload;
}) {
    const filePeriod = `${payload.filters.date_from} sampai ${payload.filters.date_to}`;

    return (
        <Document
            title={`Laporan Penjualan ${filePeriod}`}
            author="Mahaputra Apps"
            creator="Mahaputra Apps"
        >
            <Page size="A4" orientation="landscape" style={styles.page} wrap>
                <View style={styles.header} fixed>
                    <Text style={styles.title}>Laporan Penjualan Mahaputra Group</Text>
                    <Text style={styles.subtitle}>
                        Periode {filePeriod} | Dibuat {payload.generated_at}
                    </Text>
                </View>

                <View style={styles.summaryGrid}>
                    <Summary label="Transaksi" value={String(payload.summary.sales_count)} />
                    <Summary label="Nilai Penjualan" value={formatRupiah(payload.summary.sales_value)} />
                    <Summary label="Laba Kendaraan" value={formatRupiah(payload.summary.profit_total)} />
                    <Summary label="Operasional" value={formatRupiah(payload.summary.operational_total)} />
                    <Summary
                        label="Selisih Laba - Operasional"
                        value={formatRupiah(payload.summary.profit_minus_operational)}
                    />
                </View>

                <Text style={styles.note}>
                    Catatan: Selisih laba - operasional bukan formula final keuntungan perusahaan.
                </Text>

                <View style={styles.table}>
                    <View style={[styles.row, styles.headerRow]} fixed>
                        {columns.map((column) => (
                            <Text
                                key={column.label}
                                style={[styles.cell, { width: column.width }]}
                            >
                                {column.label}
                            </Text>
                        ))}
                    </View>

                    {payload.rows.map((row, index) => (
                        <View key={row.id} style={styles.row} wrap={false}>
                            <Cell width={columns[0].width}>{index + 1}</Cell>
                            <Cell width={columns[1].width}>{row.sale_date}</Cell>
                            <Cell width={columns[2].width}>{row.area}</Cell>
                            <Cell width={columns[3].width}>{row.employee}</Cell>
                            <Cell width={columns[4].width}>{row.vehicle}</Cell>
                            <Cell width={columns[5].width}>{row.plate_number}</Cell>
                            <Cell width={columns[6].width}>{row.capital_type}</Cell>
                            <Cell width={columns[7].width}>{row.payment_type}</Cell>
                            <Cell width={columns[8].width} alignRight>
                                {formatCompactRupiah(row.selling_price)}
                            </Cell>
                            <Cell width={columns[9].width} alignRight>
                                {formatCompactRupiah(row.dp)}
                            </Cell>
                            <Cell width={columns[10].width} alignRight>
                                {formatCompactRupiah(row.outstanding_dp)}
                            </Cell>
                            <Cell width={columns[11].width} alignRight>
                                {formatCompactRupiah(row.final_capital_snapshot)}
                            </Cell>
                            <Cell width={columns[12].width} alignRight>
                                {formatCompactRupiah(row.profit_snapshot)}
                            </Cell>
                        </View>
                    ))}
                </View>

                <View style={styles.footer} fixed>
                    <Text>Mahaputra Apps</Text>
                    <Text render={({ pageNumber, totalPages }) => `Halaman ${pageNumber} / ${totalPages}`} />
                </View>
            </Page>
        </Document>
    );
}

function Summary({ label, value }: { label: string; value: string }) {
    return (
        <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>{label}</Text>
            <Text style={styles.summaryValue}>{value}</Text>
        </View>
    );
}

function Cell({
    width,
    alignRight = false,
    children,
}: {
    width: string;
    alignRight?: boolean;
    children: string | number;
}) {
    return (
        <Text
            style={[
                styles.cell,
                alignRight ? styles.numberCell : {},
                { width },
            ]}
        >
            {children}
        </Text>
    );
}

function formatRupiah(value: number) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(value);
}

function formatCompactRupiah(value: number) {
    return new Intl.NumberFormat('id-ID', {
        maximumFractionDigits: 0,
    }).format(value);
}
