import NodeFetch from 'node-fetch';

export class LaunchDarklyProjects {
  constructor(
    fetch = NodeFetch,
    apiKey = process.env.LAUNCH_DARKLY_READER_ACCESS_TOKEN
  ) {
    this.fetch = fetch;
    this.apiKey = apiKey;
  }

  async getAll() {
    const resp = await this.fetch(
      `https://app.launchdarkly.com/api/v2/projects`,
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
