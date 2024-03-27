import { strict as assert } from 'node:assert';
import { LaunchDarkly } from '../launch-darkly.js';

const SUPPORTED_TARGETING_ATTRS = process.env.SUPPORTED_TARGETING_ATTRS.split(',');

export class LaunchDarklySegments extends LaunchDarkly {
    async getAll(projectKey, environment) {
        const segments = [];

        const opts = {
            url: `${this.BASE_URL_V2}/segments/${projectKey}/${environment.key}`,
        };
        const res = await super.gets(opts);

        for (const item of res.items) {
            this.validate(item);
            segments.push(this.transform(environment.name, item));
        }

        return segments;
    }

    validate({ name, included, rules }) {
        if (included.length && rules.length) {
            assert.fail(`${name}: Segment has both rules and user IDs`);
        } else if (rules.length > 1) {
            console.warn(`${name}: Segment has multiple rules`);
        }
        for (const rule of rules) {
            if (rule.clauses.length > 1) {
                assert.fail(`${name}: Segment rule has multiple clauses`);
            }
            const clause = rule.clauses[0];

            if (!SUPPORTED_TARGETING_ATTRS.includes(clause.attribute) || clause.op !== 'in') {
                assert.fail(
                    `${name}: Segment has unexpected clause attribute/op (${clause.attribute}/${clause.op})`
                );
            }
            if (clause.contextKind !== 'user') {
                assert.fail(
                    `${name}: Segment has unexpected clause contextKind (${clause.contextKind})`
                );
            }
            if (clause.negate) {
                assert.fail(`${name}: Segment has negate set to true`);
            }
        }
    }

    transform(environmentName, segmentResponse) {
        let targeting;
        if (segmentResponse.included.length) {
            targeting = {
                comparisonAttribute: 'Identifier',
                comparator: 'sensitiveIsOneOf',
                comparisonValue: segmentResponse.included.join(','),
            };
        } else {
            for (const rule of segmentResponse.rules) {
                const clause = rule.clauses[0];
                targeting = {
                    comparisonAttribute: clause.attribute,
                    comparator: 'sensitiveIsOneOf',
                    comparisonValue: clause.values.join(','),
                };
            }
        }
        return {
            name: `[${environmentName}] ${segmentResponse.name}`,
            key: segmentResponse.key,
            description: segmentResponse.description,
            ...targeting,
        };
    }
}
