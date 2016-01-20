# rfg-api

Implementation of the [RealFaviconGenerator API](http://realfavicongenerator.net/api)
for [Node.js](https://nodejs.org).

## Getting Started

This plugin implements the
[non-interactive API of RealFaviconGenerator.net](https://realfavicongenerator.net/api/non_interactive_api).
This API lets you create favicons for all platforms: desktop browsers, iOS, Android, etc.

To install it:

```shell
npm install rfg-api --save
```

## Release History

### 0.1.7

- 

### 0.1.6

- Fix for `existing_manifest`.

### 0.1.5

- Add `escapeJSONSpecialChars`.

### 0.1.4

- Switch to HTTPS.

### 0.1.3

- Existing `rel=mask-icon` markups are filtered-out.

### 0.1.2

- Improvement in `normalizeMasterPicture`.

### 0.1.1

- `changeLog` added.

### 0.1.0

- `injectFaviconMarkups` now takes the HTML content directly, not a file name.

### 0.0.3

- In case of API invocation error, the error is transmitted to the callback
(instead of being thrown).

### 0.0.2

- Refactoring

### 0.0.1

- Initial release
