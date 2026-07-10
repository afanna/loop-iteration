# Arkts - Language Basics

**Pages:** 42

---

## 2. Lexical Elements¶

**URL:** https://yoyocat.github.io/ArkTSSpec/2_lexical.html#line-separators

**Contents:**
- 2. Lexical Elements¶
- 2.1. Use of Unicode Characters¶
- 2.2. Lexical Input Elements¶
- 2.3. White Spaces¶
- 2.4. Line Separators¶
- 2.5. Tokens¶
- 2.6. Identifiers¶
- 2.7. Keywords¶
- 2.8. Operators and Punctuators¶
- 2.9. Literals¶

This chapter discusses the lexical structure of the ArkTS programming language and the analytical conventions.

The ArkTS programming language uses characters of the Unicode Character set [1] as its terminal symbols. It represents text in sequences of 16-bit code units using the Unicode UTF-16 encoding.

The term Unicode code point is used in this specification only where such representation is relevant to refer the reader to Unicode Character set and UTF-16 encoding. Where such representation is irrelevant to the discussion, the generic term character is used.

The language has lexical input elements of the following types:

White spaces are lexical input elements that separate tokens from one another. Whitespaces never occur within a token. White spaces include the following:

Horizontal tabulation (U+0009),

Vertical tabulation (U+000B),

No-break space (U+00A0), and

Zero-width no-break space (U+FEFF).

White spaces improve source code readability and help avoiding ambiguities. White spaces are ignored by the syntactic grammar, but can occur within a comment.

Line separators are lexical input elements that divide sequences of Unicode input characters into lines. Line separators include the following:

Newline character (U+000A or ASCII <LF>),

Carriage return character (U+000D or ASCII <CR>),

Line separator character (U+2028 or ASCII <LS>), and

Paragraph separator character (U+2029 or ASCII <PS>).

Line separators separate tokens from one another and improve source code readability. Any sequence of line separators is considered a single separator.

Tokens form the vocabulary of the language. There are four classes of tokens:

Operators and Punctuators, and

Token is the only lexical input element that can act as a terminal symbol of the syntactic grammar. In the process of tokenization, the next token is always the longest sequence of characters that form a valid token. Tokens are separated by white spaces (see White Spaces). Without white spaces, tokens merge into a single token. White spaces are ignored by the syntactic grammar.

Line separators are often treated as white spaces, except where line separators have special meanings. See Semicolons for more details.

An identifier is a sequence of one or more valid Unicode characters. The Unicode grammar of identifiers is based on character properties specified by the Unicode Standard.

The first character in an identifier must be ‘$’, ‘_’, or any Unicode code point with the Unicode property ‘ID_Star

*[Content truncated]*

**Examples:**

Example 1 (unknown):
```unknown
Identifier:
  IdentifierStart IdentifierPart \*
  ;

IdentifierStart:
  UnicodeIDStart
  | '$'
  | '_'
  | '\\' EscapeSequence
  ;

IdentifierPart:
  UnicodeIDContinue
  | '$'
  | <ZWNJ>
  | <ZWJ>
  | '\\' EscapeSequence
  ;
```

Example 2 (unknown):
```unknown
Literal:
  IntegerLiteral
  | FloatLiteral
  | BigIntLiteral
  | BooleanLiteral
  | StringLiteral
  | TemplateLiteral
  | NullLiteral
  | UndefinedLiteral
  | CharLiteral
  ;
```

Example 3 (unknown):
```unknown
IntegerLiteral:
  DecimalIntegerLiteral
  | HexIntegerLiteral
  | OctalIntegerLiteral
  | BinaryIntegerLiteral
  ;

DecimalIntegerLiteral:
  '0'
  | [1-9] ('_'? [0-9])*
  ;

HexIntegerLiteral:
  '0' [xX]  ( HexDigit
  | HexDigit (HexDigit | '_')* HexDigit
  )
  ;

HexDigit:
  [0-9a-fA-F]
  ;

OctalIntegerLiteral:
  '0' [oO] ( [0-7] | [0-7] [0-7_]* [0-7] )
  ;

BinaryIntegerLiteral:
  '0' [bB] ( [01] | [01] [01_]* [01] )
  ;
```

Example 4 (unknown):
```unknown
1 153 // decimal literal
2 1_153 // decimal literal
3 0xBAD3 // hex literal
4 0xBAD_3 // hex literal
5 0o777 // octal literal
6 0b101 // binary literal
```

---

## 2. Lexical Elements¶

**URL:** https://yoyocat.github.io/ArkTSSpec/2_lexical.html#keywords

**Contents:**
- 2. Lexical Elements¶
- 2.1. Use of Unicode Characters¶
- 2.2. Lexical Input Elements¶
- 2.3. White Spaces¶
- 2.4. Line Separators¶
- 2.5. Tokens¶
- 2.6. Identifiers¶
- 2.7. Keywords¶
- 2.8. Operators and Punctuators¶
- 2.9. Literals¶

This chapter discusses the lexical structure of the ArkTS programming language and the analytical conventions.

The ArkTS programming language uses characters of the Unicode Character set [1] as its terminal symbols. It represents text in sequences of 16-bit code units using the Unicode UTF-16 encoding.

The term Unicode code point is used in this specification only where such representation is relevant to refer the reader to Unicode Character set and UTF-16 encoding. Where such representation is irrelevant to the discussion, the generic term character is used.

The language has lexical input elements of the following types:

White spaces are lexical input elements that separate tokens from one another. Whitespaces never occur within a token. White spaces include the following:

Horizontal tabulation (U+0009),

Vertical tabulation (U+000B),

No-break space (U+00A0), and

Zero-width no-break space (U+FEFF).

White spaces improve source code readability and help avoiding ambiguities. White spaces are ignored by the syntactic grammar, but can occur within a comment.

Line separators are lexical input elements that divide sequences of Unicode input characters into lines. Line separators include the following:

Newline character (U+000A or ASCII <LF>),

Carriage return character (U+000D or ASCII <CR>),

Line separator character (U+2028 or ASCII <LS>), and

Paragraph separator character (U+2029 or ASCII <PS>).

Line separators separate tokens from one another and improve source code readability. Any sequence of line separators is considered a single separator.

Tokens form the vocabulary of the language. There are four classes of tokens:

Operators and Punctuators, and

Token is the only lexical input element that can act as a terminal symbol of the syntactic grammar. In the process of tokenization, the next token is always the longest sequence of characters that form a valid token. Tokens are separated by white spaces (see White Spaces). Without white spaces, tokens merge into a single token. White spaces are ignored by the syntactic grammar.

Line separators are often treated as white spaces, except where line separators have special meanings. See Semicolons for more details.

An identifier is a sequence of one or more valid Unicode characters. The Unicode grammar of identifiers is based on character properties specified by the Unicode Standard.

The first character in an identifier must be ‘$’, ‘_’, or any Unicode code point with the Unicode property ‘ID_Star

*[Content truncated]*

**Examples:**

Example 1 (unknown):
```unknown
Identifier:
  IdentifierStart IdentifierPart \*
  ;

IdentifierStart:
  UnicodeIDStart
  | '$'
  | '_'
  | '\\' EscapeSequence
  ;

IdentifierPart:
  UnicodeIDContinue
  | '$'
  | <ZWNJ>
  | <ZWJ>
  | '\\' EscapeSequence
  ;
```

Example 2 (unknown):
```unknown
Literal:
  IntegerLiteral
  | FloatLiteral
  | BigIntLiteral
  | BooleanLiteral
  | StringLiteral
  | TemplateLiteral
  | NullLiteral
  | UndefinedLiteral
  | CharLiteral
  ;
```

Example 3 (unknown):
```unknown
IntegerLiteral:
  DecimalIntegerLiteral
  | HexIntegerLiteral
  | OctalIntegerLiteral
  | BinaryIntegerLiteral
  ;

DecimalIntegerLiteral:
  '0'
  | [1-9] ('_'? [0-9])*
  ;

HexIntegerLiteral:
  '0' [xX]  ( HexDigit
  | HexDigit (HexDigit | '_')* HexDigit
  )
  ;

HexDigit:
  [0-9a-fA-F]
  ;

OctalIntegerLiteral:
  '0' [oO] ( [0-7] | [0-7] [0-7_]* [0-7] )
  ;

BinaryIntegerLiteral:
  '0' [bB] ( [01] | [01] [01_]* [01] )
  ;
```

Example 4 (unknown):
```unknown
1 153 // decimal literal
2 1_153 // decimal literal
3 0xBAD3 // hex literal
4 0xBAD_3 // hex literal
5 0o777 // octal literal
6 0b101 // binary literal
```

---

## 2. Lexical Elements¶

**URL:** https://yoyocat.github.io/ArkTSSpec/2_lexical.html#literals

**Contents:**
- 2. Lexical Elements¶
- 2.1. Use of Unicode Characters¶
- 2.2. Lexical Input Elements¶
- 2.3. White Spaces¶
- 2.4. Line Separators¶
- 2.5. Tokens¶
- 2.6. Identifiers¶
- 2.7. Keywords¶
- 2.8. Operators and Punctuators¶
- 2.9. Literals¶

This chapter discusses the lexical structure of the ArkTS programming language and the analytical conventions.

The ArkTS programming language uses characters of the Unicode Character set [1] as its terminal symbols. It represents text in sequences of 16-bit code units using the Unicode UTF-16 encoding.

The term Unicode code point is used in this specification only where such representation is relevant to refer the reader to Unicode Character set and UTF-16 encoding. Where such representation is irrelevant to the discussion, the generic term character is used.

The language has lexical input elements of the following types:

White spaces are lexical input elements that separate tokens from one another. Whitespaces never occur within a token. White spaces include the following:

Horizontal tabulation (U+0009),

Vertical tabulation (U+000B),

No-break space (U+00A0), and

Zero-width no-break space (U+FEFF).

White spaces improve source code readability and help avoiding ambiguities. White spaces are ignored by the syntactic grammar, but can occur within a comment.

Line separators are lexical input elements that divide sequences of Unicode input characters into lines. Line separators include the following:

Newline character (U+000A or ASCII <LF>),

Carriage return character (U+000D or ASCII <CR>),

Line separator character (U+2028 or ASCII <LS>), and

Paragraph separator character (U+2029 or ASCII <PS>).

Line separators separate tokens from one another and improve source code readability. Any sequence of line separators is considered a single separator.

Tokens form the vocabulary of the language. There are four classes of tokens:

Operators and Punctuators, and

Token is the only lexical input element that can act as a terminal symbol of the syntactic grammar. In the process of tokenization, the next token is always the longest sequence of characters that form a valid token. Tokens are separated by white spaces (see White Spaces). Without white spaces, tokens merge into a single token. White spaces are ignored by the syntactic grammar.

Line separators are often treated as white spaces, except where line separators have special meanings. See Semicolons for more details.

An identifier is a sequence of one or more valid Unicode characters. The Unicode grammar of identifiers is based on character properties specified by the Unicode Standard.

The first character in an identifier must be ‘$’, ‘_’, or any Unicode code point with the Unicode property ‘ID_Star

*[Content truncated]*

**Examples:**

Example 1 (unknown):
```unknown
Identifier:
  IdentifierStart IdentifierPart \*
  ;

IdentifierStart:
  UnicodeIDStart
  | '$'
  | '_'
  | '\\' EscapeSequence
  ;

IdentifierPart:
  UnicodeIDContinue
  | '$'
  | <ZWNJ>
  | <ZWJ>
  | '\\' EscapeSequence
  ;
```

Example 2 (unknown):
```unknown
Literal:
  IntegerLiteral
  | FloatLiteral
  | BigIntLiteral
  | BooleanLiteral
  | StringLiteral
  | TemplateLiteral
  | NullLiteral
  | UndefinedLiteral
  | CharLiteral
  ;
```

Example 3 (unknown):
```unknown
IntegerLiteral:
  DecimalIntegerLiteral
  | HexIntegerLiteral
  | OctalIntegerLiteral
  | BinaryIntegerLiteral
  ;

DecimalIntegerLiteral:
  '0'
  | [1-9] ('_'? [0-9])*
  ;

HexIntegerLiteral:
  '0' [xX]  ( HexDigit
  | HexDigit (HexDigit | '_')* HexDigit
  )
  ;

HexDigit:
  [0-9a-fA-F]
  ;

OctalIntegerLiteral:
  '0' [oO] ( [0-7] | [0-7] [0-7_]* [0-7] )
  ;

BinaryIntegerLiteral:
  '0' [bB] ( [01] | [01] [01_]* [01] )
  ;
```

Example 4 (unknown):
```unknown
1 153 // decimal literal
2 1_153 // decimal literal
3 0xBAD3 // hex literal
4 0xBAD_3 // hex literal
5 0o777 // octal literal
6 0b101 // binary literal
```

---

## 2. Lexical Elements¶

**URL:** https://yoyocat.github.io/ArkTSSpec/2_lexical.html#boolean-literals

**Contents:**
- 2. Lexical Elements¶
- 2.1. Use of Unicode Characters¶
- 2.2. Lexical Input Elements¶
- 2.3. White Spaces¶
- 2.4. Line Separators¶
- 2.5. Tokens¶
- 2.6. Identifiers¶
- 2.7. Keywords¶
- 2.8. Operators and Punctuators¶
- 2.9. Literals¶

This chapter discusses the lexical structure of the ArkTS programming language and the analytical conventions.

The ArkTS programming language uses characters of the Unicode Character set [1] as its terminal symbols. It represents text in sequences of 16-bit code units using the Unicode UTF-16 encoding.

The term Unicode code point is used in this specification only where such representation is relevant to refer the reader to Unicode Character set and UTF-16 encoding. Where such representation is irrelevant to the discussion, the generic term character is used.

The language has lexical input elements of the following types:

White spaces are lexical input elements that separate tokens from one another. Whitespaces never occur within a token. White spaces include the following:

Horizontal tabulation (U+0009),

Vertical tabulation (U+000B),

No-break space (U+00A0), and

Zero-width no-break space (U+FEFF).

White spaces improve source code readability and help avoiding ambiguities. White spaces are ignored by the syntactic grammar, but can occur within a comment.

Line separators are lexical input elements that divide sequences of Unicode input characters into lines. Line separators include the following:

Newline character (U+000A or ASCII <LF>),

Carriage return character (U+000D or ASCII <CR>),

Line separator character (U+2028 or ASCII <LS>), and

Paragraph separator character (U+2029 or ASCII <PS>).

Line separators separate tokens from one another and improve source code readability. Any sequence of line separators is considered a single separator.

Tokens form the vocabulary of the language. There are four classes of tokens:

Operators and Punctuators, and

Token is the only lexical input element that can act as a terminal symbol of the syntactic grammar. In the process of tokenization, the next token is always the longest sequence of characters that form a valid token. Tokens are separated by white spaces (see White Spaces). Without white spaces, tokens merge into a single token. White spaces are ignored by the syntactic grammar.

Line separators are often treated as white spaces, except where line separators have special meanings. See Semicolons for more details.

An identifier is a sequence of one or more valid Unicode characters. The Unicode grammar of identifiers is based on character properties specified by the Unicode Standard.

The first character in an identifier must be ‘$’, ‘_’, or any Unicode code point with the Unicode property ‘ID_Star

*[Content truncated]*

**Examples:**

Example 1 (unknown):
```unknown
Identifier:
  IdentifierStart IdentifierPart \*
  ;

IdentifierStart:
  UnicodeIDStart
  | '$'
  | '_'
  | '\\' EscapeSequence
  ;

IdentifierPart:
  UnicodeIDContinue
  | '$'
  | <ZWNJ>
  | <ZWJ>
  | '\\' EscapeSequence
  ;
```

Example 2 (unknown):
```unknown
Literal:
  IntegerLiteral
  | FloatLiteral
  | BigIntLiteral
  | BooleanLiteral
  | StringLiteral
  | TemplateLiteral
  | NullLiteral
  | UndefinedLiteral
  | CharLiteral
  ;
```

Example 3 (unknown):
```unknown
IntegerLiteral:
  DecimalIntegerLiteral
  | HexIntegerLiteral
  | OctalIntegerLiteral
  | BinaryIntegerLiteral
  ;

DecimalIntegerLiteral:
  '0'
  | [1-9] ('_'? [0-9])*
  ;

HexIntegerLiteral:
  '0' [xX]  ( HexDigit
  | HexDigit (HexDigit | '_')* HexDigit
  )
  ;

HexDigit:
  [0-9a-fA-F]
  ;

OctalIntegerLiteral:
  '0' [oO] ( [0-7] | [0-7] [0-7_]* [0-7] )
  ;

BinaryIntegerLiteral:
  '0' [bB] ( [01] | [01] [01_]* [01] )
  ;
```

Example 4 (unknown):
```unknown
1 153 // decimal literal
2 1_153 // decimal literal
3 0xBAD3 // hex literal
4 0xBAD_3 // hex literal
5 0o777 // octal literal
6 0b101 // binary literal
```

---

## 2. Lexical Elements¶

**URL:** https://yoyocat.github.io/ArkTSSpec/2_lexical.html#null-literal

**Contents:**
- 2. Lexical Elements¶
- 2.1. Use of Unicode Characters¶
- 2.2. Lexical Input Elements¶
- 2.3. White Spaces¶
- 2.4. Line Separators¶
- 2.5. Tokens¶
- 2.6. Identifiers¶
- 2.7. Keywords¶
- 2.8. Operators and Punctuators¶
- 2.9. Literals¶

This chapter discusses the lexical structure of the ArkTS programming language and the analytical conventions.

The ArkTS programming language uses characters of the Unicode Character set [1] as its terminal symbols. It represents text in sequences of 16-bit code units using the Unicode UTF-16 encoding.

The term Unicode code point is used in this specification only where such representation is relevant to refer the reader to Unicode Character set and UTF-16 encoding. Where such representation is irrelevant to the discussion, the generic term character is used.

The language has lexical input elements of the following types:

White spaces are lexical input elements that separate tokens from one another. Whitespaces never occur within a token. White spaces include the following:

Horizontal tabulation (U+0009),

Vertical tabulation (U+000B),

No-break space (U+00A0), and

Zero-width no-break space (U+FEFF).

White spaces improve source code readability and help avoiding ambiguities. White spaces are ignored by the syntactic grammar, but can occur within a comment.

Line separators are lexical input elements that divide sequences of Unicode input characters into lines. Line separators include the following:

Newline character (U+000A or ASCII <LF>),

Carriage return character (U+000D or ASCII <CR>),

Line separator character (U+2028 or ASCII <LS>), and

Paragraph separator character (U+2029 or ASCII <PS>).

Line separators separate tokens from one another and improve source code readability. Any sequence of line separators is considered a single separator.

Tokens form the vocabulary of the language. There are four classes of tokens:

Operators and Punctuators, and

Token is the only lexical input element that can act as a terminal symbol of the syntactic grammar. In the process of tokenization, the next token is always the longest sequence of characters that form a valid token. Tokens are separated by white spaces (see White Spaces). Without white spaces, tokens merge into a single token. White spaces are ignored by the syntactic grammar.

Line separators are often treated as white spaces, except where line separators have special meanings. See Semicolons for more details.

An identifier is a sequence of one or more valid Unicode characters. The Unicode grammar of identifiers is based on character properties specified by the Unicode Standard.

The first character in an identifier must be ‘$’, ‘_’, or any Unicode code point with the Unicode property ‘ID_Star

*[Content truncated]*

**Examples:**

Example 1 (unknown):
```unknown
Identifier:
  IdentifierStart IdentifierPart \*
  ;

IdentifierStart:
  UnicodeIDStart
  | '$'
  | '_'
  | '\\' EscapeSequence
  ;

IdentifierPart:
  UnicodeIDContinue
  | '$'
  | <ZWNJ>
  | <ZWJ>
  | '\\' EscapeSequence
  ;
```

