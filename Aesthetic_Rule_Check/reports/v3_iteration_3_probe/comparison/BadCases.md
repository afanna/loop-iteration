# Bad Cases

- threshold_abs_error: 8.0
- high_bucket: >= 75.0
- low_bucket: < 60.0

| sample | type | rule | teacher | error | rule_bucket | teacher_bucket | rank_delta |
| --- | --- | ---: | ---: | ---: | --- | --- | ---: |
| meeting | large_error | 74.66 | 57.44 | 17.22 | mid | low | -4 |
| sleep | large_error | 66.85 | 78.88 | -12.03 | mid | high | 6 |
| earbuds | large_error | 48.17 | 37.75 | 10.42 | low | low | 0 |
| care | large_error | 66.04 | 57.06 | 8.98 | mid | low | 0 |
