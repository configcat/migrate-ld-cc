// require('dotenv').config()
import 'dotenv/config';
// const configCatAuth = require('../src/configcat/auth/auth.ts')
// const launchDarklyAuth = require('../src/launchdarkly/auth/auth.ts')

import { LaunchDarklyProjects } from '../src/launchdarkly/projects/projects.js';
import { LaunchDarklyEnvironments } from '../src/launchdarkly/environments/environments.js';
const ld = {
  projects: new LaunchDarklyProjects(),
  env: new LaunchDarklyEnvironments()
}

async function init() {
  const ldProjects = await ld.projects.getAll();
  const ldEnvs = ld.env.getEnvironmentsFromProjects(ldProjects[0]);
  console.log('ldEnvs: ', ldEnvs)
}

init();



// lsEnvironments()
// 1. Auth to LD
// 2. pull all environment
// 3. pull all feature flags



// const xx = require('../src/launchdarkly/environments/environments');
// xx()
