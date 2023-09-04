import 'dotenv/config';

import { LaunchDarklyProjects } from '../src/launchdarkly/projects/projects.js';
import { LaunchDarklyEnvironments } from '../src/launchdarkly/environments/environments.js';
import { LaunchDarklyFeatureFlags } from '../src/launchdarkly/feature-flags/feature-flags.js';

import { ConfigCatProducts } from '../src/configcat/products/products.js';
import { ConfigCatConfigs } from '../src/configcat/configs/configs.js';
import { ConfigCatFeatureFlags } from '../src/configcat/feature-flags/feature-flags.js';
import { ConfigCatEnvironments } from '../src/configcat/environments/environments.js';
import { ConfigCatTags } from '../src/configcat/tags/tags.js';
import { ConfigCat } from '../src/configcat/config-cat.js';

const ld = {
    projects: new LaunchDarklyProjects(),
    envs: new LaunchDarklyEnvironments(),
    ffs: new LaunchDarklyFeatureFlags(),
};

const cc = {
    base: new ConfigCat(),
    products: new ConfigCatProducts(),
    configs: new ConfigCatConfigs(),
    ffs: new ConfigCatFeatureFlags(),
    envs: new ConfigCatEnvironments(),
    tags: new ConfigCatTags(),
};

async function init() {
    const { ldProjects, ldEnvs, ldFeatureFlags } = await getLaunchDarklyData();
    console.dir(ldFeatureFlags, { depth: 10 });
    // console.dir({ ldProjects, ldEnvs, ldFeatureFlags }, { depth: 10 });
    await crudConfigCatData(ldProjects, ldEnvs, ldFeatureFlags);
}

init();

async function getLaunchDarklyData() {
    const ldProjects = await ld.projects.getAll();
    const ldEnvs = ld.envs.getEnvironmentsFromProjects(ldProjects[0]);

    const ldFeatureFlags = await ld.ffs.getAll('default');
    // const ldFeatureFlags = await Promise.all(
    //   ldProjects?.map(async (project) => ({
    //     projectId: project.id,
    //     featureFlags: await ld.ffs.getAll(project.key)
    //   }))
    // );

    return {
        ldProjects,
        ldEnvs,
        ldFeatureFlags,
    };
}

async function crudConfigCatData(ldProjects, ldEnvs, ldFeatureFlags) {
    const ccProducts = await cc.products.getAll();
    const existingTags = new Set();

    if (cc.base.PRICING_PLAN.toLowerCase() === 'free') {
        const productId = ccProducts?.[0]?.productId;
        const ccConfig = await cc.configs.create(
            productId,
            'from launchdarkly',
            'migrated from launchdarkly'
        );
        const { configId } = ccConfig;

        const [env] = await cc.envs.list(productId);

        await Promise.all(
            ldFeatureFlags?.map(async (ldFlag) => {
                const ccFlagTags = [];

                if (ldFlag.tags.length > 0) {
                    for (const tag of ldFlag.tags) {
                        ccFlagTags.push(await cc.tags.create(productId, tag));
                    }
                }
                if (ldFlag.maintainerEmail) {
                    ccFlagTags.push(await cc.tags.create(productId, ldFlag.maintainerEmail));
                }

                const ccFf = await cc.ffs.create(configId, ldFlag, ccFlagTags);

                const str = `Flag
                    - Product ID: ${productId}
                    - Config ID: ${ccFf.configId}
                    - Config Name: ${ccFf.configName}
                    - Flag Key: ${ccFf.key}
                    - Flag Name: ${ccFf.name}
                    - Flag Id: ${ccFf.settingId}
                `;
                console.log(str);

                await cc.ffs.setTargeting(configId, env.environmentId, ldFlag, ccFf.settingId);
            })
        );
    } else {
        // add products
        // add environments
        // add feature flags
        // TODO:
        // const ccProduct = await cc.products.create('test', 'test desc');
        // console.log('ccProduct: ', ccProduct)
        // const ccConfigs = await Promise.all(
        //   ccProducts?.map(async (product) => {
        //     return ({
        //       product,
        //       configs: await cc.configs.getAll(product.productId)
        //     })
        //   })
        // );
        // console.log('ccConfigs: ', JSON.stringify(ccConfigs))
        // const prodId = '08d9a314-d068-4357-84d1-f7d86ccffa2e';
        // const name = 'Test Product Name';
        // const ccEnvs = await cc.envs.create(prodId, name);
        // console.log('ccEnvs: ',ccEnvs);
        // const configId = '08d9a314-d087-4974-868a-d26b60b4b227';
        // const key = 'testkey';
        // const name = 'test Name';
        // const ccFfs = await cc.ffs.create(configId, key, name);
        // console.log('ccFfs: ', ccFfs);
    }
}
