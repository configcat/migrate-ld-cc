import { ConfigCat } from '../config-cat.js';

export class ConfigCatProducts extends ConfigCat {
    async getAll() {
        try {
            const opts = {
                url: `${this.BASE_URL}/v1/products`,
            };

            const res = super.gets(opts);

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
            return res;
        } catch (ex) {
            console.log(ex);
        }
    }

    async create(name, description, orgId = process.env.CONFIG_CAT_ORG_ID) {
        try {
            const opts = {
                url: `${this.BASE_URL}/v1/organizations/${orgId}/products`,
                body: JSON.stringify({
                    name,
                    description,
                }),
            };

            const res = super.post(opts);

            return res;
        } catch (ex) {
            console.log(ex);
        }
    }
}
