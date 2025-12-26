# ATP-0001 — Core Envelope + Header

## Motivation
We need a tiny, unambiguous kernel that can be implemented consistently.

## Wire format

### Header
- `Agent-Token: <base64url(JSON)>`

### Envelope
```json
{
  "v": 0,
  "pkgs": {}
}
```

## Fields
- `v` (int, required): envelope version
- `pkgs` (object, required): map from package id to package payload object

## Security considerations
The header is not inherently authenticated. Implementations SHOULD bind it to a request signature.

## Backwards compatibility
New optional fields should be avoided in the envelope. Add new capability via packages instead.
