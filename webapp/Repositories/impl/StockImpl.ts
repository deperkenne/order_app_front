import { IStockRepository } from "../IStockRepository";
import {Stock} from "../../model/Stock";
import ODataModel from "sap/ui/model/odata/v2/ODataModel";
import { ODataRequestErrorHelper } from "../../Helpers/oDataRequestErrorHelper";
import { ODataRequestError } from "../../MyError/oDataRequestError";
import MessageBox from "sap/m/MessageBox";
import MessageToast from "sap/m/MessageToast";

export class StockImpl implements IStockRepository {

    private oModel: ODataModel;
    private oDataRequestErrorHelper: ODataRequestErrorHelper;

    constructor(oModel: ODataModel, oDataRequestErrorHelper: ODataRequestErrorHelper) {
        this.oModel = oModel;
        this.oDataRequestErrorHelper = oDataRequestErrorHelper;
    }

    // Sends a POST request to create a new stock entry and returns the backend-enriched object
    async saveStock(stock: Stock): Promise<Stock> {
        // Convert the class instance into a plain object for the OData payload
        const oPayload = {
            StockId:           stock.StockId,
            ProductId:         stock.ProductId,
            SkuId:             stock.SkuId,
            Quantity:          stock.Quantity,
            AvailableQuantity: stock.AvailableQuantity
        };

        return new Promise((resolve, reject) => {
            this.oModel.create("/Stock", oPayload, {
                success: (oData: any) => {
                    // Return the created object as returned by the backend (may include generated fields)
                    resolve(new Stock(oData));
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
    async deleteByStockId(stockId: string): Promise<boolean> {
        return true;
    }

    // Sends a PATCH request to update the quantity of a stock entry by its ID
    async updateByStockId(stockId: string, updateQuantity: number): Promise<void> {
        // Build the canonical OData key path for the target stock entry
        const sPath = this.oModel.createKey("/Stock", {
            StockId: stockId
        });

        const oPayload = {
            Quantity: updateQuantity,
        };

        this.oModel.update(sPath, oPayload, {
            success: () => {
                MessageToast.show("Stock updated successfully");
            },
            error: (oError: any) => {
                let message = "Error during stock update";

                // Extract the OData error message from the response if available
                if (oError.responseText) {
                    const oResponse = JSON.parse(oError.responseText);
                    message = oResponse?.error?.message?.value || message;
                }

                MessageBox.error(message);
            }
        });
    }

    // Not yet implemented
    async findByStockId(stockId: string): Promise<Stock | null> {
        return null;
    }

    // Fetches the full stock list from the backend and returns it as an array
    async findAll(): Promise<Stock[]> {
        return new Promise((resolve, reject) => {
            this.oModel.read("/Stock", {
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