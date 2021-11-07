import { LaunchDarkly } from '../launch-darkly.js';
export class LaunchDarklyProjects extends LaunchDarkly {
  async getAll() {
    const resp = await this.fetch(
      `${this.BASE_URL_V2}/projects`,
      {
        method: 'GET',
        headers: {
          Authorization: this.apiKey
        }
      }
    );

    const parsedRes = JSON.parse(await resp.text() || {});
    return this.transform(parsedRes)
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
