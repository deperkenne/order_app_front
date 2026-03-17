
import {IProductRepos} from "../Repositories/IProductRepository"
import {Zproduct}  from "../model/Zproduct"

export class ProductService{
    
    readonly productRepo : IProductRepos

    constructor(productRepository: IProductRepos) {
       this.productRepo = productRepository;
    }

    async getAllProducts(): Promise<Zproduct []>{   
        return this.productRepo.findAll()
    }  
    
    async save(product:Zproduct): Promise<Zproduct>{
        return this.productRepo.saveProduct(product)
    }
    async updateProduct(productId:number,product:Zproduct): Promise<void>{
       this.productRepo.updateByProductId(productId,product)

    }
}