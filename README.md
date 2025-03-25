# GitHub Action to import Apple Code-signing Certificates and Keys

[![License](https://img.shields.io/badge/license-MIT-green.svg?style=flat)](LICENSE)
[![PRs welcome!](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

## Getting Started

* Create a certificate signing request (see [here](https://developer.apple.com/help/account/certificates/create-a-certificate-signing-request/))
* Create a `iOS Distribution (App Store Connect and Ad Hoc)` (same as [these instructions](https://developer.apple.com/help/account/certificates/create-enterprise-distribution-certificates) but select the different type on step 3)
* Download the certificate (must be done upon creation and will be called `ios_distribution.cer`)
* Import into `login` section of Keychain Access (must be launched with spotlight because it doesn't show up in Launchpad)
* Select `My Certificates` and then export the certificate as a `.p12` (it will prompt for a password)
* Copy the `.p12` in base64 format ( `base64 -i ios_distribution.p12 | pbcopy` )
* Add it as a secret called `APPSTORE_CERTIFICATES_FILE_BASE64` and the password as `APPSTORE_CERTIFICATES_PASSWORD`

## Usage

```yaml
uses: apple-actions/import-codesign-certs@v3
with: 
  p12-file-base64: ${{ secrets.APPSTORE_CERTIFICATES_FILE_BASE64 }}
  p12-password: ${{ secrets.APPSTORE_CERTIFICATES_PASSWORD }}
```

## Multiple Certificates

If you need to add multiple certificates, select them all in the keychain when creating your p12 file. You do not need multiple separate steps.

## Additional Arguments

See [action.yml](action.yml) for more details.

## Generating the certificate

1. Generate a CSR on your machine, either
   - using the macos "Keychain Access" tool 
   - or using openssl
     ```sh
     openssl req -new -newkey rsa:2048 -nodes -keyout app.key -out app.csr
     ```
3. Sign your `app.csr` on [Apple Developer](https://developer.apple.com/account/resources/certificates/add)
4. Download the resulting `certificate.cer`
5. Create a `p12` file, you will be asked to set a password
   - Either importing and exporting to/from the macos "Keychain Access" 
   - or a terminal
     ```sh
     openssl x509 -in app.cer -inform DER -out app.pem -outform PEM
     openssl pkcs12 -export -out app.p12 -inkey app.key -in app.pem
     ```
     
     Since [the default openssl 3 default algorithms are not compatible with the security frameworks in macOS/iOS.](https://getcodesolution.com/programs/mac-verification-failed-during-pkcs12-import-wrong-password-azure-devops/) you have to use an openssl 1.1 installation, if you don't have one on your system, you can use docker
     
     ```sh
     docker run -it --rm -v$(pwd):/io:rw ubuntu:20.04 /bin/bash -c "apt-get update && apt-get install -y openssl && openssl pkcs12 -export -out /io/app.p12 -inkey /io/app.key -in /io/app.pem"
     ```
6. Encode your p12 file with base64
   ```
   base64 app.p12
   ```
7. Create the github action secrets

## Contributing

We welcome your interest in contributing to this project. Please read the [Contribution Guidelines](CONTRIBUTING.md) for more guidance.

## License

Any contributions made under this project will be governed by the [MIT License](LICENSE).