Example 2 (unknown):
```unknown
Literal:
  IntegerLiteral
  | FloatLiteral
  | BigIntLiteral
  | BooleanLiteral
  | StringLiteral
  | TemplateLiteral
  | NullLiteral
  | UndefinedLiteral
  | CharLiteral
  ;
```

Example 3 (unknown):
```unknown
IntegerLiteral:
  DecimalIntegerLiteral
  | HexIntegerLiteral
  | OctalIntegerLiteral
  | BinaryIntegerLiteral
  ;

DecimalIntegerLiteral:
  '0'
  | [1-9] ('_'? [0-9])*
  ;

HexIntegerLiteral:
  '0' [xX]  ( HexDigit
  | HexDigit (HexDigit | '_')* HexDigit
  )
  ;

HexDigit:
  [0-9a-fA-F]
  ;

OctalIntegerLiteral:
  '0' [oO] ( [0-7] | [0-7] [0-7_]* [0-7] )
  ;

BinaryIntegerLiteral:
  '0' [bB] ( [01] | [01] [01_]* [01] )
  ;
```

Example 4 (unknown):
```unknown
1 153 // decimal literal
2 1_153 // decimal literal
3 0xBAD3 // hex literal
4 0xBAD_3 // hex literal
5 0o777 // octal literal
6 0b101 // binary literal
```

---

## 2. Lexical Elements¶

**URL:** https://yoyocat.github.io/ArkTSSpec/2_lexical.html#white-spaces

**Contents:**
- 2. Lexical Elements¶
- 2.1. Use of Unicode Characters¶
- 2.2. Lexical Input Elements¶
- 2.3. White Spaces¶
- 2.4. Line Separators¶
- 2.5. Tokens¶
- 2.6. Identifiers¶
- 2.7. Keywords¶
- 2.8. Operators and Punctuators¶
- 2.9. Literals¶

This chapter discusses the lexical structure of the ArkTS programming language and the analytical conventions.

The ArkTS programming language uses characters of the Unicode Character set [1] as its terminal symbols. It represents text in sequences of 16-bit code units using the Unicode UTF-16 encoding.

The term Unicode code point is used in this specification only where such representation is relevant to refer the reader to Unicode Character set and UTF-16 encoding. Where such representation is irrelevant to the discussion, the generic term character is used.

The language has lexical input elements of the following types:

White spaces are lexical input elements that separate tokens from one another. Whitespaces never occur within a token. White spaces include the following:

Horizontal tabulation (U+0009),

Vertical tabulation (U+000B),

No-break space (U+00A0), and

Zero-width no-break space (U+FEFF).

White spaces improve source code readability and help avoiding ambiguities. White spaces are ignored by the syntactic grammar, but can occur within a comment.

Line separators are lexical input elements that divide sequences of Unicode input characters into lines. Line separators include the following:

Newline character (U+000A or ASCII <LF>),

Carriage return character (U+000D or ASCII <CR>),

Line separator character (U+2028 or ASCII <LS>), and

Paragraph separator character (U+2029 or ASCII <PS>).

Line separators separate tokens from one another and improve source code readability. Any sequence of line separators is considered a single separator.

Tokens form the vocabulary of the language. There are four classes of tokens:

Operators and Punctuators, and

Token is the only lexical input element that can act as a terminal symbol of the syntactic grammar. In the process of tokenization, the next token is always the longest sequence of characters that form a valid token. Tokens are separated by white spaces (see White Spaces). Without white spaces, tokens merge into a single token. White spaces are ignored by the syntactic grammar.

Line separators are often treated as white spaces, except where line separators have special meanings. See Semicolons for more details.

An identifier is a sequence of one or more valid Unicode characters. The Unicode grammar of identifiers is based on character properties specified by the Unicode Standard.

The first character in an identifier must be ‘$’, ‘_’, or any Unicode code point with the Unicode property ‘ID_Star

*[Content truncated]*

**Examples:**

Example 1 (unknown):
```unknown
Identifier:
  IdentifierStart IdentifierPart \*
  ;

IdentifierStart:
  UnicodeIDStart
  | '$'
  | '_'
  | '\\' EscapeSequence
  ;

IdentifierPart:
  UnicodeIDContinue
  | '$'
  | <ZWNJ>
  | <ZWJ>
  | '\\' EscapeSequence
  ;
```

Example 2 (unknown):
```unknown
Literal:
  IntegerLiteral
  | FloatLiteral
  | BigIntLiteral
  | BooleanLiteral
  | StringLiteral
  | TemplateLiteral
  | NullLiteral
  | UndefinedLiteral
  | CharLiteral
  ;
```

Example 3 (unknown):
```unknown
IntegerLiteral:
  DecimalIntegerLiteral
  | HexIntegerLiteral
  | OctalIntegerLiteral
  | BinaryIntegerLiteral
  ;

DecimalIntegerLiteral:
  '0'
  | [1-9] ('_'? [0-9])*
  ;

HexIntegerLiteral:
  '0' [xX]  ( HexDigit
  | HexDigit (HexDigit | '_')* HexDigit
  )
  ;

HexDigit:
  [0-9a-fA-F]
  ;

OctalIntegerLiteral:
  '0' [oO] ( [0-7] | [0-7] [0-7_]* [0-7] )
  ;

BinaryIntegerLiteral:
  '0' [bB] ( [01] | [01] [01_]* [01] )
  ;
```

Example 4 (unknown):
```unknown
1 153 // decimal literal
2 1_153 // decimal literal
3 0xBAD3 // hex literal
4 0xBAD_3 // hex literal
5 0o777 // octal literal
6 0b101 // binary literal
```

---

## 2. Lexical Elements¶

**URL:** https://yoyocat.github.io/ArkTSSpec/2_lexical.html#tokens

**Contents:**
- 2. Lexical Elements¶
- 2.1. Use of Unicode Characters¶
- 2.2. Lexical Input Elements¶
- 2.3. White Spaces¶
- 2.4. Line Separators¶
- 2.5. Tokens¶
- 2.6. Identifiers¶
- 2.7. Keywords¶
- 2.8. Operators and Punctuators¶
- 2.9. Literals¶

This chapter discusses the lexical structure of the ArkTS programming language and the analytical conventions.

The ArkTS programming language uses characters of the Unicode Character set [1] as its terminal symbols. It represents text in sequences of 16-bit code units using the Unicode UTF-16 encoding.

The term Unicode code point is used in this specification only where such representation is relevant to refer the reader to Unicode Character set and UTF-16 encoding. Where such representation is irrelevant to the discussion, the generic term character is used.

The language has lexical input elements of the following types:

White spaces are lexical input elements that separate tokens from one another. Whitespaces never occur within a token. White spaces include the following:

Horizontal tabulation (U+0009),

Vertical tabulation (U+000B),

No-break space (U+00A0), and

Zero-width no-break space (U+FEFF).

White spaces improve source code readability and help avoiding ambiguities. White spaces are ignored by the syntactic grammar, but can occur within a comment.

Line separators are lexical input elements that divide sequences of Unicode input characters into lines. Line separators include the following:

Newline character (U+000A or ASCII <LF>),

Carriage return character (U+000D or ASCII <CR>),

Line separator character (U+2028 or ASCII <LS>), and

Paragraph separator character (U+2029 or ASCII <PS>).

Line separators separate tokens from one another and improve source code readability. Any sequence of line separators is considered a single separator.

Tokens form the vocabulary of the language. There are four classes of tokens:

Operators and Punctuators, and

Token is the only lexical input element that can act as a terminal symbol of the syntactic grammar. In the process of tokenization, the next token is always the longest sequence of characters that form a valid token. Tokens are separated by white spaces (see White Spaces). Without white spaces, tokens merge into a single token. White spaces are ignored by the syntactic grammar.

Line separators are often treated as white spaces, except where line separators have special meanings. See Semicolons for more details.

An identifier is a sequence of one or more valid Unicode characters. The Unicode grammar of identifiers is based on character properties specified by the Unicode Standard.

The first character in an identifier must be ‘$’, ‘_’, or any Unicode code point with the Unicode property ‘ID_Star

*[Content truncated]*

**Examples:**

Example 1 (unknown):
```unknown
Identifier:
  IdentifierStart IdentifierPart \*
  ;

IdentifierStart:
  UnicodeIDStart
  | '$'
  | '_'
  | '\\' EscapeSequence
  ;

IdentifierPart:
  UnicodeIDContinue
  | '$'
  | <ZWNJ>
  | <ZWJ>
  | '\\' EscapeSequence
  ;
```

Example 2 (unknown):
```unknown
Literal:
  IntegerLiteral
  | FloatLiteral
  | BigIntLiteral
  | BooleanLiteral
  | StringLiteral
  | TemplateLiteral
  | NullLiteral
  | UndefinedLiteral
  | CharLiteral
  ;
```

Example 3 (unknown):
```unknown
IntegerLiteral:
  DecimalIntegerLiteral
  | HexIntegerLiteral
  | OctalIntegerLiteral
  | BinaryIntegerLiteral
  ;

DecimalIntegerLiteral:
  '0'
  | [1-9] ('_'? [0-9])*
  ;

HexIntegerLiteral:
  '0' [xX]  ( HexDigit
  | HexDigit (HexDigit | '_')* HexDigit
  )
  ;

HexDigit:
  [0-9a-fA-F]
  ;

OctalIntegerLiteral:
  '0' [oO] ( [0-7] | [0-7] [0-7_]* [0-7] )
  ;

BinaryIntegerLiteral:
  '0' [bB] ( [01] | [01] [01_]* [01] )
  ;
```

Example 4 (unknown):
```unknown
1 153 // decimal literal
2 1_153 // decimal literal
3 0xBAD3 // hex literal
4 0xBAD_3 // hex literal
5 0o777 // octal literal
6 0b101 // binary literal
```

---

## 2. Lexical Elements¶

**URL:** https://yoyocat.github.io/ArkTSSpec/2_lexical.html

**Contents:**
- 2. Lexical Elements¶
- 2.1. Use of Unicode Characters¶
- 2.2. Lexical Input Elements¶
- 2.3. White Spaces¶
- 2.4. Line Separators¶
- 2.5. Tokens¶
- 2.6. Identifiers¶
- 2.7. Keywords¶
- 2.8. Operators and Punctuators¶
- 2.9. Literals¶

This chapter discusses the lexical structure of the ArkTS programming language and the analytical conventions.

The ArkTS programming language uses characters of the Unicode Character set [1] as its terminal symbols. It represents text in sequences of 16-bit code units using the Unicode UTF-16 encoding.

The term Unicode code point is used in this specification only where such representation is relevant to refer the reader to Unicode Character set and UTF-16 encoding. Where such representation is irrelevant to the discussion, the generic term character is used.

The language has lexical input elements of the following types:

White spaces are lexical input elements that separate tokens from one another. Whitespaces never occur within a token. White spaces include the following:

Horizontal tabulation (U+0009),

Vertical tabulation (U+000B),

No-break space (U+00A0), and

Zero-width no-break space (U+FEFF).

White spaces improve source code readability and help avoiding ambiguities. White spaces are ignored by the syntactic grammar, but can occur within a comment.

Line separators are lexical input elements that divide sequences of Unicode input characters into lines. Line separators include the following:

Newline character (U+000A or ASCII <LF>),

Carriage return character (U+000D or ASCII <CR>),

Line separator character (U+2028 or ASCII <LS>), and

Paragraph separator character (U+2029 or ASCII <PS>).

Line separators separate tokens from one another and improve source code readability. Any sequence of line separators is considered a single separator.

Tokens form the vocabulary of the language. There are four classes of tokens:

Operators and Punctuators, and

Token is the only lexical input element that can act as a terminal symbol of the syntactic grammar. In the process of tokenization, the next token is always the longest sequence of characters that form a valid token. Tokens are separated by white spaces (see White Spaces). Without white spaces, tokens merge into a single token. White spaces are ignored by the syntactic grammar.

Line separators are often treated as white spaces, except where line separators have special meanings. See Semicolons for more details.

An identifier is a sequence of one or more valid Unicode characters. The Unicode grammar of identifiers is based on character properties specified by the Unicode Standard.

The first character in an identifier must be ‘$’, ‘_’, or any Unicode code point with the Unicode property ‘ID_Star

*[Content truncated]*

**Examples:**

Example 1 (unknown):
```unknown
Identifier:
  IdentifierStart IdentifierPart \*
  ;

IdentifierStart:
  UnicodeIDStart
  | '$'
  | '_'
  | '\\' EscapeSequence
  ;

IdentifierPart:
  UnicodeIDContinue
  | '$'
  | <ZWNJ>
  | <ZWJ>
  | '\\' EscapeSequence
  ;
```

Example 2 (unknown):
```unknown
Literal:
  IntegerLiteral
  | FloatLiteral
  | BigIntLiteral
  | BooleanLiteral
  | StringLiteral
  | TemplateLiteral
  | NullLiteral
  | UndefinedLiteral
  | CharLiteral
  ;
```

Example 3 (unknown):
```unknown
IntegerLiteral:
  DecimalIntegerLiteral
  | HexIntegerLiteral
  | OctalIntegerLiteral
  | BinaryIntegerLiteral
  ;

DecimalIntegerLiteral:
  '0'
  | [1-9] ('_'? [0-9])*
  ;

HexIntegerLiteral:
  '0' [xX]  ( HexDigit
  | HexDigit (HexDigit | '_')* HexDigit
  )
  ;

HexDigit:
  [0-9a-fA-F]
  ;

OctalIntegerLiteral:
  '0' [oO] ( [0-7] | [0-7] [0-7_]* [0-7] )
  ;

BinaryIntegerLiteral:
  '0' [bB] ( [01] | [01] [01_]* [01] )
  ;
```

Example 4 (unknown):
```unknown
1 153 // decimal literal
2 1_153 // decimal literal
3 0xBAD3 // hex literal
4 0xBAD_3 // hex literal
5 0o777 // octal literal
6 0b101 // binary literal
```

---

## 2. Lexical Elements¶

**URL:** https://yoyocat.github.io/ArkTSSpec/2_lexical.html#bigint-literals

**Contents:**
- 2. Lexical Elements¶
- 2.1. Use of Unicode Characters¶
- 2.2. Lexical Input Elements¶
- 2.3. White Spaces¶
- 2.4. Line Separators¶
- 2.5. Tokens¶
- 2.6. Identifiers¶
- 2.7. Keywords¶
- 2.8. Operators and Punctuators¶
- 2.9. Literals¶

This chapter discusses the lexical structure of the ArkTS programming language and the analytical conventions.

The ArkTS programming language uses characters of the Unicode Character set [1] as its terminal symbols. It represents text in sequences of 16-bit code units using the Unicode UTF-16 encoding.

The term Unicode code point is used in this specification only where such representation is relevant to refer the reader to Unicode Character set and UTF-16 encoding. Where such representation is irrelevant to the discussion, the generic term character is used.

The language has lexical input elements of the following types:

White spaces are lexical input elements that separate tokens from one another. Whitespaces never occur within a token. White spaces include the following:

Horizontal tabulation (U+0009),

Vertical tabulation (U+000B),

No-break space (U+00A0), and

Zero-width no-break space (U+FEFF).

White spaces improve source code readability and help avoiding ambiguities. White spaces are ignored by the syntactic grammar, but can occur within a comment.

Line separators are lexical input elements that divide sequences of Unicode input characters into lines. Line separators include the following:

Newline character (U+000A or ASCII <LF>),

Carriage return character (U+000D or ASCII <CR>),

Line separator character (U+2028 or ASCII <LS>), and

Paragraph separator character (U+2029 or ASCII <PS>).

Line separators separate tokens from one another and improve source code readability. Any sequence of line separators is considered a single separator.

Tokens form the vocabulary of the language. There are four classes of tokens:

Operators and Punctuators, and

Token is the only lexical input element that can act as a terminal symbol of the syntactic grammar. In the process of tokenization, the next token is always the longest sequence of characters that form a valid token. Tokens are separated by white spaces (see White Spaces). Without white spaces, tokens merge into a single token. White spaces are ignored by the syntactic grammar.

Line separators are often treated as white spaces, except where line separators have special meanings. See Semicolons for more details.

An identifier is a sequence of one or more valid Unicode characters. The Unicode grammar of identifiers is based on character properties specified by the Unicode Standard.

The first character in an identifier must be ‘$’, ‘_’, or any Unicode code point with the Unicode property ‘ID_Star

*[Content truncated]*

**Examples:**

Example 1 (unknown):
```unknown
Identifier:
  IdentifierStart IdentifierPart \*
  ;

IdentifierStart:
  UnicodeIDStart
  | '$'
  | '_'
  | '\\' EscapeSequence
  ;

IdentifierPart:
  UnicodeIDContinue
  | '$'
  | <ZWNJ>
  | <ZWJ>
  | '\\' EscapeSequence
  ;
```

Example 2 (unknown):
```unknown
Literal:
  IntegerLiteral
  | FloatLiteral
  | BigIntLiteral
  | BooleanLiteral
  | StringLiteral
  | TemplateLiteral
  | NullLiteral
  | UndefinedLiteral
  | CharLiteral
  ;
```

Example 3 (unknown):
```unknown
IntegerLiteral:
  DecimalIntegerLiteral
  | HexIntegerLiteral
  | OctalIntegerLiteral
  | BinaryIntegerLiteral
  ;

DecimalIntegerLiteral:
  '0'
  | [1-9] ('_'? [0-9])*
  ;

HexIntegerLiteral:
  '0' [xX]  ( HexDigit
  | HexDigit (HexDigit | '_')* HexDigit
  )
  ;

HexDigit:
  [0-9a-fA-F]
  ;

OctalIntegerLiteral:
  '0' [oO] ( [0-7] | [0-7] [0-7_]* [0-7] )
  ;

BinaryIntegerLiteral:
  '0' [bB] ( [01] | [01] [01_]* [01] )
  ;
```

Example 4 (unknown):
```unknown
1 153 // decimal literal
2 1_153 // decimal literal
3 0xBAD3 // hex literal
4 0xBAD_3 // hex literal
5 0o777 // octal literal
6 0b101 // binary literal
```

---

## 2. Lexical Elements¶

**URL:** https://yoyocat.github.io/ArkTSSpec/2_lexical.html#floating-point-literals

**Contents:**
- 2. Lexical Elements¶
- 2.1. Use of Unicode Characters¶
- 2.2. Lexical Input Elements¶
- 2.3. White Spaces¶
- 2.4. Line Separators¶
- 2.5. Tokens¶
- 2.6. Identifiers¶
- 2.7. Keywords¶
- 2.8. Operators and Punctuators¶
- 2.9. Literals¶

This chapter discusses the lexical structure of the ArkTS programming language and the analytical conventions.

The ArkTS programming language uses characters of the Unicode Character set [1] as its terminal symbols. It represents text in sequences of 16-bit code units using the Unicode UTF-16 encoding.

The term Unicode code point is used in this specification only where such representation is relevant to refer the reader to Unicode Character set and UTF-16 encoding. Where such representation is irrelevant to the discussion, the generic term character is used.

The language has lexical input elements of the following types:

White spaces are lexical input elements that separate tokens from one another. Whitespaces never occur within a token. White spaces include the following:

Horizontal tabulation (U+0009),

Vertical tabulation (U+000B),

No-break space (U+00A0), and

Zero-width no-break space (U+FEFF).

White spaces improve source code readability and help avoiding ambiguities. White spaces are ignored by the syntactic grammar, but can occur within a comment.

Line separators are lexical input elements that divide sequences of Unicode input characters into lines. Line separators include the following:

Newline character (U+000A or ASCII <LF>),

Carriage return character (U+000D or ASCII <CR>),

Line separator character (U+2028 or ASCII <LS>), and

Paragraph separator character (U+2029 or ASCII <PS>).

