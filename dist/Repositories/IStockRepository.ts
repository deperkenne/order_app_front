import {Stock} from "../model/Stock"

export interface IStockRepository {
  saveStock(stock: Stock): Promise<Stock>;
  deleteByStockId(stockId: string): Promise<boolean>;
  updateByStockId(stockId: string,updateQuantity:number): Promise<void>;
  findByStockId(stockId: string): Promise<Stock | null>;
  findAll(): Promise<Stock[]>;
}