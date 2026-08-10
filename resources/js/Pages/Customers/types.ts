import { PaymentType } from '../Sales/types';

export type CustomerSummary = {
    id: number;
    name: string;
    whatsapp: string;
    alternative_whatsapp: string | null;
    address: string;
    sales_count: number;
    total_purchase: number;
    last_sale_date: string | null;
    latest_area: string | null;
};

export type CustomerSale = {
    id: number;
    sale_date: string;
    vehicle: string;
    plate_number: string;
    year: number;
    area: string;
    employee: string;
    payment_type: PaymentType;
    financing_provider: string | null;
    selling_price: number;
};

export type CustomerDetail = CustomerSummary & {
    ktp_original_name: string | null;
    ktp_download_url: string;
    sales: CustomerSale[];
};

export type CustomerFormModel = {
    id: number;
    name: string;
    whatsapp: string;
    alternative_whatsapp: string | null;
    address: string;
};
