import { BaseApi } from '../utils/base-api.js';
import { camelCase } from "camel-case";

export class ConfigCat extends BaseApi {
  BASE_URL = 'https://api.configcat.com';
  PRICING_PLAN = '';
  CAMELCASE;

  constructor(
    apiKey = process.env.CONFIG_CAT_API_AUTH_HEADER,
    pricing_plan = process.env.CONFIG_CAT_PLAN,
    camelcase = camelCase
  ) {
    super();
    this.HEADERS = {
      Authorization: apiKey
    };
    this.PRICING_PLAN = pricing_plan;
    this.CAMELCASE = camelcase
  }
}
