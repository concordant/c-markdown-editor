# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

### Changed

### Deprecated

### Removed

### Fixed

### Security

## [1.2.0] - 2021-07-22

### Added

- Provide a service worker file in public repository
- Add a callback to receive notifications when a crdt is updated

### Changed

- Separate the timeout into two timeout: pushing/polling
- Remove frequent pooling but keep a backup call when it has not received a new version for a while
- Set push timeout only when there has been a write

### Fixed

- Fix mdeditor new version types

## [1.1.0] - 2021-05-17

### Added

- Add offline mode

### Fixed

- Fix concurrency between edits and remote updates

## [1.0.7] - 2021-04-17

### Added

- Add buttons to export as markdown file or png image
- Default value for empty documents

### Changed

- Delay and group update requests

### Fixed

- Replace unnecessary calls to rga.get
- Fix the cursor position when merging text

## [1.0.6] - 2021-03-18

### Added

- Export the markdown editor as a component
- Add STATUS.md file

### Fixed

- Selection + insertion loses data
