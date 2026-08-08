import { Document, Page, StyleSheet, Text, View } from '@react-pdf/renderer';

export type VehiclePdfPayload = {
    generated_at: string;
    vehicle: {
        id: number;
        purchase_date: string;
        brand: string | null;
        type: string;
        plate_number: string;
        year: number;
        color: string;
        capital_type: 'UMUM' | 'KHUSUS';
        tax_status: 'ON' | 'OFF';
        status: 'PREPARATION' | 'READY' | 'BOOKING' | 'SOLD';
        asking_price: number;
        showroom_capital: number;
        collaborator_name: string | null;
        collaborator_capital: number;
        tax_amount: number;
        additional_costs_total: number;
        total_vehicle_cost: number;
        initial_capital: number;
        final_capital: number;
        photos_count: number;
        has_cover_photo: boolean;
    };
    costs: Array<{
        id: number;
        cost_date: string;
        category_label: string;
        amount: number;
        description: string | null;
    }>;
    documents: Array<{
        document_type: 'STNK' | 'BPKB';
        document_label: string;
        is_available: boolean;
        original_name: string | null;
        note: string | null;
    }>;
    sale: {
        sale_date: string;
        payment_type: 'CASH' | 'CREDIT';
        customer_name: string | null;
        employee: string | null;
        area: string | null;
        selling_price: number;
        credit_total: number;
        profit_snapshot: number;
    } | null;
};

const styles = StyleSheet.create({
    page: {
        padding: 28,
        fontSize: 8,
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
        fontSize: 17,
        fontWeight: 700,
    },
    subtitle: {
        marginTop: 4,
        color: '#525252',
    },
    section: {
        marginBottom: 12,
    },
    sectionTitle: {
        marginBottom: 6,
        fontSize: 10,
        fontWeight: 700,
    },
    grid: {
        flexDirection: 'row',
        gap: 8,
    },
    column: {
        flex: 1,
    },
    infoRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5E5',
        paddingVertical: 4,
    },
    label: {
        width: '42%',
        color: '#737373',
    },
    value: {
        width: '58%',
        fontWeight: 700,
    },
    summaryGrid: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 12,
    },
    summaryCard: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#E5E5E5',
        padding: 7,
    },
    summaryLabel: {
        marginBottom: 3,
        fontSize: 7,
        color: '#737373',
    },
    summaryValue: {
        fontSize: 10,
        fontWeight: 700,
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
        padding: 4,
        borderRightWidth: 1,
        borderRightColor: '#E5E5E5',
    },
    numberCell: {
        textAlign: 'right',
    },
    note: {
        color: '#737373',
    },
    footer: {
        position: 'absolute',
        left: 28,
        right: 28,
        bottom: 14,
        flexDirection: 'row',
        justifyContent: 'space-between',
        fontSize: 7,
        color: '#737373',
    },
});

