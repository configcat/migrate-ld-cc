import { LaunchDarkly } from '../launch-darkly.js';
export class LaunchDarklyEnvironments extends LaunchDarkly {
    async getAll(project = 'default') {
        try {
            const opts = { url: `${this.BASE_URL_V2}/projects/${project}/environments` };

            const res = await super.gets(opts);

            return this.transform(res);
        } catch (ex) {
            console.log(ex);
        }
    }

    transform(data = {}) {
        return data?.items?.map(({ key, name }) => ({ key, name }));
    }
}
