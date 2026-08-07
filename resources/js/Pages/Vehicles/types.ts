export type Option = {
    id?: number;
    value?: string;
    label?: string;
    name?: string;
};

export type VehicleOptions = {
    brands: Array<{ id: number; name: string }>;
    capitalTypes: Array<{ value: 'UMUM' | 'KHUSUS'; label: string }>;
    taxStatuses: Array<{ value: 'ON' | 'OFF'; label: string }>;
    statuses: Array<{
        value: 'PREPARATION' | 'READY' | 'BOOKING' | 'SOLD';
        label: string;
    }>;
};

export type VehicleSummary = {
    id: number;
    purchase_date: string;
    brand: string | null;
    type: string;
    plate_number: string;
    year: number;
    color: string;
    capital_type: 'UMUM' | 'KHUSUS';
    asking_price: number;
    status: 'PREPARATION' | 'READY' | 'BOOKING' | 'SOLD';
};

export type VehicleDetail = VehicleSummary & {
    brand_id: number;
    showroom_capital: number;
    collaborator_name: string | null;
    collaborator_capital: number;
    tax_status: 'ON' | 'OFF';
    tax_amount: number;
    initial_capital: number;
};
