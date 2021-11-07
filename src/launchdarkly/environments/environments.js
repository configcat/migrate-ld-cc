export class LaunchDarklyEnvironments {
  constructor() { }

  getEnvironmentsFromProjects(item={}) {
    return item.environments?.map((env) => ({
      key: env.key,
      name: env.name
    }));
  }
}