export default function VehiclePdfDocument({
    payload,
}: {
    payload: VehiclePdfPayload;
}) {
    const vehicleName = `${payload.vehicle.brand ?? '-'} ${payload.vehicle.type}`;

    return (
        <Document
            title={`Internal Kendaraan ${payload.vehicle.plate_number}`}
            author="Mahaputra Apps"
            creator="Mahaputra Apps"
        >
            <Page size="A4" style={styles.page} wrap>
                <View style={styles.header} fixed>
                    <Text style={styles.title}>PDF Internal Kendaraan</Text>
                    <Text style={styles.subtitle}>
                        {vehicleName} | {payload.vehicle.plate_number} | Dibuat{' '}
                        {payload.generated_at}
                    </Text>
                </View>

                <View style={styles.summaryGrid}>
                    <Summary
                        label="Harga Penawaran"
                        value={formatRupiah(payload.vehicle.asking_price)}
                    />
                    <Summary
                        label="Modal Awal"
                        value={formatRupiah(payload.vehicle.initial_capital)}
                    />
                    <Summary
                        label="Total Biaya"
                        value={formatRupiah(payload.vehicle.total_vehicle_cost)}
                    />
                    <Summary
                        label="Modal Akhir"
                        value={formatRupiah(payload.vehicle.final_capital)}
                    />
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Informasi Kendaraan</Text>
                    <View style={styles.grid}>
                        <View style={styles.column}>
                            <Info label="Tanggal Pembelian" value={payload.vehicle.purchase_date} />
                            <Info label="Merk/Tipe" value={vehicleName} />
                            <Info label="No Polisi" value={payload.vehicle.plate_number} />
                            <Info label="Tahun/Warna" value={`${payload.vehicle.year} / ${payload.vehicle.color}`} />
                            <Info label="Status" value={payload.vehicle.status} />
                        </View>
                        <View style={styles.column}>
                            <Info label="Jenis Modal" value={payload.vehicle.capital_type} />
                            <Info label="Status Pajak" value={payload.vehicle.tax_status} />
                            <Info label="Jumlah Foto" value={String(payload.vehicle.photos_count)} />
                            <Info label="Cover Foto" value={payload.vehicle.has_cover_photo ? 'Ada' : 'Belum ada'} />
                        </View>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Modal dan Biaya</Text>
                    <View style={styles.grid}>
                        <View style={styles.column}>
                            <Info label="Modal Showroom" value={formatRupiah(payload.vehicle.showroom_capital)} />
                            <Info label="Kolaborator" value={payload.vehicle.collaborator_name ?? '-'} />
                            <Info label="Modal Kolaborator" value={formatRupiah(payload.vehicle.collaborator_capital)} />
                        </View>
                        <View style={styles.column}>
                            <Info label="Pajak" value={formatRupiah(payload.vehicle.tax_amount)} />
                            <Info label="Biaya Tambahan" value={formatRupiah(payload.vehicle.additional_costs_total)} />
                            <Info label="Modal Akhir" value={formatRupiah(payload.vehicle.final_capital)} />
                        </View>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Biaya Kendaraan</Text>
                    {payload.costs.length === 0 ? (
                        <Text style={styles.note}>Belum ada biaya tambahan.</Text>
                    ) : (
                        <View style={styles.table}>
                            <View style={[styles.row, styles.headerRow]} fixed>
                                <Cell width="16%">Tanggal</Cell>
                                <Cell width="22%">Kategori</Cell>
                                <Cell width="42%">Keterangan</Cell>
                                <Cell width="20%" alignRight>
                                    Nominal
                                </Cell>
                            </View>
                            {payload.costs.map((cost) => (
                                <View key={cost.id} style={styles.row} wrap={false}>
                                    <Cell width="16%">{cost.cost_date}</Cell>
                                    <Cell width="22%">{cost.category_label}</Cell>
                                    <Cell width="42%">{cost.description ?? '-'}</Cell>
                                    <Cell width="20%" alignRight>
                                        {formatRupiah(cost.amount)}
                                    </Cell>
                                </View>
                            ))}
                        </View>
                    )}
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Dokumen Kendaraan</Text>
                    <View style={styles.table}>
                        <View style={[styles.row, styles.headerRow]} fixed>
                            <Cell width="20%">Dokumen</Cell>
                            <Cell width="18%">Status</Cell>
                            <Cell width="30%">File</Cell>
                            <Cell width="32%">Catatan</Cell>
                        </View>
                        {payload.documents.map((document) => (
                            <View key={document.document_type} style={styles.row} wrap={false}>
                                <Cell width="20%">{document.document_label}</Cell>
                                <Cell width="18%">{document.is_available ? 'Tersedia' : 'Belum tersedia'}</Cell>
                                <Cell width="30%">{document.original_name ?? '-'}</Cell>
                                <Cell width="32%">{document.note ?? '-'}</Cell>
                            </View>
                        ))}
                    </View>
                </View>

                {payload.sale && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Transaksi Penjualan</Text>
                        <View style={styles.grid}>
                            <View style={styles.column}>
                                <Info label="Tanggal Penjualan" value={payload.sale.sale_date} />
                                <Info label="Pembayaran" value={payload.sale.payment_type} />
                                <Info label="Customer" value={payload.sale.customer_name ?? '-'} />
                            </View>
                            <View style={styles.column}>
                                <Info label="Area" value={payload.sale.area ?? '-'} />
                                <Info label="PIC" value={payload.sale.employee ?? '-'} />
                                <Info label="Laba Snapshot" value={formatRupiah(payload.sale.profit_snapshot)} />
                            </View>
                        </View>
                    </View>
                )}

                <View style={styles.footer} fixed>
                    <Text>Mahaputra Apps - dokumen internal</Text>
                    <Text
                        render={({ pageNumber, totalPages }) =>
                            `Halaman ${pageNumber} / ${totalPages}`
                        }
                    />
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

function Info({ label, value }: { label: string; value: string }) {
    return (
        <View style={styles.infoRow}>
            <Text style={styles.label}>{label}</Text>
            <Text style={styles.value}>{value}</Text>
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
