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
    additional_costs_total: number;
    total_vehicle_cost: number;
    initial_capital: number;
    final_capital: number;
    costs: VehicleCost[];
};

export type VehicleCost = {
    id: number;
    cost_date: string;
    category: 'DICO' | 'ELECTRICAL_UNDERCARRIAGE' | 'OTHER';
    category_label: string;
    amount: number;
    description: string | null;
};

export type VehicleCostCategoryOption = {
    value: VehicleCost['category'];
    label: string;
};
