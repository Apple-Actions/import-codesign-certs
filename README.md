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

## macOS: App Store and Developer ID

A macOS app that ships to TestFlight / the Mac App Store and as a notarized Developer ID DMG needs three identities in one `.p12`:

| Identity | Signs |
| --- | --- |
| Apple Distribution | The app, for the App Store |
| Mac Installer Distribution | The `.pkg` uploaded to TestFlight |
| Developer ID Application | The app and the DMG distributed outside the App Store |

`openssl pkcs12` holds only one private key, so build the combined `.p12` with `security`. Import each identity's `.p12` into a throwaway keychain, then export all of them together:

```sh
security create-keychain -p temp build.keychain
for p12 in distribution.p12 installer.p12 developer-id.p12; do
  security import "$p12" -k build.keychain -P "$P12_PASSWORD" -T /usr/bin/security
done
security export -k build.keychain -t identities -f pkcs12 -P "$P12_PASSWORD" -o all.p12
security delete-keychain build.keychain
base64 -i all.p12 | pbcopy # → APPSTORE_CERTIFICATES_FILE_BASE64
```

Profiles for both channels come from [`download-provisioning-profiles`](https://github.com/Apple-Actions/download-provisioning-profiles#macos-app-store-and-developer-id), and [`xcodebuild`](https://github.com/Apple-Actions/xcodebuild#macos-mac-app-store-and-developer-id-from-one-archive) exports one archive for both. See [`Apple-Actions/Example-macOS`](https://github.com/Apple-Actions/Example-macOS) for the full workflow, including [`upload-testflight-build`](https://github.com/Apple-Actions/upload-testflight-build) and [`notarize`](https://github.com/Apple-Actions/notarize).

## Outputs

| Name | Description |
| --- | --- |
| `keychain-password` | The password for the keychain. |
| `security-response` | The output of the `security` commands. |
| `identities` | JSON array of the valid code-signing identities in the keychain, each `{"hash": "<SHA-1>", "name": "<common name>"}`. |

### identities

A renewed certificate keeps the same name as the old one, so `codesign --sign "<name>"` fails as ambiguous while both are in the keychain. Sign by hash instead:

```yaml
- id: certs
  uses: apple-actions/import-codesign-certs@v7
  with:
    p12-file-base64: ${{ secrets.APPSTORE_CERTIFICATES_FILE_BASE64 }}
    p12-password: ${{ secrets.APPSTORE_CERTIFICATES_PASSWORD }}

- name: Sign the DMG
  env:
    IDENTITIES: ${{ steps.certs.outputs.identities }}
  run: |
    hash=$(jq -r 'first(.[] | select(.name | startswith("Developer ID Application:")) | .hash)' <<<"$IDENTITIES")
    codesign --sign "$hash" --timestamp App.dmg
```

## Additional Arguments

See [action.yml](action.yml) for more details.

## Contributing

We welcome your interest in contributing to this project. Please read the [Contribution Guidelines](CONTRIBUTING.md) for more guidance.

## License

Any contributions made under this project will be governed by the [MIT License](LICENSE).