Line separators separate tokens from one another and improve source code readability. Any sequence of line separators is considered a single separator.

Tokens form the vocabulary of the language. There are four classes of tokens:

Operators and Punctuators, and

Token is the only lexical input element that can act as a terminal symbol of the syntactic grammar. In the process of tokenization, the next token is always the longest sequence of characters that form a valid token. Tokens are separated by white spaces (see White Spaces). Without white spaces, tokens merge into a single token. White spaces are ignored by the syntactic grammar.

Line separators are often treated as white spaces, except where line separators have special meanings. See Semicolons for more details.

An identifier is a sequence of one or more valid Unicode characters. The Unicode grammar of identifiers is based on character properties specified by the Unicode Standard.

The first character in an identifier must be ‘$’, ‘_’, or any Unicode code point with the Unicode property ‘ID_Star

*[Content truncated]*

**Examples:**

Example 1 (unknown):
```unknown
Identifier:
  IdentifierStart IdentifierPart \*
  ;

IdentifierStart:
  UnicodeIDStart
  | '$'
  | '_'
  | '\\' EscapeSequence
  ;

IdentifierPart:
  UnicodeIDContinue
  | '$'
  | <ZWNJ>
  | <ZWJ>
  | '\\' EscapeSequence
  ;
```

Example 2 (unknown):
```unknown
Literal:
  IntegerLiteral
  | FloatLiteral
  | BigIntLiteral
  | BooleanLiteral
  | StringLiteral
  | TemplateLiteral
  | NullLiteral
  | UndefinedLiteral
  | CharLiteral
  ;
```

Example 3 (unknown):
```unknown
IntegerLiteral:
  DecimalIntegerLiteral
  | HexIntegerLiteral
  | OctalIntegerLiteral
  | BinaryIntegerLiteral
  ;

DecimalIntegerLiteral:
  '0'
  | [1-9] ('_'? [0-9])*
  ;

HexIntegerLiteral:
  '0' [xX]  ( HexDigit
  | HexDigit (HexDigit | '_')* HexDigit
  )
  ;

HexDigit:
  [0-9a-fA-F]
  ;

OctalIntegerLiteral:
  '0' [oO] ( [0-7] | [0-7] [0-7_]* [0-7] )
  ;

BinaryIntegerLiteral:
  '0' [bB] ( [01] | [01] [01_]* [01] )
  ;
```

Example 4 (unknown):
```unknown
1 153 // decimal literal
2 1_153 // decimal literal
3 0xBAD3 // hex literal
4 0xBAD_3 // hex literal
5 0o777 // octal literal
6 0b101 // binary literal
```

---

## 2. Lexical Elements¶

**URL:** https://yoyocat.github.io/ArkTSSpec/2_lexical.html#lexical-input-elements

**Contents:**
- 2. Lexical Elements¶
- 2.1. Use of Unicode Characters¶
- 2.2. Lexical Input Elements¶
- 2.3. White Spaces¶
- 2.4. Line Separators¶
- 2.5. Tokens¶
- 2.6. Identifiers¶
- 2.7. Keywords¶
- 2.8. Operators and Punctuators¶
- 2.9. Literals¶

This chapter discusses the lexical structure of the ArkTS programming language and the analytical conventions.

The ArkTS programming language uses characters of the Unicode Character set [1] as its terminal symbols. It represents text in sequences of 16-bit code units using the Unicode UTF-16 encoding.

The term Unicode code point is used in this specification only where such representation is relevant to refer the reader to Unicode Character set and UTF-16 encoding. Where such representation is irrelevant to the discussion, the generic term character is used.

The language has lexical input elements of the following types:

White spaces are lexical input elements that separate tokens from one another. Whitespaces never occur within a token. White spaces include the following:

Horizontal tabulation (U+0009),

Vertical tabulation (U+000B),

No-break space (U+00A0), and

Zero-width no-break space (U+FEFF).

White spaces improve source code readability and help avoiding ambiguities. White spaces are ignored by the syntactic grammar, but can occur within a comment.

Line separators are lexical input elements that divide sequences of Unicode input characters into lines. Line separators include the following:

Newline character (U+000A or ASCII <LF>),

Carriage return character (U+000D or ASCII <CR>),

Line separator character (U+2028 or ASCII <LS>), and

Paragraph separator character (U+2029 or ASCII <PS>).

Line separators separate tokens from one another and improve source code readability. Any sequence of line separators is considered a single separator.

Tokens form the vocabulary of the language. There are four classes of tokens:

Operators and Punctuators, and

Token is the only lexical input element that can act as a terminal symbol of the syntactic grammar. In the process of tokenization, the next token is always the longest sequence of characters that form a valid token. Tokens are separated by white spaces (see White Spaces). Without white spaces, tokens merge into a single token. White spaces are ignored by the syntactic grammar.

Line separators are often treated as white spaces, except where line separators have special meanings. See Semicolons for more details.

An identifier is a sequence of one or more valid Unicode characters. The Unicode grammar of identifiers is based on character properties specified by the Unicode Standard.

The first character in an identifier must be ‘$’, ‘_’, or any Unicode code point with the Unicode property ‘ID_Star

*[Content truncated]*

**Examples:**

Example 1 (unknown):
```unknown
Identifier:
  IdentifierStart IdentifierPart \*
  ;

IdentifierStart:
  UnicodeIDStart
  | '$'
  | '_'
  | '\\' EscapeSequence
  ;

IdentifierPart:
  UnicodeIDContinue
  | '$'
  | <ZWNJ>
  | <ZWJ>
  | '\\' EscapeSequence
  ;
```

Example 2 (unknown):
```unknown
Literal:
  IntegerLiteral
  | FloatLiteral
  | BigIntLiteral
  | BooleanLiteral
  | StringLiteral
  | TemplateLiteral
  | NullLiteral
  | UndefinedLiteral
  | CharLiteral
  ;
```

Example 3 (unknown):
```unknown
IntegerLiteral:
  DecimalIntegerLiteral
  | HexIntegerLiteral
  | OctalIntegerLiteral
  | BinaryIntegerLiteral
  ;

DecimalIntegerLiteral:
  '0'
  | [1-9] ('_'? [0-9])*
  ;

HexIntegerLiteral:
  '0' [xX]  ( HexDigit
  | HexDigit (HexDigit | '_')* HexDigit
  )
  ;

HexDigit:
  [0-9a-fA-F]
  ;

OctalIntegerLiteral:
  '0' [oO] ( [0-7] | [0-7] [0-7_]* [0-7] )
  ;

BinaryIntegerLiteral:
  '0' [bB] ( [01] | [01] [01_]* [01] )
  ;
```

Example 4 (unknown):
```unknown
1 153 // decimal literal
2 1_153 // decimal literal
3 0xBAD3 // hex literal
4 0xBAD_3 // hex literal
5 0o777 // octal literal
6 0b101 // binary literal
```

---

## 2. Lexical Elements¶

**URL:** https://yoyocat.github.io/ArkTSSpec/2_lexical.html#template-literals

**Contents:**
- 2. Lexical Elements¶
- 2.1. Use of Unicode Characters¶
- 2.2. Lexical Input Elements¶
- 2.3. White Spaces¶
- 2.4. Line Separators¶
- 2.5. Tokens¶
- 2.6. Identifiers¶
- 2.7. Keywords¶
- 2.8. Operators and Punctuators¶
- 2.9. Literals¶

This chapter discusses the lexical structure of the ArkTS programming language and the analytical conventions.

The ArkTS programming language uses characters of the Unicode Character set [1] as its terminal symbols. It represents text in sequences of 16-bit code units using the Unicode UTF-16 encoding.

The term Unicode code point is used in this specification only where such representation is relevant to refer the reader to Unicode Character set and UTF-16 encoding. Where such representation is irrelevant to the discussion, the generic term character is used.

The language has lexical input elements of the following types:

White spaces are lexical input elements that separate tokens from one another. Whitespaces never occur within a token. White spaces include the following:

Horizontal tabulation (U+0009),

Vertical tabulation (U+000B),

No-break space (U+00A0), and

Zero-width no-break space (U+FEFF).

White spaces improve source code readability and help avoiding ambiguities. White spaces are ignored by the syntactic grammar, but can occur within a comment.

Line separators are lexical input elements that divide sequences of Unicode input characters into lines. Line separators include the following:

Newline character (U+000A or ASCII <LF>),

Carriage return character (U+000D or ASCII <CR>),

Line separator character (U+2028 or ASCII <LS>), and

Paragraph separator character (U+2029 or ASCII <PS>).

Line separators separate tokens from one another and improve source code readability. Any sequence of line separators is considered a single separator.

Tokens form the vocabulary of the language. There are four classes of tokens:

Operators and Punctuators, and

Token is the only lexical input element that can act as a terminal symbol of the syntactic grammar. In the process of tokenization, the next token is always the longest sequence of characters that form a valid token. Tokens are separated by white spaces (see White Spaces). Without white spaces, tokens merge into a single token. White spaces are ignored by the syntactic grammar.

Line separators are often treated as white spaces, except where line separators have special meanings. See Semicolons for more details.

An identifier is a sequence of one or more valid Unicode characters. The Unicode grammar of identifiers is based on character properties specified by the Unicode Standard.

The first character in an identifier must be ‘$’, ‘_’, or any Unicode code point with the Unicode property ‘ID_Star

*[Content truncated]*

**Examples:**

Example 1 (unknown):
```unknown
Identifier:
  IdentifierStart IdentifierPart \*
  ;

IdentifierStart:
  UnicodeIDStart
  | '$'
  | '_'
  | '\\' EscapeSequence
  ;

IdentifierPart:
  UnicodeIDContinue
  | '$'
  | <ZWNJ>
  | <ZWJ>
  | '\\' EscapeSequence
  ;
```

Example 2 (unknown):
```unknown
Literal:
  IntegerLiteral
  | FloatLiteral
  | BigIntLiteral
  | BooleanLiteral
  | StringLiteral
  | TemplateLiteral
  | NullLiteral
  | UndefinedLiteral
  | CharLiteral
  ;
```

Example 3 (unknown):
```unknown
IntegerLiteral:
  DecimalIntegerLiteral
  | HexIntegerLiteral
  | OctalIntegerLiteral
  | BinaryIntegerLiteral
  ;

DecimalIntegerLiteral:
  '0'
  | [1-9] ('_'? [0-9])*
  ;

HexIntegerLiteral:
  '0' [xX]  ( HexDigit
  | HexDigit (HexDigit | '_')* HexDigit
  )
  ;

HexDigit:
  [0-9a-fA-F]
  ;

OctalIntegerLiteral:
  '0' [oO] ( [0-7] | [0-7] [0-7_]* [0-7] )
  ;

BinaryIntegerLiteral:
  '0' [bB] ( [01] | [01] [01_]* [01] )
  ;
```

Example 4 (unknown):
```unknown
1 153 // decimal literal
2 1_153 // decimal literal
3 0xBAD3 // hex literal
4 0xBAD_3 // hex literal
5 0o777 // octal literal
6 0b101 // binary literal
```

---

## 2. Lexical Elements¶

**URL:** https://yoyocat.github.io/ArkTSSpec/2_lexical.html#integer-literals

**Contents:**
- 2. Lexical Elements¶
- 2.1. Use of Unicode Characters¶
- 2.2. Lexical Input Elements¶
- 2.3. White Spaces¶
- 2.4. Line Separators¶
- 2.5. Tokens¶
- 2.6. Identifiers¶
- 2.7. Keywords¶
- 2.8. Operators and Punctuators¶
- 2.9. Literals¶

This chapter discusses the lexical structure of the ArkTS programming language and the analytical conventions.

The ArkTS programming language uses characters of the Unicode Character set [1] as its terminal symbols. It represents text in sequences of 16-bit code units using the Unicode UTF-16 encoding.

The term Unicode code point is used in this specification only where such representation is relevant to refer the reader to Unicode Character set and UTF-16 encoding. Where such representation is irrelevant to the discussion, the generic term character is used.

The language has lexical input elements of the following types:

White spaces are lexical input elements that separate tokens from one another. Whitespaces never occur within a token. White spaces include the following:

Horizontal tabulation (U+0009),

Vertical tabulation (U+000B),

No-break space (U+00A0), and

Zero-width no-break space (U+FEFF).

White spaces improve source code readability and help avoiding ambiguities. White spaces are ignored by the syntactic grammar, but can occur within a comment.

Line separators are lexical input elements that divide sequences of Unicode input characters into lines. Line separators include the following:

Newline character (U+000A or ASCII <LF>),

Carriage return character (U+000D or ASCII <CR>),

Line separator character (U+2028 or ASCII <LS>), and

Paragraph separator character (U+2029 or ASCII <PS>).

Line separators separate tokens from one another and improve source code readability. Any sequence of line separators is considered a single separator.

Tokens form the vocabulary of the language. There are four classes of tokens:

Operators and Punctuators, and

Token is the only lexical input element that can act as a terminal symbol of the syntactic grammar. In the process of tokenization, the next token is always the longest sequence of characters that form a valid token. Tokens are separated by white spaces (see White Spaces). Without white spaces, tokens merge into a single token. White spaces are ignored by the syntactic grammar.

Line separators are often treated as white spaces, except where line separators have special meanings. See Semicolons for more details.

An identifier is a sequence of one or more valid Unicode characters. The Unicode grammar of identifiers is based on character properties specified by the Unicode Standard.

The first character in an identifier must be ‘$’, ‘_’, or any Unicode code point with the Unicode property ‘ID_Star

*[Content truncated]*

**Examples:**

Example 1 (unknown):
```unknown
Identifier:
  IdentifierStart IdentifierPart \*
  ;

IdentifierStart:
  UnicodeIDStart
  | '$'
  | '_'
  | '\\' EscapeSequence
  ;

IdentifierPart:
  UnicodeIDContinue
  | '$'
  | <ZWNJ>
  | <ZWJ>
  | '\\' EscapeSequence
  ;
```

Example 2 (unknown):
```unknown
Literal:
  IntegerLiteral
  | FloatLiteral
  | BigIntLiteral
  | BooleanLiteral
  | StringLiteral
  | TemplateLiteral
  | NullLiteral
  | UndefinedLiteral
  | CharLiteral
  ;
```

Example 3 (unknown):
```unknown
IntegerLiteral:
  DecimalIntegerLiteral
  | HexIntegerLiteral
  | OctalIntegerLiteral
  | BinaryIntegerLiteral
  ;

DecimalIntegerLiteral:
  '0'
  | [1-9] ('_'? [0-9])*
  ;

HexIntegerLiteral:
  '0' [xX]  ( HexDigit
  | HexDigit (HexDigit | '_')* HexDigit
  )
  ;

HexDigit:
  [0-9a-fA-F]
  ;

OctalIntegerLiteral:
  '0' [oO] ( [0-7] | [0-7] [0-7_]* [0-7] )
  ;

BinaryIntegerLiteral:
  '0' [bB] ( [01] | [01] [01_]* [01] )
  ;
```

Example 4 (unknown):
```unknown
1 153 // decimal literal
2 1_153 // decimal literal
3 0xBAD3 // hex literal
4 0xBAD_3 // hex literal
5 0o777 // octal literal
6 0b101 // binary literal
```

---

## 2. Lexical Elements¶

**URL:** https://yoyocat.github.io/ArkTSSpec/2_lexical.html#comments

**Contents:**
- 2. Lexical Elements¶
- 2.1. Use of Unicode Characters¶
- 2.2. Lexical Input Elements¶
- 2.3. White Spaces¶
- 2.4. Line Separators¶
- 2.5. Tokens¶
- 2.6. Identifiers¶
- 2.7. Keywords¶
- 2.8. Operators and Punctuators¶
- 2.9. Literals¶

This chapter discusses the lexical structure of the ArkTS programming language and the analytical conventions.

The ArkTS programming language uses characters of the Unicode Character set [1] as its terminal symbols. It represents text in sequences of 16-bit code units using the Unicode UTF-16 encoding.

The term Unicode code point is used in this specification only where such representation is relevant to refer the reader to Unicode Character set and UTF-16 encoding. Where such representation is irrelevant to the discussion, the generic term character is used.

The language has lexical input elements of the following types:

White spaces are lexical input elements that separate tokens from one another. Whitespaces never occur within a token. White spaces include the following:

Horizontal tabulation (U+0009),

Vertical tabulation (U+000B),

No-break space (U+00A0), and

Zero-width no-break space (U+FEFF).

White spaces improve source code readability and help avoiding ambiguities. White spaces are ignored by the syntactic grammar, but can occur within a comment.

Line separators are lexical input elements that divide sequences of Unicode input characters into lines. Line separators include the following:

Newline character (U+000A or ASCII <LF>),

Carriage return character (U+000D or ASCII <CR>),

Line separator character (U+2028 or ASCII <LS>), and

Paragraph separator character (U+2029 or ASCII <PS>).

Line separators separate tokens from one another and improve source code readability. Any sequence of line separators is considered a single separator.

Tokens form the vocabulary of the language. There are four classes of tokens:

Operators and Punctuators, and

Token is the only lexical input element that can act as a terminal symbol of the syntactic grammar. In the process of tokenization, the next token is always the longest sequence of characters that form a valid token. Tokens are separated by white spaces (see White Spaces). Without white spaces, tokens merge into a single token. White spaces are ignored by the syntactic grammar.

Line separators are often treated as white spaces, except where line separators have special meanings. See Semicolons for more details.

An identifier is a sequence of one or more valid Unicode characters. The Unicode grammar of identifiers is based on character properties specified by the Unicode Standard.

The first character in an identifier must be ‘$’, ‘_’, or any Unicode code point with the Unicode property ‘ID_Star

*[Content truncated]*

**Examples:**

Example 1 (unknown):
```unknown
Identifier:
  IdentifierStart IdentifierPart \*
  ;

IdentifierStart:
  UnicodeIDStart
  | '$'
  | '_'
  | '\\' EscapeSequence
  ;

IdentifierPart:
  UnicodeIDContinue
  | '$'
  | <ZWNJ>
  | <ZWJ>
  | '\\' EscapeSequence
  ;
```

Example 2 (unknown):
```unknown
Literal:
  IntegerLiteral
  | FloatLiteral
  | BigIntLiteral
  | BooleanLiteral
  | StringLiteral
  | TemplateLiteral
  | NullLiteral
  | UndefinedLiteral
  | CharLiteral
  ;
```

Example 3 (unknown):
```unknown
IntegerLiteral:
  DecimalIntegerLiteral
  | HexIntegerLiteral
  | OctalIntegerLiteral
  | BinaryIntegerLiteral
  ;

DecimalIntegerLiteral:
  '0'
  | [1-9] ('_'? [0-9])*
  ;

HexIntegerLiteral:
  '0' [xX]  ( HexDigit
  | HexDigit (HexDigit | '_')* HexDigit
  )
  ;

HexDigit:
  [0-9a-fA-F]
  ;

OctalIntegerLiteral:
  '0' [oO] ( [0-7] | [0-7] [0-7_]* [0-7] )
  ;

BinaryIntegerLiteral:
  '0' [bB] ( [01] | [01] [01_]* [01] )
  ;
```

Example 4 (unknown):
```unknown
1 153 // decimal literal
2 1_153 // decimal literal
3 0xBAD3 // hex literal
4 0xBAD_3 // hex literal
5 0o777 // octal literal
6 0b101 // binary literal
```

---

## 2. Lexical Elements¶

**URL:** https://yoyocat.github.io/ArkTSSpec/2_lexical.html#identifiers

**Contents:**
- 2. Lexical Elements¶
- 2.1. Use of Unicode Characters¶
- 2.2. Lexical Input Elements¶
- 2.3. White Spaces¶
- 2.4. Line Separators¶
- 2.5. Tokens¶
- 2.6. Identifiers¶
- 2.7. Keywords¶
- 2.8. Operators and Punctuators¶
- 2.9. Literals¶

