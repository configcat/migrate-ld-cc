import { strict as assert } from 'node:assert';
import { ConfigCat } from '../config-cat.js';

export class ConfigCatFeatureFlags extends ConfigCat {
    async getAll(configId) {
        try {
            const opts = {
                url: `${this.BASE_URL}/v1/configs/${configId}/settings`,
            };

            const res = super.gets(opts);

            return res;
        } catch (ex) {
            console.log(ex);
        }
    }

    async create(configId, ldFlag, ccFlagTags) {
        console.log(`Creating "${ldFlag.key}"`);
        const key = this.CAMELCASE(ldFlag.key);
        const opts = {
            url: `${this.BASE_URL}/v1/configs/${configId}/settings`,
            body: JSON.stringify({
                key,
                name: ldFlag.key,
                settingType: ldFlag.kind === 'boolean' ? ldFlag.kind : 'string',
                hint: ldFlag.description,
                tags: ccFlagTags,
            }),
        };

        const res = await super.post(opts);

        return res;
    }

    async setTargeting(configId, envId, ldFlag, ccFlagId, segmentKeyToIdMap) {
        const prod = ldFlag.environments.production;

        const identifierRules = prod.individualTargetRules.map(({ userIds, value }) => ({
            comparisonAttribute: 'Identifier',
            comparator: 'sensitiveIsOneOf',
            comparisonValue: userIds.join(','),
            value,
        }));

        const additionalRules = prod.additionalRules.map((rule) => {
            if (rule.op === 'segmentMatch') {
                const segmentKey = rule.comparisonValues[0]; // CC only supports matching on one segment
                if (!segmentKeyToIdMap.has(segmentKey)) {
                    assert.fail(`${ldFlag.name} has missing segment: ${segmentKey}`);
                }
                return {
                    segmentComparator: rule.negate ? 'isNotIn' : 'isIn',
                    segmentId: segmentKeyToIdMap.get(segmentKey),
                    value: rule.value,
                };
            } else {
                return {
                    comparisonAttribute: rule.attribute,
                    comparator: rule.negate ? 'sensitiveIsNotOneOf' : 'sensitiveIsOneOf',
                    comparisonValue: rule.comparisonValues.join(','),
                    value: rule.value,
                };
            }
        });

        const opts = {
            url: `${this.BASE_URL}/v1/configs/${configId}/environments/${envId}/values`,
            body: JSON.stringify({
                settingValues: [
                    {
                        rolloutRules: [...identifierRules, ...additionalRules],
                        value: prod.fallthrough,
                        settingId: ccFlagId,
                    },
                ],
            }),
        };

        await super.post(opts);
    }
}
