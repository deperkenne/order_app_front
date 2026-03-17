import { IOrderRepository } from "../IOrderRepository";
import {Order} from "../../model/order"
import ODataModel from "sap/ui/model/odata/v2/ODataModel";
import { ODataRequestErrorHelper } from "../../Helpers/oDataRequestErrorHelper";
import { ODataRequestError } from "../../MyError/oDataRequestError";
import { OrderItem } from "../../model/Order_items";
import { IOrder } from "../../model/IOrder";

export class OrderImpl implements IOrderRepository {

    private oModel: ODataModel;
    private oDataRequestErrorHelper: ODataRequestErrorHelper;

    constructor(oModel: ODataModel, oDataRequestErrorHelper: ODataRequestErrorHelper) {
        this.oModel = oModel;
        this.oDataRequestErrorHelper = oDataRequestErrorHelper;
    }

    
    async activateOrder(orderUuid: string): Promise<any> {
      

   
        const mParameters = {
         "OrderUuid": orderUuid,
         "IsActiveEntity": false
        };

        return new Promise((resolve, reject) => {
            
            this.oModel.callFunction("/OrdersActivate", {
                method: "POST",
                urlParameters: mParameters,
                success: (oData: any) => {
                 
                    resolve(oData);
                },
                error: (oError: any) => {
                    let message = "activation error";
                    let statusCode;

                    try {
                        statusCode = Number(oError.statusCode);
                        if (oError.responseText) {
                            const oResponse = JSON.parse(oError.responseText);
                            message = oResponse?.error?.message?.value || message;
                        }
                    } catch (e) {
                        message = oError.message || "unknow error";
                    }

                    reject(new ODataRequestError(message, statusCode));
                }
            });
        });
    }

    // Sends a POST request to create a new order and returns the backend-enriched object
    async createOrder(order: IOrder): Promise<IOrder> {
        const oPayload = {
            CustomerId: order.CustomerId,
            OrderId:    order.OrderId,
            Currency:   order.Currency,
            Status:     order.Status,
        };

        return new Promise((resolve, reject) => {
            this.oModel.create("/Orders", oPayload, {
                success: (oData: any) => {
                    // Return the created object as returned by the backend (may include generated fields)
                    resolve(new Order(oData));
                },
                error: (oError: any) => {
                    reject(this.handleODataError(oError));
                }
            });
        });
    }

    // Fetches a single order with its items filtered by productId
    async getOrderWithFilteredItems(orderUuid: string, productId: number): Promise<{ order: Order, items: OrderItem[] }> {
        const sPath = `/Orders(OrderUuid=guid'${orderUuid}',IsActiveEntity=false)`;

        // Read only the fields needed, and filter the expanded items by productId
        const oUrlParameters = {
            $select:             "TotalAmount",
            $expand:             "to_Items",
            "to_Items/$filter":  `ProductId eq '${productId}'`,
            "to_Items/$select":  "ItemId,ProductId,GrossAmount,Quantity,CreatedAt",
            "to_Items/$orderby": "CreatedAt asc",
            "to_Items/$top":     "1"
        };

        return new Promise((resolve, reject) => {
            this.oModel.read(sPath, {
                urlParameters: oUrlParameters,
                success: (oData: any) => {
                    const order = new Order({
                        TotalAmount: oData.TotalAmount
                    });

                    // Map each raw item response into an OrderItem instance
                    const items = oData.to_Items.results.map((item: OrderItem) =>
                        new OrderItem(item)
                    );

                    resolve({ order, items });
                },
                error: (oError: any) => {
                    reject(this.handleODataError(oError));
                }
            });
        });
    }

    // Extracts the HTTP status code and OData error message from a failed request
    private handleODataError(oError: any): ODataRequestError {
        let message    = "Unknown error";
        let statusCode: number | undefined;

        try {
            statusCode = Number(oError.statusCode);
            if (oError.responseText) {
                const oResponse = JSON.parse(oError.responseText);
                message = oResponse?.error?.message?.value || message;
            }
        } catch (e) {
            // Fallback to the raw error message if parsing fails
            message = oError.message || "Error during parsing";
        }

        return new ODataRequestError(message, statusCode);
    }

    // Not yet implemented
    async getOrderId(orderUuid: string): Promise<Order[]> {
        return [];
    }
}