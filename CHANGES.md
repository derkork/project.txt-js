# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.2] - 2020-03-26
### Fixed
* Effective task state calculation now takes the task start date into account. If a task start date is in the future, the task will be marked as blocked. 
* Improved the parser for some less-than-ideally handled edge cases (e.g. dates followed by newlines). These should now be correctly parsed and not require the insertion of a whitespace to make the parser happy.

## [0.1.1] - 2020-03-26
### Fixed
* The library was not fully built because I had no proper automation of the build process. So the typescript files were not updated. Please use 0.1.1 instead of 0.1.0.
* The `index` property in `Person` entries no longer contains the line number, but the actual index.
* The `lineNumber` property in `Person` entries no longer contains the index but the actual line number.

## [0.1.0] - 2020-03-26
* THIS VERSION IS BROKEN, please use 0.1.1 or later.

### Added
* `calculateDependencies` now also calculates the effective state of a task. This is useful to be able to show the correct task status in the UI and for building lists with currently actionable tasks.

## [0.0.1] - 2020-03-23

* Initially released version. 
* This is not stable and is not recommended for productive use.