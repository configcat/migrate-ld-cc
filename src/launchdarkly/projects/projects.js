import { LaunchDarkly } from '../launch-darkly.js';
export class LaunchDarklyProjects extends LaunchDarkly {
  async getAll() {
    try {
      const opts = {
        url: `${this.BASE_URL_V2}/projects`
      };

      const res = await super.gets(opts);

      return this.transform(res);
    } catch (ex) {
      console.log(ex);
    }
  }

  transform(data={}) {
    return data?.items
      ?.filter(item => !item.key.includes('demo'))
      ?.map(item => ({
        id: item._id,
        key: item.key,
        name: item.name,
        environments: item.environments
      }));
  }
}
