# Serialization library comparisons
Comparing JSON vs avsc, cbor-x, and js-binary across both encoded size and how long it took to serialize vs deserialize.  cbor-x seemed to be the only one that was a pure win.  avsc would be good for small change sets since it is both faster and smaller.  Even for large saves avsc was similar encoding/decoding time and significantly smaller files, so it's probably worth it.

Running compression with snappy appears to only be worth it at larger sizes.  The library with the least compressed size difference was avsc.  With compression though even JSON is close enough to avsc to probably not be worth it.  Using JSON we are taking 7.4 + 3.1 = 10.5ms to serialize and with avsc we are taking 7.5 + 2.1 = 9.6ms to serialize and the size difference is only 927k to 889k.  

For small entity updates, avsc without compression appears to be the smallest/fastest.

## Raw results for large save file

| Library  | Encoded Size | Compressed Size | Encode Time | Decode Time | Compress Time |
| ------------- | ------------- | ------------- | ------------- | ------------- | ------------- |
| JSON  | 2,018,016     | 927,543 | 6.4ms (6ms - 7ms std dev 0.7ms)     | 7.1ms (6ms - 11ms std dev 0.7ms)  | 3.1ms (2ms - 4ms std dev 0.4ms)
| avsc  | 1,180,059     | 889,386 | 7.5ms (7ms - 21ms std dev 0.8ms)    | 7.0ms (6ms - 18ms std dev 0.9ms)  | 2.1ms (1ms - 3ms std dev 0.4ms)
| cbor-x | 1,646,763    | 910,722 | 5.7ms (5ms - 18ms std dev 0.8ms)    | 7.1ms (5ms - 19ms std dev 1.2ms)  | 2.3ms (2ms - 3ms std dev 0.6ms)
| js-binary | 1,340,066 | 820,972 | 22.6ms (20ms - 214ms std dev 2.0ms) | 11.2ms (9ms - 23ms std dev 1.3ms) | 2.3ms (2ms - 3ms std dev 0.6ms)


## Percent results for large save file (lower is better)
| Libary | Encoded Size | Compressed Size | Encode Time | Decode Time | Compress Time |
| ------------- | ------------- | ------------- | ------------- | ------------- | ------------- |
| JSON      | 100% | 100% | 100% | 100% | 100%
| avsc      | 58%  | 96%  | 117% | 99%  | 68%
| cbor-x    | 82%  | 98%  | 89%  | 100% | 74%
| js-binary | 66%  | 88%  | 353% | 157% | 74%


## Raw results for single entity update

| Library  | Encoded Size | Compressed Size  | Encode Time | Decode Time | Compress Time |
| ------------- | ------------- | ------------- | ------------- | ------------- | ------------- |
| JSON      | 92 | 95 | 0.54ns (0.5ns - 1ns std dev 0.22ns)   | 0.50ns (0.4ns - 0.8ns std dev 0.10ns) | 1.37ns (1.1ns - 5.7ns std dev 0.42ns)
| avsc      | 59 | 61 | 0.37ns (0.3ns - 1.2ns std dev 0.23ns) | 0.26ns (0.2ns - 0.8ns std dev 0.23ns) | 1.34ns (1.1ns - 10.5ns std dev 0.45ns)
| cbor-x    | 77 | 80 | 0.42ns (0.3ns - 0.9ns std dev 0.20ns) | 0.56ns (0.5ns - 1.2ns std dev 0.24ns) | 1.47ns (1.1ns - 20.9ns std dev 0.63ns)
| js-binary | 67 | 70 | 1.40ns (1.3ns - 1.7ns std dev 0.18ns) | 0.45ns (0.4ns - 0.8ns std dev 0.23ns) | 1.35ns (1.2ns - 2.9ns std dev 0.31ns)


## Percent results for single entity update (lower is better)
| Libary | Encoded Size | Compressed Size  | Encode Time | Decode Time | Compress Time |
| ------------- | ------------- | ------------- | ------------- | ------------- | ------------- |
| JSON      | 100% | 100% | 100% | 100% | 100%
| avsc      | 64%  | 64% | 68%  | 52%   | 98%
| cbor-x    | 84%  | 84% | 78%  | 112%  | 108%
| js-binary | 73%  | 74% | 259% | 90%   | 99%


## TODO: Add tables for x/y entity update array results
json updates size: 410 chars
json updates compressed: 358 chars
json updates average encode: 2.38ns (2.3ns - 2.6ns std dev 0.21ns)
json updates average decode: 2.25ns (2.2ns - 2.5ns std dev 0.23ns)
json updates average compress: 1.80ns (1.6ns - 6ns std dev 0.40ns)

avsc updates size: 318 chars
avsc updates compressed: 323 chars
avsc updates average encode: 2.39ns (2.3ns - 3.9ns std dev 0.24ns)
avsc updates average decode: 1.10ns (1ns - 2ns std dev 0.19ns)
avsc updates average compress: 1.49ns (1.2ns - 11.1ns std dev 0.46ns)

cbor-x updates size: 377 chars
cbor-x updates compressed: 356 chars
cbor-x updates average encode: 1.31ns (1.2ns - 2.3ns std dev 0.18ns)
cbor-x updates average decode: 1.27ns (1.2ns - 2.4ns std dev 0.26ns)
cbor-x updates average compress: 1.80ns (1.5ns - 21.2ns std dev 0.63ns)

js-binary updates size: 346 chars
js-binary updates compressed: 340 chars
js-binary updates average encode: 5.12ns (4.7ns - 30.2ns std dev 0.72ns)
js-binary updates average decode: 1.22ns (1.2ns - 2.3ns std dev 0.19ns)
js-binary updates average compress: 1.63ns (1.4ns - 2.2ns std dev 0.30ns)