import { LaunchDarkly } from '../launch-darkly.js';

export class LaunchDarklyTags extends LaunchDarkly {
    async getAll() {
        const opts = {
            url: `${this.BASE_URL_V2}/tags?kind=flag`,
        };
        const res = await super.gets(opts);

        return res.items;
    }
}
