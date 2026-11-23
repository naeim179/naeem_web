# Parallax

## Challenge overview

Parallax is a 464-point cryptography challenge from OVERPASS 2026 by notSUH1B. The beacon signs each request with two related reports: a full range response and a lower-precision Doppler response. The challenge asks whether an observer can impersonate the beacon and unlock its sealed logbook.

## Where the signing design fails

The beacon signs the two reports with separate private keys and distinct challenge labels, but uses the same secret nonce for both responses in each request. The public commitment therefore reflects a shared secret value. Restricting the Doppler response to its most significant bits still reveals information about that value and its relation to the signing keys.

A fresh nonce for each request does not address reuse within the request itself. The risk comes from combining the full range response with the partial Doppler response across multiple observations. The shared nonce links those observations to the same pair of session keys.

## Impact

The writeup records a successful solve. The linked responses exposed enough information to recover the session signing keys, impersonate the beacon, and read its sealed logbook. The logbook also depended on those private scalars for its encryption key, so the signing compromise affected confidentiality as well as authentication.

## Design lessons

Use reviewed signature implementations and generate a nonce independently for each signing operation, even when multiple signatures are produced for the same request. For a custom protocol that must expose a derived or rounded measurement, keep it separate from intermediate signature values.

Use independent key material for signing and encryption. Review both how values are generated and how they are shared across operations, especially when multiple components emit data derived from the same secret.
