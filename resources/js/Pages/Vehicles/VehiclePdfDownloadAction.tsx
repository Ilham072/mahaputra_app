import { PDFDownloadLink } from '@react-pdf/renderer';
import VehiclePdfDocument, { VehiclePdfPayload } from './VehiclePdfDocument';

export default function VehiclePdfDownloadAction({
    payload,
    className,
}: {
    payload: VehiclePdfPayload;
    className: string;
}) {
    return (
        <PDFDownloadLink
            className={className}
            document={<VehiclePdfDocument payload={payload} />}
            fileName={`internal-kendaraan-${payload.vehicle.plate_number.replace(/\s+/g, '-')}.pdf`}
        >
            {({ loading }) => (loading ? 'Membuat PDF' : 'Unduh PDF Internal')}
        </PDFDownloadLink>
    );
}
