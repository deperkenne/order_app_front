
import {
    IBatchResult,
    IOrderItem,
    IBatchRequestBuilder,
    IBatchResponseParser,
    IPathBuilder,
    IQueryParameterBuilder
} from "./Interfaces/IBatchProcessing";

const BATCH_GROUP_ID           = "OrderBatchGroup";
const DECREASE_QUANTITY_PATH   = "/decrease_quantity";

export class BatchServiceProcess {

    constructor(
        private readonly executor:        IBatchRequestBuilder,
        private readonly responseParser:  IBatchResponseParser,
        private readonly pathBuilder:     IPathBuilder,
        private readonly queryBuilder:    IQueryParameterBuilder
    ) {}

    async deleteProductAndRefresh(item: any, orderUuid: string): Promise<IBatchResult> {
        const orderPath = this.pathBuilder.buildOrderPath(orderUuid);
        const itemsPath = this.pathBuilder.buildItemsPath(orderUuid);

        // 1) Action: decrement the item quantity via a Function Import call
        this.executor.addFunctionCall(
            DECREASE_QUANTITY_PATH,
            "POST",
            { ItemUuid: item.itemUuid, IsActiveEntity: false },
            BATCH_GROUP_ID
        );

        // 2) Refresh: re-read the order to get the updated total
        this.executor.addRead(
            orderPath,
            this.queryBuilder.buildOrderParams(),
            BATCH_GROUP_ID
        );

        // 3) Refresh: re-read the updated item to reflect the new quantity
        this.executor.addRead(
            itemsPath,
            this.queryBuilder.buildItemParams(item.productId),
            BATCH_GROUP_ID
        );

        // Submit all queued API calls in a single batch request
        const responses = await this.executor.submitBatch(BATCH_GROUP_ID);
        return this.responseParser.parseDeleteResponse(responses);
    }

    async addProductAndRefresh(orderUuid: string, orderItem: IOrderItem): Promise<IBatchResult> {
        const orderPath = this.pathBuilder.buildOrderPath(orderUuid);
        const itemsPath = this.pathBuilder.buildItemsPath(orderUuid);

        const payload = {
            ProductId:   orderItem.ProductId,
            ProductName: orderItem.ProductName,
            Quantity:    orderItem.Quantity,
            Price:       orderItem.Price,
            Currency:    orderItem.Currency
        };

        // 1) Action: create the new item in the order
        this.executor.addCreate(itemsPath, payload, BATCH_GROUP_ID);

        // 2) Refresh: re-read the order to get the updated total
        this.executor.addRead(
            orderPath,
            this.queryBuilder.buildOrderParams(),
            BATCH_GROUP_ID
        );

        // 3) Refresh: re-read the items list to include the newly created entry
        this.executor.addRead(
            itemsPath,
            this.queryBuilder.buildItemParams(orderItem.ProductId),
            BATCH_GROUP_ID
        );

        // Submit all queued API calls in a single batch request
        const responses = await this.executor.submitBatch(BATCH_GROUP_ID);
        return this.responseParser.parseAddResponse(responses);
    }
}