This chapter discusses the lexical structure of the ArkTS programming language and the analytical conventions.

The ArkTS programming language uses characters of the Unicode Character set [1] as its terminal symbols. It represents text in sequences of 16-bit code units using the Unicode UTF-16 encoding.

The term Unicode code point is used in this specification only where such representation is relevant to refer the reader to Unicode Character set and UTF-16 encoding. Where such representation is irrelevant to the discussion, the generic term character is used.

The language has lexical input elements of the following types:

White spaces are lexical input elements that separate tokens from one another. Whitespaces never occur within a token. White spaces include the following:

Horizontal tabulation (U+0009),

Vertical tabulation (U+000B),

No-break space (U+00A0), and

Zero-width no-break space (U+FEFF).

White spaces improve source code readability and help avoiding ambiguities. White spaces are ignored by the syntactic grammar, but can occur within a comment.

Line separators are lexical input elements that divide sequences of Unicode input characters into lines. Line separators include the following:

Newline character (U+000A or ASCII <LF>),

Carriage return character (U+000D or ASCII <CR>),

Line separator character (U+2028 or ASCII <LS>), and

Paragraph separator character (U+2029 or ASCII <PS>).

Line separators separate tokens from one another and improve source code readability. Any sequence of line separators is considered a single separator.

Tokens form the vocabulary of the language. There are four classes of tokens:

Operators and Punctuators, and

Token is the only lexical input element that can act as a terminal symbol of the syntactic grammar. In the process of tokenization, the next token is always the longest sequence of characters that form a valid token. Tokens are separated by white spaces (see White Spaces). Without white spaces, tokens merge into a single token. White spaces are ignored by the syntactic grammar.

Line separators are often treated as white spaces, except where line separators have special meanings. See Semicolons for more details.

An identifier is a sequence of one or more valid Unicode characters. The Unicode grammar of identifiers is based on character properties specified by the Unicode Standard.

The first character in an identifier must be ‘$’, ‘_’, or any Unicode code point with the Unicode property ‘ID_Star

*[Content truncated]*

**Examples:**

Example 1 (unknown):
```unknown
Identifier:
  IdentifierStart IdentifierPart \*
  ;

IdentifierStart:
  UnicodeIDStart
  | '$'
  | '_'
  | '\\' EscapeSequence
  ;

IdentifierPart:
  UnicodeIDContinue
  | '$'
  | <ZWNJ>
  | <ZWJ>
  | '\\' EscapeSequence
  ;
```

Example 2 (unknown):
```unknown
Literal:
  IntegerLiteral
  | FloatLiteral
  | BigIntLiteral
  | BooleanLiteral
  | StringLiteral
  | TemplateLiteral
  | NullLiteral
  | UndefinedLiteral
  | CharLiteral
  ;
```

Example 3 (unknown):
```unknown
IntegerLiteral:
  DecimalIntegerLiteral
  | HexIntegerLiteral
  | OctalIntegerLiteral
  | BinaryIntegerLiteral
  ;

DecimalIntegerLiteral:
  '0'
  | [1-9] ('_'? [0-9])*
  ;

HexIntegerLiteral:
  '0' [xX]  ( HexDigit
  | HexDigit (HexDigit | '_')* HexDigit
  )
  ;

HexDigit:
  [0-9a-fA-F]
  ;

OctalIntegerLiteral:
  '0' [oO] ( [0-7] | [0-7] [0-7_]* [0-7] )
  ;

BinaryIntegerLiteral:
  '0' [bB] ( [01] | [01] [01_]* [01] )
  ;
```

Example 4 (unknown):
```unknown
1 153 // decimal literal
2 1_153 // decimal literal
3 0xBAD3 // hex literal
4 0xBAD_3 // hex literal
5 0o777 // octal literal
6 0b101 // binary literal
```

---

## 2. Lexical Elements¶

**URL:** https://yoyocat.github.io/ArkTSSpec/2_lexical.html#use-of-unicode-characters

**Contents:**
- 2. Lexical Elements¶
- 2.1. Use of Unicode Characters¶
- 2.2. Lexical Input Elements¶
- 2.3. White Spaces¶
- 2.4. Line Separators¶
- 2.5. Tokens¶
- 2.6. Identifiers¶
- 2.7. Keywords¶
- 2.8. Operators and Punctuators¶
- 2.9. Literals¶

This chapter discusses the lexical structure of the ArkTS programming language and the analytical conventions.

The ArkTS programming language uses characters of the Unicode Character set [1] as its terminal symbols. It represents text in sequences of 16-bit code units using the Unicode UTF-16 encoding.

The term Unicode code point is used in this specification only where such representation is relevant to refer the reader to Unicode Character set and UTF-16 encoding. Where such representation is irrelevant to the discussion, the generic term character is used.

The language has lexical input elements of the following types:

White spaces are lexical input elements that separate tokens from one another. Whitespaces never occur within a token. White spaces include the following:

Horizontal tabulation (U+0009),

Vertical tabulation (U+000B),

No-break space (U+00A0), and

Zero-width no-break space (U+FEFF).

White spaces improve source code readability and help avoiding ambiguities. White spaces are ignored by the syntactic grammar, but can occur within a comment.

Line separators are lexical input elements that divide sequences of Unicode input characters into lines. Line separators include the following:

Newline character (U+000A or ASCII <LF>),

Carriage return character (U+000D or ASCII <CR>),

Line separator character (U+2028 or ASCII <LS>), and

Paragraph separator character (U+2029 or ASCII <PS>).

Line separators separate tokens from one another and improve source code readability. Any sequence of line separators is considered a single separator.

Tokens form the vocabulary of the language. There are four classes of tokens:

Operators and Punctuators, and

Token is the only lexical input element that can act as a terminal symbol of the syntactic grammar. In the process of tokenization, the next token is always the longest sequence of characters that form a valid token. Tokens are separated by white spaces (see White Spaces). Without white spaces, tokens merge into a single token. White spaces are ignored by the syntactic grammar.

Line separators are often treated as white spaces, except where line separators have special meanings. See Semicolons for more details.

An identifier is a sequence of one or more valid Unicode characters. The Unicode grammar of identifiers is based on character properties specified by the Unicode Standard.

The first character in an identifier must be ‘$’, ‘_’, or any Unicode code point with the Unicode property ‘ID_Star

*[Content truncated]*

**Examples:**

Example 1 (unknown):
```unknown
Identifier:
  IdentifierStart IdentifierPart \*
  ;

IdentifierStart:
  UnicodeIDStart
  | '$'
  | '_'
  | '\\' EscapeSequence
  ;

IdentifierPart:
  UnicodeIDContinue
  | '$'
  | <ZWNJ>
  | <ZWJ>
  | '\\' EscapeSequence
  ;
```

Example 2 (unknown):
```unknown
Literal:
  IntegerLiteral
  | FloatLiteral
  | BigIntLiteral
  | BooleanLiteral
  | StringLiteral
  | TemplateLiteral
  | NullLiteral
  | UndefinedLiteral
  | CharLiteral
  ;
```

Example 3 (unknown):
```unknown
IntegerLiteral:
  DecimalIntegerLiteral
  | HexIntegerLiteral
  | OctalIntegerLiteral
  | BinaryIntegerLiteral
  ;

DecimalIntegerLiteral:
  '0'
  | [1-9] ('_'? [0-9])*
  ;

HexIntegerLiteral:
  '0' [xX]  ( HexDigit
  | HexDigit (HexDigit | '_')* HexDigit
  )
  ;

HexDigit:
  [0-9a-fA-F]
  ;

OctalIntegerLiteral:
  '0' [oO] ( [0-7] | [0-7] [0-7_]* [0-7] )
  ;

BinaryIntegerLiteral:
  '0' [bB] ( [01] | [01] [01_]* [01] )
  ;
```

Example 4 (unknown):
```unknown
1 153 // decimal literal
2 1_153 // decimal literal
3 0xBAD3 // hex literal
4 0xBAD_3 // hex literal
5 0o777 // octal literal
6 0b101 // binary literal
```

---

## 2. Lexical Elements¶

**URL:** https://yoyocat.github.io/ArkTSSpec/2_lexical.html#undefined-literal

**Contents:**
- 2. Lexical Elements¶
- 2.1. Use of Unicode Characters¶
- 2.2. Lexical Input Elements¶
- 2.3. White Spaces¶
- 2.4. Line Separators¶
- 2.5. Tokens¶
- 2.6. Identifiers¶
- 2.7. Keywords¶
- 2.8. Operators and Punctuators¶
- 2.9. Literals¶

This chapter discusses the lexical structure of the ArkTS programming language and the analytical conventions.

The ArkTS programming language uses characters of the Unicode Character set [1] as its terminal symbols. It represents text in sequences of 16-bit code units using the Unicode UTF-16 encoding.

The term Unicode code point is used in this specification only where such representation is relevant to refer the reader to Unicode Character set and UTF-16 encoding. Where such representation is irrelevant to the discussion, the generic term character is used.

The language has lexical input elements of the following types:

White spaces are lexical input elements that separate tokens from one another. Whitespaces never occur within a token. White spaces include the following:

Horizontal tabulation (U+0009),

Vertical tabulation (U+000B),

No-break space (U+00A0), and

Zero-width no-break space (U+FEFF).

White spaces improve source code readability and help avoiding ambiguities. White spaces are ignored by the syntactic grammar, but can occur within a comment.

Line separators are lexical input elements that divide sequences of Unicode input characters into lines. Line separators include the following:

Newline character (U+000A or ASCII <LF>),

Carriage return character (U+000D or ASCII <CR>),

Line separator character (U+2028 or ASCII <LS>), and

Paragraph separator character (U+2029 or ASCII <PS>).

Line separators separate tokens from one another and improve source code readability. Any sequence of line separators is considered a single separator.

Tokens form the vocabulary of the language. There are four classes of tokens:

Operators and Punctuators, and

Token is the only lexical input element that can act as a terminal symbol of the syntactic grammar. In the process of tokenization, the next token is always the longest sequence of characters that form a valid token. Tokens are separated by white spaces (see White Spaces). Without white spaces, tokens merge into a single token. White spaces are ignored by the syntactic grammar.

Line separators are often treated as white spaces, except where line separators have special meanings. See Semicolons for more details.

An identifier is a sequence of one or more valid Unicode characters. The Unicode grammar of identifiers is based on character properties specified by the Unicode Standard.

The first character in an identifier must be ‘$’, ‘_’, or any Unicode code point with the Unicode property ‘ID_Star

*[Content truncated]*

**Examples:**

Example 1 (unknown):
```unknown
Identifier:
  IdentifierStart IdentifierPart \*
  ;

IdentifierStart:
  UnicodeIDStart
  | '$'
  | '_'
  | '\\' EscapeSequence
  ;

IdentifierPart:
  UnicodeIDContinue
  | '$'
  | <ZWNJ>
  | <ZWJ>
  | '\\' EscapeSequence
  ;
```

Example 2 (unknown):
```unknown
Literal:
  IntegerLiteral
  | FloatLiteral
  | BigIntLiteral
  | BooleanLiteral
  | StringLiteral
  | TemplateLiteral
  | NullLiteral
  | UndefinedLiteral
  | CharLiteral
  ;
```

Example 3 (unknown):
```unknown
IntegerLiteral:
  DecimalIntegerLiteral
  | HexIntegerLiteral
  | OctalIntegerLiteral
  | BinaryIntegerLiteral
  ;

DecimalIntegerLiteral:
  '0'
  | [1-9] ('_'? [0-9])*
  ;

HexIntegerLiteral:
  '0' [xX]  ( HexDigit
  | HexDigit (HexDigit | '_')* HexDigit
  )
  ;

HexDigit:
  [0-9a-fA-F]
  ;

OctalIntegerLiteral:
  '0' [oO] ( [0-7] | [0-7] [0-7_]* [0-7] )
  ;

BinaryIntegerLiteral:
  '0' [bB] ( [01] | [01] [01_]* [01] )
  ;
```

Example 4 (unknown):
```unknown
1 153 // decimal literal
2 1_153 // decimal literal
3 0xBAD3 // hex literal
4 0xBAD_3 // hex literal
5 0o777 // octal literal
6 0b101 // binary literal
```

---

## 2. Lexical Elements¶

**URL:** https://yoyocat.github.io/ArkTSSpec/2_lexical.html#string-literals

**Contents:**
- 2. Lexical Elements¶
- 2.1. Use of Unicode Characters¶
- 2.2. Lexical Input Elements¶
- 2.3. White Spaces¶
- 2.4. Line Separators¶
- 2.5. Tokens¶
- 2.6. Identifiers¶
- 2.7. Keywords¶
- 2.8. Operators and Punctuators¶
- 2.9. Literals¶

This chapter discusses the lexical structure of the ArkTS programming language and the analytical conventions.

The ArkTS programming language uses characters of the Unicode Character set [1] as its terminal symbols. It represents text in sequences of 16-bit code units using the Unicode UTF-16 encoding.

The term Unicode code point is used in this specification only where such representation is relevant to refer the reader to Unicode Character set and UTF-16 encoding. Where such representation is irrelevant to the discussion, the generic term character is used.

The language has lexical input elements of the following types:

White spaces are lexical input elements that separate tokens from one another. Whitespaces never occur within a token. White spaces include the following:

Horizontal tabulation (U+0009),

Vertical tabulation (U+000B),

No-break space (U+00A0), and

Zero-width no-break space (U+FEFF).

White spaces improve source code readability and help avoiding ambiguities. White spaces are ignored by the syntactic grammar, but can occur within a comment.

Line separators are lexical input elements that divide sequences of Unicode input characters into lines. Line separators include the following:

Newline character (U+000A or ASCII <LF>),

Carriage return character (U+000D or ASCII <CR>),

Line separator character (U+2028 or ASCII <LS>), and

Paragraph separator character (U+2029 or ASCII <PS>).

Line separators separate tokens from one another and improve source code readability. Any sequence of line separators is considered a single separator.

Tokens form the vocabulary of the language. There are four classes of tokens:

Operators and Punctuators, and

Token is the only lexical input element that can act as a terminal symbol of the syntactic grammar. In the process of tokenization, the next token is always the longest sequence of characters that form a valid token. Tokens are separated by white spaces (see White Spaces). Without white spaces, tokens merge into a single token. White spaces are ignored by the syntactic grammar.

Line separators are often treated as white spaces, except where line separators have special meanings. See Semicolons for more details.

An identifier is a sequence of one or more valid Unicode characters. The Unicode grammar of identifiers is based on character properties specified by the Unicode Standard.

The first character in an identifier must be ‘$’, ‘_’, or any Unicode code point with the Unicode property ‘ID_Star

*[Content truncated]*

**Examples:**

Example 1 (unknown):
```unknown
Identifier:
  IdentifierStart IdentifierPart \*
  ;

IdentifierStart:
  UnicodeIDStart
  | '$'
  | '_'
  | '\\' EscapeSequence
  ;

IdentifierPart:
  UnicodeIDContinue
  | '$'
  | <ZWNJ>
  | <ZWJ>
  | '\\' EscapeSequence
  ;
```

Example 2 (unknown):
```unknown
Literal:
  IntegerLiteral
  | FloatLiteral
  | BigIntLiteral
  | BooleanLiteral
  | StringLiteral
  | TemplateLiteral
  | NullLiteral
  | UndefinedLiteral
  | CharLiteral
  ;
```

Example 3 (unknown):
```unknown
IntegerLiteral:
  DecimalIntegerLiteral
  | HexIntegerLiteral
  | OctalIntegerLiteral
  | BinaryIntegerLiteral
  ;

DecimalIntegerLiteral:
  '0'
  | [1-9] ('_'? [0-9])*
  ;

HexIntegerLiteral:
  '0' [xX]  ( HexDigit
  | HexDigit (HexDigit | '_')* HexDigit
  )
  ;

HexDigit:
  [0-9a-fA-F]
  ;

OctalIntegerLiteral:
  '0' [oO] ( [0-7] | [0-7] [0-7_]* [0-7] )
  ;

BinaryIntegerLiteral:
  '0' [bB] ( [01] | [01] [01_]* [01] )
  ;
```

Example 4 (unknown):
```unknown
1 153 // decimal literal
2 1_153 // decimal literal
3 0xBAD3 // hex literal
4 0xBAD_3 // hex literal
5 0o777 // octal literal
6 0b101 // binary literal
```

---

## 2. Lexical Elements¶

**URL:** https://yoyocat.github.io/ArkTSSpec/2_lexical.html#operators-and-punctuators

**Contents:**
- 2. Lexical Elements¶
- 2.1. Use of Unicode Characters¶
- 2.2. Lexical Input Elements¶
- 2.3. White Spaces¶
- 2.4. Line Separators¶
- 2.5. Tokens¶
- 2.6. Identifiers¶
- 2.7. Keywords¶
- 2.8. Operators and Punctuators¶
- 2.9. Literals¶

This chapter discusses the lexical structure of the ArkTS programming language and the analytical conventions.

The ArkTS programming language uses characters of the Unicode Character set [1] as its terminal symbols. It represents text in sequences of 16-bit code units using the Unicode UTF-16 encoding.

The term Unicode code point is used in this specification only where such representation is relevant to refer the reader to Unicode Character set and UTF-16 encoding. Where such representation is irrelevant to the discussion, the generic term character is used.

The language has lexical input elements of the following types:

White spaces are lexical input elements that separate tokens from one another. Whitespaces never occur within a token. White spaces include the following:

Horizontal tabulation (U+0009),

Vertical tabulation (U+000B),

No-break space (U+00A0), and

Zero-width no-break space (U+FEFF).

White spaces improve source code readability and help avoiding ambiguities. White spaces are ignored by the syntactic grammar, but can occur within a comment.

Line separators are lexical input elements that divide sequences of Unicode input characters into lines. Line separators include the following:

Newline character (U+000A or ASCII <LF>),

Carriage return character (U+000D or ASCII <CR>),

Line separator character (U+2028 or ASCII <LS>), and

Paragraph separator character (U+2029 or ASCII <PS>).

Line separators separate tokens from one another and improve source code readability. Any sequence of line separators is considered a single separator.

Tokens form the vocabulary of the language. There are four classes of tokens:

Operators and Punctuators, and

Token is the only lexical input element that can act as a terminal symbol of the syntactic grammar. In the process of tokenization, the next token is always the longest sequence of characters that form a valid token. Tokens are separated by white spaces (see White Spaces). Without white spaces, tokens merge into a single token. White spaces are ignored by the syntactic grammar.

Line separators are often treated as white spaces, except where line separators have special meanings. See Semicolons for more details.

An identifier is a sequence of one or more valid Unicode characters. The Unicode grammar of identifiers is based on character properties specified by the Unicode Standard.

The first character in an identifier must be ‘$’, ‘_’, or any Unicode code point with the Unicode property ‘ID_Star

*[Content truncated]*

**Examples:**

Example 1 (unknown):
```unknown
Identifier:
  IdentifierStart IdentifierPart \*
  ;

IdentifierStart:
  UnicodeIDStart
  | '$'
  | '_'
  | '\\' EscapeSequence
  ;

IdentifierPart:
  UnicodeIDContinue
  | '$'
  | <ZWNJ>
  | <ZWJ>
  | '\\' EscapeSequence
  ;
```

Example 2 (unknown):
```unknown
Literal:
  IntegerLiteral
  | FloatLiteral
  | BigIntLiteral
  | BooleanLiteral
  | StringLiteral
  | TemplateLiteral
  | NullLiteral
  | UndefinedLiteral
  | CharLiteral
  ;
```

