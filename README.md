| :mega: Important notice |
|-------------------------|
| The script in this repo is outdated and not fully functional. Another, more complete solution is under development and a preview version is already available. For more information, contact [ConfigCat support](https://configcat.com/support/). |

# Migrate LaunchDarkly To ConfigCat

This repo contains a script to migrate Feature Flags from a LaunchDarkly project to ConfigCat.

## Getting Started

These instructions will get you started on this project and run the migration from [LaunchDarkly](https://launchdarkly.com/) to [ConfigCat](https://configcat.com/).

### Prerequisites

- [NodeJs](https://nodejs.org/en/)

## Setup

1. Clone this repository to your local environment
2. Run `npm install`
3. Copy `.env.sample` into `.env` file & fill in the details (see below)
4. Run `npm run migrate` on your terminal
5. If you see your LaunchDarkly's feature flag names listed, you have set everything right. Congratulations!

### Environment Variables

To find the ConfigCat Product and Config IDs, login to app.configcat.com. Select the correct
product and config, and you'll be redirected to a new URL with the following syntax:
`https://app.configcat.com/<org_id>/<product_id>/<env_id>`

The `SUPPORTED_TARGETING_ATTRS` is a comma-separated list of attributes which are expected to be targeted by
feature flags/segments. For example, `orgId`, `isInternal` etc.

## Caveats

This script was tested with LaunchDarkly API v3 and ConfigCat API v1.

At the time of writing (Jan 2024), ConfigCat are preparing to release a new version which will
be more feature-rich.

Moreover, the original LaunchDarkly project targeted by this script used a relatively small subset
of features; others were intentionally not supported in the interest of time. Pull requests welcome!

The targeting rules in particular pose a challenge. Aside from matching
segments, the script currently assumes the targeting operation/comparator is `in` - e.g.
is the user's organisation ID in this list?

## Further information

Please see the [/docs](./docs) folder for additional information on unsupported features, transformations
and validation.

## Terminology

Whilst most concepts share names between LaunchDarkly and ConfigCat, there are some exceptions.

- Most notably, ConfigCat refer to Feature Flags as Settings. Additionally, although both have the concept of
  projects, each project in ConfigCat has one or more Configs (a collection of flags/settings).
- ConfigCat talks of "comparators" whereas LaunchDarkly rules have "operations".
- The "default value" in a LaunchDarkly flag maps simply to "value" in ConfigCat.
- You will see the terms `sensitiveIsOneOf` etc in the script. As ConfigCat's business model involves sending the entire configuration file to the client, it is recommended to use sensitive text comparators to make sure clients don't get access to sensitive information. See more information here: https://configcat.com/blog/2020/03/02/sensitive-comparators/

## Authors

- [**Kiong**](https://github.com/tlkiong)
- [**Larister**](https://github.com/larister)

See also the list of [contributors](https://github.com/your/project/contributors) who participated in this project.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details
