import { ConfigCat } from '../config-cat.js';

export class ConfigCatEnvironments extends ConfigCat {
  async create(productId, name, color='', description='') {
    const body = JSON.stringify({
      name,
      color,
      description
    })
    const resp = await this.fetch(
      `${this.BASE_URL}/v1/products/${productId}/environments`,
      {
        method: 'POST',
        body,
        headers: this.HEADERS
      }
    );

    const resTxt = await resp.text();
    const parsedRes = JSON.parse(resTxt || '{}');

    // parsedRes:
    // {
    //   organization: {
    //     organizationId: String;
    //     name: String;
    //   },
    //   productId: String;
    //   name: String;
    //   description: String;
    // }[]
    return parsedRes;
  }

  async create(name, description, orgId = process.env.CONFIG_CAT_ORG_ID) {
    const body = JSON.stringify({
      name,
      description
    });

    const resp = await this.fetch(
      `${this.BASE_URL}/v1/organizations/${orgId}/products`,
      {
        method: 'POST',
        body,
        headers: this.HEADERS
      }
    );

    const resTxt = await resp.text();
    const parsedRes = JSON.parse(resTxt || '{}');
    return parsedRes;
  }
}
