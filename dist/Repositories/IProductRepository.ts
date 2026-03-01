import {Zproduct} from "../model/Zproduct"

export interface IProductRepos {
  saveProduct(zproduct: Zproduct): Promise<Zproduct>;
  deleteByProductId(productId: number): Promise<boolean>;
  updateByProductId(productId: number): Promise<void>;
  findByProductId(productId: number): Promise<Zproduct | null>;
  findAll(): Promise<Zproduct[]>;

  
}