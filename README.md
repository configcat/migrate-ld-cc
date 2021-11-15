# Migrate LaunchDarkly To ConfigCat

This project is to show a working sample on migrating from [LaunchDarkly](https://launchdarkly.com/) to [ConfigCat](https://configcat.com/)

## Getting Started

These instructions will get you started on this project and run the migration from [LaunchDarkly](https://launchdarkly.com/) to [ConfigCat](https://configcat.com/).

### Prerequisites

What things you need to install the software and how to install them

- [NodeJs](https://nodejs.org/en/)


### Setup

1. Clone this repository to your local environment
2. Run `npm install`
3. Copy `.env.sample` into `.env` file & fill in the details*
4. Run `npm run migrate` on your terminal
5. If you see your LaunchDarkly's feature flag names listed, you have set everything right. Congratulations!

*Note that `CONFIG_CAT_PLAN` is important. That will determine whether the code will create feature flag within your base product or not.

## Running the tests

Explain how to run the automated tests for this system

### Break down into end to end tests

Explain what these tests test and why

```
Give an example
```

### And coding style tests

Explain what these tests test and why

```
Give an example
```

## Deployment

Add additional notes about how to deploy this on a live system

## Built With

* 

## Authors

* [**Kiong**](https://github.com/tlkiong)

See also the list of [contributors](https://github.com/your/project/contributors) who participated in this project.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details
