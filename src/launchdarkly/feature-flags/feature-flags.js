import { LaunchDarkly } from '../launch-darkly.js';

export class LaunchDarklyFeatureFlags extends LaunchDarkly {
  async getAll(projectKey, url='') {
    try {
      let nextUrl;
      let featureFlags = [];

      do {
        const opts = {
          url: url || `${this.BASE_URL_V2}/flags/${projectKey}`,
          queryParams: {
            limit: 1
          }
        };
        const res = await super.gets(opts);

        featureFlags = [...featureFlags, ...this.transform(res.items)]
        nextUrl = res?.['_links']?.next?.href;

        url = `${this.BASE_URL}${nextUrl}`;
      } while(!!nextUrl)

      return featureFlags;
    } catch (ex) {
      console.log('ex: ', ex);
    }
  }

  transform(items=[]) {
    return items?.map((item) => ({
      key: item.key,
      kind: item.kind,
      name: item.name
    }));
  }
}
