
// ========================================
// 1. Model: Product.ts
// ========================================
export interface IProduct {
    id: string;
    name: string;
    quantity : number;
    description: string;
    price: number;
    currency: string;
    category: string;
    rating: number;
    imageUrl: string;
    inStock: boolean;
    supplier: string;
}