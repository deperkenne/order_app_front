
import {IStockRepository} from "../Repositories/IStockRepository"
import {Stock} from "../model/Stock"

export class StockService{
   
   private readonly stockRepository: IStockRepository; 

   constructor(stockRepository: IStockRepository) {
   this.stockRepository = stockRepository;
   }

   async createStocks(stock:Stock){
      return this.stockRepository.saveStock(stock);
   }

   async getAllStocks() {
    return  await this.stockRepository.findAll();
   }

   async ModifyStock(stockId:string,updateQuantity:number){
         await this.stockRepository.updateByStockId(stockId,updateQuantity)
   }
}