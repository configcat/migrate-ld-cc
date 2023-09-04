import { strict as assert } from 'node:assert';
import { LaunchDarkly } from '../launch-darkly.js';

export class LaunchDarklyFeatureFlags extends LaunchDarkly {
    async getAll(projectKey) {
        let featureFlags = [];

        try {
            const flag = await this.getFlag(projectKey, 'enable-search-api-word-cloud');
            featureFlags.push(flag);

            return featureFlags;
        } catch (ex) {
            console.log('ex: ', ex);
        }
    }

    async getFlag(projectKey, flagName) {
        const opts = {
            url: `${this.BASE_URL_V2}/flags/${projectKey}/${flagName}`,
            queryParams: {
                expand: 'evaluation',
            },
        };
        const res = await super.gets(opts);

        this.validateFlag(res);

        const flag = this.transform(res);

        const prod = flag.environments.production;

        const prodBooleanTargeting = {
            enabledUserIds: prod.targets.find(({ variation }) => variation === 0).values,
            fallback: prod.fallthrough.variation === 0,
        };

        return { ...flag, prodBooleanTargeting };
    }

    validateFlag(flagResponse) {
        if (flagResponse.kind === 'boolean') {
            assert.deepEqual(
                flagResponse.variations.map(({ value }) => value),
                [true, false],
                `${flagResponse.key}: Boolean variations in unexpected order`
            );
        }
        Object.entries(flagResponse.environments).forEach(
            ([envKey, { prerequisites, contextTargets }]) => {
                if (prerequisites.length > 0) {
                    console.warn(`${flagResponse.key}: Flag has prerequisites for env ${envKey}`);
                    // assert.fail(`${flagResponse.key}: Flag has prerequisites`);
                }
                if (contextTargets?.length > 1 || contextTargets[0]?.values?.length > 1) {
                    assert.fail(
                        `${flagResponse.key}: Flag has unexpected context targets for env ${envKey}`
                    );
                }
            }
        );
    }

    transform(flagResponse) {
        return {
            key: flagResponse.key,
            kind: flagResponse.kind,
            name: flagResponse.name,
            description: flagResponse.description,
            variations: flagResponse.variations.map(({ value }) => value),
            environments: Object.fromEntries(
                Object.entries(flagResponse.environments).map(
                    ([envKey, { targets, fallthrough, on }]) => [
                        envKey,
                        {
                            targets,
                            fallthrough,
                            on,
                        },
                    ]
                )
            ),
            tags: flagResponse.tags,
            maintainerEmail: flagResponse._maintainer?.email,
            permanent: !flagResponse.temporary,
            archived: flagResponse.archived,
            defaults: flagResponse.defaults,
        };
    }
}
