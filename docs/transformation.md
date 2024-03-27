# Flag transformations

The following flag transformations should be applied to LaunchDarkly flags:

- Variations -> Pluck out the value
- Tags -> Include the maintainer email
- Permanent -> Is not temporary
- Boolean targeting ->
  - enabledUserIds -> targets have variation = 0
  - disabledUserIds -> targets have variation = 1
  - fallback -> fallthrough variation = 0

# Segment transformations

The following segment transformations should be applied to LaunchDarkly flags:

- Prepend name with [env] e.g. `[prod] Beta Users`
