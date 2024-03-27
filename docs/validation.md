# Validation

Not all LaunchDarkly features are supported in ConfigCat. Additionally, some
features have not been encountered by this script and thus not coded specifically.
As a result, we run a set of validations for both feature flags and segments.

## Flag validation

The following checks are made whilst validating LaunchDarkly flags:

- Boolean variations are in the order `[true, false]` (simple sanity check)
- Flag should have no prerequisites (unsupported in ConfigCat v1)
- Flag should not have contextTargets
- Flag targeting should always have contextKind of "user" (The concept of [context kinds](https://docs.launchdarkly.com/home/contexts/context-kinds) was new to LaunchDarkly v3 and thus not a focus for the original migration)
- Flag should only have rules with one clause
- Kind should be either boolean or multivariate (numeric supported but not implemented)
- Flag rules shouldn't have a rollout property (supported but not implemented)
- Flag rules should only have have `SUPPORTED_TARGETING_ATTRS/in` or `segmentMatch segmentMatch` for attribute/in clause properties. Others supported but not implemented.
- Flag rule should only ever match on a single segment (multiple segment matching not supported in ConfigCat).
- Flag rules should not bucket by attributes (not supported in ConfigCat).
- Flag fallthrough should not be percentage rollout (not technically supported in ConfigCat but can just have the final ELSE IF targeting rule be a percentage).
- Flag fallthrough should not be undefined (simple sanity check)

## Segment validation

The following checks should be made whilst validating Launch Darkly segments:

- Should not have both included ids AND rules
- Should only have one rule
- Segment rule clauses have `SUPPORTED_TARGETING_ATTRS` attribute and `in` op
- Segment rule clauses have contextKind of 'user'
- Segment rule clauses do not have negate set to true
