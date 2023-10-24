import { ConfigCat } from '../config-cat.js';

export class ConfigCatTags extends ConfigCat {
    async getAll(productId) {
        try {
            const opts = {
                url: `${this.BASE_URL}/v1/products/${productId}/tags`,
            };

            return super.gets(opts);
        } catch (ex) {
            console.log(ex);
        }
    }

    async create(productId, name, color = '') {
        try {
            console.log(`Creating tag "${name}"`);
            const opts = {
                url: `${this.BASE_URL}/v1/products/${productId}/tags`,
                body: JSON.stringify({
                    name,
                    color,
                }),
            };

            return super.post(opts);
        } catch (ex) {
            console.log(ex);
        }
    }

    async delete(tag) {
        try {
            const opts = {
                url: `${this.BASE_URL}/v1/tags/${tag.tagId}`,
            };

            return super.delete(opts);
        } catch (ex) {
            console.log(ex);
        }
    }
}
