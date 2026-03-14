import { IBatchResponseParser, IBatchResult } from "../Interfaces/IBatchProcessing";

export class BatchResponseParser implements IBatchResponseParser {

    // Expected indexes within the batch response array
    private static readonly POST_RESPONSE_INDEX    = 0;
    private static readonly ORDER_RESPONSE_INDEX   = 1;
    private static readonly ITEMS_RESPONSE_INDEX   = 2;
    private static readonly MIN_RESPONSES_REQUIRED = 3;

    parseDeleteResponse(responses: any[]): IBatchResult {
        return this.parseResponses(responses);
    }

    parseAddResponse(responses: any[]): IBatchResult {
        return this.parseResponses(responses);
    }

    // Protected so subclasses can override the parsing logic (Open/Closed Principle)
    protected parseResponses(responses: any[]): IBatchResult {
        // Ensure the batch returned the minimum number of expected responses
        this.validateResponses(responses);

        // Extract each response by its fixed position in the batch array
        const postResponse  = responses[BatchResponseParser.POST_RESPONSE_INDEX];
        const orderResponse = responses[BatchResponseParser.ORDER_RESPONSE_INDEX];
        const itemsResponse = responses[BatchResponseParser.ITEMS_RESPONSE_INDEX];

        // Normalize the order response: some adapters wrap data, others do not
        const orderData = orderResponse.data ?? orderResponse;
        const itemsData = itemsResponse.data;

        // Normalize the items array regardless of the response shape
        const newItems = itemsData?.results ?? itemsData?.to_Items ?? [];

        return {
            success:    true,
            totalOrder: orderData.TotalAmount,
            currency:   orderData.Currency,
            newItems,
            Status: true
        };
    }

    // Throw early if the batch response is missing or incomplete
    private validateResponses(responses: any[]): void {
        if (!Array.isArray(responses) || responses.length < BatchResponseParser.MIN_RESPONSES_REQUIRED) {
            throw new Error(
                `Incomplete batch responses: ${responses?.length ?? 0} received, ` +
                `${BatchResponseParser.MIN_RESPONSES_REQUIRED} expected.`
            );
        }
    }
}