import { PDFDownloadLink } from '@react-pdf/renderer';
import InvoicePdfDocument, { InvoicePdfPayload } from './InvoicePdfDocument';

export default function InvoicePdfDownloadAction({
    payload,
    className,
}: {
    payload: InvoicePdfPayload;
    className: string;
}) {
    return (
        <PDFDownloadLink
            className={className}
            document={<InvoicePdfDocument payload={payload} />}
            fileName={`${payload.invoice.number.toLowerCase()}.pdf`}
        >
            {({ loading }) => (loading ? 'Membuat Invoice' : 'Unduh Invoice')}
        </PDFDownloadLink>
    );
}
