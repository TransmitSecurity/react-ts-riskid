# Changelog

## Version 2.0.0
**BREAKING CHANGES:**

1. **🚨 BREAKING:** Upgrade to React 18
   - The SDK now requires **React 18** and **ReactDOM 18** as peer dependencies.
   - If you're using TypeScript, please ensure that `@types/react` and `@types/react-dom` match your installed React version (18.x).
   - You may encounter type errors (e.g. `JSX.Element is not assignable to ReactNode`) if your project has multiple versions of `@types/react` installed.

## Version 1.2.0
1. Expose `getSessionToken()` method from the SDK.

## Version 1.1.1
1. Update react quickstart documentation link in package README

## Version 1.1.0
1. Update default SDK's `serverUrl` to the gateway URL (`'https://api.transmitsecurity.io/risk-collect/'`)
2. export DRSConfigOptions
3. Add optional `initSuccessLog` prop for TSAccountProtectionProvider component.

## Version 1.0.17
1. Renamed `serverPath` optional param to `serverUrl`, mark `serverPath` as deprecated.
2. Export new `DRSConfigOptions` interface for the Provider component.
3. Add new optional param - `sdkLoadUrl` - an alternative URL to load the SDK from for 1st-party integration (*This option overrides the `DRSConfigOptions/sdkVersion` option).

## Version 1.0.14
1. Support lower React versions and commonJS modules import.

## Versions 1.0.12-1.0.13 - not widely used, published for testing (unstable).

## Version 1.0.11
1. Making '@transmitsecurity/riskid-reactjs-ts' package public in npm.