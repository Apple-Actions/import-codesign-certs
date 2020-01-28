# GitHub Action to import Apple Code-signing Certificates and Keys

## Usage:

```yaml
uses: apple-actions/import-codesign-certs@v1
with: 
  p12-file-base64: ${{ secrets.CERTIFICATES_P12 }}
  p12-password: ${{ secrets.CERTIFICATES_P12_PASSWORD }}
```

## Additional Arguments

See [action.yml](action.yml) for more details.
