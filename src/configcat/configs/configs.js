import { ConfigCat } from '../config-cat.js';

export class ConfigCatConfigs extends ConfigCat {
    async create(productId, name, description = '') {
        try {
            const opts = {
                url: `${this.BASE_URL}/v1/products/${productId}/configs`,
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

    async getAll(productId) {
        try {
            const opts = {
                url: `${this.BASE_URL}/v1/products/${productId}/configs`,
            };

            const res = super.gets(opts);

            return res;
        } catch (ex) {
            console.log(ex);
        }
    }

    transform(data = {}) {
        return data?.map((item) => ({
            configId: item.configId,
            name: item.name,
            description: item.description,
        }));

        // .map(item => {
        //     const envs = {}
        //     for (const [key, value] of Object.entries(object1)) {
        //       envs[key] =
        //     }

        //     const envs = Object.entries(item?.environments || {})?.map(entry => {
        //       const key =
        //     })
        //   }(
        //     envs: item?.environments?.map(env => ({m
        //       name:
        //     }))
        //   ))
    }
}
