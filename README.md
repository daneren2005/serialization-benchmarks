# Serialization library comparisons
Comparing JSON vs avsc, cbor-x, and js-binary across both encoded size and how long it took to serialize vs deserialize.  cbor-x seemed to be the only one that was a pure win.  avsc would be good for small change sets since it is both faster and smaller.  Even for large saves avsc was similar encoding/decoding time and significantly smaller files, so it's probably worth it.

Running compression with snappy appears to only be worth it at larger sizes.  The library with the least compressed size difference was avsc.  With compression though even JSON is close enough to avsc to probably not be worth it.  Using JSON we are taking 7.4 + 3.1 = 10.5ms to serialize and with avsc we are taking 7.5 + 2.1 = 9.6ms to serialize and the size difference is only 927k to 889k.  

For small entity updates, avsc without compression appears to be the smallest/fastest.

## Raw results for large save file

| Library  | Encoded Size | Compressed Size | Encode Time | Decode Time | Compress Time |
| ------------- | ------------- | ------------- | ------------- | ------------- | ------------- |
| json | 2,018,016 | 927,889 | 6.2ms (6ms - 9ms std dev 0.6ms) | 7.0ms (6ms - 12ms std dev 0.6ms) | 3.1ms (2ms - 4ms std dev 0.4ms)
| avsc | 1,180,059 | 889,433 | 7.1ms (6ms - 10ms std dev 0.5ms) | 6.4ms (6ms - 10ms std dev 0.7ms) | 2.0ms (1ms - 3ms std dev 0.2ms)
| cbor-x | 1,646,763 | 910,820 | 5.4ms (5ms - 7ms std dev 0.7ms) | 6.4ms (5ms - 17ms std dev 1.0ms) | 2.1ms (2ms - 3ms std dev 0.5ms)
| cbor-x-encoder | 1,266,787 | 901,709 | 5.4ms (5ms - 10ms std dev 0.7ms) | 2.5ms (1ms - 8ms std dev 0.9ms) | 2.2ms (2ms - 3ms std dev 0.5ms)
| cbor-x-structured | 1,266,787 | 901,709 | 7.3ms (6ms - 14ms std dev 1.0ms) | 2.5ms (1ms - 13ms std dev 0.9ms) | 2.2ms (2ms - 4ms std dev 0.5ms)
| js-binary | 1,340,066 | 920,976 | 19.7ms (18ms - 28ms std dev 0.7ms) | 10.4ms (8ms - 19ms std dev 1.2ms) | 2.2ms (2ms - 3ms std dev 0.6ms)


## Percent results for large save file (lower is better)
| Libary | Encoded Size | Compressed Size | Encode Time | Decode Time | Compress Time |
| ------------- | ------------- | ------------- | ------------- | ------------- | ------------- |
| json | 100% | 100% | 100% | 100% | 100%
| avsc | 58% | 96% | 115% | 92% | 65%
| cbor-x | 82% | 98% | 87% | 92% | 69%
| cbor-x-encoder | 63% | 97% | 86% | 36% | 69%
| cbor-x-structured | 63% | 97% | 117% | 36% | 70%
| js-binary | 66% | 99% | 318% | 149% | 71%


## Raw results for single entity update

