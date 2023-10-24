import { camelCase } from 'camel-case';
import NodeFetch from 'node-fetch';
import { BaseApi } from '../utils/base-api.js';

let noOfRequests = 0;

export class ConfigCat extends BaseApi {
    BASE_URL = 'https://api.configcat.com';
    PRICING_PLAN = '';
    CAMELCASE;

    constructor(
        apiKey = process.env.CONFIG_CAT_API_AUTH_HEADER,
        pricing_plan = process.env.CONFIG_CAT_PLAN,
        camelcase = camelCase
    ) {
        super(async function (...args) {
            noOfRequests++;
            const resp = await NodeFetch(...args);
            console.log(
                `Number of requests: ${noOfRequests} with ${resp.headers.get(
                    'x-rate-limit-remaining'
                )} remaining`
            );
            if (!resp.ok) {
                console.log(resp.headers);
                console.dir({
                    remainingRequests: resp.headers.get('x-rate-limit-remaining'),
                    limitReset: resp.headers.get('x-rate-limit-reset'),
                });
            }
            return resp;
        });
        this.HEADERS = {
            Authorization: apiKey,
        };
        this.PRICING_PLAN = pricing_plan;
        this.CAMELCASE = camelcase;
    }
}
