# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## Unreleased
### Fixed
* Finished tasks are no longer marked as having an uncertain finish date (fixes [#2](https://github.com/derkork/project.txt-js/issues/2)).

## [0.1.3] - 2020-03-28
### Fixed
* The library now properly calculates whether a finish date has uncertainty when a task has more than one prerequisite.

## [0.1.2] - 2020-03-26
### Fixed
* Effective task state calculation now takes the task start date into account. If a task start date is in the future, the task will be marked as blocked. 
* Improved the parser for some less-than-ideally handled edge cases (e.g. dates followed by newlines). These should now be correctly parsed and not require the insertion of a whitespace to make the parser happy.

## [0.1.1] - 2020-03-26
### Fixed
* The library is now using proper automation for the build process, so typescript definitions are up to date when the library is released.
* The `index` property in `Person` entries no longer contains the line number, but the actual index.
* The `lineNumber` property in `Person` entries no longer contains the index but the actual line number.

## [0.1.0] - 2020-03-26
* THIS VERSION IS BROKEN, please use 0.1.1 or later.

### Added
* `calculateDependencies` now also calculates the effective state of a task. This is useful to be able to show the correct task status in the UI and for building lists with currently actionable tasks.

## [0.0.1] - 2020-03-23

* Initially released version. 
* This is not stable and is not recommended for productive use.