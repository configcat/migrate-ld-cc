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
    }

    async delete(config) {
        try {
            const opts = {
                url: `${this.BASE_URL}/v1/configs/${config.configId}`,
            };

            super.delete(opts);
        } catch (ex) {
            console.log(ex);
        }
    }
}
