
import {  BatchServiceProcess }               from "./BatchService";
import { ODataBatchExecutor }         from "./executors/BachExecutor";
import { BatchResponseParser }        from "./parsers/ResponseParser";
import { ODataPathBuilder }           from "./builders/PathBuilder";
import { ODataQueryParameterBuilder } from "./builders/QueryParameterBuilder";
import ODataModel from "sap/ui/model/odata/v2/ODataModel";
import { ODataRequestErrorHelper } from "../Helpers/oDataRequestErrorHelper";

export function createBatchService(
    oModel: ODataModel,
    _oDataRequestErrorHelper: ODataRequestErrorHelper  
):  BatchServiceProcess {
    oModel.setDeferredGroups(["OrderBatchGroup"]);

    return new  BatchServiceProcess(
        new ODataBatchExecutor(oModel as any),
        new BatchResponseParser(),
        new ODataPathBuilder(),
        new ODataQueryParameterBuilder()
    );
}