Example 3 (unknown):
```unknown
IntegerLiteral:
  DecimalIntegerLiteral
  | HexIntegerLiteral
  | OctalIntegerLiteral
  | BinaryIntegerLiteral
  ;

DecimalIntegerLiteral:
  '0'
  | [1-9] ('_'? [0-9])*
  ;

HexIntegerLiteral:
  '0' [xX]  ( HexDigit
  | HexDigit (HexDigit | '_')* HexDigit
  )
  ;

HexDigit:
  [0-9a-fA-F]
  ;

OctalIntegerLiteral:
  '0' [oO] ( [0-7] | [0-7] [0-7_]* [0-7] )
  ;

BinaryIntegerLiteral:
  '0' [bB] ( [01] | [01] [01_]* [01] )
  ;
```

Example 4 (unknown):
```unknown
1 153 // decimal literal
2 1_153 // decimal literal
3 0xBAD3 // hex literal
4 0xBAD_3 // hex literal
5 0o777 // octal literal
6 0b101 // binary literal
```

---

## 2. Lexical Elements¶

**URL:** https://yoyocat.github.io/ArkTSSpec/2_lexical.html#semicolons

**Contents:**
- 2. Lexical Elements¶
- 2.1. Use of Unicode Characters¶
- 2.2. Lexical Input Elements¶
- 2.3. White Spaces¶
- 2.4. Line Separators¶
- 2.5. Tokens¶
- 2.6. Identifiers¶
- 2.7. Keywords¶
- 2.8. Operators and Punctuators¶
- 2.9. Literals¶

This chapter discusses the lexical structure of the ArkTS programming language and the analytical conventions.

The ArkTS programming language uses characters of the Unicode Character set [1] as its terminal symbols. It represents text in sequences of 16-bit code units using the Unicode UTF-16 encoding.

The term Unicode code point is used in this specification only where such representation is relevant to refer the reader to Unicode Character set and UTF-16 encoding. Where such representation is irrelevant to the discussion, the generic term character is used.

The language has lexical input elements of the following types:

White spaces are lexical input elements that separate tokens from one another. Whitespaces never occur within a token. White spaces include the following:

Horizontal tabulation (U+0009),

Vertical tabulation (U+000B),

No-break space (U+00A0), and

Zero-width no-break space (U+FEFF).

White spaces improve source code readability and help avoiding ambiguities. White spaces are ignored by the syntactic grammar, but can occur within a comment.

Line separators are lexical input elements that divide sequences of Unicode input characters into lines. Line separators include the following:

Newline character (U+000A or ASCII <LF>),

Carriage return character (U+000D or ASCII <CR>),

Line separator character (U+2028 or ASCII <LS>), and

Paragraph separator character (U+2029 or ASCII <PS>).

Line separators separate tokens from one another and improve source code readability. Any sequence of line separators is considered a single separator.

Tokens form the vocabulary of the language. There are four classes of tokens:

Operators and Punctuators, and

Token is the only lexical input element that can act as a terminal symbol of the syntactic grammar. In the process of tokenization, the next token is always the longest sequence of characters that form a valid token. Tokens are separated by white spaces (see White Spaces). Without white spaces, tokens merge into a single token. White spaces are ignored by the syntactic grammar.

Line separators are often treated as white spaces, except where line separators have special meanings. See Semicolons for more details.

An identifier is a sequence of one or more valid Unicode characters. The Unicode grammar of identifiers is based on character properties specified by the Unicode Standard.

The first character in an identifier must be ‘$’, ‘_’, or any Unicode code point with the Unicode property ‘ID_Star

*[Content truncated]*

**Examples:**

Example 1 (unknown):
```unknown
Identifier:
  IdentifierStart IdentifierPart \*
  ;

IdentifierStart:
  UnicodeIDStart
  | '$'
  | '_'
  | '\\' EscapeSequence
  ;

IdentifierPart:
  UnicodeIDContinue
  | '$'
  | <ZWNJ>
  | <ZWJ>
  | '\\' EscapeSequence
  ;
```

Example 2 (unknown):
```unknown
Literal:
  IntegerLiteral
  | FloatLiteral
  | BigIntLiteral
  | BooleanLiteral
  | StringLiteral
  | TemplateLiteral
  | NullLiteral
  | UndefinedLiteral
  | CharLiteral
  ;
```

Example 3 (unknown):
```unknown
IntegerLiteral:
  DecimalIntegerLiteral
  | HexIntegerLiteral
  | OctalIntegerLiteral
  | BinaryIntegerLiteral
  ;

DecimalIntegerLiteral:
  '0'
  | [1-9] ('_'? [0-9])*
  ;

HexIntegerLiteral:
  '0' [xX]  ( HexDigit
  | HexDigit (HexDigit | '_')* HexDigit
  )
  ;

HexDigit:
  [0-9a-fA-F]
  ;

OctalIntegerLiteral:
  '0' [oO] ( [0-7] | [0-7] [0-7_]* [0-7] )
  ;

BinaryIntegerLiteral:
  '0' [bB] ( [01] | [01] [01_]* [01] )
  ;
```

Example 4 (unknown):
```unknown
1 153 // decimal literal
2 1_153 // decimal literal
3 0xBAD3 // hex literal
4 0xBAD_3 // hex literal
5 0o777 // octal literal
6 0b101 // binary literal
```

---

## 4. Names, Declarations and Scopes¶

**URL:** https://yoyocat.github.io/ArkTSSpec/4_names.html#constant-declarations

**Contents:**
- 4. Names, Declarations and Scopes¶
- 4.1. Names¶
- 4.2. Declarations¶
- 4.3. Distinguishable Declarations¶
- 4.4. Scopes¶
- 4.5. Type Declarations¶
- 4.6. Type Alias Declaration¶
  - 4.6.1. Recursive Type Aliases¶
- 4.7. Variable and Constant Declarations¶
  - 4.7.1. Variable Declarations¶

This chapter introduces the following three mutually-related notions:

Each entity in an ArkTS program—a variable, a constant, a class, a type, a function, a method, etc.—is introduced via a declaration. An entity declaration assigns a name to the entity declared. The name is used to refer to the entity further in the program text.

Each declaration is valid (i.e., available and known) only within its scope. Scope is the region of the program text where the entity is declared and can be referred to by its simple (unqualified) name (see Scopes for more details).

A name refers to any declared entity.

Simple names consist of a single identifier. Qualified names consist of a sequence of identifiers with the ‘.’ tokens as separators:

In a qualified name N.x (where N is a simple name, and x is an identifier that can follow a sequence of identifiers separated with ‘.’ tokens), N can name the following:

The name of a compilation unit (see Compilation Units, Packages, and Modules) introduced as a result of import * as N (see Bind All with Qualified Access) with x to name the exported entity;

A class or interface type (see Classes, Interfaces) with x to name its static member;

A variable of a class or interface type with x to name its member.

A declaration introduces a named entity in an appropriate declaration scope (see Scopes).

Each declaration in the declaration scope must be distinguishable. A compile-time error occurs otherwise.

Declarations are distinguishable if:

They have different names.

They are distinguishable by signatures (see Declaration Distinguishable by Signatures).

The examples below are declarations distinguishable by names:

If a declaration is indistinguishable by name, then a compile-time error occurs:

The scope of a name is the region of program code within which the entity declared by that name can be referred to without having the name qualified. It means that a name is accessible in some context if it can be used in this context by its simple name.

The nature of scope usage depends on the kind of the name. A type name is used to declare variables or constants. A function name is used to call that function.

The scope of a name depends on the context the name is declared in:

A name declared on the package level (package level scope) is accessible throughout the entire package. The name can be accessed in other packages if exported.

Module level scope is applicable for separate modules only. A name declared on the module leve

*[Content truncated]*

**Examples:**

Example 1 (unknown):
```unknown
qualifiedName:
  Identifier ('.' Identifier )*
  ;
```

Example 2 (unknown):
```unknown
import * as N
```

Example 3 (javascript):
```javascript
1 const PI = 3.14
 2 const pi = 3
 3 function Pi() {}
 4 type IP = number[]
 5 class A {
 6     static method() {}
 7     method() {}
 8     field: number = PI
 9     static field: number = PI + pi
10 }
```

Example 4 (javascript):
```javascript
1 // The constant and the function have the same name.
 2 const PI = 3.14                   // compile-time error
 3 function PI() { return 3.14 }     // compile-time error
 4
 5 // The type and the variable have the same name.
 6 class P type Person = P           // compile-time error
 7 let Person: Person                // compile-time error
 8
 9 // The field and the method have the same name.
10 class C {
11     counter: number               // compile-time error
12     counter(): number {           // compile-time error
13       return this.counter
14     }
15 }
```

---

## 4. Names, Declarations and Scopes¶

**URL:** https://yoyocat.github.io/ArkTSSpec/4_names.html#variable-and-constant-declarations

**Contents:**
- 4. Names, Declarations and Scopes¶
- 4.1. Names¶
- 4.2. Declarations¶
- 4.3. Distinguishable Declarations¶
- 4.4. Scopes¶
- 4.5. Type Declarations¶
- 4.6. Type Alias Declaration¶
  - 4.6.1. Recursive Type Aliases¶
- 4.7. Variable and Constant Declarations¶
  - 4.7.1. Variable Declarations¶

This chapter introduces the following three mutually-related notions:

Each entity in an ArkTS program—a variable, a constant, a class, a type, a function, a method, etc.—is introduced via a declaration. An entity declaration assigns a name to the entity declared. The name is used to refer to the entity further in the program text.

Each declaration is valid (i.e., available and known) only within its scope. Scope is the region of the program text where the entity is declared and can be referred to by its simple (unqualified) name (see Scopes for more details).

A name refers to any declared entity.

Simple names consist of a single identifier. Qualified names consist of a sequence of identifiers with the ‘.’ tokens as separators:

In a qualified name N.x (where N is a simple name, and x is an identifier that can follow a sequence of identifiers separated with ‘.’ tokens), N can name the following:

The name of a compilation unit (see Compilation Units, Packages, and Modules) introduced as a result of import * as N (see Bind All with Qualified Access) with x to name the exported entity;

A class or interface type (see Classes, Interfaces) with x to name its static member;

A variable of a class or interface type with x to name its member.

A declaration introduces a named entity in an appropriate declaration scope (see Scopes).

Each declaration in the declaration scope must be distinguishable. A compile-time error occurs otherwise.

Declarations are distinguishable if:

They have different names.

They are distinguishable by signatures (see Declaration Distinguishable by Signatures).

The examples below are declarations distinguishable by names:

If a declaration is indistinguishable by name, then a compile-time error occurs:

The scope of a name is the region of program code within which the entity declared by that name can be referred to without having the name qualified. It means that a name is accessible in some context if it can be used in this context by its simple name.

The nature of scope usage depends on the kind of the name. A type name is used to declare variables or constants. A function name is used to call that function.

The scope of a name depends on the context the name is declared in:

A name declared on the package level (package level scope) is accessible throughout the entire package. The name can be accessed in other packages if exported.

Module level scope is applicable for separate modules only. A name declared on the module leve

*[Content truncated]*

**Examples:**

Example 1 (unknown):
```unknown
qualifiedName:
  Identifier ('.' Identifier )*
  ;
```

Example 2 (unknown):
```unknown
import * as N
```

Example 3 (javascript):
```javascript
1 const PI = 3.14
 2 const pi = 3
 3 function Pi() {}
 4 type IP = number[]
 5 class A {
 6     static method() {}
 7     method() {}
 8     field: number = PI
 9     static field: number = PI + pi
10 }
```

Example 4 (javascript):
```javascript
1 // The constant and the function have the same name.
 2 const PI = 3.14                   // compile-time error
 3 function PI() { return 3.14 }     // compile-time error
 4
 5 // The type and the variable have the same name.
 6 class P type Person = P           // compile-time error
 7 let Person: Person                // compile-time error
 8
 9 // The field and the method have the same name.
10 class C {
11     counter: number               // compile-time error
12     counter(): number {           // compile-time error
13       return this.counter
14     }
15 }
```

---

## 4. Names, Declarations and Scopes¶

**URL:** https://yoyocat.github.io/ArkTSSpec/4_names.html#type-alias-declaration

**Contents:**
- 4. Names, Declarations and Scopes¶
- 4.1. Names¶
- 4.2. Declarations¶
- 4.3. Distinguishable Declarations¶
- 4.4. Scopes¶
- 4.5. Type Declarations¶
- 4.6. Type Alias Declaration¶
  - 4.6.1. Recursive Type Aliases¶
- 4.7. Variable and Constant Declarations¶
  - 4.7.1. Variable Declarations¶

This chapter introduces the following three mutually-related notions:

Each entity in an ArkTS program—a variable, a constant, a class, a type, a function, a method, etc.—is introduced via a declaration. An entity declaration assigns a name to the entity declared. The name is used to refer to the entity further in the program text.

Each declaration is valid (i.e., available and known) only within its scope. Scope is the region of the program text where the entity is declared and can be referred to by its simple (unqualified) name (see Scopes for more details).

A name refers to any declared entity.

Simple names consist of a single identifier. Qualified names consist of a sequence of identifiers with the ‘.’ tokens as separators:

In a qualified name N.x (where N is a simple name, and x is an identifier that can follow a sequence of identifiers separated with ‘.’ tokens), N can name the following:

The name of a compilation unit (see Compilation Units, Packages, and Modules) introduced as a result of import * as N (see Bind All with Qualified Access) with x to name the exported entity;

A class or interface type (see Classes, Interfaces) with x to name its static member;

A variable of a class or interface type with x to name its member.

A declaration introduces a named entity in an appropriate declaration scope (see Scopes).

Each declaration in the declaration scope must be distinguishable. A compile-time error occurs otherwise.

Declarations are distinguishable if:

They have different names.

They are distinguishable by signatures (see Declaration Distinguishable by Signatures).

The examples below are declarations distinguishable by names:

If a declaration is indistinguishable by name, then a compile-time error occurs:

The scope of a name is the region of program code within which the entity declared by that name can be referred to without having the name qualified. It means that a name is accessible in some context if it can be used in this context by its simple name.

The nature of scope usage depends on the kind of the name. A type name is used to declare variables or constants. A function name is used to call that function.

The scope of a name depends on the context the name is declared in:

A name declared on the package level (package level scope) is accessible throughout the entire package. The name can be accessed in other packages if exported.

Module level scope is applicable for separate modules only. A name declared on the module leve

*[Content truncated]*

**Examples:**

Example 1 (unknown):
```unknown
qualifiedName:
  Identifier ('.' Identifier )*
  ;
```

Example 2 (unknown):
```unknown
import * as N
```

Example 3 (javascript):
```javascript
1 const PI = 3.14
 2 const pi = 3
 3 function Pi() {}
 4 type IP = number[]
 5 class A {
 6     static method() {}
 7     method() {}
 8     field: number = PI
 9     static field: number = PI + pi
10 }
```

Example 4 (javascript):
```javascript
1 // The constant and the function have the same name.
 2 const PI = 3.14                   // compile-time error
 3 function PI() { return 3.14 }     // compile-time error
 4
 5 // The type and the variable have the same name.
 6 class P type Person = P           // compile-time error
 7 let Person: Person                // compile-time error
 8
 9 // The field and the method have the same name.
10 class C {
11     counter: number               // compile-time error
12     counter(): number {           // compile-time error
13       return this.counter
14     }
15 }
```

---

## 4. Names, Declarations and Scopes¶

**URL:** https://yoyocat.github.io/ArkTSSpec/4_names.html#declarations

**Contents:**
- 4. Names, Declarations and Scopes¶
- 4.1. Names¶
- 4.2. Declarations¶
- 4.3. Distinguishable Declarations¶
- 4.4. Scopes¶
- 4.5. Type Declarations¶
- 4.6. Type Alias Declaration¶
  - 4.6.1. Recursive Type Aliases¶
- 4.7. Variable and Constant Declarations¶
  - 4.7.1. Variable Declarations¶

This chapter introduces the following three mutually-related notions:

Each entity in an ArkTS program—a variable, a constant, a class, a type, a function, a method, etc.—is introduced via a declaration. An entity declaration assigns a name to the entity declared. The name is used to refer to the entity further in the program text.

Each declaration is valid (i.e., available and known) only within its scope. Scope is the region of the program text where the entity is declared and can be referred to by its simple (unqualified) name (see Scopes for more details).

A name refers to any declared entity.

Simple names consist of a single identifier. Qualified names consist of a sequence of identifiers with the ‘.’ tokens as separators:

In a qualified name N.x (where N is a simple name, and x is an identifier that can follow a sequence of identifiers separated with ‘.’ tokens), N can name the following:

The name of a compilation unit (see Compilation Units, Packages, and Modules) introduced as a result of import * as N (see Bind All with Qualified Access) with x to name the exported entity;

A class or interface type (see Classes, Interfaces) with x to name its static member;

A variable of a class or interface type with x to name its member.

A declaration introduces a named entity in an appropriate declaration scope (see Scopes).

Each declaration in the declaration scope must be distinguishable. A compile-time error occurs otherwise.

Declarations are distinguishable if:

They have different names.

They are distinguishable by signatures (see Declaration Distinguishable by Signatures).

The examples below are declarations distinguishable by names:

If a declaration is indistinguishable by name, then a compile-time error occurs:

The scope of a name is the region of program code within which the entity declared by that name can be referred to without having the name qualified. It means that a name is accessible in some context if it can be used in this context by its simple name.

The nature of scope usage depends on the kind of the name. A type name is used to declare variables or constants. A function name is used to call that function.

The scope of a name depends on the context the name is declared in:

A name declared on the package level (package level scope) is accessible throughout the entire package. The name can be accessed in other packages if exported.

Module level scope is applicable for separate modules only. A name declared on the module leve

*[Content truncated]*

**Examples:**

Example 1 (unknown):
```unknown
qualifiedName:
  Identifier ('.' Identifier )*
  ;
```

Example 2 (unknown):
```unknown
import * as N
```

Example 3 (javascript):
```javascript
1 const PI = 3.14
 2 const pi = 3
 3 function Pi() {}
 4 type IP = number[]
 5 class A {
 6     static method() {}
 7     method() {}
 8     field: number = PI
 9     static field: number = PI + pi
10 }
```

Example 4 (javascript):
```javascript
1 // The constant and the function have the same name.
 2 const PI = 3.14                   // compile-time error
 3 function PI() { return 3.14 }     // compile-time error
 4
 5 // The type and the variable have the same name.
 6 class P type Person = P           // compile-time error
 7 let Person: Person                // compile-time error
 8
 9 // The field and the method have the same name.
10 class C {
11     counter: number               // compile-time error
12     counter(): number {           // compile-time error
13       return this.counter
14     }
15 }
```

---

## 4. Names, Declarations and Scopes¶

**URL:** https://yoyocat.github.io/ArkTSSpec/4_names.html#type-declarations

**Contents:**
- 4. Names, Declarations and Scopes¶
- 4.1. Names¶
- 4.2. Declarations¶
- 4.3. Distinguishable Declarations¶
- 4.4. Scopes¶
- 4.5. Type Declarations¶
- 4.6. Type Alias Declaration¶
  - 4.6.1. Recursive Type Aliases¶
- 4.7. Variable and Constant Declarations¶
  - 4.7.1. Variable Declarations¶

This chapter introduces the following three mutually-related notions:

Each entity in an ArkTS program—a variable, a constant, a class, a type, a function, a method, etc.—is introduced via a declaration. An entity declaration assigns a name to the entity declared. The name is used to refer to the entity further in the program text.

Each declaration is valid (i.e., available and known) only within its scope. Scope is the region of the program text where the entity is declared and can be referred to by its simple (unqualified) name (see Scopes for more details).

A name refers to any declared entity.

Simple names consist of a single identifier. Qualified names consist of a sequence of identifiers with the ‘.’ tokens as separators:

In a qualified name N.x (where N is a simple name, and x is an identifier that can follow a sequence of identifiers separated with ‘.’ tokens), N can name the following:

