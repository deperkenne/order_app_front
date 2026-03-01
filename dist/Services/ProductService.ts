
import {IProductRepos} from "../Repositories/IProductRepository"
import {Zproduct}  from "../model/Zproduct"

export class ProductService{
    // dependency injection 
    readonly productRepo : IProductRepos

    constructor(productRepository: IProductRepos) {
       this.productRepo = productRepository;
       }

    async getAllProducts(): Promise<Zproduct []>{   
        return this.productRepo.findAll()
   
    }
    
}