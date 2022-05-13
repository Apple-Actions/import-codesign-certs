# GitHub Action to import Apple Code-signing Certificates and Keys

[![License](https://img.shields.io/badge/license-MIT-green.svg?style=flat)](LICENSE)
[![PRs welcome!](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

## Getting Started

First, generate your signing certificates in the XCode preferences. Click on the Accounts tab, select your user account and click Manage Certificates. Click the plus button and add the relevant certificates for the type of app you are developing.

Next, create a .p12 file that combines all of your certificates and private keys using [these instructions](https://calvium.com/how-to-make-a-p12-file/). 

Copy the .p12 format in base64:

```
base64 CertificateFile.p12 | pbcopy
```

Paste the output of the above command into a secret called `CERTIFICATES_P12` and the password into `CERTIFICATES_P12_PASSWORD` into the GitHub Actions Secrets in the GitHub settings.
## Usage:

```yaml
uses: apple-actions/import-codesign-certs@v1
with: 
  p12-file-base64: ${{ secrets.CERTIFICATES_P12 }}
  p12-password: ${{ secrets.CERTIFICATES_P12_PASSWORD }}
```

## Multiple Certificates

If you need to add multiple certificates, select them all in the keychain when creating your p12 file. You do not need multiple separate steps.

## Additional Arguments

See [action.yml](action.yml) for more details.

## Contributing

We welcome your interest in contributing to this project. Please read the [Contribution Guidelines](CONTRIBUTING.md) for more guidance.

## License

Any contributions made under this project will be governed by the [MIT License](LICENSE).
