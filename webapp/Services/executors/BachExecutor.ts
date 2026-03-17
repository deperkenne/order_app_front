import ODataModel from "sap/ui/model/odata/v2/ODataModel";
import { IBatchRequestBuilder } from "../Interfaces/IBatchProcessing";

export class ODataBatchExecutor implements  IBatchRequestBuilder {

    constructor(private readonly oDataModel: ODataModel) {}

    addCreate(path: string, payload:Record<string, unknown>, groupId: string): void {
        this.oDataModel.create(path, payload, { groupId });
    }

    addFunctionCall(path: string, method: string, urlParameters:Record<string, string>, groupId: string): void {
        this.oDataModel.callFunction(path, { method, groupId, urlParameters });
    }

    addRead(path: string, urlParameters: Record<string, string> , groupId: string): void {
        this.oDataModel.read(path, { groupId, urlParameters });
    }

    submitBatch(groupId: string): Promise<any[]> {
        return new Promise((resolve, reject) => {
            this.oDataModel.submitChanges({
                groupId,
                success: (oData: any) => {
                    const responses = oData?.__batchResponses ?? [];
                    resolve(responses);
                },
                error: (err: any) => {
                    reject(err);
                }
            });
        });
    }
}