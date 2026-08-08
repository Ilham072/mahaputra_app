import { Document, Page, StyleSheet, Text, View } from '@react-pdf/renderer';

export type InvoicePdfPayload = {
    generated_at: string;
    invoice: {
        number: string;
        sale_date: string;
        payment_type: 'CASH' | 'CREDIT';
        transaction_total: number;
    };
    vehicle: {
        brand: string | null;
        type: string;
        plate_number: string;
        year: number;
        color: string;
    };
    customer: {
        name: string;
        whatsapp: string;
        alternative_whatsapp: string | null;
        address: string;
    };
    showroom: {
        area: string;
        employee: string;
    };
    payment: {
        financing_provider: string | null;
        selling_price: number;
        dp: number;
        outstanding_dp: number;
        financing_disbursement: number;
        refund: number;
    };
};

const styles = StyleSheet.create({
    page: {
        padding: 36,
        fontSize: 9,
        fontFamily: 'Helvetica',
        color: '#111111',
    },
    header: {
        marginBottom: 20,
        paddingBottom: 12,
        borderBottomWidth: 2,
        borderBottomColor: '#EAB308',
    },
    brand: {
        fontSize: 18,
        fontWeight: 700,
    },
    title: {
        marginTop: 6,
        fontSize: 13,
        fontWeight: 700,
    },
    muted: {
        color: '#737373',
    },
    summary: {
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#E5E5E5',
        padding: 10,
    },
    totalLabel: {
        color: '#737373',
        marginBottom: 4,
    },
    totalValue: {
        fontSize: 16,
        fontWeight: 700,
    },
    grid: {
        flexDirection: 'row',
        gap: 16,
        marginBottom: 14,
    },
    column: {
        flex: 1,
    },
    sectionTitle: {
        marginBottom: 6,
        fontSize: 10,
        fontWeight: 700,
    },
    row: {
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
    table: {
        marginTop: 2,
        borderWidth: 1,
        borderColor: '#D4D4D4',
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5E5',
    },
    tableHead: {
        backgroundColor: '#EAB308',
        fontWeight: 700,
    },
    cell: {
        padding: 6,
        borderRightWidth: 1,
        borderRightColor: '#E5E5E5',
    },
    numberCell: {
        textAlign: 'right',
    },
    note: {
        marginTop: 14,
        color: '#737373',
        lineHeight: 1.4,
    },
    footer: {
        position: 'absolute',
        left: 36,
        right: 36,
        bottom: 18,
        flexDirection: 'row',
        justifyContent: 'space-between',
        fontSize: 7,
        color: '#737373',
    },
});

export default function InvoicePdfDocument({
    payload,
}: {
    payload: InvoicePdfPayload;
}) {
    const vehicleName = `${payload.vehicle.brand ?? '-'} ${payload.vehicle.type}`;

    return (
        <Document
            title={`Invoice ${payload.invoice.number}`}
            author="Mahaputra Apps"
            creator="Mahaputra Apps"
        >
            <Page size="A4" style={styles.page}>
                <View style={styles.header}>
                    <Text style={styles.brand}>Mahaputra Group</Text>
                    <Text style={styles.title}>Invoice Pelanggan</Text>
                    <Text style={styles.muted}>
                        {payload.invoice.number} | {payload.invoice.sale_date}
                    </Text>
                </View>

                <View style={styles.summary}>
                    <Text style={styles.totalLabel}>Total Transaksi</Text>
                    <Text style={styles.totalValue}>
                        {formatRupiah(payload.invoice.transaction_total)}
                    </Text>
                    <Text style={styles.muted}>
                        Metode pembayaran: {payload.invoice.payment_type}
                    </Text>
                </View>

                <View style={styles.grid}>
                    <View style={styles.column}>
                        <Text style={styles.sectionTitle}>Pembeli</Text>
                        <Info label="Nama" value={payload.customer.name} />
                        <Info label="WhatsApp" value={payload.customer.whatsapp} />
                        <Info
                            label="WA Alternatif"
                            value={payload.customer.alternative_whatsapp ?? '-'}
                        />
                        <Info label="Alamat" value={payload.customer.address} />
                    </View>

                    <View style={styles.column}>
                        <Text style={styles.sectionTitle}>Kendaraan</Text>
                        <Info label="Kendaraan" value={vehicleName} />
                        <Info label="No Polisi" value={payload.vehicle.plate_number} />
                        <Info
                            label="Tahun/Warna"
                            value={`${payload.vehicle.year} / ${payload.vehicle.color}`}
                        />
                        <Info label="Area" value={payload.showroom.area} />
                    </View>
                </View>

                <View>
                    <Text style={styles.sectionTitle}>Rincian Pembayaran</Text>
                    <View style={styles.table}>
                        <View style={[styles.tableRow, styles.tableHead]}>
                            <Cell width="65%">Keterangan</Cell>
                            <Cell width="35%" alignRight>
                                Nominal
                            </Cell>
                        </View>
                        <PaymentRows payload={payload} />
                    </View>
                </View>

                <Text style={styles.note}>
                    Dokumen ini dibuat dari data transaksi Mahaputra Apps dan tidak
                    memuat modal, biaya internal, atau laba kendaraan.
                </Text>

                <View style={styles.footer} fixed>
                    <Text>PIC: {payload.showroom.employee}</Text>
                    <Text>Dibuat {payload.generated_at}</Text>
                </View>
            </Page>
        </Document>
    );
}

function PaymentRows({ payload }: { payload: InvoicePdfPayload }) {
    if (payload.invoice.payment_type === 'CASH') {
        return (
            <View style={styles.tableRow}>
                <Cell width="65%">Harga Terjual</Cell>
                <Cell width="35%" alignRight>
                    {formatRupiah(payload.payment.selling_price)}
                </Cell>
            </View>
        );
    }

    return (
        <>
            <View style={styles.tableRow}>
                <Cell width="65%">
                    {`Pembiayaan ${payload.payment.financing_provider ?? '-'}`}
                </Cell>
                <Cell width="35%" alignRight>
                    {formatRupiah(payload.payment.financing_disbursement)}
                </Cell>
            </View>
            <View style={styles.tableRow}>
                <Cell width="65%">DP</Cell>
                <Cell width="35%" alignRight>
                    {formatRupiah(payload.payment.dp)}
                </Cell>
            </View>
            <View style={styles.tableRow}>
                <Cell width="65%">DP Terutang</Cell>
                <Cell width="35%" alignRight>
                    {formatRupiah(payload.payment.outstanding_dp)}
                </Cell>
            </View>
            <View style={styles.tableRow}>
                <Cell width="65%">Refund</Cell>
                <Cell width="35%" alignRight>
                    {formatRupiah(payload.payment.refund)}
                </Cell>
            </View>
            <View style={styles.tableRow}>
                <Cell width="65%">Total Nilai Kredit</Cell>
                <Cell width="35%" alignRight>
                    {formatRupiah(payload.invoice.transaction_total)}
                </Cell>
            </View>
        </>
    );
}

function Info({ label, value }: { label: string; value: string }) {
    return (
        <View style={styles.row}>
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
