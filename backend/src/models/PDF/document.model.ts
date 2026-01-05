    export type OrderItem = {
    id: string;
    name: string;
    price: number;
    quantity: number;
    };

    export type Address = {
    city: string;
    street: string;
    number: string;
    };

    export type DataOrder = {
    address: Address;
    items: OrderItem[];
    total: number;
    userId: string
    };

    export type DataUser = {
    name: string;
    };
