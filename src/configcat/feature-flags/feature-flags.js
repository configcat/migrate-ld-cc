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
        try {
            const key = this.CAMELCASE(ldFlag.key);
            const opts = {
                url: `${this.BASE_URL}/v1/configs/${configId}/settings`,
                body: JSON.stringify({
                    key,
                    name: ldFlag.name,
                    settingType: ldFlag.kind,
                    hint: ldFlag.description,
                    tags: ccFlagTags.map(({ tagId }) => tagId),
                }),
            };

            const res = super.post(opts);

            return res;
        } catch (ex) {
            console.log(ex);
        }
    }

    async setTargeting(configId, envId, ldFlag, ccFlagId) {
        console.log(configId, envId, ccFlagId);
        try {
            const opts = {
                url: `${this.BASE_URL}/v1/configs/${configId}/environments/${envId}/values`,
                body: JSON.stringify({
                    settingValues: [
                        {
                            rolloutRules: [
                                {
                                    comparisonAttribute: 'Identifier',
                                    comparator: 'sensitiveIsOneOf',
                                    comparisonValue:
                                        ldFlag.prodBooleanTargeting.enabledUserIds.join(','),
                                    value: true,
                                },
                            ],
                            value: false,
                            settingId: ccFlagId,
                        },
                    ],
                }),
            };

            const res = super.post(opts);

            return res;
        } catch (ex) {
            console.log(ex);
        }
    }
}
