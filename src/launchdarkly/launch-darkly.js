import { BaseApi } from '../utils/base-api.js';

export class LaunchDarkly extends BaseApi {
  BASE_URL = 'https://app.launchdarkly.com';
  BASE_URL_V2 = `${this.BASE_URL}/api/v2`;

  constructor(
    apiKey = process.env.LAUNCH_DARKLY_READER_ACCESS_TOKEN
  ) {
    super();
    this.HEADERS = {
      Authorization: apiKey
    };
  }
}
