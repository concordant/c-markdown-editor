# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

- [Unreleased]

  - Added
  - Changed
  - Deprecated
  - Removed
  - Fixed
    - Fix concurrency between edits and remote updates
  - Security

- [1.0.7] - 2020-04-17

  - Added
    - Add export as markdown file and png image buttons
    - Set a default value for empty documents using the placeholder attribute
  - Changed
    - Delay and group update requests
  - Fixed
    - Replace unnecessary calls to rga.get
    - Fix the cursor position when merging text

- [1.0.6] - 2020-03-18
  - Added
    - Export the markdown editor as a component
    - Add status file
  - Fixed
    - Selection + insertion loses data
