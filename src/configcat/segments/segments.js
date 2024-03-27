import { ConfigCat } from '../config-cat.js';

export class ConfigCatSegments extends ConfigCat {
    async create(productId, ldSegment) {
        try {
            const opts = {
                url: `${this.BASE_URL}/v1/products/${productId}/segments`,
                body: JSON.stringify(ldSegment),
            };

            const res = await super.post(opts);

            return res;
        } catch (ex) {
            console.log(ex);
        }
    }

    async list(productId) {
        try {
            const opts = {
                url: `${this.BASE_URL}/v1/products/${productId}/segments`,
            };

            const res = await super.gets(opts);

            return res;
        } catch (ex) {
            console.log(ex);
        }
    }

    async delete(segment) {
        try {
            const opts = {
                url: `${this.BASE_URL}/v1/segments/${segment.segmentId}`,
            };

            await super.delete(opts);
        } catch (ex) {
            console.log(ex);
        }
    }
}
