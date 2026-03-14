
import { IProductRepos } from "../IProductRepository";
import ODataModel from "sap/ui/model/odata/v2/ODataModel";
import { ODataRequestErrorHelper } from "../../Helpers/oDataRequestErrorHelper";
import { ODataRequestError } from "../../MyError/oDataRequestError";
import {Zproduct} from "../../model/Zproduct"
export class ZProductImpl implements IProductRepos {

    private oModel: ODataModel;
    private oDataRequestErrorHelper: ODataRequestErrorHelper;

    constructor(oModel: ODataModel, oDataRequestErrorHelper: ODataRequestErrorHelper) {
        this.oModel = oModel;
        this.oDataRequestErrorHelper = oDataRequestErrorHelper;
    }

    // Sends a POST request to create a new product and returns the backend-enriched object
    async saveProduct(zproduct: Zproduct): Promise<Zproduct> {

        const oPayload = {
            ProductId:   zproduct.ProductId,
            Productname: zproduct.Productname,
            Price:       String(zproduct.Price),
            Currency:    zproduct.Currency,
            Stock:       zproduct.Stock,
        };

        return new Promise((resolve, reject) => {
            this.oModel.create("/Products", oPayload, {
                success: (oData: any) => {
                    // Return the created object as returned by the backend (may include generated fields)
                    resolve(new Zproduct(oData));
                },
                error: (oError: any) => {
                    let message = "Unknown error";
                    let statusCode;

                    try {
                        // Extract the HTTP status code and the OData error message from the response
                        statusCode = Number(oError.statusCode);
                        if (oError.responseText) {
                            const oResponse = JSON.parse(oError.responseText);
                            message = oResponse?.error?.message?.value || message;
                        }
                    } catch (e) {
                        // Fallback to the raw error message if parsing fails
                        message = oError.message;
                    }

                    reject(new ODataRequestError(message, statusCode));
                }
            });
        });
    }

    // Not yet implemented
    async deleteByProductId(productId: number): Promise<boolean> {
        return true;
    }

    // Not yet implemented
   async updateByProductId(productId: number, zproduct: Zproduct): Promise<void> {
        const oPayload = {
            Productname: zproduct.Productname,
            Price:       String(zproduct.Price),
            Currency:    zproduct.Currency,
            Stock:       zproduct.Stock,
        };

        // Construction du chemin de l'entité (Entity Key)
        // Exemple: /Products(123) ou /Products('UUID')
        const sPath = this.oModel.createKey("/Products", {
            ProductId: productId
        });

        return new Promise((resolve, reject) => {
            this.oModel.update(sPath, oPayload, {
                success: () => {
                    // Succès : La donnée est mise à jour, le backend a exécuté 
                    // la détermination setChanged en arrière-plan.
                    resolve();
                },
                error: (oError: any) => {
                    let message = "Error during update";
                    let statusCode = Number(oError.statusCode);

                    try {
                        if (oError.responseText) {
                            const oResponse = JSON.parse(oError.responseText);
                            message = oResponse?.error?.message?.value || message;
                        }
                    } catch (e) {
                        message = oError.message || message;
                    }

                    reject(new ODataRequestError(message, statusCode));
                }
            });
        });
    }
    // Not yet implemented
    async findByProductId(productId: number): Promise<Zproduct | null> {
        return null;
    }

    // Fetches the full product list from the backend and returns it as an array
    async findAll(): Promise<Zproduct[]> {
        return new Promise((resolve, reject) => {
            this.oModel.read("/Products", {
                success: (oData: any) => {
                    resolve(oData.results);
                },
                error: (oError: any) => {
                    let message = "Unknown error";
                    let statusCode;

                    try {
                        // Extract the HTTP status code and the OData error message from the response
                        statusCode = Number(oError.statusCode);
                        if (oError.responseText) {
                            const oResponse = JSON.parse(oError.responseText);
                            message = oResponse?.error?.message?.value || message;
                        }
                    } catch (e) {
                        // Fallback to the raw error message if parsing fails
                        message = oError.message;
                    }

                    reject(new ODataRequestError(message, statusCode));
                }
            });
        });
    }
}