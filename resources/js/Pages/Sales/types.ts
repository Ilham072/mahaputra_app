export type PaymentType = 'CASH' | 'CREDIT';

export type SaleVehicleContext = {
    id: number;
    brand: string | null;
    type: string;
    plate_number: string;
    asking_price: number;
    status: 'PREPARATION' | 'READY' | 'BOOKING' | 'SOLD';
    initial_capital: number;
    vehicle_cost: number;
    final_capital: number;
};

export type SaleOption = {
    id: number;
    name: string;
};

export type SaleSummary = {
    id: number;
    sale_date: string;
    vehicle: string;
    plate_number: string;
    customer_name: string;
    area: string;
    employee: string;
    payment_type: PaymentType;
    selling_price: number;
    final_capital_snapshot: number;
    profit_snapshot: number;
};

export type SaleDetail = SaleSummary & {
    vehicle_id: number;
    customer: {
        name: string;
        whatsapp: string;
        alternative_whatsapp: string | null;
        address: string;
        ktp_original_name: string | null;
        ktp_download_url: string;
    };
    credit_total: number;
    initial_capital_snapshot: number;
    vehicle_cost_snapshot: number;
    payment: {
        financing_provider: string | null;
        dp: number;
        outstanding_dp: number;
        financing_disbursement: number;
        refund: number;
    };
};

export type SaleFormModel = {
    id: number;
    sale_date: string;
    employee_id: number;
    area_id: number;
    customer_name: string;
    customer_whatsapp: string;
    customer_alternative_whatsapp: string | null;
    customer_address: string;
    customer_ktp_original_name: string | null;
    payment_type: PaymentType;
    selling_price: number;
    financing_provider_id: number | null;
    dp: number;
    outstanding_dp: number;
    financing_disbursement: number;
    refund: number;
};
