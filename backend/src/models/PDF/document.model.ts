    export type OrderItem = {
    name: string;
    price: number;
    quantity: number;
    typeBox: number;
    };

    export type Address = {
    city: string;
    street: string;
    number: number | string;
    };

    export type Customer = {
    companyName: string;
    RUC : number;
    addres: Address;
    payMethod: string;
    date: string;
    moneda:string;
    }

    export type Payment = {
        subtotal: number,
        tax: number,
        total: number
    }

    export type Driver = {

    }