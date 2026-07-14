# Bad Cases

- threshold_abs_error: 8.0
- high_bucket: >= 75.0
- low_bucket: < 60.0

| sample | type | rule | teacher | error | rule_bucket | teacher_bucket | rank_delta |
| --- | --- | ---: | ---: | ---: | --- | --- | ---: |
| meeting | large_error | 71.34 | 57.44 | 13.90 | mid | low | -3 |
| earbuds | large_error | 48.81 | 37.75 | 11.06 | low | low | 0 |
| sleep | large_error | 69.52 | 78.88 | -9.36 | mid | high | 6 |
| focus | large_error | 76.00 | 84.06 | -8.06 | high | high | 0 |