| Library  | Encoded Size | Compressed Size | Encode Time | Decode Time | Compress Time |
| ------------- | ------------- | ------------- | ------------- | ------------- | ------------- |
| json | 92 | 95 | 0.50ns (0.4ns - 0.8ns std dev 0.09ns) | 0.47ns (0.4ns - 0.9ns std dev 0.21ns) | 1.62ns (1.3ns - 84.6ns std dev 0.58ns)
| avsc | 59 | 61 | 0.35ns (0.3ns - 1.6ns std dev 0.23ns) | 0.23ns (0.2ns - 0.4ns std dev 0.21ns) | 1.65ns (1.3ns - 187ns std dev 0.62ns)
| cbor-x | 77 | 80 | 0.41ns (0.3ns - 0.7ns std dev 0.19ns) | 0.52ns (0.5ns - 0.9ns std dev 0.19ns) | 1.61ns (1.3ns - 2.6ns std dev 0.32ns)
| cbor-x-encoder | 82 | 85 | 0.80ns (0.7ns - 1.7ns std dev 0.12ns) | 0.65ns (0.6ns - 1.1ns std dev 0.23ns) | 2.26ns (1.4ns - 415.9ns std dev 0.93ns)
| cbor-x-structured | 82 | 85 | 0.94ns (0.9ns - 1.7ns std dev 0.22ns) | 0.64ns (0.6ns - 1.1ns std dev 0.22ns) | 2.51ns (1.8ns - 4.2ns std dev 0.58ns)
| js-binary | 67 | 70 | 1.41ns (1.2ns - 2.4ns std dev 0.30ns) | 0.40ns (0.3ns - 0.7ns std dev 0.09ns) | 2.52ns (1.7ns - 5.7ns std dev 0.61ns)


## Percent results for single entity update (lower is better)
| Library  | Encoded Size | Compressed Size | Encode Time | Decode Time | Compress Time |
| ------------- | ------------- | ------------- | ------------- | ------------- | ------------- |
| json | 100% | 100% | 100% | 100% | 100%
| avsc | 64% | 64% | 69% | 49% | 102%
| cbor-x | 84% | 84% | 82% | 110% | 99%
| cbor-x-encoder | 89% | 89% | 160% | 137% | 140%
| cbor-x-structured | 89% | 89% | 188% | 134% | 155%
| js-binary | 73% | 74% | 282% | 85% | 156%


## Raw results for partial updates
| Library  | Encoded Size | Compressed Size | Encode Time | Decode Time | Compress Time |
| ------------- | ------------- | ------------- | ------------- | ------------- | ------------- |
| json | 410 | 365 | 2.48ns (2.4ns - 3ns std dev 0.21ns) | 2.27ns (2.2ns - 3.1ns std dev 0.21ns) | 2.02ns (1.7ns - 84.8ns std dev 0.57ns)
| avsc | 318 | 323 | 2.37ns (2.3ns - 3.4ns std dev 0.21ns) | 1.04ns (1ns - 1.3ns std dev 0.22ns) | 1.66ns (1.3ns - 171.3ns std dev 0.60ns)
| cbor-x | 377 | 358 | 1.35ns (1.3ns - 1.6ns std dev 0.22ns) | 1.24ns (1.2ns - 1.4ns std dev 0.22ns) | 1.96ns (1.6ns - 3.1ns std dev 0.41ns)
| cbor-x-encoder | 379 | 375 | 2.58ns (2.5ns - 3.4ns std dev 0.20ns) | 1.30ns (1.2ns - 1.5ns std dev 0.10ns) | 2.40ns (1.5ns - 440ns std dev 0.94ns)
| cbor-x-structured | 379 | 375 | 3.36ns (3.3ns - 3.8ns std dev 0.23ns) | 1.30ns (1.2ns - 1.7ns std dev 0.15ns) | 1.98ns (1.6ns - 3.2ns std dev 0.42ns)
| js-binary | 346 | 338 | 4.82ns (4.7ns - 6.6ns std dev 0.30ns) | 1.20ns (1.1ns - 1.9ns std dev 0.21ns) | 2.33ns (1.7ns - 3.9ns std dev 0.55ns)

## Percent results for partial updates (lower is better)
| Library  | Encoded Size | Compressed Size | Encode Time | Decode Time | Compress Time |
| ------------- | ------------- | ------------- | ------------- | ------------- | ------------- |
| json | 100% | 100% | 100% | 100% | 100%
| avsc | 78% | 88% | 96% | 46% | 82%
| cbor-x | 92% | 98% | 54% | 55% | 97%
| cbor-x-encoder | 92% | 103% | 104% | 57% | 119%
| cbor-x-structured | 92% | 103% | 136% | 57% | 98%
| js-binary | 84% | 93% | 195% | 53% | 115%