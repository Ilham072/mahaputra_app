import { PDFDownloadLink } from '@react-pdf/renderer';
import ReportPdfDocument, { ReportPdfPayload } from './ReportPdfDocument';

export default function PdfDownloadAction({
    payload,
    className,
}: {
    payload: ReportPdfPayload;
    className: string;
}) {
    return (
        <PDFDownloadLink
            className={className}
            document={<ReportPdfDocument payload={payload} />}
            fileName={`laporan-penjualan-${payload.filters.date_from}-${payload.filters.date_to}.pdf`}
        >
            {({ loading }) => (loading ? 'Membuat PDF' : 'Unduh PDF')}
        </PDFDownloadLink>
    );
}
