import { IOrderItemRepo } from "../IOrder_ItemRepository";
import { OrderItem } from "../../model/Order_items";
import ODataModel from "sap/ui/model/odata/v2/ODataModel";
import { ODataRequestErrorHelper } from "../../Helpers/oDataRequestErrorHelper";
import { ODataRequestError } from "../../MyError/oDataRequestError";

export class OrderItemImpl implements IOrderItemRepo {

    private oModel: ODataModel;
    private oDataRequestErrorHelper: ODataRequestErrorHelper;

    constructor(oModel: ODataModel, oDataRequestErrorHelper: ODataRequestErrorHelper) {
        this.oModel = oModel;
        this.oDataRequestErrorHelper = oDataRequestErrorHelper;
    }

    // Sends a POST request to create a new order item under the given order and returns the backend-enriched object
    async saveOrderItem(orderItem: OrderItem, orderUuid: string): Promise<OrderItem> {

        const oPayload = {
            ProductId:   orderItem.ProductId,
            ProductName: orderItem.ProductName,
            Quantity:    orderItem.Quantity,
            Unit:        orderItem.Unit,
            Price:       orderItem.Price,
            Currency:    orderItem.Currency
        };

        // Build the navigation path to the items collection of the target order
        const sPath = `/Orders(OrderUuid=guid'${orderUuid}',IsActiveEntity=false)/to_Items`;

        return new Promise((resolve, reject) => {
            this.oModel.create(sPath, oPayload, {
                success: (oData: any) => {
                    // Return the created object as returned by the backend (may include generated fields)
                    resolve(new OrderItem(oData));
                },
                error: (oError: any) => {
                    let message  = "Unknown error";
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
    async findAll(): Promise<OrderItem[]> {
        return [];
    }

    // Calls the "decrease_quantity" Function Import to decrement the quantity of a specific item
    async decrease_qty(itemUuid: string): Promise<OrderItem> {
        const sPath = `/decrease_quantity(ItemUuid=guid'${itemUuid}',IsActiveEntity=false)`;

        return new Promise((resolve, reject) => {
            this.oModel.read(sPath, {
                success: (oData: any) => {
                    resolve(oData);
                },
                error: (oError: any) => {
                    let message  = "Unknown error";
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