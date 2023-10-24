import { strict as assert } from 'node:assert';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { LaunchDarkly } from '../launch-darkly.js';

const CACHED_FLAGS_FILE = 'flagsCache.json';
const EXCLUDE_FLAG_KEYS = [];
const SUPPORTED_TARGETING_ATTRS = process.env.SUPPORTED_TARGETING_ATTRS.split(',');

export class LaunchDarklyFeatureFlags extends LaunchDarkly {
    async getAll(projectKey) {
        let rawFeatureFlags;
        const transformedFeatureFlags = [];

        try {
            if (existsSync(CACHED_FLAGS_FILE)) {
                rawFeatureFlags = JSON.parse(readFileSync(CACHED_FLAGS_FILE));
            } else {
                rawFeatureFlags = [];

                const opts = {
                    url: `${this.BASE_URL_V2}/flags/${projectKey}`,
                    queryParams: {
                        expand: 'evaluation',
                    },
                };
                const res = await super.gets(opts);

                for (const item of res.items) {
                    if (!EXCLUDE_FLAG_KEYS.includes(item.key)) {
                        const flag = await this.getFlag(projectKey, item.key);
                        rawFeatureFlags.push(flag);
                    }
                }
                writeFileSync(CACHED_FLAGS_FILE, JSON.stringify(rawFeatureFlags, null, 2));
            }

            for (const flag of rawFeatureFlags) {
                this.validate(flag);
                transformedFeatureFlags.push(this.transform(flag));
            }
            return transformedFeatureFlags;
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

        return res;
    }

    validate(flagResponse) {
        if (flagResponse.kind === 'boolean') {
            assert.deepEqual(
                flagResponse.variations.map(({ value }) => value),
                [true, false],
                `${flagResponse.key}: Boolean variations in unexpected order`
            );
        } else if (flagResponse.kind !== 'multivariate') {
            assert.fail(`${flagResponse.key} is neither boolean nor multivariate`);
        }
        Object.entries(flagResponse.environments).forEach(
            ([envKey, { prerequisites, targets, contextTargets, rules, fallthrough }]) => {
                if (prerequisites.length > 0 && envKey === 'production') {
                    console.warn(`${flagResponse.key}: Flag has prerequisites for production`);
                    // assert.fail(`${flagResponse.key}: Flag has prerequisites for env ${envKey}`);
                }
                if (contextTargets?.values?.length) {
                    assert.fail(`${flagResponse.key}: Flag has context targets for env ${envKey}`);
                }
                targets.forEach(({ contextKind }) => {
                    if (contextKind !== 'user') {
                        assert.fail(
                            `${flagResponse.key}: Flag targeting has non-user contextKind for env ${envKey}`
                        );
                    }
                });
                if (fallthrough.rollout) {
                    assert.fail(
                        `${flagResponse.key}: Flag has percentage rollout as fallback for env ${envKey}`
                    );
                }
                rules?.forEach(({ rollout, clauses }) => {
                    if (clauses.length > 1) {
                        assert.fail(
                            `${flagResponse.key}: Flag rule has multiple clauses for env ${envKey}`
                        );
                    }
                    if (rollout) {
                        assert.fail(
                            `${flagResponse.key}: Flag rule has percentage rollout for env ${envKey}`
                        );
                    }
                    clauses?.forEach((clause) => {
                        const isInUserAttr =
                            SUPPORTED_TARGETING_ATTRS.includes(clause.attribute) &&
                            clause.op === 'in';

                        if (!isInUserAttr && clause.op !== 'segmentMatch') {
                            assert.fail(
                                `${flagResponse.key}: Flag has unexpected clause attribute/op (${clause.attribute}/${clause.op}) for env ${envKey}`
                            );
                        }
                        if (clause.op === 'segmentMatch' && clause.values.length > 1) {
                            assert.fail(
                                `${flagResponse.key}: Flag is matching on multiple segments for env ${envKey}`
                            );
                        }
                    });
                });
            }
        );
    }

    transform(flagResponse) {
        const { variations } = flagResponse;

        const getValueFromVariation = (variationIndex) => {
            const value = variations[variationIndex].value;
            if (typeof value === 'string' || typeof value === 'boolean') {
                return value;
            } else {
                return JSON.stringify(value);
            }
        };

        const getEnvironmentTargeting = ({ targets, fallthrough, rules }) => {
            const individualTargetRules = targets.map(
                ({ values: userIds, variation: variationIndex }) => ({
                    userIds,
                    value: getValueFromVariation(variationIndex),
                })
            );
            const additionalRules = rules.map(({ clauses, variation: variationIndex }) => {
                const { attribute, op, values, negate } = clauses[0];
                return {
                    attribute,
                    op,
                    comparisonValues: values,
                    negate,
                    value: getValueFromVariation(variationIndex),
                };
            });

            if (fallthrough.variation === undefined) {
                console.dir(flagResponse, { depth: 99 });
            }

            return {
                individualTargetRules,
                additionalRules,
                fallthrough: getValueFromVariation(fallthrough.variation),
            };
        };
        const environments = Object.fromEntries(
            Object.entries(flagResponse.environments).map(([envKey, environment]) => [
                envKey,
                getEnvironmentTargeting(environment),
            ])
        );

        return {
            key: flagResponse.key,
            kind: flagResponse.kind,
            name: flagResponse.name,
            description: flagResponse.description,
            variations: flagResponse.variations.map(({ value }) => value),
            environments,
            tags: flagResponse.tags,
            maintainerEmail: flagResponse._maintainer?.email,
            permanent: !flagResponse.temporary,
            archived: flagResponse.archived,
            defaults: flagResponse.defaults,
        };
    }
}
