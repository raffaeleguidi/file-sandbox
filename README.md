# file-sandbox
POC of a file sandbox process

```
% file-sandbox % node demo.js
2022-03-12T16:29:45.706Z initializing private and public keys
2022-03-12T16:29:45.714Z creating Intermediary key pair
2022-03-12T16:29:45.716Z creating Final-customer key pair
2022-03-12T16:29:45.716Z creating Data-provider key pair
2022-03-12T16:29:50.720Z encrypting data
hash before encryption is 1e23b44390cad00b960ee39c362eb805
Uint8Array(5881081) [
   89, 101,  97, 114,  44,  73, 110, 100, 117, 115, 116, 114,
  121,  95,  97, 103, 103, 114, 101, 103,  97, 116, 105, 111,
  110,  95,  78,  90,  83,  73,  79,  67,  44,  73, 110, 100,
  117, 115, 116, 114, 121,  95,  99, 111, 100, 101,  95,  78,
   90,  83,  73,  79,  67,  44,  73, 110, 100, 117, 115, 116,
  114, 121,  95, 110,  97, 109, 101,  95,  78,  90,  83,  73,
   79,  67,  44,  85, 110, 105, 116, 115,  44,  86,  97, 114,
  105,  97,  98, 108, 101,  95,  99, 111, 100, 101,  44,  86,
   97, 114, 105,  97,
  ... 5880981 more items
]
2022-03-12T16:29:55.716Z decrypting data and checking md5 hashes
Intermediary hash verification is correct 1e23b44390cad00b960ee39c362eb805
Final-customer hash verification is correct 1e23b44390cad00b960ee39c362eb805
Intermediary verified Data-provider Signature is valid {
  keyID: Me { bytes: '¹:Ô\x05\x88\x03aÇ' },
  verified: Promise { true },
  signature: Promise { Bo { packets: [so] } }
}
Final-customer verified Data-provider Signature is valid {
  keyID: Me { bytes: '¹:Ô\x05\x88\x03aÇ' },
  verified: Promise { true },
  signature: Promise { Bo { packets: [so] } }
}
```
