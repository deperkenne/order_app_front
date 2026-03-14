import { IOrderStorageRepo } from "../IOrderStorageRepository";

export class OrderStorageImpl implements IOrderStorageRepo {

    private readonly ORDER_UUID_KEY    = 'app_order_uuid';
    private readonly ORDER_EXPIRY_KEY  = 'app_order_expiry';
    // 7 days expressed in milliseconds
    private readonly ORDER_EXPIRY_TIME = 7 * 24 * 60 * 60 * 1000;


    // Retrieves the order UUID from localStorage if it exists and has not expired
    getOrderUuid(): string | null {
        try {
            const uuid   = localStorage.getItem(this.ORDER_UUID_KEY);
            const expiry = localStorage.getItem(this.ORDER_EXPIRY_KEY);

            console.log("getOrderUuid:", uuid);

            if (uuid && expiry) {
                const expiryTime = parseInt(expiry, 10);

                if (Date.now() < expiryTime) {
                    console.log('OrderUUID found:', uuid);
                    return uuid;
                } else {
                    // UUID has expired — remove it from storage
                    this.clearOrderUuid();
                    console.log('OrderUUID expired');
                }
            }
        } catch (error) {
            console.error('Error reading OrderUUID:', error);
        }

        return null;
    }


    // Persists the order UUID in localStorage alongside its expiry timestamp
    setOrderUuid(uuid: string): void {
        try {
            const expiryTime = Date.now() + this.ORDER_EXPIRY_TIME;

            localStorage.setItem(this.ORDER_UUID_KEY, uuid);
            localStorage.setItem(this.ORDER_EXPIRY_KEY, expiryTime.toString());

            console.log('OrderUUID saved:', uuid);
        } catch (error) {
            console.error('Error saving OrderUUID:', error);
        }
    }


    // Removes the order UUID and its expiry timestamp from localStorage
    clearOrderUuid(): void {
        try {
            localStorage.removeItem(this.ORDER_UUID_KEY);
            localStorage.removeItem(this.ORDER_EXPIRY_KEY);
            console.log('OrderUUID cleared');
        } catch (error) {
            console.error('Error clearing OrderUUID:', error);
        }
    }


    // Returns true if a valid (non-expired) order UUID exists in storage
    hasOrderUuid(): boolean {
        return this.getOrderUuid() !== null;
    }
}