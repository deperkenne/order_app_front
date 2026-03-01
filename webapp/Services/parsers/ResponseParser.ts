import { IBatchResponseParser, IBatchResult } from "../Interfaces/IBatchProcessing";

export class BatchResponseParser implements IBatchResponseParser {

    // Index attendus dans le tableau de réponses batch
    private static readonly POST_RESPONSE_INDEX   = 0;
    private static readonly ORDER_RESPONSE_INDEX  = 1;
    private static readonly ITEMS_RESPONSE_INDEX  = 2;
    private static readonly MIN_RESPONSES_REQUIRED = 3;

    parseDeleteResponse(responses: any[]): IBatchResult {
        return this.parseResponses(responses);
    }

    parseAddResponse(responses: any[]): IBatchResult {
        return this.parseResponses(responses);
    }

    // Méthode protégée => extensible par héritage (OCP)
    protected parseResponses(responses: any[]): IBatchResult {
        this.validateResponses(responses);

        const postResponse  = responses[BatchResponseParser.POST_RESPONSE_INDEX];
        const orderResponse = responses[BatchResponseParser.ORDER_RESPONSE_INDEX];
        const itemsResponse = responses[BatchResponseParser.ITEMS_RESPONSE_INDEX];

        const orderData = orderResponse.data ?? orderResponse;
        const itemsData = itemsResponse.data;

        const newItems = itemsData?.results ?? itemsData?.to_Items ?? [];

        return {
            success:    true,
            totalOrder: orderData.TotalAmount,
            currency:   orderData.Currency,
            newItems,
            postStatus: postResponse.statusCode
        };
    }

    private validateResponses(responses: any[]): void {
        if (!Array.isArray(responses) || responses.length < BatchResponseParser.MIN_RESPONSES_REQUIRED) {
            throw new Error(
                `Réponses batch incomplètes : ${responses?.length ?? 0} reçues, ` +
                `${BatchResponseParser.MIN_RESPONSES_REQUIRED} attendues.`
            );
        }
    }
}
