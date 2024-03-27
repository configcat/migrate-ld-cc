import 'dotenv/config';

import { LaunchDarklyEnvironments } from '../src/launchdarkly/environments/environments.js';
import { LaunchDarklyFeatureFlags } from '../src/launchdarkly/feature-flags/feature-flags.js';
import { LaunchDarklySegments } from '../src/launchdarkly/segments/segments.js';
import { LaunchDarklyTags } from '../src/launchdarkly/tags/tags.js';

import { ConfigCatConfigs } from '../src/configcat/configs/configs.js';
import { ConfigCatFeatureFlags } from '../src/configcat/feature-flags/feature-flags.js';
import { ConfigCatEnvironments } from '../src/configcat/environments/environments.js';
import { ConfigCatTags } from '../src/configcat/tags/tags.js';
import { ConfigCatSegments } from '../src/configcat/segments/segments.js';
import { ConfigCat } from '../src/configcat/config-cat.js';

const LAUNCH_DARKLY_PRODUCT_KEY = process.env.LAUNCH_DARKLY_PRODUCT_KEY;
const CONFIG_CAT_PRODUCT_ID = process.env.CONFIG_CAT_PRODUCT_ID;
const CONFIG_CAT_CONFIG_ID = process.env.CONFIG_CAT_CONFIG_ID;

const ld = {
    envs: new LaunchDarklyEnvironments(),
    ffs: new LaunchDarklyFeatureFlags(),
    segments: new LaunchDarklySegments(),
    tags: new LaunchDarklyTags(),
};

const cc = {
    base: new ConfigCat(),
    configs: new ConfigCatConfigs(),
    ffs: new ConfigCatFeatureFlags(),
    envs: new ConfigCatEnvironments(),
    tags: new ConfigCatTags(),
    segments: new ConfigCatSegments(),
};

async function init() {
    await cleanExistingConfigCatData();

    const { ldEnvs, ldSegments, ldTags, ldFeatureFlags } = await getLaunchDarklyData();

    if (!ldFeatureFlags) {
        return;
    }

    await crudConfigCatData(ldEnvs, ldSegments, ldTags, ldFeatureFlags);
}

init();

async function getLaunchDarklyData() {
    const ldEnvs = await ld.envs.getAll(LAUNCH_DARKLY_PRODUCT_KEY);
    const ldSegments = [];
    for (const env of ldEnvs) {
        ldSegments.push(...(await ld.segments.getAll(LAUNCH_DARKLY_PRODUCT_KEY, env)));
    }
    const ldTags = await ld.tags.getAll(LAUNCH_DARKLY_PRODUCT_KEY);
    const ldFeatureFlags = await ld.ffs.getAll(LAUNCH_DARKLY_PRODUCT_KEY);

    return {
        ldEnvs,
        ldSegments,
        ldTags,
        ldFeatureFlags,
    };
}

async function cleanExistingConfigCatData() {
    const flags = await cc.ffs.getAll(CONFIG_CAT_CONFIG_ID);
    for (const { settingId: ccFlagId, key: ccFlagKey } of flags) {
        await cc.ffs.delete(ccFlagId, ccFlagKey);
    }

    const tags = await cc.tags.getAll(CONFIG_CAT_PRODUCT_ID);
    for (const tag of tags) {
        await cc.tags.delete(tag);
    }

    const segments = await cc.segments.list(CONFIG_CAT_PRODUCT_ID);
    for (const segment of segments) {
        await cc.segments.delete(segment);
    }
}

async function createConfigCatTags(ldTags) {
    const tagNameToIdMap = new Map();
    const lowerCaseTags = ldTags.map((tag) => tag.toLowerCase());

    const colours = ['panther', 'whale', 'salmon', 'lizard', 'canary'];

    for (const lowerCaseTag of lowerCaseTags) {
        if (!tagNameToIdMap.has(lowerCaseTag)) {
            const colour = colours[Math.floor(Math.random() * colours.length)];
            const ccTag = await cc.tags.create(CONFIG_CAT_PRODUCT_ID, lowerCaseTag, colour);
            tagNameToIdMap.set(lowerCaseTag, ccTag.tagId);
        }
    }
    return tagNameToIdMap;
}

async function createConfigCatSegments(ldSegments) {
    const segmentKeyToIdMap = new Map();
    for (const ldSegment of ldSegments) {
        const ccSegment = await cc.segments.create(CONFIG_CAT_PRODUCT_ID, ldSegment);
        segmentKeyToIdMap.set(ldSegment.key, ccSegment.segmentId);
    }
    return segmentKeyToIdMap;
}

async function crudConfigCatData(ldEnvs, ldSegments, ldTags, ldFeatureFlags) {
    const tagNameToIdMap = await createConfigCatTags(ldTags);
    const segmentKeyToIdMap = await createConfigCatSegments(ldSegments);

    const ccEnvs = await cc.envs.list(CONFIG_CAT_PRODUCT_ID);

    for (const ldFlag of ldFeatureFlags) {
        const ccFlagTagIds = [];

        if (ldFlag.tags.length > 0) {
            for (const ldTag of ldFlag.tags) {
                ccFlagTagIds.push(tagNameToIdMap.get(ldTag.toLowerCase()));
            }
        }
        if (ldFlag.maintainerEmail) {
            const tagName = ldFlag.maintainerEmail.toLowerCase();
            if (!tagNameToIdMap.has(tagName)) {
                const ccTag = await cc.tags.create(CONFIG_CAT_PRODUCT_ID, tagName, 'koala');
                tagNameToIdMap.set(tagName, ccTag.tagId);
                ccFlagTagIds.push(ccTag.tagId);
            } else {
                ccFlagTagIds.push(tagNameToIdMap.get(tagName));
            }
        }

        const ccFf = await cc.ffs.create(CONFIG_CAT_CONFIG_ID, ldFlag, ccFlagTagIds);

        const str = `Flag
                - Product ID: ${CONFIG_CAT_PRODUCT_ID}
                - Config ID: ${ccFf.configId}
                - Config Name: ${ccFf.configName}
                - Flag Key: ${ccFf.key}
                - Flag Name: ${ccFf.name}
                - Flag Id: ${ccFf.settingId}
            `;
        console.log(str);

        await cc.ffs.setTargeting(
            CONFIG_CAT_CONFIG_ID,
            ccEnvs,
            ldFlag,
            ccFf.settingId,
            segmentKeyToIdMap
        );
    }
}
