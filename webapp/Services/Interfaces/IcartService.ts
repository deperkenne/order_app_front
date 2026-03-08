
import { Zproduct } from "../../model/Zproduct";

//  Résultat normalisé retourné par le batch 
export interface IBatchResult {
    success:    boolean;
    totalOrder: number;
    currency:   string;
    newItems:   any[];
    postStatus: string | number;
}

// Item tel que stocké dans le panier (vue frontend) 
export interface ICartItem {
    itemUuid:    string;
    productId:   number;
    productName: string;
    imageUrl:    string;
    price:       number;
    currency:    string;
    quantity:    number;
    grossAmount: number;
}

// Contrat : lire/écrire l'état du panier (JSONModel abstrait) 
export interface ICartStore {
    getItems(): ICartItem[];
    setItems(items: ICartItem[]): void;
    setTotal(total: string): void;
    setCount(count: number): void;
    getTotal(): string;
}

// Contrat : calculs métier sur le panier
export interface ICartCalculator {
    recalculateTotal(items: ICartItem[]): string;
    buildNewItem(product: Zproduct, quantity: number): ICartItem;
    incrementItem(items: ICartItem): ICartItem;
}

// Contrat : persistance mémoire navigateur 
export interface ICartPersistence {
    save(items: ICartItem[], total: string, count: number): void;
}

// Contrat : notifier l'utilisateur 
export interface ICartNotifier {
    notifyError(message: string): void;
}