# GitHub Action to import Apple Code-signing Certificates and Keys

[![License](https://img.shields.io/badge/license-MIT-green.svg?style=flat)](LICENSE)
[![PRs welcome!](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

## Usage:

```yaml
uses: apple-actions/import-codesign-certs@v1
with: 
  p12-file-base64: ${{ secrets.CERTIFICATES_P12 }}
  p12-password: ${{ secrets.CERTIFICATES_P12_PASSWORD }}
```

## Additional Arguments

See [action.yml](action.yml) for more details.

## Generating the certificate

1. Generate a CSR on your machine, either
   - using the macos "Keychain Access" tool 
   - or using openssl `openssl req -new -newkey rsa:2048 -nodes -keyout app.key -out app.csr`
3. Sign your `app.csr` on [Apple Developer](https://developer.apple.com/account/resources/certificates/add) with a "Developer ID Application"
4. Download the resulting `certificate.cer`
5. Create a `p12` file, you will be asked to set a password
   - Either importing and exporting to/from the macos "Keychain Access" 
   - or a terminal
     ```sh
     openssl x509 -in app.cer -inform DER -out app.pem -outform PEM
     openssl pkcs12 -export -out app.p12 -inkey app.key -in app.pem
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