The name of a compilation unit (see Compilation Units, Packages, and Modules) introduced as a result of import * as N (see Bind All with Qualified Access) with x to name the exported entity;

A class or interface type (see Classes, Interfaces) with x to name its static member;

A variable of a class or interface type with x to name its member.

A declaration introduces a named entity in an appropriate declaration scope (see Scopes).

Each declaration in the declaration scope must be distinguishable. A compile-time error occurs otherwise.

Declarations are distinguishable if:

They have different names.

They are distinguishable by signatures (see Declaration Distinguishable by Signatures).

The examples below are declarations distinguishable by names:

If a declaration is indistinguishable by name, then a compile-time error occurs:

The scope of a name is the region of program code within which the entity declared by that name can be referred to without having the name qualified. It means that a name is accessible in some context if it can be used in this context by its simple name.

The nature of scope usage depends on the kind of the name. A type name is used to declare variables or constants. A function name is used to call that function.

The scope of a name depends on the context the name is declared in:

A name declared on the package level (package level scope) is accessible throughout the entire package. The name can be accessed in other packages if exported.

Module level scope is applicable for separate modules only. A name declared on the module leve

*[Content truncated]*

**Examples:**

Example 1 (unknown):
```unknown
qualifiedName:
  Identifier ('.' Identifier )*
  ;
```

Example 2 (unknown):
```unknown
import * as N
```

Example 3 (javascript):
```javascript
1 const PI = 3.14
 2 const pi = 3
 3 function Pi() {}
 4 type IP = number[]
 5 class A {
 6     static method() {}
 7     method() {}
 8     field: number = PI
 9     static field: number = PI + pi
10 }
```

Example 4 (javascript):
```javascript
1 // The constant and the function have the same name.
 2 const PI = 3.14                   // compile-time error
 3 function PI() { return 3.14 }     // compile-time error
 4
 5 // The type and the variable have the same name.
 6 class P type Person = P           // compile-time error
 7 let Person: Person                // compile-time error
 8
 9 // The field and the method have the same name.
10 class C {
11     counter: number               // compile-time error
12     counter(): number {           // compile-time error
13       return this.counter
14     }
15 }
```

---

## 4. Names, Declarations and Scopes¶

**URL:** https://yoyocat.github.io/ArkTSSpec/4_names.html#return-type

**Contents:**
- 4. Names, Declarations and Scopes¶
- 4.1. Names¶
- 4.2. Declarations¶
- 4.3. Distinguishable Declarations¶
- 4.4. Scopes¶
- 4.5. Type Declarations¶
- 4.6. Type Alias Declaration¶
  - 4.6.1. Recursive Type Aliases¶
- 4.7. Variable and Constant Declarations¶
  - 4.7.1. Variable Declarations¶

This chapter introduces the following three mutually-related notions:

Each entity in an ArkTS program—a variable, a constant, a class, a type, a function, a method, etc.—is introduced via a declaration. An entity declaration assigns a name to the entity declared. The name is used to refer to the entity further in the program text.

Each declaration is valid (i.e., available and known) only within its scope. Scope is the region of the program text where the entity is declared and can be referred to by its simple (unqualified) name (see Scopes for more details).

A name refers to any declared entity.

Simple names consist of a single identifier. Qualified names consist of a sequence of identifiers with the ‘.’ tokens as separators:

In a qualified name N.x (where N is a simple name, and x is an identifier that can follow a sequence of identifiers separated with ‘.’ tokens), N can name the following:

The name of a compilation unit (see Compilation Units, Packages, and Modules) introduced as a result of import * as N (see Bind All with Qualified Access) with x to name the exported entity;

A class or interface type (see Classes, Interfaces) with x to name its static member;

A variable of a class or interface type with x to name its member.

A declaration introduces a named entity in an appropriate declaration scope (see Scopes).

Each declaration in the declaration scope must be distinguishable. A compile-time error occurs otherwise.

Declarations are distinguishable if:

They have different names.

They are distinguishable by signatures (see Declaration Distinguishable by Signatures).

The examples below are declarations distinguishable by names:

If a declaration is indistinguishable by name, then a compile-time error occurs:

The scope of a name is the region of program code within which the entity declared by that name can be referred to without having the name qualified. It means that a name is accessible in some context if it can be used in this context by its simple name.

The nature of scope usage depends on the kind of the name. A type name is used to declare variables or constants. A function name is used to call that function.

The scope of a name depends on the context the name is declared in:

A name declared on the package level (package level scope) is accessible throughout the entire package. The name can be accessed in other packages if exported.

Module level scope is applicable for separate modules only. A name declared on the module leve

*[Content truncated]*

**Examples:**

Example 1 (unknown):
```unknown
qualifiedName:
  Identifier ('.' Identifier )*
  ;
```

Example 2 (unknown):
```unknown
import * as N
```

Example 3 (javascript):
```javascript
1 const PI = 3.14
 2 const pi = 3
 3 function Pi() {}
 4 type IP = number[]
 5 class A {
 6     static method() {}
 7     method() {}
 8     field: number = PI
 9     static field: number = PI + pi
10 }
```

Example 4 (javascript):
```javascript
1 // The constant and the function have the same name.
 2 const PI = 3.14                   // compile-time error
 3 function PI() { return 3.14 }     // compile-time error
 4
 5 // The type and the variable have the same name.
 6 class P type Person = P           // compile-time error
 7 let Person: Person                // compile-time error
 8
 9 // The field and the method have the same name.
10 class C {
11     counter: number               // compile-time error
12     counter(): number {           // compile-time error
13       return this.counter
14     }
15 }
```

---

## 4. Names, Declarations and Scopes¶

**URL:** https://yoyocat.github.io/ArkTSSpec/4_names.html

**Contents:**
- 4. Names, Declarations and Scopes¶
- 4.1. Names¶
- 4.2. Declarations¶
- 4.3. Distinguishable Declarations¶
- 4.4. Scopes¶
- 4.5. Type Declarations¶
- 4.6. Type Alias Declaration¶
  - 4.6.1. Recursive Type Aliases¶
- 4.7. Variable and Constant Declarations¶
  - 4.7.1. Variable Declarations¶

This chapter introduces the following three mutually-related notions:

Each entity in an ArkTS program—a variable, a constant, a class, a type, a function, a method, etc.—is introduced via a declaration. An entity declaration assigns a name to the entity declared. The name is used to refer to the entity further in the program text.

Each declaration is valid (i.e., available and known) only within its scope. Scope is the region of the program text where the entity is declared and can be referred to by its simple (unqualified) name (see Scopes for more details).

A name refers to any declared entity.

Simple names consist of a single identifier. Qualified names consist of a sequence of identifiers with the ‘.’ tokens as separators:

In a qualified name N.x (where N is a simple name, and x is an identifier that can follow a sequence of identifiers separated with ‘.’ tokens), N can name the following:

The name of a compilation unit (see Compilation Units, Packages, and Modules) introduced as a result of import * as N (see Bind All with Qualified Access) with x to name the exported entity;

A class or interface type (see Classes, Interfaces) with x to name its static member;

A variable of a class or interface type with x to name its member.

A declaration introduces a named entity in an appropriate declaration scope (see Scopes).

Each declaration in the declaration scope must be distinguishable. A compile-time error occurs otherwise.

Declarations are distinguishable if:

They have different names.

They are distinguishable by signatures (see Declaration Distinguishable by Signatures).

The examples below are declarations distinguishable by names:

If a declaration is indistinguishable by name, then a compile-time error occurs:

The scope of a name is the region of program code within which the entity declared by that name can be referred to without having the name qualified. It means that a name is accessible in some context if it can be used in this context by its simple name.

The nature of scope usage depends on the kind of the name. A type name is used to declare variables or constants. A function name is used to call that function.

The scope of a name depends on the context the name is declared in:

A name declared on the package level (package level scope) is accessible throughout the entire package. The name can be accessed in other packages if exported.

Module level scope is applicable for separate modules only. A name declared on the module leve

*[Content truncated]*

**Examples:**

Example 1 (unknown):
```unknown
qualifiedName:
  Identifier ('.' Identifier )*
  ;
```

Example 2 (unknown):
```unknown
import * as N
```

Example 3 (javascript):
```javascript
1 const PI = 3.14
 2 const pi = 3
 3 function Pi() {}
 4 type IP = number[]
 5 class A {
 6     static method() {}
 7     method() {}
 8     field: number = PI
 9     static field: number = PI + pi
10 }
```

Example 4 (javascript):
```javascript
1 // The constant and the function have the same name.
 2 const PI = 3.14                   // compile-time error
 3 function PI() { return 3.14 }     // compile-time error
 4
 5 // The type and the variable have the same name.
 6 class P type Person = P           // compile-time error
 7 let Person: Person                // compile-time error
 8
 9 // The field and the method have the same name.
10 class C {
11     counter: number               // compile-time error
12     counter(): number {           // compile-time error
13       return this.counter
14     }
15 }
```

---

## 4. Names, Declarations and Scopes¶

**URL:** https://yoyocat.github.io/ArkTSSpec/4_names.html#variable-declarations

**Contents:**
- 4. Names, Declarations and Scopes¶
- 4.1. Names¶
- 4.2. Declarations¶
- 4.3. Distinguishable Declarations¶
- 4.4. Scopes¶
- 4.5. Type Declarations¶
- 4.6. Type Alias Declaration¶
  - 4.6.1. Recursive Type Aliases¶
- 4.7. Variable and Constant Declarations¶
  - 4.7.1. Variable Declarations¶

This chapter introduces the following three mutually-related notions:

Each entity in an ArkTS program—a variable, a constant, a class, a type, a function, a method, etc.—is introduced via a declaration. An entity declaration assigns a name to the entity declared. The name is used to refer to the entity further in the program text.

Each declaration is valid (i.e., available and known) only within its scope. Scope is the region of the program text where the entity is declared and can be referred to by its simple (unqualified) name (see Scopes for more details).

A name refers to any declared entity.

Simple names consist of a single identifier. Qualified names consist of a sequence of identifiers with the ‘.’ tokens as separators:

In a qualified name N.x (where N is a simple name, and x is an identifier that can follow a sequence of identifiers separated with ‘.’ tokens), N can name the following:

The name of a compilation unit (see Compilation Units, Packages, and Modules) introduced as a result of import * as N (see Bind All with Qualified Access) with x to name the exported entity;

A class or interface type (see Classes, Interfaces) with x to name its static member;

A variable of a class or interface type with x to name its member.

A declaration introduces a named entity in an appropriate declaration scope (see Scopes).

Each declaration in the declaration scope must be distinguishable. A compile-time error occurs otherwise.

Declarations are distinguishable if:

They have different names.

They are distinguishable by signatures (see Declaration Distinguishable by Signatures).

The examples below are declarations distinguishable by names:

If a declaration is indistinguishable by name, then a compile-time error occurs:

The scope of a name is the region of program code within which the entity declared by that name can be referred to without having the name qualified. It means that a name is accessible in some context if it can be used in this context by its simple name.

The nature of scope usage depends on the kind of the name. A type name is used to declare variables or constants. A function name is used to call that function.

The scope of a name depends on the context the name is declared in:

A name declared on the package level (package level scope) is accessible throughout the entire package. The name can be accessed in other packages if exported.

Module level scope is applicable for separate modules only. A name declared on the module leve

*[Content truncated]*

**Examples:**

Example 1 (unknown):
```unknown
qualifiedName:
  Identifier ('.' Identifier )*
  ;
```

Example 2 (unknown):
```unknown
import * as N
```

Example 3 (javascript):
```javascript
1 const PI = 3.14
 2 const pi = 3
 3 function Pi() {}
 4 type IP = number[]
 5 class A {
 6     static method() {}
 7     method() {}
 8     field: number = PI
 9     static field: number = PI + pi
10 }
```

Example 4 (javascript):
```javascript
1 // The constant and the function have the same name.
 2 const PI = 3.14                   // compile-time error
 3 function PI() { return 3.14 }     // compile-time error
 4
 5 // The type and the variable have the same name.
 6 class P type Person = P           // compile-time error
 7 let Person: Person                // compile-time error
 8
 9 // The field and the method have the same name.
10 class C {
11     counter: number               // compile-time error
12     counter(): number {           // compile-time error
13       return this.counter
14     }
15 }
```

---

## 4. Names, Declarations and Scopes¶

**URL:** https://yoyocat.github.io/ArkTSSpec/4_names.html#rest-parameter

**Contents:**
- 4. Names, Declarations and Scopes¶
- 4.1. Names¶
- 4.2. Declarations¶
- 4.3. Distinguishable Declarations¶
- 4.4. Scopes¶
- 4.5. Type Declarations¶
- 4.6. Type Alias Declaration¶
  - 4.6.1. Recursive Type Aliases¶
- 4.7. Variable and Constant Declarations¶
  - 4.7.1. Variable Declarations¶

This chapter introduces the following three mutually-related notions:

Each entity in an ArkTS program—a variable, a constant, a class, a type, a function, a method, etc.—is introduced via a declaration. An entity declaration assigns a name to the entity declared. The name is used to refer to the entity further in the program text.

Each declaration is valid (i.e., available and known) only within its scope. Scope is the region of the program text where the entity is declared and can be referred to by its simple (unqualified) name (see Scopes for more details).

A name refers to any declared entity.

Simple names consist of a single identifier. Qualified names consist of a sequence of identifiers with the ‘.’ tokens as separators:

In a qualified name N.x (where N is a simple name, and x is an identifier that can follow a sequence of identifiers separated with ‘.’ tokens), N can name the following:

The name of a compilation unit (see Compilation Units, Packages, and Modules) introduced as a result of import * as N (see Bind All with Qualified Access) with x to name the exported entity;

A class or interface type (see Classes, Interfaces) with x to name its static member;

A variable of a class or interface type with x to name its member.

A declaration introduces a named entity in an appropriate declaration scope (see Scopes).

Each declaration in the declaration scope must be distinguishable. A compile-time error occurs otherwise.

Declarations are distinguishable if:

They have different names.

They are distinguishable by signatures (see Declaration Distinguishable by Signatures).

The examples below are declarations distinguishable by names:

If a declaration is indistinguishable by name, then a compile-time error occurs:

The scope of a name is the region of program code within which the entity declared by that name can be referred to without having the name qualified. It means that a name is accessible in some context if it can be used in this context by its simple name.

The nature of scope usage depends on the kind of the name. A type name is used to declare variables or constants. A function name is used to call that function.

The scope of a name depends on the context the name is declared in:

A name declared on the package level (package level scope) is accessible throughout the entire package. The name can be accessed in other packages if exported.

Module level scope is applicable for separate modules only. A name declared on the module leve

*[Content truncated]*

**Examples:**

Example 1 (unknown):
```unknown
qualifiedName:
  Identifier ('.' Identifier )*
  ;
```

Example 2 (unknown):
```unknown
import * as N
```

Example 3 (javascript):
```javascript
1 const PI = 3.14
 2 const pi = 3
 3 function Pi() {}
 4 type IP = number[]
 5 class A {
 6     static method() {}
 7     method() {}
 8     field: number = PI
 9     static field: number = PI + pi
10 }
```

Example 4 (javascript):
```javascript
1 // The constant and the function have the same name.
 2 const PI = 3.14                   // compile-time error
 3 function PI() { return 3.14 }     // compile-time error
 4
 5 // The type and the variable have the same name.
 6 class P type Person = P           // compile-time error
 7 let Person: Person                // compile-time error
 8
 9 // The field and the method have the same name.
10 class C {
11     counter: number               // compile-time error
12     counter(): number {           // compile-time error
13       return this.counter
14     }
15 }
```

---

## 4. Names, Declarations and Scopes¶

**URL:** https://yoyocat.github.io/ArkTSSpec/4_names.html#scopes

**Contents:**
- 4. Names, Declarations and Scopes¶
- 4.1. Names¶
- 4.2. Declarations¶
- 4.3. Distinguishable Declarations¶
- 4.4. Scopes¶
- 4.5. Type Declarations¶
- 4.6. Type Alias Declaration¶
  - 4.6.1. Recursive Type Aliases¶
- 4.7. Variable and Constant Declarations¶
  - 4.7.1. Variable Declarations¶

This chapter introduces the following three mutually-related notions:

Each entity in an ArkTS program—a variable, a constant, a class, a type, a function, a method, etc.—is introduced via a declaration. An entity declaration assigns a name to the entity declared. The name is used to refer to the entity further in the program text.

Each declaration is valid (i.e., available and known) only within its scope. Scope is the region of the program text where the entity is declared and can be referred to by its simple (unqualified) name (see Scopes for more details).

A name refers to any declared entity.

Simple names consist of a single identifier. Qualified names consist of a sequence of identifiers with the ‘.’ tokens as separators:

In a qualified name N.x (where N is a simple name, and x is an identifier that can follow a sequence of identifiers separated with ‘.’ tokens), N can name the following:

The name of a compilation unit (see Compilation Units, Packages, and Modules) introduced as a result of import * as N (see Bind All with Qualified Access) with x to name the exported entity;

A class or interface type (see Classes, Interfaces) with x to name its static member;

A variable of a class or interface type with x to name its member.

A declaration introduces a named entity in an appropriate declaration scope (see Scopes).

Each declaration in the declaration scope must be distinguishable. A compile-time error occurs otherwise.

Declarations are distinguishable if:

They have different names.

They are distinguishable by signatures (see Declaration Distinguishable by Signatures).

The examples below are declarations distinguishable by names:

If a declaration is indistinguishable by name, then a compile-time error occurs:

The scope of a name is the region of program code within which the entity declared by that name can be referred to without having the name qualified. It means that a name is accessible in some context if it can be used in this context by its simple name.

The nature of scope usage depends on the kind of the name. A type name is used to declare variables or constants. A function name is used to call that function.

The scope of a name depends on the context the name is declared in:

A name declared on the package level (package level scope) is accessible throughout the entire package. The name can be accessed in other packages if exported.

Module level scope is applicable for separate modules only. A name declared on the module leve

*[Content truncated]*

**Examples:**

Example 1 (unknown):
```unknown
qualifiedName:
  Identifier ('.' Identifier )*
  ;
```

Example 2 (unknown):
```unknown
import * as N
```

Example 3 (javascript):
```javascript
1 const PI = 3.14
 2 const pi = 3
 3 function Pi() {}
 4 type IP = number[]
 5 class A {
 6     static method() {}
 7     method() {}
 8     field: number = PI
 9     static field: number = PI + pi
10 }
```

Example 4 (javascript):
```javascript
1 // The constant and the function have the same name.
 2 const PI = 3.14                   // compile-time error
 3 function PI() { return 3.14 }     // compile-time error
 4
 5 // The type and the variable have the same name.
 6 class P type Person = P           // compile-time error
 7 let Person: Person                // compile-time error
 8
 9 // The field and the method have the same name.
10 class C {
11     counter: number               // compile-time error
12     counter(): number {           // compile-time error
13       return this.counter
14     }
15 }
```

---

## 4. Names, Declarations and Scopes¶

**URL:** https://yoyocat.github.io/ArkTSSpec/4_names.html#optional-parameters

**Contents:**
- 4. Names, Declarations and Scopes¶
- 4.1. Names¶
- 4.2. Declarations¶
- 4.3. Distinguishable Declarations¶
- 4.4. Scopes¶
- 4.5. Type Declarations¶
- 4.6. Type Alias Declaration¶
  - 4.6.1. Recursive Type Aliases¶
- 4.7. Variable and Constant Declarations¶
  - 4.7.1. Variable Declarations¶

This chapter introduces the following three mutually-related notions:

Each entity in an ArkTS program—a variable, a constant, a class, a type, a function, a method, etc.—is introduced via a declaration. An entity declaration assigns a name to the entity declared. The name is used to refer to the entity further in the program text.

