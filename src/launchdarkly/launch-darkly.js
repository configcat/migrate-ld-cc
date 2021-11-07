import NodeFetch from 'node-fetch';

export class LaunchDarkly {
  BASE_URL_V2 = 'https://app.launchdarkly.com/api/v2';

  constructor(
    fetch = NodeFetch,
    apiKey = process.env.LAUNCH_DARKLY_READER_ACCESS_TOKEN
  ) {
    this.fetch = fetch;
    this.apiKey = apiKey;
  }
}
