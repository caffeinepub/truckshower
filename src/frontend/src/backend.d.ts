import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type Timestamp = bigint;
export interface TruckStop {
    id: bigint;
    totalShowers: bigint;
    city: string;
    chain: string;
    name: string;
    lastUpdated: Timestamp;
    highway: string;
    state: string;
    availableShowers: bigint;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addOrUpdateTruckStop(id: bigint | null, name: string, chain: string, city: string, state: string, highway: string, totalShowers: bigint): Promise<bigint>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    getAllTruckStops(): Promise<Array<TruckStop>>;
    getCallerUserRole(): Promise<UserRole>;
    getTruckStopById(id: bigint): Promise<TruckStop>;
    isCallerAdmin(): Promise<boolean>;
    removeTruckStop(id: bigint): Promise<void>;
    searchTruckStops(searchText: string): Promise<Array<TruckStop>>;
    seedSampleData(): Promise<void>;
    updateShowerAvailability(id: bigint, availableShowers: bigint): Promise<void>;
}
