import { ConfigCat } from '../config-cat.js';

export class ConfigCatFeatureFlags extends ConfigCat {
  async getAll(configId) {
    try {
      const opts = {
        url: `${this.BASE_URL}/v1/configs/${configId}/settings`
      };

      const res = super.gets(opts);

      return res;
    } catch (ex) {
      console.log(ex);
    }
  }

  async create(configId, rawKey, name, settingType='boolean', hint='', tags=[]) {
    try {
      const key = this.CAMELCASE(rawKey);
      const opts = {
        url: `${this.BASE_URL}/v1/configs/${configId}/settings`,
        body: JSON.stringify({
          key,
          name,
          settingType,
          hint,
          tags
        })
      };

      const res = super.post(opts);

      return res;
    } catch (ex) {
      console.log(ex);
    }
  }
}
