import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface OrderResponse {
    id: bigint;
    customerName: string;
    createdBy: Principal;
    totalAmount: bigint;
    address: string;
    notes?: string;
    timestamp: bigint;
    items: Array<CartItem>;
    phoneNumber: string;
}
export interface CartItem {
    productName: string;
    quantity: bigint;
}
export interface Order {
    id: bigint;
    customerName: string;
    createdBy: Principal;
    totalAmount: bigint;
    address: string;
    notes?: string;
    timestamp: bigint;
    items: Array<CartItem>;
    phoneNumber: string;
}
export interface UserProfile {
    name: string;
    address?: string;
    phoneNumber?: string;
}
export interface Product {
    name: string;
    unit: string;
    description?: string;
    category: string;
    price: bigint;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createGuestOrder(customerName: string, phoneNumber: string, address: string, notes: string | null, items: Array<CartItem>): Promise<bigint>;
    createOrder(customerName: string, phoneNumber: string, address: string, notes: string | null, items: Array<CartItem>): Promise<bigint>;
    createProduct(product: Product): Promise<void>;
    getAllOrders(): Promise<Array<Order>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getOrder(orderId: bigint): Promise<Order>;
    getOrderById(orderId: bigint): Promise<OrderResponse | null>;
    getProductsAdmin(): Promise<Array<Product>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    listProducts(): Promise<Array<Product>>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updateProductPrices(priceUpdates: Array<[string, bigint]>): Promise<void>;
    upsertProductsAdmin(productsArray: Array<Product>): Promise<void>;
}
