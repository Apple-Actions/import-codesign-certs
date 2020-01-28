# GitHub Action to import Apple Code-signing Certificates and Keys

## Usage:

```yaml
uses: apple-actions/import-codesign-certs@v1
with: 
  p12-filepath: 'path/to/certs.p12`
  p12-password: ${{ secrets.P12_PASSWORD }}
```

## Additional Arguments

See [action.yml](action.yml) for more details.