Each declaration is valid (i.e., available and known) only within its scope. Scope is the region of the program text where the entity is declared and can be referred to by its simple (unqualified) name (see Scopes for more details).

A name refers to any declared entity.

Simple names consist of a single identifier. Qualified names consist of a sequence of identifiers with the ‘.’ tokens as separators:

In a qualified name N.x (where N is a simple name, and x is an identifier that can follow a sequence of identifiers separated with ‘.’ tokens), N can name the following:

The name of a compilation unit (see Compilation Units, Packages, and Modules) introduced as a result of import * as N (see Bind All with Qualified Access) with x to name the exported entity;

A class or interface type (see Classes, Interfaces) with x to name its static member;

A variable of a class or interface type with x to name its member.

A declaration introduces a named entity in an appropriate declaration scope (see Scopes).

Each declaration in the declaration scope must be distinguishable. A compile-time error occurs otherwise.

Declarations are distinguishable if:

They have different names.

They are distinguishable by signatures (see Declaration Distinguishable by Signatures).

The examples below are declarations distinguishable by names:

If a declaration is indistinguishable by name, then a compile-time error occurs:

The scope of a name is the region of program code within which the entity declared by that name can be referred to without having the name qualified. It means that a name is accessible in some context if it can be used in this context by its simple name.

The nature of scope usage depends on the kind of the name. A type name is used to declare variables or constants. A function name is used to call that function.

The scope of a name depends on the context the name is declared in:

A name declared on the package level (package level scope) is accessible throughout the entire package. The name can be accessed in other packages if exported.

Module level scope is applicable for separate modules only. A name declared on the module leve

*[Content truncated]*

**Examples:**

Example 1 (unknown):
```unknown
qualifiedName:
  Identifier ('.' Identifier )*
  ;
```

Example 2 (unknown):
```unknown
import * as N
```

Example 3 (javascript):
```javascript
1 const PI = 3.14
 2 const pi = 3
 3 function Pi() {}
 4 type IP = number[]
 5 class A {
 6     static method() {}
 7     method() {}
 8     field: number = PI
 9     static field: number = PI + pi
10 }
```

Example 4 (javascript):
```javascript
1 // The constant and the function have the same name.
 2 const PI = 3.14                   // compile-time error
 3 function PI() { return 3.14 }     // compile-time error
 4
 5 // The type and the variable have the same name.
 6 class P type Person = P           // compile-time error
 7 let Person: Person                // compile-time error
 8
 9 // The field and the method have the same name.
10 class C {
11     counter: number               // compile-time error
12     counter(): number {           // compile-time error
13       return this.counter
14     }
15 }
```

---

## 4. Names, Declarations and Scopes¶

**URL:** https://yoyocat.github.io/ArkTSSpec/4_names.html#type-inference-from-initializer

**Contents:**
- 4. Names, Declarations and Scopes¶
- 4.1. Names¶
- 4.2. Declarations¶
- 4.3. Distinguishable Declarations¶
- 4.4. Scopes¶
- 4.5. Type Declarations¶
- 4.6. Type Alias Declaration¶
  - 4.6.1. Recursive Type Aliases¶
- 4.7. Variable and Constant Declarations¶
  - 4.7.1. Variable Declarations¶

This chapter introduces the following three mutually-related notions:

Each entity in an ArkTS program—a variable, a constant, a class, a type, a function, a method, etc.—is introduced via a declaration. An entity declaration assigns a name to the entity declared. The name is used to refer to the entity further in the program text.

Each declaration is valid (i.e., available and known) only within its scope. Scope is the region of the program text where the entity is declared and can be referred to by its simple (unqualified) name (see Scopes for more details).

A name refers to any declared entity.

Simple names consist of a single identifier. Qualified names consist of a sequence of identifiers with the ‘.’ tokens as separators:

In a qualified name N.x (where N is a simple name, and x is an identifier that can follow a sequence of identifiers separated with ‘.’ tokens), N can name the following:

The name of a compilation unit (see Compilation Units, Packages, and Modules) introduced as a result of import * as N (see Bind All with Qualified Access) with x to name the exported entity;

A class or interface type (see Classes, Interfaces) with x to name its static member;

A variable of a class or interface type with x to name its member.

A declaration introduces a named entity in an appropriate declaration scope (see Scopes).

Each declaration in the declaration scope must be distinguishable. A compile-time error occurs otherwise.

Declarations are distinguishable if:

They have different names.

They are distinguishable by signatures (see Declaration Distinguishable by Signatures).

The examples below are declarations distinguishable by names:

If a declaration is indistinguishable by name, then a compile-time error occurs:

The scope of a name is the region of program code within which the entity declared by that name can be referred to without having the name qualified. It means that a name is accessible in some context if it can be used in this context by its simple name.

The nature of scope usage depends on the kind of the name. A type name is used to declare variables or constants. A function name is used to call that function.

The scope of a name depends on the context the name is declared in:

A name declared on the package level (package level scope) is accessible throughout the entire package. The name can be accessed in other packages if exported.

Module level scope is applicable for separate modules only. A name declared on the module leve

*[Content truncated]*

**Examples:**

Example 1 (unknown):
```unknown
qualifiedName:
  Identifier ('.' Identifier )*
  ;
```

Example 2 (unknown):
```unknown
import * as N
```

Example 3 (javascript):
```javascript
1 const PI = 3.14
 2 const pi = 3
 3 function Pi() {}
 4 type IP = number[]
 5 class A {
 6     static method() {}
 7     method() {}
 8     field: number = PI
 9     static field: number = PI + pi
10 }
```

Example 4 (javascript):
```javascript
1 // The constant and the function have the same name.
 2 const PI = 3.14                   // compile-time error
 3 function PI() { return 3.14 }     // compile-time error
 4
 5 // The type and the variable have the same name.
 6 class P type Person = P           // compile-time error
 7 let Person: Person                // compile-time error
 8
 9 // The field and the method have the same name.
10 class C {
11     counter: number               // compile-time error
12     counter(): number {           // compile-time error
13       return this.counter
14     }
15 }
```

---

## 4. Names, Declarations and Scopes¶

**URL:** https://yoyocat.github.io/ArkTSSpec/4_names.html#function-overload-signatures

**Contents:**
- 4. Names, Declarations and Scopes¶
- 4.1. Names¶
- 4.2. Declarations¶
- 4.3. Distinguishable Declarations¶
- 4.4. Scopes¶
- 4.5. Type Declarations¶
- 4.6. Type Alias Declaration¶
  - 4.6.1. Recursive Type Aliases¶
- 4.7. Variable and Constant Declarations¶
  - 4.7.1. Variable Declarations¶

This chapter introduces the following three mutually-related notions:

Each entity in an ArkTS program—a variable, a constant, a class, a type, a function, a method, etc.—is introduced via a declaration. An entity declaration assigns a name to the entity declared. The name is used to refer to the entity further in the program text.

Each declaration is valid (i.e., available and known) only within its scope. Scope is the region of the program text where the entity is declared and can be referred to by its simple (unqualified) name (see Scopes for more details).

A name refers to any declared entity.

Simple names consist of a single identifier. Qualified names consist of a sequence of identifiers with the ‘.’ tokens as separators:

In a qualified name N.x (where N is a simple name, and x is an identifier that can follow a sequence of identifiers separated with ‘.’ tokens), N can name the following:

The name of a compilation unit (see Compilation Units, Packages, and Modules) introduced as a result of import * as N (see Bind All with Qualified Access) with x to name the exported entity;

A class or interface type (see Classes, Interfaces) with x to name its static member;

A variable of a class or interface type with x to name its member.

A declaration introduces a named entity in an appropriate declaration scope (see Scopes).

Each declaration in the declaration scope must be distinguishable. A compile-time error occurs otherwise.

Declarations are distinguishable if:

They have different names.

They are distinguishable by signatures (see Declaration Distinguishable by Signatures).

The examples below are declarations distinguishable by names:

If a declaration is indistinguishable by name, then a compile-time error occurs:

The scope of a name is the region of program code within which the entity declared by that name can be referred to without having the name qualified. It means that a name is accessible in some context if it can be used in this context by its simple name.

The nature of scope usage depends on the kind of the name. A type name is used to declare variables or constants. A function name is used to call that function.

The scope of a name depends on the context the name is declared in:

A name declared on the package level (package level scope) is accessible throughout the entire package. The name can be accessed in other packages if exported.

Module level scope is applicable for separate modules only. A name declared on the module leve

*[Content truncated]*

**Examples:**

Example 1 (unknown):
```unknown
qualifiedName:
  Identifier ('.' Identifier )*
  ;
```

Example 2 (unknown):
```unknown
import * as N
```

Example 3 (javascript):
```javascript
1 const PI = 3.14
 2 const pi = 3
 3 function Pi() {}
 4 type IP = number[]
 5 class A {
 6     static method() {}
 7     method() {}
 8     field: number = PI
 9     static field: number = PI + pi
10 }
```

Example 4 (javascript):
```javascript
1 // The constant and the function have the same name.
 2 const PI = 3.14                   // compile-time error
 3 function PI() { return 3.14 }     // compile-time error
 4
 5 // The type and the variable have the same name.
 6 class P type Person = P           // compile-time error
 7 let Person: Person                // compile-time error
 8
 9 // The field and the method have the same name.
10 class C {
11     counter: number               // compile-time error
12     counter(): number {           // compile-time error
13       return this.counter
14     }
15 }
```

---

## 4. Names, Declarations and Scopes¶

**URL:** https://yoyocat.github.io/ArkTSSpec/4_names.html#parameter-list

**Contents:**
- 4. Names, Declarations and Scopes¶
- 4.1. Names¶
- 4.2. Declarations¶
- 4.3. Distinguishable Declarations¶
- 4.4. Scopes¶
- 4.5. Type Declarations¶
- 4.6. Type Alias Declaration¶
  - 4.6.1. Recursive Type Aliases¶
- 4.7. Variable and Constant Declarations¶
  - 4.7.1. Variable Declarations¶

This chapter introduces the following three mutually-related notions:

Each entity in an ArkTS program—a variable, a constant, a class, a type, a function, a method, etc.—is introduced via a declaration. An entity declaration assigns a name to the entity declared. The name is used to refer to the entity further in the program text.

Each declaration is valid (i.e., available and known) only within its scope. Scope is the region of the program text where the entity is declared and can be referred to by its simple (unqualified) name (see Scopes for more details).

A name refers to any declared entity.

Simple names consist of a single identifier. Qualified names consist of a sequence of identifiers with the ‘.’ tokens as separators:

In a qualified name N.x (where N is a simple name, and x is an identifier that can follow a sequence of identifiers separated with ‘.’ tokens), N can name the following:

The name of a compilation unit (see Compilation Units, Packages, and Modules) introduced as a result of import * as N (see Bind All with Qualified Access) with x to name the exported entity;

A class or interface type (see Classes, Interfaces) with x to name its static member;

A variable of a class or interface type with x to name its member.

A declaration introduces a named entity in an appropriate declaration scope (see Scopes).

Each declaration in the declaration scope must be distinguishable. A compile-time error occurs otherwise.

Declarations are distinguishable if:

They have different names.

They are distinguishable by signatures (see Declaration Distinguishable by Signatures).

The examples below are declarations distinguishable by names:

If a declaration is indistinguishable by name, then a compile-time error occurs:

The scope of a name is the region of program code within which the entity declared by that name can be referred to without having the name qualified. It means that a name is accessible in some context if it can be used in this context by its simple name.

The nature of scope usage depends on the kind of the name. A type name is used to declare variables or constants. A function name is used to call that function.

The scope of a name depends on the context the name is declared in:

A name declared on the package level (package level scope) is accessible throughout the entire package. The name can be accessed in other packages if exported.

Module level scope is applicable for separate modules only. A name declared on the module leve

*[Content truncated]*

**Examples:**

Example 1 (unknown):
```unknown
qualifiedName:
  Identifier ('.' Identifier )*
  ;
```

Example 2 (unknown):
```unknown
import * as N
```

Example 3 (javascript):
```javascript
1 const PI = 3.14
 2 const pi = 3
 3 function Pi() {}
 4 type IP = number[]
 5 class A {
 6     static method() {}
 7     method() {}
 8     field: number = PI
 9     static field: number = PI + pi
10 }
```

Example 4 (javascript):
```javascript
1 // The constant and the function have the same name.
 2 const PI = 3.14                   // compile-time error
 3 function PI() { return 3.14 }     // compile-time error
 4
 5 // The type and the variable have the same name.
 6 class P type Person = P           // compile-time error
 7 let Person: Person                // compile-time error
 8
 9 // The field and the method have the same name.
10 class C {
11     counter: number               // compile-time error
12     counter(): number {           // compile-time error
13       return this.counter
14     }
15 }
```

---

## 4. Names, Declarations and Scopes¶

**URL:** https://yoyocat.github.io/ArkTSSpec/4_names.html#shadowing-parameters

**Contents:**
- 4. Names, Declarations and Scopes¶
- 4.1. Names¶
- 4.2. Declarations¶
- 4.3. Distinguishable Declarations¶
- 4.4. Scopes¶
- 4.5. Type Declarations¶
- 4.6. Type Alias Declaration¶
  - 4.6.1. Recursive Type Aliases¶
- 4.7. Variable and Constant Declarations¶
  - 4.7.1. Variable Declarations¶

This chapter introduces the following three mutually-related notions:

Each entity in an ArkTS program—a variable, a constant, a class, a type, a function, a method, etc.—is introduced via a declaration. An entity declaration assigns a name to the entity declared. The name is used to refer to the entity further in the program text.

Each declaration is valid (i.e., available and known) only within its scope. Scope is the region of the program text where the entity is declared and can be referred to by its simple (unqualified) name (see Scopes for more details).

A name refers to any declared entity.

Simple names consist of a single identifier. Qualified names consist of a sequence of identifiers with the ‘.’ tokens as separators:

In a qualified name N.x (where N is a simple name, and x is an identifier that can follow a sequence of identifiers separated with ‘.’ tokens), N can name the following:

The name of a compilation unit (see Compilation Units, Packages, and Modules) introduced as a result of import * as N (see Bind All with Qualified Access) with x to name the exported entity;

A class or interface type (see Classes, Interfaces) with x to name its static member;

A variable of a class or interface type with x to name its member.

A declaration introduces a named entity in an appropriate declaration scope (see Scopes).

Each declaration in the declaration scope must be distinguishable. A compile-time error occurs otherwise.

Declarations are distinguishable if:

They have different names.

They are distinguishable by signatures (see Declaration Distinguishable by Signatures).

The examples below are declarations distinguishable by names:

If a declaration is indistinguishable by name, then a compile-time error occurs:

The scope of a name is the region of program code within which the entity declared by that name can be referred to without having the name qualified. It means that a name is accessible in some context if it can be used in this context by its simple name.

The nature of scope usage depends on the kind of the name. A type name is used to declare variables or constants. A function name is used to call that function.

The scope of a name depends on the context the name is declared in:

A name declared on the package level (package level scope) is accessible throughout the entire package. The name can be accessed in other packages if exported.

Module level scope is applicable for separate modules only. A name declared on the module leve

*[Content truncated]*

**Examples:**

Example 1 (unknown):
```unknown
qualifiedName:
  Identifier ('.' Identifier )*
  ;
```

Example 2 (unknown):
```unknown
import * as N
```

Example 3 (javascript):
```javascript
1 const PI = 3.14
 2 const pi = 3
 3 function Pi() {}
 4 type IP = number[]
 5 class A {
 6     static method() {}
 7     method() {}
 8     field: number = PI
 9     static field: number = PI + pi
10 }
```

Example 4 (javascript):
```javascript
1 // The constant and the function have the same name.
 2 const PI = 3.14                   // compile-time error
 3 function PI() { return 3.14 }     // compile-time error
 4
 5 // The type and the variable have the same name.
 6 class P type Person = P           // compile-time error
 7 let Person: Person                // compile-time error
 8
 9 // The field and the method have the same name.
10 class C {
11     counter: number               // compile-time error
12     counter(): number {           // compile-time error
13       return this.counter
14     }
15 }
```

---

## 4. Names, Declarations and Scopes¶

**URL:** https://yoyocat.github.io/ArkTSSpec/4_names.html#names

**Contents:**
- 4. Names, Declarations and Scopes¶
- 4.1. Names¶
- 4.2. Declarations¶
- 4.3. Distinguishable Declarations¶
- 4.4. Scopes¶
- 4.5. Type Declarations¶
- 4.6. Type Alias Declaration¶
  - 4.6.1. Recursive Type Aliases¶
- 4.7. Variable and Constant Declarations¶
  - 4.7.1. Variable Declarations¶

This chapter introduces the following three mutually-related notions:

Each entity in an ArkTS program—a variable, a constant, a class, a type, a function, a method, etc.—is introduced via a declaration. An entity declaration assigns a name to the entity declared. The name is used to refer to the entity further in the program text.

Each declaration is valid (i.e., available and known) only within its scope. Scope is the region of the program text where the entity is declared and can be referred to by its simple (unqualified) name (see Scopes for more details).

A name refers to any declared entity.

Simple names consist of a single identifier. Qualified names consist of a sequence of identifiers with the ‘.’ tokens as separators:

In a qualified name N.x (where N is a simple name, and x is an identifier that can follow a sequence of identifiers separated with ‘.’ tokens), N can name the following:

The name of a compilation unit (see Compilation Units, Packages, and Modules) introduced as a result of import * as N (see Bind All with Qualified Access) with x to name the exported entity;

A class or interface type (see Classes, Interfaces) with x to name its static member;

A variable of a class or interface type with x to name its member.

A declaration introduces a named entity in an appropriate declaration scope (see Scopes).

Each declaration in the declaration scope must be distinguishable. A compile-time error occurs otherwise.

Declarations are distinguishable if:

They have different names.

They are distinguishable by signatures (see Declaration Distinguishable by Signatures).

The examples below are declarations distinguishable by names:

If a declaration is indistinguishable by name, then a compile-time error occurs:

The scope of a name is the region of program code within which the entity declared by that name can be referred to without having the name qualified. It means that a name is accessible in some context if it can be used in this context by its simple name.

The nature of scope usage depends on the kind of the name. A type name is used to declare variables or constants. A function name is used to call that function.

The scope of a name depends on the context the name is declared in:

A name declared on the package level (package level scope) is accessible throughout the entire package. The name can be accessed in other packages if exported.

Module level scope is applicable for separate modules only. A name declared on the module leve

*[Content truncated]*

**Examples:**

Example 1 (unknown):
```unknown
qualifiedName:
  Identifier ('.' Identifier )*
  ;
```

Example 2 (unknown):
```unknown
import * as N
```

Example 3 (javascript):
```javascript
1 const PI = 3.14
 2 const pi = 3
 3 function Pi() {}
 4 type IP = number[]
 5 class A {
 6     static method() {}
 7     method() {}
 8     field: number = PI
 9     static field: number = PI + pi
10 }
```

Example 4 (javascript):
```javascript
1 // The constant and the function have the same name.
 2 const PI = 3.14                   // compile-time error
 3 function PI() { return 3.14 }     // compile-time error
 4
 5 // The type and the variable have the same name.
 6 class P type Person = P           // compile-time error
 7 let Person: Person                // compile-time error
 8
 9 // The field and the method have the same name.
10 class C {
11     counter: number               // compile-time error
12     counter(): number {           // compile-time error
13       return this.counter
14     }
15 }
```

---

## 4. Names, Declarations and Scopes¶

**URL:** https://yoyocat.github.io/ArkTSSpec/4_names.html#readonly-parameters

**Contents:**
- 4. Names, Declarations and Scopes¶
- 4.1. Names¶
- 4.2. Declarations¶
- 4.3. Distinguishable Declarations¶
- 4.4. Scopes¶
- 4.5. Type Declarations¶
- 4.6. Type Alias Declaration¶
  - 4.6.1. Recursive Type Aliases¶
