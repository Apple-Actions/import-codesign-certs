# GitHub Action to import Apple Code-signing Certificates and Keys

[![License](https://img.shields.io/badge/license-MIT-green.svg?style=flat)](LICENSE)
[![PRs welcome!](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

## Getting Started

Use the same GitHub secrets as the rest of the [Apple-Actions](https://github.com/Apple-Actions) suite.

### Canonical GitHub ENVs

| Kind | Name | Purpose |
| --- | --- | --- |
| Secret | `APPSTORE_CERTIFICATES_FILE_BASE64` | Base64-encoded signing `.p12` |
| Secret | `APPSTORE_CERTIFICATES_PASSWORD` | Password for the `.p12` |

Related ASC API vars/secrets (used by download-profiles / upload-testflight): `APPSTORE_ISSUER_ID`, `APPSTORE_API_KEY_ID`, `APPSTORE_API_PRIVATE_KEY`.

### Create the signing certificate

Recommended: use the setup scripts in [`download-provisioning-profiles`](https://github.com/Apple-Actions/download-provisioning-profiles#one-shot-setup) (`scripts/setup.sh` or `scripts/create-signing-certificate.sh --p12-password ...`). That creates the distribution certificate via the App Store Connect API and prints values for the secrets above.

Manual alternative:

* Create a certificate signing request (see [here](https://developer.apple.com/help/account/certificates/create-a-certificate-signing-request/))
* Create an `iOS Distribution (App Store Connect and Ad Hoc)` certificate
* Download `ios_distribution.cer`, import into Keychain Access → **login** → **My Certificates**, export as `.p12`
* `base64 -i ios_distribution.p12 | pbcopy` → secret `APPSTORE_CERTIFICATES_FILE_BASE64`, plus `APPSTORE_CERTIFICATES_PASSWORD`

## Usage

```yaml
uses: apple-actions/import-codesign-certs@v7
with:
  p12-file-base64: ${{ secrets.APPSTORE_CERTIFICATES_FILE_BASE64 }}
  p12-password: ${{ secrets.APPSTORE_CERTIFICATES_PASSWORD }}
```

## Multiple Certificates

If you need to add multiple certificates, select them all in the keychain when creating your p12 file. You do not need multiple separate steps.

## Additional Arguments

See [action.yml](action.yml) for more details.

## Contributing

We welcome your interest in contributing to this project. Please read the [Contribution Guidelines](CONTRIBUTING.md) for more guidance.

## License

Any contributions made under this project will be governed by the [MIT License](LICENSE).
