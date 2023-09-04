import { LaunchDarkly } from '../launch-darkly.js';
export class LaunchDarklyProjects extends LaunchDarkly {
    async getAll() {
        try {
            const opts = {
                url: `${this.BASE_URL_V2}/projects`,
                queryParams: { limit: 100, expand: 'environments' },
            };

            const res = await super.gets(opts);

            return this.transform(res);
        } catch (ex) {
            console.log(ex);
        }
    }

    transform(data = {}) {
        return data?.items?.map((item) => ({
            key: item.key,
            name: item.name,
            environments: item.environments?.items,
        }));
    }
}