- 4.7. Variable and Constant Declarations¶
  - 4.7.1. Variable Declarations¶

This chapter introduces the following three mutually-related notions:

Each entity in an ArkTS program—a variable, a constant, a class, a type, a function, a method, etc.—is introduced via a declaration. An entity declaration assigns a name to the entity declared. The name is used to refer to the entity further in the program text.

Each declaration is valid (i.e., available and known) only within its scope. Scope is the region of the program text where the entity is declared and can be referred to by its simple (unqualified) name (see Scopes for more details).

A name refers to any declared entity.

Simple names consist of a single identifier. Qualified names consist of a sequence of identifiers with the ‘.’ tokens as separators:

In a qualified name N.x (where N is a simple name, and x is an identifier that can follow a sequence of identifiers separated with ‘.’ tokens), N can name the following:

The name of a compilation unit (see Compilation Units, Packages, and Modules) introduced as a result of import * as N (see Bind All with Qualified Access) with x to name the exported entity;

A class or interface type (see Classes, Interfaces) with x to name its static member;

A variable of a class or interface type with x to name its member.

A declaration introduces a named entity in an appropriate declaration scope (see Scopes).

Each declaration in the declaration scope must be distinguishable. A compile-time error occurs otherwise.

Declarations are distinguishable if:

They have different names.

They are distinguishable by signatures (see Declaration Distinguishable by Signatures).

The examples below are declarations distinguishable by names:

If a declaration is indistinguishable by name, then a compile-time error occurs:

The scope of a name is the region of program code within which the entity declared by that name can be referred to without having the name qualified. It means that a name is accessible in some context if it can be used in this context by its simple name.

The nature of scope usage depends on the kind of the name. A type name is used to declare variables or constants. A function name is used to call that function.

The scope of a name depends on the context the name is declared in:

A name declared on the package level (package level scope) is accessible throughout the entire package. The name can be accessed in other packages if exported.

Module level scope is applicable for separate modules only. A name declared on the module leve

*[Content truncated]*

**Examples:**

Example 1 (unknown):
```unknown
qualifiedName:
  Identifier ('.' Identifier )*
  ;
```

Example 2 (unknown):
```unknown
import * as N
```

Example 3 (javascript):
```javascript
1 const PI = 3.14
 2 const pi = 3
 3 function Pi() {}
 4 type IP = number[]
 5 class A {
 6     static method() {}
 7     method() {}
 8     field: number = PI
 9     static field: number = PI + pi
10 }
```

Example 4 (javascript):
```javascript
1 // The constant and the function have the same name.
 2 const PI = 3.14                   // compile-time error
 3 function PI() { return 3.14 }     // compile-time error
 4
 5 // The type and the variable have the same name.
 6 class P type Person = P           // compile-time error
 7 let Person: Person                // compile-time error
 8
 9 // The field and the method have the same name.
10 class C {
11     counter: number               // compile-time error
12     counter(): number {           // compile-time error
13       return this.counter
14     }
15 }
```

---

## 4. Names, Declarations and Scopes¶

**URL:** https://yoyocat.github.io/ArkTSSpec/4_names.html#distinguishable-declarations

**Contents:**
- 4. Names, Declarations and Scopes¶
- 4.1. Names¶
- 4.2. Declarations¶
- 4.3. Distinguishable Declarations¶
- 4.4. Scopes¶
- 4.5. Type Declarations¶
- 4.6. Type Alias Declaration¶
  - 4.6.1. Recursive Type Aliases¶
- 4.7. Variable and Constant Declarations¶
  - 4.7.1. Variable Declarations¶

This chapter introduces the following three mutually-related notions:

Each entity in an ArkTS program—a variable, a constant, a class, a type, a function, a method, etc.—is introduced via a declaration. An entity declaration assigns a name to the entity declared. The name is used to refer to the entity further in the program text.

Each declaration is valid (i.e., available and known) only within its scope. Scope is the region of the program text where the entity is declared and can be referred to by its simple (unqualified) name (see Scopes for more details).

A name refers to any declared entity.

Simple names consist of a single identifier. Qualified names consist of a sequence of identifiers with the ‘.’ tokens as separators:

In a qualified name N.x (where N is a simple name, and x is an identifier that can follow a sequence of identifiers separated with ‘.’ tokens), N can name the following:

The name of a compilation unit (see Compilation Units, Packages, and Modules) introduced as a result of import * as N (see Bind All with Qualified Access) with x to name the exported entity;

A class or interface type (see Classes, Interfaces) with x to name its static member;

A variable of a class or interface type with x to name its member.

A declaration introduces a named entity in an appropriate declaration scope (see Scopes).

Each declaration in the declaration scope must be distinguishable. A compile-time error occurs otherwise.

Declarations are distinguishable if:

They have different names.

They are distinguishable by signatures (see Declaration Distinguishable by Signatures).

The examples below are declarations distinguishable by names:

If a declaration is indistinguishable by name, then a compile-time error occurs:

The scope of a name is the region of program code within which the entity declared by that name can be referred to without having the name qualified. It means that a name is accessible in some context if it can be used in this context by its simple name.

The nature of scope usage depends on the kind of the name. A type name is used to declare variables or constants. A function name is used to call that function.

The scope of a name depends on the context the name is declared in:

A name declared on the package level (package level scope) is accessible throughout the entire package. The name can be accessed in other packages if exported.

Module level scope is applicable for separate modules only. A name declared on the module leve

*[Content truncated]*

**Examples:**

Example 1 (unknown):
```unknown
qualifiedName:
  Identifier ('.' Identifier )*
  ;
```

Example 2 (unknown):
```unknown
import * as N
```

Example 3 (javascript):
```javascript
1 const PI = 3.14
 2 const pi = 3
 3 function Pi() {}
 4 type IP = number[]
 5 class A {
 6     static method() {}
 7     method() {}
 8     field: number = PI
 9     static field: number = PI + pi
10 }
```

Example 4 (javascript):
```javascript
1 // The constant and the function have the same name.
 2 const PI = 3.14                   // compile-time error
 3 function PI() { return 3.14 }     // compile-time error
 4
 5 // The type and the variable have the same name.
 6 class P type Person = P           // compile-time error
 7 let Person: Person                // compile-time error
 8
 9 // The field and the method have the same name.
10 class C {
11     counter: number               // compile-time error
12     counter(): number {           // compile-time error
13       return this.counter
14     }
15 }
```

---

## 4. Names, Declarations and Scopes¶

**URL:** https://yoyocat.github.io/ArkTSSpec/4_names.html#recursive-type-aliases

**Contents:**
- 4. Names, Declarations and Scopes¶
- 4.1. Names¶
- 4.2. Declarations¶
- 4.3. Distinguishable Declarations¶
- 4.4. Scopes¶
- 4.5. Type Declarations¶
- 4.6. Type Alias Declaration¶
  - 4.6.1. Recursive Type Aliases¶
- 4.7. Variable and Constant Declarations¶
  - 4.7.1. Variable Declarations¶

This chapter introduces the following three mutually-related notions:

Each entity in an ArkTS program—a variable, a constant, a class, a type, a function, a method, etc.—is introduced via a declaration. An entity declaration assigns a name to the entity declared. The name is used to refer to the entity further in the program text.

Each declaration is valid (i.e., available and known) only within its scope. Scope is the region of the program text where the entity is declared and can be referred to by its simple (unqualified) name (see Scopes for more details).

A name refers to any declared entity.

Simple names consist of a single identifier. Qualified names consist of a sequence of identifiers with the ‘.’ tokens as separators:

In a qualified name N.x (where N is a simple name, and x is an identifier that can follow a sequence of identifiers separated with ‘.’ tokens), N can name the following:

The name of a compilation unit (see Compilation Units, Packages, and Modules) introduced as a result of import * as N (see Bind All with Qualified Access) with x to name the exported entity;

A class or interface type (see Classes, Interfaces) with x to name its static member;

A variable of a class or interface type with x to name its member.

A declaration introduces a named entity in an appropriate declaration scope (see Scopes).

Each declaration in the declaration scope must be distinguishable. A compile-time error occurs otherwise.

Declarations are distinguishable if:

They have different names.

They are distinguishable by signatures (see Declaration Distinguishable by Signatures).

The examples below are declarations distinguishable by names:

If a declaration is indistinguishable by name, then a compile-time error occurs:

The scope of a name is the region of program code within which the entity declared by that name can be referred to without having the name qualified. It means that a name is accessible in some context if it can be used in this context by its simple name.

The nature of scope usage depends on the kind of the name. A type name is used to declare variables or constants. A function name is used to call that function.

The scope of a name depends on the context the name is declared in:

A name declared on the package level (package level scope) is accessible throughout the entire package. The name can be accessed in other packages if exported.

Module level scope is applicable for separate modules only. A name declared on the module leve

*[Content truncated]*

**Examples:**

Example 1 (unknown):
```unknown
qualifiedName:
  Identifier ('.' Identifier )*
  ;
```

Example 2 (unknown):
```unknown
import * as N
```

Example 3 (javascript):
```javascript
1 const PI = 3.14
 2 const pi = 3
 3 function Pi() {}
 4 type IP = number[]
 5 class A {
 6     static method() {}
 7     method() {}
 8     field: number = PI
 9     static field: number = PI + pi
10 }
```

Example 4 (javascript):
```javascript
1 // The constant and the function have the same name.
 2 const PI = 3.14                   // compile-time error
 3 function PI() { return 3.14 }     // compile-time error
 4
 5 // The type and the variable have the same name.
 6 class P type Person = P           // compile-time error
 7 let Person: Person                // compile-time error
 8
 9 // The field and the method have the same name.
10 class C {
11     counter: number               // compile-time error
12     counter(): number {           // compile-time error
13       return this.counter
14     }
15 }
```

---

## 4. Names, Declarations and Scopes¶

**URL:** https://yoyocat.github.io/ArkTSSpec/4_names.html#type-compatibility-with-initializer

**Contents:**
- 4. Names, Declarations and Scopes¶
- 4.1. Names¶
- 4.2. Declarations¶
- 4.3. Distinguishable Declarations¶
- 4.4. Scopes¶
- 4.5. Type Declarations¶
- 4.6. Type Alias Declaration¶
  - 4.6.1. Recursive Type Aliases¶
- 4.7. Variable and Constant Declarations¶
  - 4.7.1. Variable Declarations¶

This chapter introduces the following three mutually-related notions:

Each entity in an ArkTS program—a variable, a constant, a class, a type, a function, a method, etc.—is introduced via a declaration. An entity declaration assigns a name to the entity declared. The name is used to refer to the entity further in the program text.

Each declaration is valid (i.e., available and known) only within its scope. Scope is the region of the program text where the entity is declared and can be referred to by its simple (unqualified) name (see Scopes for more details).

A name refers to any declared entity.

Simple names consist of a single identifier. Qualified names consist of a sequence of identifiers with the ‘.’ tokens as separators:

In a qualified name N.x (where N is a simple name, and x is an identifier that can follow a sequence of identifiers separated with ‘.’ tokens), N can name the following:

The name of a compilation unit (see Compilation Units, Packages, and Modules) introduced as a result of import * as N (see Bind All with Qualified Access) with x to name the exported entity;

A class or interface type (see Classes, Interfaces) with x to name its static member;

A variable of a class or interface type with x to name its member.

A declaration introduces a named entity in an appropriate declaration scope (see Scopes).

Each declaration in the declaration scope must be distinguishable. A compile-time error occurs otherwise.

Declarations are distinguishable if:

They have different names.

They are distinguishable by signatures (see Declaration Distinguishable by Signatures).

The examples below are declarations distinguishable by names:

If a declaration is indistinguishable by name, then a compile-time error occurs:

The scope of a name is the region of program code within which the entity declared by that name can be referred to without having the name qualified. It means that a name is accessible in some context if it can be used in this context by its simple name.

The nature of scope usage depends on the kind of the name. A type name is used to declare variables or constants. A function name is used to call that function.

The scope of a name depends on the context the name is declared in:

A name declared on the package level (package level scope) is accessible throughout the entire package. The name can be accessed in other packages if exported.

Module level scope is applicable for separate modules only. A name declared on the module leve

*[Content truncated]*

**Examples:**

Example 1 (unknown):
```unknown
qualifiedName:
  Identifier ('.' Identifier )*
  ;
```

Example 2 (unknown):
```unknown
import * as N
```

Example 3 (javascript):
```javascript
1 const PI = 3.14
 2 const pi = 3
 3 function Pi() {}
 4 type IP = number[]
 5 class A {
 6     static method() {}
 7     method() {}
 8     field: number = PI
 9     static field: number = PI + pi
10 }
```

Example 4 (javascript):
```javascript
1 // The constant and the function have the same name.
 2 const PI = 3.14                   // compile-time error
 3 function PI() { return 3.14 }     // compile-time error
 4
 5 // The type and the variable have the same name.
 6 class P type Person = P           // compile-time error
 7 let Person: Person                // compile-time error
 8
 9 // The field and the method have the same name.
10 class C {
11     counter: number               // compile-time error
12     counter(): number {           // compile-time error
13       return this.counter
14     }
15 }
```

---

## 4. Names, Declarations and Scopes¶

**URL:** https://yoyocat.github.io/ArkTSSpec/4_names.html#function-declarations

**Contents:**
- 4. Names, Declarations and Scopes¶
- 4.1. Names¶
- 4.2. Declarations¶
- 4.3. Distinguishable Declarations¶
- 4.4. Scopes¶
- 4.5. Type Declarations¶
- 4.6. Type Alias Declaration¶
  - 4.6.1. Recursive Type Aliases¶
- 4.7. Variable and Constant Declarations¶
  - 4.7.1. Variable Declarations¶

This chapter introduces the following three mutually-related notions:

Each entity in an ArkTS program—a variable, a constant, a class, a type, a function, a method, etc.—is introduced via a declaration. An entity declaration assigns a name to the entity declared. The name is used to refer to the entity further in the program text.

Each declaration is valid (i.e., available and known) only within its scope. Scope is the region of the program text where the entity is declared and can be referred to by its simple (unqualified) name (see Scopes for more details).

A name refers to any declared entity.

Simple names consist of a single identifier. Qualified names consist of a sequence of identifiers with the ‘.’ tokens as separators:

In a qualified name N.x (where N is a simple name, and x is an identifier that can follow a sequence of identifiers separated with ‘.’ tokens), N can name the following:

The name of a compilation unit (see Compilation Units, Packages, and Modules) introduced as a result of import * as N (see Bind All with Qualified Access) with x to name the exported entity;

A class or interface type (see Classes, Interfaces) with x to name its static member;

A variable of a class or interface type with x to name its member.

A declaration introduces a named entity in an appropriate declaration scope (see Scopes).

Each declaration in the declaration scope must be distinguishable. A compile-time error occurs otherwise.

Declarations are distinguishable if:

They have different names.

They are distinguishable by signatures (see Declaration Distinguishable by Signatures).

The examples below are declarations distinguishable by names:

If a declaration is indistinguishable by name, then a compile-time error occurs:

The scope of a name is the region of program code within which the entity declared by that name can be referred to without having the name qualified. It means that a name is accessible in some context if it can be used in this context by its simple name.

The nature of scope usage depends on the kind of the name. A type name is used to declare variables or constants. A function name is used to call that function.

The scope of a name depends on the context the name is declared in:

A name declared on the package level (package level scope) is accessible throughout the entire package. The name can be accessed in other packages if exported.

Module level scope is applicable for separate modules only. A name declared on the module leve

*[Content truncated]*

**Examples:**

Example 1 (unknown):
```unknown
qualifiedName:
  Identifier ('.' Identifier )*
  ;
```

Example 2 (unknown):
```unknown
import * as N
```

Example 3 (javascript):
```javascript
1 const PI = 3.14
 2 const pi = 3
 3 function Pi() {}
 4 type IP = number[]
 5 class A {
 6     static method() {}
 7     method() {}
 8     field: number = PI
 9     static field: number = PI + pi
10 }
```

Example 4 (javascript):
```javascript
1 // The constant and the function have the same name.
 2 const PI = 3.14                   // compile-time error
 3 function PI() { return 3.14 }     // compile-time error
 4
 5 // The type and the variable have the same name.
 6 class P type Person = P           // compile-time error
 7 let Person: Person                // compile-time error
 8
 9 // The field and the method have the same name.
10 class C {
11     counter: number               // compile-time error
12     counter(): number {           // compile-time error
13       return this.counter
14     }
15 }
```

---

## 4. Names, Declarations and Scopes¶

**URL:** https://yoyocat.github.io/ArkTSSpec/4_names.html#signatures

**Contents:**
- 4. Names, Declarations and Scopes¶
- 4.1. Names¶
- 4.2. Declarations¶
- 4.3. Distinguishable Declarations¶
- 4.4. Scopes¶
- 4.5. Type Declarations¶
- 4.6. Type Alias Declaration¶
  - 4.6.1. Recursive Type Aliases¶
- 4.7. Variable and Constant Declarations¶
  - 4.7.1. Variable Declarations¶

This chapter introduces the following three mutually-related notions:

Each entity in an ArkTS program—a variable, a constant, a class, a type, a function, a method, etc.—is introduced via a declaration. An entity declaration assigns a name to the entity declared. The name is used to refer to the entity further in the program text.

Each declaration is valid (i.e., available and known) only within its scope. Scope is the region of the program text where the entity is declared and can be referred to by its simple (unqualified) name (see Scopes for more details).

A name refers to any declared entity.

Simple names consist of a single identifier. Qualified names consist of a sequence of identifiers with the ‘.’ tokens as separators:

In a qualified name N.x (where N is a simple name, and x is an identifier that can follow a sequence of identifiers separated with ‘.’ tokens), N can name the following:

The name of a compilation unit (see Compilation Units, Packages, and Modules) introduced as a result of import * as N (see Bind All with Qualified Access) with x to name the exported entity;

A class or interface type (see Classes, Interfaces) with x to name its static member;

A variable of a class or interface type with x to name its member.

A declaration introduces a named entity in an appropriate declaration scope (see Scopes).

Each declaration in the declaration scope must be distinguishable. A compile-time error occurs otherwise.

Declarations are distinguishable if:

They have different names.

They are distinguishable by signatures (see Declaration Distinguishable by Signatures).

The examples below are declarations distinguishable by names:

If a declaration is indistinguishable by name, then a compile-time error occurs:

The scope of a name is the region of program code within which the entity declared by that name can be referred to without having the name qualified. It means that a name is accessible in some context if it can be used in this context by its simple name.

The nature of scope usage depends on the kind of the name. A type name is used to declare variables or constants. A function name is used to call that function.

The scope of a name depends on the context the name is declared in:

A name declared on the package level (package level scope) is accessible throughout the entire package. The name can be accessed in other packages if exported.

Module level scope is applicable for separate modules only. A name declared on the module leve

*[Content truncated]*

**Examples:**

Example 1 (unknown):
```unknown
qualifiedName:
  Identifier ('.' Identifier )*
  ;
```

Example 2 (unknown):
```unknown
import * as N
```

Example 3 (javascript):
```javascript
1 const PI = 3.14
 2 const pi = 3
 3 function Pi() {}
 4 type IP = number[]
 5 class A {
 6     static method() {}
 7     method() {}
 8     field: number = PI
 9     static field: number = PI + pi
10 }
```

Example 4 (javascript):
```javascript
1 // The constant and the function have the same name.
 2 const PI = 3.14                   // compile-time error
 3 function PI() { return 3.14 }     // compile-time error
 4
 5 // The type and the variable have the same name.
 6 class P type Person = P           // compile-time error
 7 let Person: Person                // compile-time error
 8
 9 // The field and the method have the same name.
10 class C {
11     counter: number               // compile-time error
12     counter(): number {           // compile-time error
13       return this.counter
14     }
15 }
```

---
