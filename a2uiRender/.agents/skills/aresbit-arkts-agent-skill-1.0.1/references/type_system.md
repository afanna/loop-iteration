# Arkts - Type System

**Pages:** 39

---

## 3. Types¶

**URL:** https://yoyocat.github.io/ArkTSSpec/3_types.html#object-class-type

**Contents:**
- 3. Types¶
- 3.1. Predefined Types¶
- 3.2. User-Defined Types¶
- 3.3. Types by Category¶
- 3.4. Using Types¶
- 3.5. Named Types¶
- 3.6. Type References¶
- 3.7. Value Types¶
  - 3.7.1. Integer Types and Operations¶
  - 3.7.2. Floating-Point Types and Operations¶

This chapter introduces the notion of type that is one of the fundamental concepts of ArkTS and other programming languages. Type classification as accepted in ArkTS is discussed below—along with all aspects of using types in programs written in the language.

Conventionally, the type of an entity is defined as the set of values the entity can take, and the set of operators applicable to the entity of a given type.

ArkTS is a statically typed language. It means that the type of every declared entity and every expression is known at compile time. The type of an entity is either set explicitly by a developer, or inferred implicitly by the compiler.

There are two categories of types:

The types integral to ArkTS are called predefined types (see Predefined Types).

The types introduced, declared, and defined by a developer are called user-defined types. All user-defined types must always have a complete type definition presented as source code in ArkTS.

Predefined types include the following:

Basic numeric value type: number

High-performance value types:

Numeric types: byte, short, int, long, float, and double;

Character type: char;

Boolean type: boolean;

Reference types: object, string, [] (array), bigint, void, never, and undefined;

Class types: Object, String, Array<T>, and BigInt.

Each predefined value type has a corresponding predefined class type that wraps the value of the predefined value type: Number, Byte, Short, Int, Long, Float, Double, Char, and Boolean.

The predefined value types are called primitive types. Primitive type names are reserved, i.e., they cannot be used for user-defined type names.

Type double is an alias to number. Type Double is an alias to Number.

User-defined types include the following:

Class types (see Classes);

Interface types (see Interfaces);

Enumeration types (see Enumerations);

Array types (see Array Types);

Function types (see Function Types);

Tuple types (see Tuple Types);

Union types (see Union Types); and

Type parameters (see Generic Parameters).

All ArkTS types are summarized in the following table:

Value Types (Primitive Types)

number, byte, short, int, long, float, double, char, boolean

Number, Byte, Short, Int, Long, Float, Double, Char, Boolean, Object, object, void, null, String, string, BigInt, bigint, never

class types, interface types, array types, function types, tuple types, union types, type parameters

A type can be referred to in source code by the following:

A reserved name f

*[Content truncated]*

**Examples:**

Example 1 (unknown):
```unknown
type:
    predefinedType
    | typeReference
    | arrayType
    | tupleType
    | functionType
    | unionType
    | keyofType
    | '(' type ')'
    ;
```

Example 2 (javascript):
```javascript
1 let b: boolean  // using primitive value type name
2 let n: number   // using primitive value type name
3 let o: Object   // using predefined class type name
4 let a: number[] // using array type
```

Example 3 (javascript):
```javascript
1 // a nullable array with elements of type string:
 2 let a: string[] | null
 3 let s: string[] = []
 4 a = s    // ok
 5 a = null // ok, a is nullable
 6
 7 // an array with elements whose types are string or null:
 8 let b: (string | null)[]
 9 b = null // error, b is an array and is not nullable
10 b = ["aa", null] // ok
11
12 // a function type that returns string or null
13 let c: () => string | null
14 c = null // error, c is not nullable
15 c = (): string | null => { return null } // ok
16
17 // (a function type that returns string) or null
18 let d: (() => string) | null
19 d = null /
...
```

Example 4 (unknown):
```unknown
typeReference:
    typeReferencePart ('.' typeReferencePart)*
    |  Identifier '!'
    ;

typeReferencePart:
    Identifier typeArguments?
    ;
```

---

## 3. Types¶

**URL:** https://yoyocat.github.io/ArkTSSpec/3_types.html#using-types

**Contents:**
- 3. Types¶
- 3.1. Predefined Types¶
- 3.2. User-Defined Types¶
- 3.3. Types by Category¶
- 3.4. Using Types¶
- 3.5. Named Types¶
- 3.6. Type References¶
- 3.7. Value Types¶
  - 3.7.1. Integer Types and Operations¶
  - 3.7.2. Floating-Point Types and Operations¶

This chapter introduces the notion of type that is one of the fundamental concepts of ArkTS and other programming languages. Type classification as accepted in ArkTS is discussed below—along with all aspects of using types in programs written in the language.

Conventionally, the type of an entity is defined as the set of values the entity can take, and the set of operators applicable to the entity of a given type.

ArkTS is a statically typed language. It means that the type of every declared entity and every expression is known at compile time. The type of an entity is either set explicitly by a developer, or inferred implicitly by the compiler.

There are two categories of types:

The types integral to ArkTS are called predefined types (see Predefined Types).

The types introduced, declared, and defined by a developer are called user-defined types. All user-defined types must always have a complete type definition presented as source code in ArkTS.

Predefined types include the following:

Basic numeric value type: number

High-performance value types:

Numeric types: byte, short, int, long, float, and double;

Character type: char;

Boolean type: boolean;

Reference types: object, string, [] (array), bigint, void, never, and undefined;

Class types: Object, String, Array<T>, and BigInt.

Each predefined value type has a corresponding predefined class type that wraps the value of the predefined value type: Number, Byte, Short, Int, Long, Float, Double, Char, and Boolean.

The predefined value types are called primitive types. Primitive type names are reserved, i.e., they cannot be used for user-defined type names.

Type double is an alias to number. Type Double is an alias to Number.

User-defined types include the following:

Class types (see Classes);

Interface types (see Interfaces);

Enumeration types (see Enumerations);

Array types (see Array Types);

Function types (see Function Types);

Tuple types (see Tuple Types);

Union types (see Union Types); and

Type parameters (see Generic Parameters).

All ArkTS types are summarized in the following table:

Value Types (Primitive Types)

number, byte, short, int, long, float, double, char, boolean

Number, Byte, Short, Int, Long, Float, Double, Char, Boolean, Object, object, void, null, String, string, BigInt, bigint, never

class types, interface types, array types, function types, tuple types, union types, type parameters

A type can be referred to in source code by the following:

A reserved name f

*[Content truncated]*

**Examples:**

Example 1 (unknown):
```unknown
type:
    predefinedType
    | typeReference
    | arrayType
    | tupleType
    | functionType
    | unionType
    | keyofType
    | '(' type ')'
    ;
```

Example 2 (javascript):
```javascript
1 let b: boolean  // using primitive value type name
2 let n: number   // using primitive value type name
3 let o: Object   // using predefined class type name
4 let a: number[] // using array type
```

Example 3 (javascript):
```javascript
1 // a nullable array with elements of type string:
 2 let a: string[] | null
 3 let s: string[] = []
 4 a = s    // ok
 5 a = null // ok, a is nullable
 6
 7 // an array with elements whose types are string or null:
 8 let b: (string | null)[]
 9 b = null // error, b is an array and is not nullable
10 b = ["aa", null] // ok
11
12 // a function type that returns string or null
13 let c: () => string | null
14 c = null // error, c is not nullable
15 c = (): string | null => { return null } // ok
16
17 // (a function type that returns string) or null
18 let d: (() => string) | null
19 d = null /
...
```

Example 4 (unknown):
```unknown
typeReference:
    typeReferencePart ('.' typeReferencePart)*
    |  Identifier '!'
    ;

typeReferencePart:
    Identifier typeArguments?
    ;
```

---

## 3. Types¶

**URL:** https://yoyocat.github.io/ArkTSSpec/3_types.html#undefined-type

**Contents:**
- 3. Types¶
- 3.1. Predefined Types¶
- 3.2. User-Defined Types¶
- 3.3. Types by Category¶
- 3.4. Using Types¶
- 3.5. Named Types¶
- 3.6. Type References¶
- 3.7. Value Types¶
  - 3.7.1. Integer Types and Operations¶
  - 3.7.2. Floating-Point Types and Operations¶

This chapter introduces the notion of type that is one of the fundamental concepts of ArkTS and other programming languages. Type classification as accepted in ArkTS is discussed below—along with all aspects of using types in programs written in the language.

Conventionally, the type of an entity is defined as the set of values the entity can take, and the set of operators applicable to the entity of a given type.

ArkTS is a statically typed language. It means that the type of every declared entity and every expression is known at compile time. The type of an entity is either set explicitly by a developer, or inferred implicitly by the compiler.

There are two categories of types:

The types integral to ArkTS are called predefined types (see Predefined Types).

The types introduced, declared, and defined by a developer are called user-defined types. All user-defined types must always have a complete type definition presented as source code in ArkTS.

Predefined types include the following:

Basic numeric value type: number

High-performance value types:

Numeric types: byte, short, int, long, float, and double;

Character type: char;

Boolean type: boolean;

Reference types: object, string, [] (array), bigint, void, never, and undefined;

Class types: Object, String, Array<T>, and BigInt.

Each predefined value type has a corresponding predefined class type that wraps the value of the predefined value type: Number, Byte, Short, Int, Long, Float, Double, Char, and Boolean.

The predefined value types are called primitive types. Primitive type names are reserved, i.e., they cannot be used for user-defined type names.

Type double is an alias to number. Type Double is an alias to Number.

User-defined types include the following:

Class types (see Classes);

Interface types (see Interfaces);

Enumeration types (see Enumerations);

Array types (see Array Types);

Function types (see Function Types);

Tuple types (see Tuple Types);

Union types (see Union Types); and

Type parameters (see Generic Parameters).

All ArkTS types are summarized in the following table:

Value Types (Primitive Types)

number, byte, short, int, long, float, double, char, boolean

Number, Byte, Short, Int, Long, Float, Double, Char, Boolean, Object, object, void, null, String, string, BigInt, bigint, never

class types, interface types, array types, function types, tuple types, union types, type parameters

A type can be referred to in source code by the following:

A reserved name f

*[Content truncated]*

**Examples:**

Example 1 (unknown):
```unknown
type:
    predefinedType
    | typeReference
    | arrayType
    | tupleType
    | functionType
    | unionType
    | keyofType
    | '(' type ')'
    ;
```

Example 2 (javascript):
```javascript
1 let b: boolean  // using primitive value type name
2 let n: number   // using primitive value type name
3 let o: Object   // using predefined class type name
4 let a: number[] // using array type
```

Example 3 (javascript):
```javascript
1 // a nullable array with elements of type string:
 2 let a: string[] | null
 3 let s: string[] = []
 4 a = s    // ok
 5 a = null // ok, a is nullable
 6
 7 // an array with elements whose types are string or null:
 8 let b: (string | null)[]
 9 b = null // error, b is an array and is not nullable
10 b = ["aa", null] // ok
11
12 // a function type that returns string or null
13 let c: () => string | null
14 c = null // error, c is not nullable
15 c = (): string | null => { return null } // ok
16
17 // (a function type that returns string) or null
18 let d: (() => string) | null
19 d = null /
...
```

Example 4 (unknown):
```unknown
typeReference:
    typeReferencePart ('.' typeReferencePart)*
    |  Identifier '!'
    ;

typeReferencePart:
    Identifier typeArguments?
    ;
```

---

## 3. Types¶

**URL:** https://yoyocat.github.io/ArkTSSpec/3_types.html#type-references

**Contents:**
- 3. Types¶
- 3.1. Predefined Types¶
- 3.2. User-Defined Types¶
- 3.3. Types by Category¶
- 3.4. Using Types¶
- 3.5. Named Types¶
- 3.6. Type References¶
- 3.7. Value Types¶
  - 3.7.1. Integer Types and Operations¶
  - 3.7.2. Floating-Point Types and Operations¶

This chapter introduces the notion of type that is one of the fundamental concepts of ArkTS and other programming languages. Type classification as accepted in ArkTS is discussed below—along with all aspects of using types in programs written in the language.

Conventionally, the type of an entity is defined as the set of values the entity can take, and the set of operators applicable to the entity of a given type.

ArkTS is a statically typed language. It means that the type of every declared entity and every expression is known at compile time. The type of an entity is either set explicitly by a developer, or inferred implicitly by the compiler.

There are two categories of types:

The types integral to ArkTS are called predefined types (see Predefined Types).

The types introduced, declared, and defined by a developer are called user-defined types. All user-defined types must always have a complete type definition presented as source code in ArkTS.

Predefined types include the following:

Basic numeric value type: number

High-performance value types:

Numeric types: byte, short, int, long, float, and double;

Character type: char;

Boolean type: boolean;

Reference types: object, string, [] (array), bigint, void, never, and undefined;

Class types: Object, String, Array<T>, and BigInt.

Each predefined value type has a corresponding predefined class type that wraps the value of the predefined value type: Number, Byte, Short, Int, Long, Float, Double, Char, and Boolean.

The predefined value types are called primitive types. Primitive type names are reserved, i.e., they cannot be used for user-defined type names.

Type double is an alias to number. Type Double is an alias to Number.

User-defined types include the following:

Class types (see Classes);

Interface types (see Interfaces);

Enumeration types (see Enumerations);

Array types (see Array Types);

Function types (see Function Types);

Tuple types (see Tuple Types);

Union types (see Union Types); and

Type parameters (see Generic Parameters).

All ArkTS types are summarized in the following table:

Value Types (Primitive Types)

number, byte, short, int, long, float, double, char, boolean

Number, Byte, Short, Int, Long, Float, Double, Char, Boolean, Object, object, void, null, String, string, BigInt, bigint, never

class types, interface types, array types, function types, tuple types, union types, type parameters

A type can be referred to in source code by the following:

A reserved name f

*[Content truncated]*

**Examples:**

Example 1 (unknown):
```unknown
type:
    predefinedType
    | typeReference
    | arrayType
    | tupleType
    | functionType
    | unionType
    | keyofType
    | '(' type ')'
    ;
```

Example 2 (javascript):
```javascript
1 let b: boolean  // using primitive value type name
2 let n: number   // using primitive value type name
3 let o: Object   // using predefined class type name
4 let a: number[] // using array type
```

Example 3 (javascript):
```javascript
1 // a nullable array with elements of type string:
 2 let a: string[] | null
 3 let s: string[] = []
 4 a = s    // ok
 5 a = null // ok, a is nullable
 6
 7 // an array with elements whose types are string or null:
 8 let b: (string | null)[]
 9 b = null // error, b is an array and is not nullable
10 b = ["aa", null] // ok
11
12 // a function type that returns string or null
13 let c: () => string | null
14 c = null // error, c is not nullable
15 c = (): string | null => { return null } // ok
16
17 // (a function type that returns string) or null
18 let d: (() => string) | null
19 d = null /
...
```

Example 4 (unknown):
```unknown
typeReference:
    typeReferencePart ('.' typeReferencePart)*
    |  Identifier '!'
    ;

typeReferencePart:
    Identifier typeArguments?
    ;
```

---

## 3. Types¶

**URL:** https://yoyocat.github.io/ArkTSSpec/3_types.html#user-defined-types

**Contents:**
- 3. Types¶
- 3.1. Predefined Types¶
- 3.2. User-Defined Types¶
- 3.3. Types by Category¶
- 3.4. Using Types¶
- 3.5. Named Types¶
- 3.6. Type References¶
- 3.7. Value Types¶
  - 3.7.1. Integer Types and Operations¶
  - 3.7.2. Floating-Point Types and Operations¶

This chapter introduces the notion of type that is one of the fundamental concepts of ArkTS and other programming languages. Type classification as accepted in ArkTS is discussed below—along with all aspects of using types in programs written in the language.

Conventionally, the type of an entity is defined as the set of values the entity can take, and the set of operators applicable to the entity of a given type.

ArkTS is a statically typed language. It means that the type of every declared entity and every expression is known at compile time. The type of an entity is either set explicitly by a developer, or inferred implicitly by the compiler.

There are two categories of types:

The types integral to ArkTS are called predefined types (see Predefined Types).

The types introduced, declared, and defined by a developer are called user-defined types. All user-defined types must always have a complete type definition presented as source code in ArkTS.

Predefined types include the following:

Basic numeric value type: number

High-performance value types:

Numeric types: byte, short, int, long, float, and double;

Character type: char;

Boolean type: boolean;

Reference types: object, string, [] (array), bigint, void, never, and undefined;

Class types: Object, String, Array<T>, and BigInt.

Each predefined value type has a corresponding predefined class type that wraps the value of the predefined value type: Number, Byte, Short, Int, Long, Float, Double, Char, and Boolean.

The predefined value types are called primitive types. Primitive type names are reserved, i.e., they cannot be used for user-defined type names.

Type double is an alias to number. Type Double is an alias to Number.

User-defined types include the following:

Class types (see Classes);

Interface types (see Interfaces);

Enumeration types (see Enumerations);

Array types (see Array Types);

Function types (see Function Types);

Tuple types (see Tuple Types);

Union types (see Union Types); and

Type parameters (see Generic Parameters).

All ArkTS types are summarized in the following table:

Value Types (Primitive Types)

number, byte, short, int, long, float, double, char, boolean

Number, Byte, Short, Int, Long, Float, Double, Char, Boolean, Object, object, void, null, String, string, BigInt, bigint, never

class types, interface types, array types, function types, tuple types, union types, type parameters

A type can be referred to in source code by the following:

A reserved name f

*[Content truncated]*

**Examples:**

Example 1 (unknown):
```unknown
type:
    predefinedType
    | typeReference
    | arrayType
    | tupleType
    | functionType
    | unionType
    | keyofType
    | '(' type ')'
    ;
```

Example 2 (javascript):
```javascript
1 let b: boolean  // using primitive value type name
2 let n: number   // using primitive value type name
3 let o: Object   // using predefined class type name
4 let a: number[] // using array type
```

Example 3 (javascript):
```javascript
1 // a nullable array with elements of type string:
 2 let a: string[] | null
 3 let s: string[] = []
 4 a = s    // ok
 5 a = null // ok, a is nullable
 6
 7 // an array with elements whose types are string or null:
 8 let b: (string | null)[]
 9 b = null // error, b is an array and is not nullable
10 b = ["aa", null] // ok
11
12 // a function type that returns string or null
13 let c: () => string | null
14 c = null // error, c is not nullable
15 c = (): string | null => { return null } // ok
16
17 // (a function type that returns string) or null
18 let d: (() => string) | null
19 d = null /
...
```

Example 4 (unknown):
```unknown
typeReference:
    typeReferencePart ('.' typeReferencePart)*
    |  Identifier '!'
    ;

typeReferencePart:
    Identifier typeArguments?
    ;
```

---

## 3. Types¶

**URL:** https://yoyocat.github.io/ArkTSSpec/3_types.html#named-types

**Contents:**
- 3. Types¶
- 3.1. Predefined Types¶
- 3.2. User-Defined Types¶
- 3.3. Types by Category¶
- 3.4. Using Types¶
- 3.5. Named Types¶
- 3.6. Type References¶
- 3.7. Value Types¶
  - 3.7.1. Integer Types and Operations¶
  - 3.7.2. Floating-Point Types and Operations¶

This chapter introduces the notion of type that is one of the fundamental concepts of ArkTS and other programming languages. Type classification as accepted in ArkTS is discussed below—along with all aspects of using types in programs written in the language.

Conventionally, the type of an entity is defined as the set of values the entity can take, and the set of operators applicable to the entity of a given type.

ArkTS is a statically typed language. It means that the type of every declared entity and every expression is known at compile time. The type of an entity is either set explicitly by a developer, or inferred implicitly by the compiler.

There are two categories of types:

The types integral to ArkTS are called predefined types (see Predefined Types).

The types introduced, declared, and defined by a developer are called user-defined types. All user-defined types must always have a complete type definition presented as source code in ArkTS.

Predefined types include the following:

Basic numeric value type: number

High-performance value types:

Numeric types: byte, short, int, long, float, and double;

Character type: char;

Boolean type: boolean;

Reference types: object, string, [] (array), bigint, void, never, and undefined;

Class types: Object, String, Array<T>, and BigInt.

Each predefined value type has a corresponding predefined class type that wraps the value of the predefined value type: Number, Byte, Short, Int, Long, Float, Double, Char, and Boolean.

The predefined value types are called primitive types. Primitive type names are reserved, i.e., they cannot be used for user-defined type names.

Type double is an alias to number. Type Double is an alias to Number.

User-defined types include the following:

Class types (see Classes);

Interface types (see Interfaces);

Enumeration types (see Enumerations);

Array types (see Array Types);

Function types (see Function Types);

Tuple types (see Tuple Types);

Union types (see Union Types); and

Type parameters (see Generic Parameters).

All ArkTS types are summarized in the following table:

Value Types (Primitive Types)

number, byte, short, int, long, float, double, char, boolean

Number, Byte, Short, Int, Long, Float, Double, Char, Boolean, Object, object, void, null, String, string, BigInt, bigint, never

class types, interface types, array types, function types, tuple types, union types, type parameters

A type can be referred to in source code by the following:

A reserved name f

*[Content truncated]*

**Examples:**

Example 1 (unknown):
```unknown
type:
    predefinedType
    | typeReference
    | arrayType
    | tupleType
    | functionType
    | unionType
    | keyofType
    | '(' type ')'
    ;
```

Example 2 (javascript):
```javascript
1 let b: boolean  // using primitive value type name
2 let n: number   // using primitive value type name
3 let o: Object   // using predefined class type name
4 let a: number[] // using array type
```

Example 3 (javascript):
```javascript
1 // a nullable array with elements of type string:
 2 let a: string[] | null
 3 let s: string[] = []
 4 a = s    // ok
 5 a = null // ok, a is nullable
 6
 7 // an array with elements whose types are string or null:
 8 let b: (string | null)[]
 9 b = null // error, b is an array and is not nullable
10 b = ["aa", null] // ok
11
12 // a function type that returns string or null
13 let c: () => string | null
14 c = null // error, c is not nullable
15 c = (): string | null => { return null } // ok
16
17 // (a function type that returns string) or null
18 let d: (() => string) | null
19 d = null /
...
```

Example 4 (unknown):
```unknown
typeReference:
    typeReferencePart ('.' typeReferencePart)*
    |  Identifier '!'
    ;

typeReferencePart:
    Identifier typeArguments?
    ;
```

---

## 3. Types¶

**URL:** https://yoyocat.github.io/ArkTSSpec/3_types.html#floating-point-types-and-operations

**Contents:**
- 3. Types¶
- 3.1. Predefined Types¶
- 3.2. User-Defined Types¶
- 3.3. Types by Category¶
- 3.4. Using Types¶
- 3.5. Named Types¶
- 3.6. Type References¶
- 3.7. Value Types¶
  - 3.7.1. Integer Types and Operations¶
  - 3.7.2. Floating-Point Types and Operations¶

This chapter introduces the notion of type that is one of the fundamental concepts of ArkTS and other programming languages. Type classification as accepted in ArkTS is discussed below—along with all aspects of using types in programs written in the language.

Conventionally, the type of an entity is defined as the set of values the entity can take, and the set of operators applicable to the entity of a given type.

ArkTS is a statically typed language. It means that the type of every declared entity and every expression is known at compile time. The type of an entity is either set explicitly by a developer, or inferred implicitly by the compiler.

There are two categories of types:

The types integral to ArkTS are called predefined types (see Predefined Types).

The types introduced, declared, and defined by a developer are called user-defined types. All user-defined types must always have a complete type definition presented as source code in ArkTS.

Predefined types include the following:

Basic numeric value type: number

High-performance value types:

Numeric types: byte, short, int, long, float, and double;

Character type: char;

Boolean type: boolean;

Reference types: object, string, [] (array), bigint, void, never, and undefined;

Class types: Object, String, Array<T>, and BigInt.

Each predefined value type has a corresponding predefined class type that wraps the value of the predefined value type: Number, Byte, Short, Int, Long, Float, Double, Char, and Boolean.

The predefined value types are called primitive types. Primitive type names are reserved, i.e., they cannot be used for user-defined type names.

Type double is an alias to number. Type Double is an alias to Number.

User-defined types include the following:

Class types (see Classes);

Interface types (see Interfaces);

Enumeration types (see Enumerations);

Array types (see Array Types);

Function types (see Function Types);

Tuple types (see Tuple Types);

Union types (see Union Types); and

Type parameters (see Generic Parameters).

All ArkTS types are summarized in the following table:

Value Types (Primitive Types)

number, byte, short, int, long, float, double, char, boolean

Number, Byte, Short, Int, Long, Float, Double, Char, Boolean, Object, object, void, null, String, string, BigInt, bigint, never

class types, interface types, array types, function types, tuple types, union types, type parameters

A type can be referred to in source code by the following:

A reserved name f

*[Content truncated]*

**Examples:**

Example 1 (unknown):
```unknown
type:
    predefinedType
    | typeReference
    | arrayType
    | tupleType
    | functionType
    | unionType
    | keyofType
    | '(' type ')'
    ;
```

Example 2 (javascript):
```javascript
1 let b: boolean  // using primitive value type name
2 let n: number   // using primitive value type name
3 let o: Object   // using predefined class type name
4 let a: number[] // using array type
```

Example 3 (javascript):
```javascript
1 // a nullable array with elements of type string:
 2 let a: string[] | null
 3 let s: string[] = []
 4 a = s    // ok
 5 a = null // ok, a is nullable
 6
 7 // an array with elements whose types are string or null:
 8 let b: (string | null)[]
 9 b = null // error, b is an array and is not nullable
10 b = ["aa", null] // ok
11
12 // a function type that returns string or null
13 let c: () => string | null
14 c = null // error, c is not nullable
15 c = (): string | null => { return null } // ok
16
17 // (a function type that returns string) or null
18 let d: (() => string) | null
19 d = null /
...
```

Example 4 (unknown):
```unknown
typeReference:
    typeReferencePart ('.' typeReferencePart)*
    |  Identifier '!'
    ;

typeReferencePart:
    Identifier typeArguments?
    ;
```

---

## 3. Types¶

**URL:** https://yoyocat.github.io/ArkTSSpec/3_types.html#union-types

**Contents:**
- 3. Types¶
- 3.1. Predefined Types¶
- 3.2. User-Defined Types¶
- 3.3. Types by Category¶
- 3.4. Using Types¶
- 3.5. Named Types¶
- 3.6. Type References¶
- 3.7. Value Types¶
  - 3.7.1. Integer Types and Operations¶
  - 3.7.2. Floating-Point Types and Operations¶

This chapter introduces the notion of type that is one of the fundamental concepts of ArkTS and other programming languages. Type classification as accepted in ArkTS is discussed below—along with all aspects of using types in programs written in the language.

Conventionally, the type of an entity is defined as the set of values the entity can take, and the set of operators applicable to the entity of a given type.

ArkTS is a statically typed language. It means that the type of every declared entity and every expression is known at compile time. The type of an entity is either set explicitly by a developer, or inferred implicitly by the compiler.

There are two categories of types:

The types integral to ArkTS are called predefined types (see Predefined Types).

The types introduced, declared, and defined by a developer are called user-defined types. All user-defined types must always have a complete type definition presented as source code in ArkTS.

Predefined types include the following:

Basic numeric value type: number

High-performance value types:

Numeric types: byte, short, int, long, float, and double;

Character type: char;

Boolean type: boolean;

Reference types: object, string, [] (array), bigint, void, never, and undefined;

Class types: Object, String, Array<T>, and BigInt.

Each predefined value type has a corresponding predefined class type that wraps the value of the predefined value type: Number, Byte, Short, Int, Long, Float, Double, Char, and Boolean.

The predefined value types are called primitive types. Primitive type names are reserved, i.e., they cannot be used for user-defined type names.

Type double is an alias to number. Type Double is an alias to Number.

User-defined types include the following:

Class types (see Classes);

Interface types (see Interfaces);

Enumeration types (see Enumerations);

Array types (see Array Types);

Function types (see Function Types);

Tuple types (see Tuple Types);

Union types (see Union Types); and

Type parameters (see Generic Parameters).

All ArkTS types are summarized in the following table:

Value Types (Primitive Types)

number, byte, short, int, long, float, double, char, boolean

Number, Byte, Short, Int, Long, Float, Double, Char, Boolean, Object, object, void, null, String, string, BigInt, bigint, never

class types, interface types, array types, function types, tuple types, union types, type parameters

A type can be referred to in source code by the following:

A reserved name f

*[Content truncated]*

**Examples:**

Example 1 (unknown):
```unknown
type:
    predefinedType
    | typeReference
    | arrayType
    | tupleType
    | functionType
    | unionType
    | keyofType
    | '(' type ')'
    ;
```

Example 2 (javascript):
```javascript
1 let b: boolean  // using primitive value type name
2 let n: number   // using primitive value type name
3 let o: Object   // using predefined class type name
4 let a: number[] // using array type
```

Example 3 (javascript):
```javascript
1 // a nullable array with elements of type string:
 2 let a: string[] | null
 3 let s: string[] = []
 4 a = s    // ok
 5 a = null // ok, a is nullable
 6
 7 // an array with elements whose types are string or null:
 8 let b: (string | null)[]
 9 b = null // error, b is an array and is not nullable
10 b = ["aa", null] // ok
11
12 // a function type that returns string or null
13 let c: () => string | null
14 c = null // error, c is not nullable
15 c = (): string | null => { return null } // ok
16
17 // (a function type that returns string) or null
18 let d: (() => string) | null
19 d = null /
...
```

Example 4 (unknown):
```unknown
typeReference:
    typeReferencePart ('.' typeReferencePart)*
    |  Identifier '!'
    ;

typeReferencePart:
    Identifier typeArguments?
    ;
```

---

## 3. Types¶

**URL:** https://yoyocat.github.io/ArkTSSpec/3_types.html#default-values-for-types

**Contents:**
- 3. Types¶
- 3.1. Predefined Types¶
- 3.2. User-Defined Types¶
- 3.3. Types by Category¶
- 3.4. Using Types¶
- 3.5. Named Types¶
- 3.6. Type References¶
- 3.7. Value Types¶
  - 3.7.1. Integer Types and Operations¶
  - 3.7.2. Floating-Point Types and Operations¶

This chapter introduces the notion of type that is one of the fundamental concepts of ArkTS and other programming languages. Type classification as accepted in ArkTS is discussed below—along with all aspects of using types in programs written in the language.

Conventionally, the type of an entity is defined as the set of values the entity can take, and the set of operators applicable to the entity of a given type.

ArkTS is a statically typed language. It means that the type of every declared entity and every expression is known at compile time. The type of an entity is either set explicitly by a developer, or inferred implicitly by the compiler.

There are two categories of types:

The types integral to ArkTS are called predefined types (see Predefined Types).

The types introduced, declared, and defined by a developer are called user-defined types. All user-defined types must always have a complete type definition presented as source code in ArkTS.

Predefined types include the following:

Basic numeric value type: number

High-performance value types:

Numeric types: byte, short, int, long, float, and double;

Character type: char;

Boolean type: boolean;

Reference types: object, string, [] (array), bigint, void, never, and undefined;

Class types: Object, String, Array<T>, and BigInt.

Each predefined value type has a corresponding predefined class type that wraps the value of the predefined value type: Number, Byte, Short, Int, Long, Float, Double, Char, and Boolean.

The predefined value types are called primitive types. Primitive type names are reserved, i.e., they cannot be used for user-defined type names.

Type double is an alias to number. Type Double is an alias to Number.

User-defined types include the following:

Class types (see Classes);

Interface types (see Interfaces);

Enumeration types (see Enumerations);

Array types (see Array Types);

Function types (see Function Types);

Tuple types (see Tuple Types);

Union types (see Union Types); and

Type parameters (see Generic Parameters).

All ArkTS types are summarized in the following table:

Value Types (Primitive Types)

number, byte, short, int, long, float, double, char, boolean

Number, Byte, Short, Int, Long, Float, Double, Char, Boolean, Object, object, void, null, String, string, BigInt, bigint, never

class types, interface types, array types, function types, tuple types, union types, type parameters

A type can be referred to in source code by the following:

A reserved name f

*[Content truncated]*

**Examples:**

Example 1 (unknown):
```unknown
type:
    predefinedType
    | typeReference
    | arrayType
    | tupleType
    | functionType
    | unionType
    | keyofType
    | '(' type ')'
    ;
```

Example 2 (javascript):
```javascript
1 let b: boolean  // using primitive value type name
2 let n: number   // using primitive value type name
3 let o: Object   // using predefined class type name
4 let a: number[] // using array type
```

Example 3 (javascript):
```javascript
1 // a nullable array with elements of type string:
 2 let a: string[] | null
 3 let s: string[] = []
 4 a = s    // ok
 5 a = null // ok, a is nullable
 6
 7 // an array with elements whose types are string or null:
 8 let b: (string | null)[]
 9 b = null // error, b is an array and is not nullable
10 b = ["aa", null] // ok
11
12 // a function type that returns string or null
13 let c: () => string | null
14 c = null // error, c is not nullable
15 c = (): string | null => { return null } // ok
16
17 // (a function type that returns string) or null
18 let d: (() => string) | null
19 d = null /
...
```

Example 4 (unknown):
```unknown
typeReference:
    typeReferencePart ('.' typeReferencePart)*
    |  Identifier '!'
    ;

typeReferencePart:
    Identifier typeArguments?
    ;
```

---

## 3. Types¶

**URL:** https://yoyocat.github.io/ArkTSSpec/3_types.html#integer-types-and-operations

**Contents:**
- 3. Types¶
- 3.1. Predefined Types¶
- 3.2. User-Defined Types¶
- 3.3. Types by Category¶
- 3.4. Using Types¶
- 3.5. Named Types¶
- 3.6. Type References¶
- 3.7. Value Types¶
  - 3.7.1. Integer Types and Operations¶
  - 3.7.2. Floating-Point Types and Operations¶

This chapter introduces the notion of type that is one of the fundamental concepts of ArkTS and other programming languages. Type classification as accepted in ArkTS is discussed below—along with all aspects of using types in programs written in the language.

Conventionally, the type of an entity is defined as the set of values the entity can take, and the set of operators applicable to the entity of a given type.

ArkTS is a statically typed language. It means that the type of every declared entity and every expression is known at compile time. The type of an entity is either set explicitly by a developer, or inferred implicitly by the compiler.

There are two categories of types:

The types integral to ArkTS are called predefined types (see Predefined Types).

The types introduced, declared, and defined by a developer are called user-defined types. All user-defined types must always have a complete type definition presented as source code in ArkTS.

Predefined types include the following:

Basic numeric value type: number

High-performance value types:

Numeric types: byte, short, int, long, float, and double;

Character type: char;

Boolean type: boolean;

Reference types: object, string, [] (array), bigint, void, never, and undefined;

Class types: Object, String, Array<T>, and BigInt.

Each predefined value type has a corresponding predefined class type that wraps the value of the predefined value type: Number, Byte, Short, Int, Long, Float, Double, Char, and Boolean.

The predefined value types are called primitive types. Primitive type names are reserved, i.e., they cannot be used for user-defined type names.

Type double is an alias to number. Type Double is an alias to Number.

User-defined types include the following:

Class types (see Classes);

Interface types (see Interfaces);

Enumeration types (see Enumerations);

Array types (see Array Types);

Function types (see Function Types);

Tuple types (see Tuple Types);

Union types (see Union Types); and

Type parameters (see Generic Parameters).

All ArkTS types are summarized in the following table:

Value Types (Primitive Types)

number, byte, short, int, long, float, double, char, boolean

Number, Byte, Short, Int, Long, Float, Double, Char, Boolean, Object, object, void, null, String, string, BigInt, bigint, never

class types, interface types, array types, function types, tuple types, union types, type parameters

A type can be referred to in source code by the following:

A reserved name f

*[Content truncated]*

**Examples:**

Example 1 (unknown):
```unknown
type:
    predefinedType
    | typeReference
    | arrayType
    | tupleType
    | functionType
    | unionType
    | keyofType
    | '(' type ')'
    ;
```

Example 2 (javascript):
```javascript
1 let b: boolean  // using primitive value type name
2 let n: number   // using primitive value type name
3 let o: Object   // using predefined class type name
4 let a: number[] // using array type
```

Example 3 (javascript):
```javascript
1 // a nullable array with elements of type string:
 2 let a: string[] | null
 3 let s: string[] = []
 4 a = s    // ok
 5 a = null // ok, a is nullable
 6
 7 // an array with elements whose types are string or null:
 8 let b: (string | null)[]
 9 b = null // error, b is an array and is not nullable
10 b = ["aa", null] // ok
11
12 // a function type that returns string or null
13 let c: () => string | null
14 c = null // error, c is not nullable
15 c = (): string | null => { return null } // ok
16
17 // (a function type that returns string) or null
18 let d: (() => string) | null
19 d = null /
...
```

Example 4 (unknown):
```unknown
typeReference:
    typeReferencePart ('.' typeReferencePart)*
    |  Identifier '!'
    ;

typeReferencePart:
    Identifier typeArguments?
    ;
```

---

## 3. Types¶

**URL:** https://yoyocat.github.io/ArkTSSpec/3_types.html#value-types

**Contents:**
- 3. Types¶
- 3.1. Predefined Types¶
- 3.2. User-Defined Types¶
- 3.3. Types by Category¶
- 3.4. Using Types¶
- 3.5. Named Types¶
- 3.6. Type References¶
- 3.7. Value Types¶
  - 3.7.1. Integer Types and Operations¶
  - 3.7.2. Floating-Point Types and Operations¶

This chapter introduces the notion of type that is one of the fundamental concepts of ArkTS and other programming languages. Type classification as accepted in ArkTS is discussed below—along with all aspects of using types in programs written in the language.

Conventionally, the type of an entity is defined as the set of values the entity can take, and the set of operators applicable to the entity of a given type.

ArkTS is a statically typed language. It means that the type of every declared entity and every expression is known at compile time. The type of an entity is either set explicitly by a developer, or inferred implicitly by the compiler.

There are two categories of types:

The types integral to ArkTS are called predefined types (see Predefined Types).

The types introduced, declared, and defined by a developer are called user-defined types. All user-defined types must always have a complete type definition presented as source code in ArkTS.

Predefined types include the following:

Basic numeric value type: number

High-performance value types:

Numeric types: byte, short, int, long, float, and double;

Character type: char;

Boolean type: boolean;

Reference types: object, string, [] (array), bigint, void, never, and undefined;

Class types: Object, String, Array<T>, and BigInt.

Each predefined value type has a corresponding predefined class type that wraps the value of the predefined value type: Number, Byte, Short, Int, Long, Float, Double, Char, and Boolean.

The predefined value types are called primitive types. Primitive type names are reserved, i.e., they cannot be used for user-defined type names.

Type double is an alias to number. Type Double is an alias to Number.

User-defined types include the following:

Class types (see Classes);

Interface types (see Interfaces);

Enumeration types (see Enumerations);

Array types (see Array Types);

Function types (see Function Types);

Tuple types (see Tuple Types);

Union types (see Union Types); and

Type parameters (see Generic Parameters).

All ArkTS types are summarized in the following table:

Value Types (Primitive Types)

number, byte, short, int, long, float, double, char, boolean

Number, Byte, Short, Int, Long, Float, Double, Char, Boolean, Object, object, void, null, String, string, BigInt, bigint, never

class types, interface types, array types, function types, tuple types, union types, type parameters

A type can be referred to in source code by the following:

A reserved name f

*[Content truncated]*

**Examples:**

Example 1 (unknown):
```unknown
type:
    predefinedType
    | typeReference
    | arrayType
    | tupleType
    | functionType
    | unionType
    | keyofType
    | '(' type ')'
    ;
```

Example 2 (javascript):
```javascript
1 let b: boolean  // using primitive value type name
2 let n: number   // using primitive value type name
3 let o: Object   // using predefined class type name
4 let a: number[] // using array type
```

Example 3 (javascript):
```javascript
1 // a nullable array with elements of type string:
 2 let a: string[] | null
 3 let s: string[] = []
 4 a = s    // ok
 5 a = null // ok, a is nullable
 6
 7 // an array with elements whose types are string or null:
 8 let b: (string | null)[]
 9 b = null // error, b is an array and is not nullable
10 b = ["aa", null] // ok
11
12 // a function type that returns string or null
13 let c: () => string | null
14 c = null // error, c is not nullable
15 c = (): string | null => { return null } // ok
16
17 // (a function type that returns string) or null
18 let d: (() => string) | null
19 d = null /
...
```

Example 4 (unknown):
```unknown
typeReference:
    typeReferencePart ('.' typeReferencePart)*
    |  Identifier '!'
    ;

typeReferencePart:
    Identifier typeArguments?
    ;
```

---

## 3. Types¶

**URL:** https://yoyocat.github.io/ArkTSSpec/3_types.html#tuple-types

**Contents:**
- 3. Types¶
- 3.1. Predefined Types¶
- 3.2. User-Defined Types¶
- 3.3. Types by Category¶
- 3.4. Using Types¶
- 3.5. Named Types¶
- 3.6. Type References¶
- 3.7. Value Types¶
  - 3.7.1. Integer Types and Operations¶
  - 3.7.2. Floating-Point Types and Operations¶

This chapter introduces the notion of type that is one of the fundamental concepts of ArkTS and other programming languages. Type classification as accepted in ArkTS is discussed below—along with all aspects of using types in programs written in the language.

Conventionally, the type of an entity is defined as the set of values the entity can take, and the set of operators applicable to the entity of a given type.

ArkTS is a statically typed language. It means that the type of every declared entity and every expression is known at compile time. The type of an entity is either set explicitly by a developer, or inferred implicitly by the compiler.

There are two categories of types:

The types integral to ArkTS are called predefined types (see Predefined Types).

The types introduced, declared, and defined by a developer are called user-defined types. All user-defined types must always have a complete type definition presented as source code in ArkTS.

Predefined types include the following:

Basic numeric value type: number

High-performance value types:

Numeric types: byte, short, int, long, float, and double;

Character type: char;

Boolean type: boolean;

Reference types: object, string, [] (array), bigint, void, never, and undefined;

Class types: Object, String, Array<T>, and BigInt.

Each predefined value type has a corresponding predefined class type that wraps the value of the predefined value type: Number, Byte, Short, Int, Long, Float, Double, Char, and Boolean.

The predefined value types are called primitive types. Primitive type names are reserved, i.e., they cannot be used for user-defined type names.

Type double is an alias to number. Type Double is an alias to Number.

User-defined types include the following:

Class types (see Classes);

Interface types (see Interfaces);

Enumeration types (see Enumerations);

Array types (see Array Types);

Function types (see Function Types);

Tuple types (see Tuple Types);

Union types (see Union Types); and

Type parameters (see Generic Parameters).

All ArkTS types are summarized in the following table:

Value Types (Primitive Types)

number, byte, short, int, long, float, double, char, boolean

Number, Byte, Short, Int, Long, Float, Double, Char, Boolean, Object, object, void, null, String, string, BigInt, bigint, never

class types, interface types, array types, function types, tuple types, union types, type parameters

A type can be referred to in source code by the following:

A reserved name f

*[Content truncated]*

**Examples:**

Example 1 (unknown):
```unknown
type:
    predefinedType
    | typeReference
    | arrayType
    | tupleType
    | functionType
    | unionType
    | keyofType
    | '(' type ')'
    ;
```

Example 2 (javascript):
```javascript
1 let b: boolean  // using primitive value type name
2 let n: number   // using primitive value type name
3 let o: Object   // using predefined class type name
4 let a: number[] // using array type
```

Example 3 (javascript):
```javascript
1 // a nullable array with elements of type string:
 2 let a: string[] | null
 3 let s: string[] = []
 4 a = s    // ok
 5 a = null // ok, a is nullable
 6
 7 // an array with elements whose types are string or null:
 8 let b: (string | null)[]
 9 b = null // error, b is an array and is not nullable
10 b = ["aa", null] // ok
11
12 // a function type that returns string or null
13 let c: () => string | null
14 c = null // error, c is not nullable
15 c = (): string | null => { return null } // ok
16
17 // (a function type that returns string) or null
18 let d: (() => string) | null
19 d = null /
...
```

Example 4 (unknown):
```unknown
typeReference:
    typeReferencePart ('.' typeReferencePart)*
    |  Identifier '!'
    ;

typeReferencePart:
    Identifier typeArguments?
    ;
```

---

## 3. Types¶

**URL:** https://yoyocat.github.io/ArkTSSpec/3_types.html

**Contents:**
- 3. Types¶
- 3.1. Predefined Types¶
- 3.2. User-Defined Types¶
- 3.3. Types by Category¶
- 3.4. Using Types¶
- 3.5. Named Types¶
- 3.6. Type References¶
- 3.7. Value Types¶
  - 3.7.1. Integer Types and Operations¶
  - 3.7.2. Floating-Point Types and Operations¶

This chapter introduces the notion of type that is one of the fundamental concepts of ArkTS and other programming languages. Type classification as accepted in ArkTS is discussed below—along with all aspects of using types in programs written in the language.

Conventionally, the type of an entity is defined as the set of values the entity can take, and the set of operators applicable to the entity of a given type.

ArkTS is a statically typed language. It means that the type of every declared entity and every expression is known at compile time. The type of an entity is either set explicitly by a developer, or inferred implicitly by the compiler.

There are two categories of types:

The types integral to ArkTS are called predefined types (see Predefined Types).

The types introduced, declared, and defined by a developer are called user-defined types. All user-defined types must always have a complete type definition presented as source code in ArkTS.

Predefined types include the following:

Basic numeric value type: number

High-performance value types:

Numeric types: byte, short, int, long, float, and double;

Character type: char;

Boolean type: boolean;

Reference types: object, string, [] (array), bigint, void, never, and undefined;

Class types: Object, String, Array<T>, and BigInt.

Each predefined value type has a corresponding predefined class type that wraps the value of the predefined value type: Number, Byte, Short, Int, Long, Float, Double, Char, and Boolean.

The predefined value types are called primitive types. Primitive type names are reserved, i.e., they cannot be used for user-defined type names.

Type double is an alias to number. Type Double is an alias to Number.

User-defined types include the following:

Class types (see Classes);

Interface types (see Interfaces);

Enumeration types (see Enumerations);

Array types (see Array Types);

Function types (see Function Types);

Tuple types (see Tuple Types);

Union types (see Union Types); and

Type parameters (see Generic Parameters).

All ArkTS types are summarized in the following table:

Value Types (Primitive Types)

number, byte, short, int, long, float, double, char, boolean

Number, Byte, Short, Int, Long, Float, Double, Char, Boolean, Object, object, void, null, String, string, BigInt, bigint, never

class types, interface types, array types, function types, tuple types, union types, type parameters

A type can be referred to in source code by the following:

A reserved name f

*[Content truncated]*

**Examples:**

Example 1 (unknown):
```unknown
type:
    predefinedType
    | typeReference
    | arrayType
    | tupleType
    | functionType
    | unionType
    | keyofType
    | '(' type ')'
    ;
```

Example 2 (javascript):
```javascript
1 let b: boolean  // using primitive value type name
2 let n: number   // using primitive value type name
3 let o: Object   // using predefined class type name
4 let a: number[] // using array type
```

Example 3 (javascript):
```javascript
1 // a nullable array with elements of type string:
 2 let a: string[] | null
 3 let s: string[] = []
 4 a = s    // ok
 5 a = null // ok, a is nullable
 6
 7 // an array with elements whose types are string or null:
 8 let b: (string | null)[]
 9 b = null // error, b is an array and is not nullable
10 b = ["aa", null] // ok
11
12 // a function type that returns string or null
13 let c: () => string | null
14 c = null // error, c is not nullable
15 c = (): string | null => { return null } // ok
16
17 // (a function type that returns string) or null
18 let d: (() => string) | null
19 d = null /
...
```

Example 4 (unknown):
```unknown
typeReference:
    typeReferencePart ('.' typeReferencePart)*
    |  Identifier '!'
    ;

typeReferencePart:
    Identifier typeArguments?
    ;
```

---

## 3. Types¶

**URL:** https://yoyocat.github.io/ArkTSSpec/3_types.html#string-type

**Contents:**
- 3. Types¶
- 3.1. Predefined Types¶
- 3.2. User-Defined Types¶
- 3.3. Types by Category¶
- 3.4. Using Types¶
- 3.5. Named Types¶
- 3.6. Type References¶
- 3.7. Value Types¶
  - 3.7.1. Integer Types and Operations¶
  - 3.7.2. Floating-Point Types and Operations¶

This chapter introduces the notion of type that is one of the fundamental concepts of ArkTS and other programming languages. Type classification as accepted in ArkTS is discussed below—along with all aspects of using types in programs written in the language.

Conventionally, the type of an entity is defined as the set of values the entity can take, and the set of operators applicable to the entity of a given type.

ArkTS is a statically typed language. It means that the type of every declared entity and every expression is known at compile time. The type of an entity is either set explicitly by a developer, or inferred implicitly by the compiler.

There are two categories of types:

The types integral to ArkTS are called predefined types (see Predefined Types).

The types introduced, declared, and defined by a developer are called user-defined types. All user-defined types must always have a complete type definition presented as source code in ArkTS.

Predefined types include the following:

Basic numeric value type: number

High-performance value types:

Numeric types: byte, short, int, long, float, and double;

Character type: char;

Boolean type: boolean;

Reference types: object, string, [] (array), bigint, void, never, and undefined;

Class types: Object, String, Array<T>, and BigInt.

Each predefined value type has a corresponding predefined class type that wraps the value of the predefined value type: Number, Byte, Short, Int, Long, Float, Double, Char, and Boolean.

The predefined value types are called primitive types. Primitive type names are reserved, i.e., they cannot be used for user-defined type names.

Type double is an alias to number. Type Double is an alias to Number.

User-defined types include the following:

Class types (see Classes);

Interface types (see Interfaces);

Enumeration types (see Enumerations);

Array types (see Array Types);

Function types (see Function Types);

Tuple types (see Tuple Types);

Union types (see Union Types); and

Type parameters (see Generic Parameters).

All ArkTS types are summarized in the following table:

Value Types (Primitive Types)

number, byte, short, int, long, float, double, char, boolean

Number, Byte, Short, Int, Long, Float, Double, Char, Boolean, Object, object, void, null, String, string, BigInt, bigint, never

class types, interface types, array types, function types, tuple types, union types, type parameters

A type can be referred to in source code by the following:

A reserved name f

*[Content truncated]*

**Examples:**

Example 1 (unknown):
```unknown
type:
    predefinedType
    | typeReference
    | arrayType
    | tupleType
    | functionType
    | unionType
    | keyofType
    | '(' type ')'
    ;
```

Example 2 (javascript):
```javascript
1 let b: boolean  // using primitive value type name
2 let n: number   // using primitive value type name
3 let o: Object   // using predefined class type name
4 let a: number[] // using array type
```

Example 3 (javascript):
```javascript
1 // a nullable array with elements of type string:
 2 let a: string[] | null
 3 let s: string[] = []
 4 a = s    // ok
 5 a = null // ok, a is nullable
 6
 7 // an array with elements whose types are string or null:
 8 let b: (string | null)[]
 9 b = null // error, b is an array and is not nullable
10 b = ["aa", null] // ok
11
12 // a function type that returns string or null
13 let c: () => string | null
14 c = null // error, c is not nullable
15 c = (): string | null => { return null } // ok
16
17 // (a function type that returns string) or null
18 let d: (() => string) | null
19 d = null /
...
```

Example 4 (unknown):
```unknown
typeReference:
    typeReferencePart ('.' typeReferencePart)*
    |  Identifier '!'
    ;

typeReferencePart:
    Identifier typeArguments?
    ;
```

---

## 3. Types¶

**URL:** https://yoyocat.github.io/ArkTSSpec/3_types.html#void-type

**Contents:**
- 3. Types¶
- 3.1. Predefined Types¶
- 3.2. User-Defined Types¶
- 3.3. Types by Category¶
- 3.4. Using Types¶
- 3.5. Named Types¶
- 3.6. Type References¶
- 3.7. Value Types¶
  - 3.7.1. Integer Types and Operations¶
  - 3.7.2. Floating-Point Types and Operations¶

This chapter introduces the notion of type that is one of the fundamental concepts of ArkTS and other programming languages. Type classification as accepted in ArkTS is discussed below—along with all aspects of using types in programs written in the language.

Conventionally, the type of an entity is defined as the set of values the entity can take, and the set of operators applicable to the entity of a given type.

ArkTS is a statically typed language. It means that the type of every declared entity and every expression is known at compile time. The type of an entity is either set explicitly by a developer, or inferred implicitly by the compiler.

There are two categories of types:

The types integral to ArkTS are called predefined types (see Predefined Types).

The types introduced, declared, and defined by a developer are called user-defined types. All user-defined types must always have a complete type definition presented as source code in ArkTS.

Predefined types include the following:

Basic numeric value type: number

High-performance value types:

Numeric types: byte, short, int, long, float, and double;

Character type: char;

Boolean type: boolean;

Reference types: object, string, [] (array), bigint, void, never, and undefined;

Class types: Object, String, Array<T>, and BigInt.

Each predefined value type has a corresponding predefined class type that wraps the value of the predefined value type: Number, Byte, Short, Int, Long, Float, Double, Char, and Boolean.

The predefined value types are called primitive types. Primitive type names are reserved, i.e., they cannot be used for user-defined type names.

Type double is an alias to number. Type Double is an alias to Number.

User-defined types include the following:

Class types (see Classes);

Interface types (see Interfaces);

Enumeration types (see Enumerations);

Array types (see Array Types);

Function types (see Function Types);

Tuple types (see Tuple Types);

Union types (see Union Types); and

Type parameters (see Generic Parameters).

All ArkTS types are summarized in the following table:

Value Types (Primitive Types)

number, byte, short, int, long, float, double, char, boolean

Number, Byte, Short, Int, Long, Float, Double, Char, Boolean, Object, object, void, null, String, string, BigInt, bigint, never

class types, interface types, array types, function types, tuple types, union types, type parameters

A type can be referred to in source code by the following:

A reserved name f

*[Content truncated]*

**Examples:**

Example 1 (unknown):
```unknown
type:
    predefinedType
    | typeReference
    | arrayType
    | tupleType
    | functionType
    | unionType
    | keyofType
    | '(' type ')'
    ;
```

Example 2 (javascript):
```javascript
1 let b: boolean  // using primitive value type name
2 let n: number   // using primitive value type name
3 let o: Object   // using predefined class type name
4 let a: number[] // using array type
```

Example 3 (javascript):
```javascript
1 // a nullable array with elements of type string:
 2 let a: string[] | null
 3 let s: string[] = []
 4 a = s    // ok
 5 a = null // ok, a is nullable
 6
 7 // an array with elements whose types are string or null:
 8 let b: (string | null)[]
 9 b = null // error, b is an array and is not nullable
10 b = ["aa", null] // ok
11
12 // a function type that returns string or null
13 let c: () => string | null
14 c = null // error, c is not nullable
15 c = (): string | null => { return null } // ok
16
17 // (a function type that returns string) or null
18 let d: (() => string) | null
19 d = null /
...
```

Example 4 (unknown):
```unknown
typeReference:
    typeReferencePart ('.' typeReferencePart)*
    |  Identifier '!'
    ;

typeReferencePart:
    Identifier typeArguments?
    ;
```

---

## 3. Types¶

**URL:** https://yoyocat.github.io/ArkTSSpec/3_types.html#objects

**Contents:**
- 3. Types¶
- 3.1. Predefined Types¶
- 3.2. User-Defined Types¶
- 3.3. Types by Category¶
- 3.4. Using Types¶
- 3.5. Named Types¶
- 3.6. Type References¶
- 3.7. Value Types¶
  - 3.7.1. Integer Types and Operations¶
  - 3.7.2. Floating-Point Types and Operations¶

This chapter introduces the notion of type that is one of the fundamental concepts of ArkTS and other programming languages. Type classification as accepted in ArkTS is discussed below—along with all aspects of using types in programs written in the language.

Conventionally, the type of an entity is defined as the set of values the entity can take, and the set of operators applicable to the entity of a given type.

ArkTS is a statically typed language. It means that the type of every declared entity and every expression is known at compile time. The type of an entity is either set explicitly by a developer, or inferred implicitly by the compiler.

There are two categories of types:

The types integral to ArkTS are called predefined types (see Predefined Types).

The types introduced, declared, and defined by a developer are called user-defined types. All user-defined types must always have a complete type definition presented as source code in ArkTS.

Predefined types include the following:

Basic numeric value type: number

High-performance value types:

Numeric types: byte, short, int, long, float, and double;

Character type: char;

Boolean type: boolean;

Reference types: object, string, [] (array), bigint, void, never, and undefined;

Class types: Object, String, Array<T>, and BigInt.

Each predefined value type has a corresponding predefined class type that wraps the value of the predefined value type: Number, Byte, Short, Int, Long, Float, Double, Char, and Boolean.

The predefined value types are called primitive types. Primitive type names are reserved, i.e., they cannot be used for user-defined type names.

Type double is an alias to number. Type Double is an alias to Number.

User-defined types include the following:

Class types (see Classes);

Interface types (see Interfaces);

Enumeration types (see Enumerations);

Array types (see Array Types);

Function types (see Function Types);

Tuple types (see Tuple Types);

Union types (see Union Types); and

Type parameters (see Generic Parameters).

All ArkTS types are summarized in the following table:

Value Types (Primitive Types)

number, byte, short, int, long, float, double, char, boolean

Number, Byte, Short, Int, Long, Float, Double, Char, Boolean, Object, object, void, null, String, string, BigInt, bigint, never

class types, interface types, array types, function types, tuple types, union types, type parameters

A type can be referred to in source code by the following:

A reserved name f

*[Content truncated]*

**Examples:**

Example 1 (unknown):
```unknown
type:
    predefinedType
    | typeReference
    | arrayType
    | tupleType
    | functionType
    | unionType
    | keyofType
    | '(' type ')'
    ;
```

Example 2 (javascript):
```javascript
1 let b: boolean  // using primitive value type name
2 let n: number   // using primitive value type name
3 let o: Object   // using predefined class type name
4 let a: number[] // using array type
```

Example 3 (javascript):
```javascript
1 // a nullable array with elements of type string:
 2 let a: string[] | null
 3 let s: string[] = []
 4 a = s    // ok
 5 a = null // ok, a is nullable
 6
 7 // an array with elements whose types are string or null:
 8 let b: (string | null)[]
 9 b = null // error, b is an array and is not nullable
10 b = ["aa", null] // ok
11
12 // a function type that returns string or null
13 let c: () => string | null
14 c = null // error, c is not nullable
15 c = (): string | null => { return null } // ok
16
17 // (a function type that returns string) or null
18 let d: (() => string) | null
19 d = null /
...
```

Example 4 (unknown):
```unknown
typeReference:
    typeReferencePart ('.' typeReferencePart)*
    |  Identifier '!'
    ;

typeReferencePart:
    Identifier typeArguments?
    ;
```

---

## 3. Types¶

**URL:** https://yoyocat.github.io/ArkTSSpec/3_types.html#never-type

**Contents:**
- 3. Types¶
- 3.1. Predefined Types¶
- 3.2. User-Defined Types¶
- 3.3. Types by Category¶
- 3.4. Using Types¶
- 3.5. Named Types¶
- 3.6. Type References¶
- 3.7. Value Types¶
  - 3.7.1. Integer Types and Operations¶
  - 3.7.2. Floating-Point Types and Operations¶

This chapter introduces the notion of type that is one of the fundamental concepts of ArkTS and other programming languages. Type classification as accepted in ArkTS is discussed below—along with all aspects of using types in programs written in the language.

Conventionally, the type of an entity is defined as the set of values the entity can take, and the set of operators applicable to the entity of a given type.

ArkTS is a statically typed language. It means that the type of every declared entity and every expression is known at compile time. The type of an entity is either set explicitly by a developer, or inferred implicitly by the compiler.

There are two categories of types:

The types integral to ArkTS are called predefined types (see Predefined Types).

The types introduced, declared, and defined by a developer are called user-defined types. All user-defined types must always have a complete type definition presented as source code in ArkTS.

Predefined types include the following:

Basic numeric value type: number

High-performance value types:

Numeric types: byte, short, int, long, float, and double;

Character type: char;

Boolean type: boolean;

Reference types: object, string, [] (array), bigint, void, never, and undefined;

Class types: Object, String, Array<T>, and BigInt.

Each predefined value type has a corresponding predefined class type that wraps the value of the predefined value type: Number, Byte, Short, Int, Long, Float, Double, Char, and Boolean.

The predefined value types are called primitive types. Primitive type names are reserved, i.e., they cannot be used for user-defined type names.

Type double is an alias to number. Type Double is an alias to Number.

User-defined types include the following:

Class types (see Classes);

Interface types (see Interfaces);

Enumeration types (see Enumerations);

Array types (see Array Types);

Function types (see Function Types);

Tuple types (see Tuple Types);

Union types (see Union Types); and

Type parameters (see Generic Parameters).

All ArkTS types are summarized in the following table:

Value Types (Primitive Types)

number, byte, short, int, long, float, double, char, boolean

Number, Byte, Short, Int, Long, Float, Double, Char, Boolean, Object, object, void, null, String, string, BigInt, bigint, never

class types, interface types, array types, function types, tuple types, union types, type parameters

A type can be referred to in source code by the following:

A reserved name f

*[Content truncated]*

**Examples:**

Example 1 (unknown):
```unknown
type:
    predefinedType
    | typeReference
    | arrayType
    | tupleType
    | functionType
    | unionType
    | keyofType
    | '(' type ')'
    ;
```

Example 2 (javascript):
```javascript
1 let b: boolean  // using primitive value type name
2 let n: number   // using primitive value type name
3 let o: Object   // using predefined class type name
4 let a: number[] // using array type
```

Example 3 (javascript):
```javascript
1 // a nullable array with elements of type string:
 2 let a: string[] | null
 3 let s: string[] = []
 4 a = s    // ok
 5 a = null // ok, a is nullable
 6
 7 // an array with elements whose types are string or null:
 8 let b: (string | null)[]
 9 b = null // error, b is an array and is not nullable
10 b = ["aa", null] // ok
11
12 // a function type that returns string or null
13 let c: () => string | null
14 c = null // error, c is not nullable
15 c = (): string | null => { return null } // ok
16
17 // (a function type that returns string) or null
18 let d: (() => string) | null
19 d = null /
...
```

Example 4 (unknown):
```unknown
typeReference:
    typeReferencePart ('.' typeReferencePart)*
    |  Identifier '!'
    ;

typeReferencePart:
    Identifier typeArguments?
    ;
```

---

## 3. Types¶

**URL:** https://yoyocat.github.io/ArkTSSpec/3_types.html#dynamicobject-type

**Contents:**
- 3. Types¶
- 3.1. Predefined Types¶
- 3.2. User-Defined Types¶
- 3.3. Types by Category¶
- 3.4. Using Types¶
- 3.5. Named Types¶
- 3.6. Type References¶
- 3.7. Value Types¶
  - 3.7.1. Integer Types and Operations¶
  - 3.7.2. Floating-Point Types and Operations¶

This chapter introduces the notion of type that is one of the fundamental concepts of ArkTS and other programming languages. Type classification as accepted in ArkTS is discussed below—along with all aspects of using types in programs written in the language.

Conventionally, the type of an entity is defined as the set of values the entity can take, and the set of operators applicable to the entity of a given type.

ArkTS is a statically typed language. It means that the type of every declared entity and every expression is known at compile time. The type of an entity is either set explicitly by a developer, or inferred implicitly by the compiler.

There are two categories of types:

The types integral to ArkTS are called predefined types (see Predefined Types).

The types introduced, declared, and defined by a developer are called user-defined types. All user-defined types must always have a complete type definition presented as source code in ArkTS.

Predefined types include the following:

Basic numeric value type: number

High-performance value types:

Numeric types: byte, short, int, long, float, and double;

Character type: char;

Boolean type: boolean;

Reference types: object, string, [] (array), bigint, void, never, and undefined;

Class types: Object, String, Array<T>, and BigInt.

Each predefined value type has a corresponding predefined class type that wraps the value of the predefined value type: Number, Byte, Short, Int, Long, Float, Double, Char, and Boolean.

The predefined value types are called primitive types. Primitive type names are reserved, i.e., they cannot be used for user-defined type names.

Type double is an alias to number. Type Double is an alias to Number.

User-defined types include the following:

Class types (see Classes);

Interface types (see Interfaces);

Enumeration types (see Enumerations);

Array types (see Array Types);

Function types (see Function Types);

Tuple types (see Tuple Types);

Union types (see Union Types); and

Type parameters (see Generic Parameters).

All ArkTS types are summarized in the following table:

Value Types (Primitive Types)

number, byte, short, int, long, float, double, char, boolean

Number, Byte, Short, Int, Long, Float, Double, Char, Boolean, Object, object, void, null, String, string, BigInt, bigint, never

class types, interface types, array types, function types, tuple types, union types, type parameters

A type can be referred to in source code by the following:

A reserved name f

*[Content truncated]*

**Examples:**

Example 1 (unknown):
```unknown
type:
    predefinedType
    | typeReference
    | arrayType
    | tupleType
    | functionType
    | unionType
    | keyofType
    | '(' type ')'
    ;
```

Example 2 (javascript):
```javascript
1 let b: boolean  // using primitive value type name
2 let n: number   // using primitive value type name
3 let o: Object   // using predefined class type name
4 let a: number[] // using array type
```

Example 3 (javascript):
```javascript
1 // a nullable array with elements of type string:
 2 let a: string[] | null
 3 let s: string[] = []
 4 a = s    // ok
 5 a = null // ok, a is nullable
 6
 7 // an array with elements whose types are string or null:
 8 let b: (string | null)[]
 9 b = null // error, b is an array and is not nullable
10 b = ["aa", null] // ok
11
12 // a function type that returns string or null
13 let c: () => string | null
14 c = null // error, c is not nullable
15 c = (): string | null => { return null } // ok
16
17 // (a function type that returns string) or null
18 let d: (() => string) | null
19 d = null /
...
```

Example 4 (unknown):
```unknown
typeReference:
    typeReferencePart ('.' typeReferencePart)*
    |  Identifier '!'
    ;

typeReferencePart:
    Identifier typeArguments?
    ;
```

---

## 3. Types¶

**URL:** https://yoyocat.github.io/ArkTSSpec/3_types.html#boolean-types-and-operations

**Contents:**
- 3. Types¶
- 3.1. Predefined Types¶
- 3.2. User-Defined Types¶
- 3.3. Types by Category¶
- 3.4. Using Types¶
- 3.5. Named Types¶
- 3.6. Type References¶
- 3.7. Value Types¶
  - 3.7.1. Integer Types and Operations¶
  - 3.7.2. Floating-Point Types and Operations¶

This chapter introduces the notion of type that is one of the fundamental concepts of ArkTS and other programming languages. Type classification as accepted in ArkTS is discussed below—along with all aspects of using types in programs written in the language.

Conventionally, the type of an entity is defined as the set of values the entity can take, and the set of operators applicable to the entity of a given type.

ArkTS is a statically typed language. It means that the type of every declared entity and every expression is known at compile time. The type of an entity is either set explicitly by a developer, or inferred implicitly by the compiler.

There are two categories of types:

The types integral to ArkTS are called predefined types (see Predefined Types).

The types introduced, declared, and defined by a developer are called user-defined types. All user-defined types must always have a complete type definition presented as source code in ArkTS.

Predefined types include the following:

Basic numeric value type: number

High-performance value types:

Numeric types: byte, short, int, long, float, and double;

Character type: char;

Boolean type: boolean;

Reference types: object, string, [] (array), bigint, void, never, and undefined;

Class types: Object, String, Array<T>, and BigInt.

Each predefined value type has a corresponding predefined class type that wraps the value of the predefined value type: Number, Byte, Short, Int, Long, Float, Double, Char, and Boolean.

The predefined value types are called primitive types. Primitive type names are reserved, i.e., they cannot be used for user-defined type names.

Type double is an alias to number. Type Double is an alias to Number.

User-defined types include the following:

Class types (see Classes);

Interface types (see Interfaces);

Enumeration types (see Enumerations);

Array types (see Array Types);

Function types (see Function Types);

Tuple types (see Tuple Types);

Union types (see Union Types); and

Type parameters (see Generic Parameters).

All ArkTS types are summarized in the following table:

Value Types (Primitive Types)

number, byte, short, int, long, float, double, char, boolean

Number, Byte, Short, Int, Long, Float, Double, Char, Boolean, Object, object, void, null, String, string, BigInt, bigint, never

class types, interface types, array types, function types, tuple types, union types, type parameters

A type can be referred to in source code by the following:

A reserved name f

*[Content truncated]*

**Examples:**

Example 1 (unknown):
```unknown
type:
    predefinedType
    | typeReference
    | arrayType
    | tupleType
    | functionType
    | unionType
    | keyofType
    | '(' type ')'
    ;
```

Example 2 (javascript):
```javascript
1 let b: boolean  // using primitive value type name
2 let n: number   // using primitive value type name
3 let o: Object   // using predefined class type name
4 let a: number[] // using array type
```

Example 3 (javascript):
```javascript
1 // a nullable array with elements of type string:
 2 let a: string[] | null
 3 let s: string[] = []
 4 a = s    // ok
 5 a = null // ok, a is nullable
 6
 7 // an array with elements whose types are string or null:
 8 let b: (string | null)[]
 9 b = null // error, b is an array and is not nullable
10 b = ["aa", null] // ok
11
12 // a function type that returns string or null
13 let c: () => string | null
14 c = null // error, c is not nullable
15 c = (): string | null => { return null } // ok
16
17 // (a function type that returns string) or null
18 let d: (() => string) | null
19 d = null /
...
```

Example 4 (unknown):
```unknown
typeReference:
    typeReferencePart ('.' typeReferencePart)*
    |  Identifier '!'
    ;

typeReferencePart:
    Identifier typeArguments?
    ;
```

---

## 3. Types¶

**URL:** https://yoyocat.github.io/ArkTSSpec/3_types.html#array-types

**Contents:**
- 3. Types¶
- 3.1. Predefined Types¶
- 3.2. User-Defined Types¶
- 3.3. Types by Category¶
- 3.4. Using Types¶
- 3.5. Named Types¶
- 3.6. Type References¶
- 3.7. Value Types¶
  - 3.7.1. Integer Types and Operations¶
  - 3.7.2. Floating-Point Types and Operations¶

This chapter introduces the notion of type that is one of the fundamental concepts of ArkTS and other programming languages. Type classification as accepted in ArkTS is discussed below—along with all aspects of using types in programs written in the language.

Conventionally, the type of an entity is defined as the set of values the entity can take, and the set of operators applicable to the entity of a given type.

ArkTS is a statically typed language. It means that the type of every declared entity and every expression is known at compile time. The type of an entity is either set explicitly by a developer, or inferred implicitly by the compiler.

There are two categories of types:

The types integral to ArkTS are called predefined types (see Predefined Types).

The types introduced, declared, and defined by a developer are called user-defined types. All user-defined types must always have a complete type definition presented as source code in ArkTS.

Predefined types include the following:

Basic numeric value type: number

High-performance value types:

Numeric types: byte, short, int, long, float, and double;

Character type: char;

Boolean type: boolean;

Reference types: object, string, [] (array), bigint, void, never, and undefined;

Class types: Object, String, Array<T>, and BigInt.

Each predefined value type has a corresponding predefined class type that wraps the value of the predefined value type: Number, Byte, Short, Int, Long, Float, Double, Char, and Boolean.

The predefined value types are called primitive types. Primitive type names are reserved, i.e., they cannot be used for user-defined type names.

Type double is an alias to number. Type Double is an alias to Number.

User-defined types include the following:

Class types (see Classes);

Interface types (see Interfaces);

Enumeration types (see Enumerations);

Array types (see Array Types);

Function types (see Function Types);

Tuple types (see Tuple Types);

Union types (see Union Types); and

Type parameters (see Generic Parameters).

All ArkTS types are summarized in the following table:

Value Types (Primitive Types)

number, byte, short, int, long, float, double, char, boolean

Number, Byte, Short, Int, Long, Float, Double, Char, Boolean, Object, object, void, null, String, string, BigInt, bigint, never

class types, interface types, array types, function types, tuple types, union types, type parameters

A type can be referred to in source code by the following:

A reserved name f

*[Content truncated]*

**Examples:**

Example 1 (unknown):
```unknown
type:
    predefinedType
    | typeReference
    | arrayType
    | tupleType
    | functionType
    | unionType
    | keyofType
    | '(' type ')'
    ;
```

Example 2 (javascript):
```javascript
1 let b: boolean  // using primitive value type name
2 let n: number   // using primitive value type name
3 let o: Object   // using predefined class type name
4 let a: number[] // using array type
```

Example 3 (javascript):
```javascript
1 // a nullable array with elements of type string:
 2 let a: string[] | null
 3 let s: string[] = []
 4 a = s    // ok
 5 a = null // ok, a is nullable
 6
 7 // an array with elements whose types are string or null:
 8 let b: (string | null)[]
 9 b = null // error, b is an array and is not nullable
10 b = ["aa", null] // ok
11
12 // a function type that returns string or null
13 let c: () => string | null
14 c = null // error, c is not nullable
15 c = (): string | null => { return null } // ok
16
17 // (a function type that returns string) or null
18 let d: (() => string) | null
19 d = null /
...
```

Example 4 (unknown):
```unknown
typeReference:
    typeReferencePart ('.' typeReferencePart)*
    |  Identifier '!'
    ;

typeReferencePart:
    Identifier typeArguments?
    ;
```

---

## 3. Types¶

**URL:** https://yoyocat.github.io/ArkTSSpec/3_types.html#types-by-category

**Contents:**
- 3. Types¶
- 3.1. Predefined Types¶
- 3.2. User-Defined Types¶
- 3.3. Types by Category¶
- 3.4. Using Types¶
- 3.5. Named Types¶
- 3.6. Type References¶
- 3.7. Value Types¶
  - 3.7.1. Integer Types and Operations¶
  - 3.7.2. Floating-Point Types and Operations¶

This chapter introduces the notion of type that is one of the fundamental concepts of ArkTS and other programming languages. Type classification as accepted in ArkTS is discussed below—along with all aspects of using types in programs written in the language.

Conventionally, the type of an entity is defined as the set of values the entity can take, and the set of operators applicable to the entity of a given type.

ArkTS is a statically typed language. It means that the type of every declared entity and every expression is known at compile time. The type of an entity is either set explicitly by a developer, or inferred implicitly by the compiler.

There are two categories of types:

The types integral to ArkTS are called predefined types (see Predefined Types).

The types introduced, declared, and defined by a developer are called user-defined types. All user-defined types must always have a complete type definition presented as source code in ArkTS.

Predefined types include the following:

Basic numeric value type: number

High-performance value types:

Numeric types: byte, short, int, long, float, and double;

Character type: char;

Boolean type: boolean;

Reference types: object, string, [] (array), bigint, void, never, and undefined;

Class types: Object, String, Array<T>, and BigInt.

Each predefined value type has a corresponding predefined class type that wraps the value of the predefined value type: Number, Byte, Short, Int, Long, Float, Double, Char, and Boolean.

The predefined value types are called primitive types. Primitive type names are reserved, i.e., they cannot be used for user-defined type names.

Type double is an alias to number. Type Double is an alias to Number.

User-defined types include the following:

Class types (see Classes);

Interface types (see Interfaces);

Enumeration types (see Enumerations);

Array types (see Array Types);

Function types (see Function Types);

Tuple types (see Tuple Types);

Union types (see Union Types); and

Type parameters (see Generic Parameters).

All ArkTS types are summarized in the following table:

Value Types (Primitive Types)

number, byte, short, int, long, float, double, char, boolean

Number, Byte, Short, Int, Long, Float, Double, Char, Boolean, Object, object, void, null, String, string, BigInt, bigint, never

class types, interface types, array types, function types, tuple types, union types, type parameters

A type can be referred to in source code by the following:

A reserved name f

*[Content truncated]*

**Examples:**

Example 1 (unknown):
```unknown
type:
    predefinedType
    | typeReference
    | arrayType
    | tupleType
    | functionType
    | unionType
    | keyofType
    | '(' type ')'
    ;
```

Example 2 (javascript):
```javascript
1 let b: boolean  // using primitive value type name
2 let n: number   // using primitive value type name
3 let o: Object   // using predefined class type name
4 let a: number[] // using array type
```

Example 3 (javascript):
```javascript
1 // a nullable array with elements of type string:
 2 let a: string[] | null
 3 let s: string[] = []
 4 a = s    // ok
 5 a = null // ok, a is nullable
 6
 7 // an array with elements whose types are string or null:
 8 let b: (string | null)[]
 9 b = null // error, b is an array and is not nullable
10 b = ["aa", null] // ok
11
12 // a function type that returns string or null
13 let c: () => string | null
14 c = null // error, c is not nullable
15 c = (): string | null => { return null } // ok
16
17 // (a function type that returns string) or null
18 let d: (() => string) | null
19 d = null /
...
```

Example 4 (unknown):
```unknown
typeReference:
    typeReferencePart ('.' typeReferencePart)*
    |  Identifier '!'
    ;

typeReferencePart:
    Identifier typeArguments?
    ;
```

---

## 3. Types¶

**URL:** https://yoyocat.github.io/ArkTSSpec/3_types.html#reference-types

**Contents:**
- 3. Types¶
- 3.1. Predefined Types¶
- 3.2. User-Defined Types¶
- 3.3. Types by Category¶
- 3.4. Using Types¶
- 3.5. Named Types¶
- 3.6. Type References¶
- 3.7. Value Types¶
  - 3.7.1. Integer Types and Operations¶
  - 3.7.2. Floating-Point Types and Operations¶

This chapter introduces the notion of type that is one of the fundamental concepts of ArkTS and other programming languages. Type classification as accepted in ArkTS is discussed below—along with all aspects of using types in programs written in the language.

Conventionally, the type of an entity is defined as the set of values the entity can take, and the set of operators applicable to the entity of a given type.

ArkTS is a statically typed language. It means that the type of every declared entity and every expression is known at compile time. The type of an entity is either set explicitly by a developer, or inferred implicitly by the compiler.

There are two categories of types:

The types integral to ArkTS are called predefined types (see Predefined Types).

The types introduced, declared, and defined by a developer are called user-defined types. All user-defined types must always have a complete type definition presented as source code in ArkTS.

Predefined types include the following:

Basic numeric value type: number

High-performance value types:

Numeric types: byte, short, int, long, float, and double;

Character type: char;

Boolean type: boolean;

Reference types: object, string, [] (array), bigint, void, never, and undefined;

Class types: Object, String, Array<T>, and BigInt.

Each predefined value type has a corresponding predefined class type that wraps the value of the predefined value type: Number, Byte, Short, Int, Long, Float, Double, Char, and Boolean.

The predefined value types are called primitive types. Primitive type names are reserved, i.e., they cannot be used for user-defined type names.

Type double is an alias to number. Type Double is an alias to Number.

User-defined types include the following:

Class types (see Classes);

Interface types (see Interfaces);

Enumeration types (see Enumerations);

Array types (see Array Types);

Function types (see Function Types);

Tuple types (see Tuple Types);

Union types (see Union Types); and

Type parameters (see Generic Parameters).

All ArkTS types are summarized in the following table:

Value Types (Primitive Types)

number, byte, short, int, long, float, double, char, boolean

Number, Byte, Short, Int, Long, Float, Double, Char, Boolean, Object, object, void, null, String, string, BigInt, bigint, never

class types, interface types, array types, function types, tuple types, union types, type parameters

A type can be referred to in source code by the following:

A reserved name f

*[Content truncated]*

**Examples:**

Example 1 (unknown):
```unknown
type:
    predefinedType
    | typeReference
    | arrayType
    | tupleType
    | functionType
    | unionType
    | keyofType
    | '(' type ')'
    ;
```

Example 2 (javascript):
```javascript
1 let b: boolean  // using primitive value type name
2 let n: number   // using primitive value type name
3 let o: Object   // using predefined class type name
4 let a: number[] // using array type
```

Example 3 (javascript):
```javascript
1 // a nullable array with elements of type string:
 2 let a: string[] | null
 3 let s: string[] = []
 4 a = s    // ok
 5 a = null // ok, a is nullable
 6
 7 // an array with elements whose types are string or null:
 8 let b: (string | null)[]
 9 b = null // error, b is an array and is not nullable
10 b = ["aa", null] // ok
11
12 // a function type that returns string or null
13 let c: () => string | null
14 c = null // error, c is not nullable
15 c = (): string | null => { return null } // ok
16
17 // (a function type that returns string) or null
18 let d: (() => string) | null
19 d = null /
...
```

Example 4 (unknown):
```unknown
typeReference:
    typeReferencePart ('.' typeReferencePart)*
    |  Identifier '!'
    ;

typeReferencePart:
    Identifier typeArguments?
    ;
```

---

## 3. Types¶

**URL:** https://yoyocat.github.io/ArkTSSpec/3_types.html#numeric-types-hierarchy

**Contents:**
- 3. Types¶
- 3.1. Predefined Types¶
- 3.2. User-Defined Types¶
- 3.3. Types by Category¶
- 3.4. Using Types¶
- 3.5. Named Types¶
- 3.6. Type References¶
- 3.7. Value Types¶
  - 3.7.1. Integer Types and Operations¶
  - 3.7.2. Floating-Point Types and Operations¶

This chapter introduces the notion of type that is one of the fundamental concepts of ArkTS and other programming languages. Type classification as accepted in ArkTS is discussed below—along with all aspects of using types in programs written in the language.

Conventionally, the type of an entity is defined as the set of values the entity can take, and the set of operators applicable to the entity of a given type.

ArkTS is a statically typed language. It means that the type of every declared entity and every expression is known at compile time. The type of an entity is either set explicitly by a developer, or inferred implicitly by the compiler.

There are two categories of types:

The types integral to ArkTS are called predefined types (see Predefined Types).

The types introduced, declared, and defined by a developer are called user-defined types. All user-defined types must always have a complete type definition presented as source code in ArkTS.

Predefined types include the following:

Basic numeric value type: number

High-performance value types:

Numeric types: byte, short, int, long, float, and double;

Character type: char;

Boolean type: boolean;

Reference types: object, string, [] (array), bigint, void, never, and undefined;

Class types: Object, String, Array<T>, and BigInt.

Each predefined value type has a corresponding predefined class type that wraps the value of the predefined value type: Number, Byte, Short, Int, Long, Float, Double, Char, and Boolean.

The predefined value types are called primitive types. Primitive type names are reserved, i.e., they cannot be used for user-defined type names.

Type double is an alias to number. Type Double is an alias to Number.

User-defined types include the following:

Class types (see Classes);

Interface types (see Interfaces);

Enumeration types (see Enumerations);

Array types (see Array Types);

Function types (see Function Types);

Tuple types (see Tuple Types);

Union types (see Union Types); and

Type parameters (see Generic Parameters).

All ArkTS types are summarized in the following table:

Value Types (Primitive Types)

number, byte, short, int, long, float, double, char, boolean

Number, Byte, Short, Int, Long, Float, Double, Char, Boolean, Object, object, void, null, String, string, BigInt, bigint, never

class types, interface types, array types, function types, tuple types, union types, type parameters

A type can be referred to in source code by the following:

A reserved name f

*[Content truncated]*

**Examples:**

Example 1 (unknown):
```unknown
type:
    predefinedType
    | typeReference
    | arrayType
    | tupleType
    | functionType
    | unionType
    | keyofType
    | '(' type ')'
    ;
```

Example 2 (javascript):
```javascript
1 let b: boolean  // using primitive value type name
2 let n: number   // using primitive value type name
3 let o: Object   // using predefined class type name
4 let a: number[] // using array type
```

Example 3 (javascript):
```javascript
1 // a nullable array with elements of type string:
 2 let a: string[] | null
 3 let s: string[] = []
 4 a = s    // ok
 5 a = null // ok, a is nullable
 6
 7 // an array with elements whose types are string or null:
 8 let b: (string | null)[]
 9 b = null // error, b is an array and is not nullable
10 b = ["aa", null] // ok
11
12 // a function type that returns string or null
13 let c: () => string | null
14 c = null // error, c is not nullable
15 c = (): string | null => { return null } // ok
16
17 // (a function type that returns string) or null
18 let d: (() => string) | null
19 d = null /
...
```

Example 4 (unknown):
```unknown
typeReference:
    typeReferencePart ('.' typeReferencePart)*
    |  Identifier '!'
    ;

typeReferencePart:
    Identifier typeArguments?
    ;
```

---

## 3. Types¶

**URL:** https://yoyocat.github.io/ArkTSSpec/3_types.html#null-type

**Contents:**
- 3. Types¶
- 3.1. Predefined Types¶
- 3.2. User-Defined Types¶
- 3.3. Types by Category¶
- 3.4. Using Types¶
- 3.5. Named Types¶
- 3.6. Type References¶
- 3.7. Value Types¶
  - 3.7.1. Integer Types and Operations¶
  - 3.7.2. Floating-Point Types and Operations¶

This chapter introduces the notion of type that is one of the fundamental concepts of ArkTS and other programming languages. Type classification as accepted in ArkTS is discussed below—along with all aspects of using types in programs written in the language.

Conventionally, the type of an entity is defined as the set of values the entity can take, and the set of operators applicable to the entity of a given type.

ArkTS is a statically typed language. It means that the type of every declared entity and every expression is known at compile time. The type of an entity is either set explicitly by a developer, or inferred implicitly by the compiler.

There are two categories of types:

The types integral to ArkTS are called predefined types (see Predefined Types).

The types introduced, declared, and defined by a developer are called user-defined types. All user-defined types must always have a complete type definition presented as source code in ArkTS.

Predefined types include the following:

Basic numeric value type: number

High-performance value types:

Numeric types: byte, short, int, long, float, and double;

Character type: char;

Boolean type: boolean;

Reference types: object, string, [] (array), bigint, void, never, and undefined;

Class types: Object, String, Array<T>, and BigInt.

Each predefined value type has a corresponding predefined class type that wraps the value of the predefined value type: Number, Byte, Short, Int, Long, Float, Double, Char, and Boolean.

The predefined value types are called primitive types. Primitive type names are reserved, i.e., they cannot be used for user-defined type names.

Type double is an alias to number. Type Double is an alias to Number.

User-defined types include the following:

Class types (see Classes);

Interface types (see Interfaces);

Enumeration types (see Enumerations);

Array types (see Array Types);

Function types (see Function Types);

Tuple types (see Tuple Types);

Union types (see Union Types); and

Type parameters (see Generic Parameters).

All ArkTS types are summarized in the following table:

Value Types (Primitive Types)

number, byte, short, int, long, float, double, char, boolean

Number, Byte, Short, Int, Long, Float, Double, Char, Boolean, Object, object, void, null, String, string, BigInt, bigint, never

class types, interface types, array types, function types, tuple types, union types, type parameters

A type can be referred to in source code by the following:

A reserved name f

*[Content truncated]*

**Examples:**

Example 1 (unknown):
```unknown
type:
    predefinedType
    | typeReference
    | arrayType
    | tupleType
    | functionType
    | unionType
    | keyofType
    | '(' type ')'
    ;
```

Example 2 (javascript):
```javascript
1 let b: boolean  // using primitive value type name
2 let n: number   // using primitive value type name
3 let o: Object   // using predefined class type name
4 let a: number[] // using array type
```

Example 3 (javascript):
```javascript
1 // a nullable array with elements of type string:
 2 let a: string[] | null
 3 let s: string[] = []
 4 a = s    // ok
 5 a = null // ok, a is nullable
 6
 7 // an array with elements whose types are string or null:
 8 let b: (string | null)[]
 9 b = null // error, b is an array and is not nullable
10 b = ["aa", null] // ok
11
12 // a function type that returns string or null
13 let c: () => string | null
14 c = null // error, c is not nullable
15 c = (): string | null => { return null } // ok
16
17 // (a function type that returns string) or null
18 let d: (() => string) | null
19 d = null /
...
```

Example 4 (unknown):
```unknown
typeReference:
    typeReferencePart ('.' typeReferencePart)*
    |  Identifier '!'
    ;

typeReferencePart:
    Identifier typeArguments?
    ;
```

---

## 3. Types¶

**URL:** https://yoyocat.github.io/ArkTSSpec/3_types.html#predefined-types

**Contents:**
- 3. Types¶
- 3.1. Predefined Types¶
- 3.2. User-Defined Types¶
- 3.3. Types by Category¶
- 3.4. Using Types¶
- 3.5. Named Types¶
- 3.6. Type References¶
- 3.7. Value Types¶
  - 3.7.1. Integer Types and Operations¶
  - 3.7.2. Floating-Point Types and Operations¶

This chapter introduces the notion of type that is one of the fundamental concepts of ArkTS and other programming languages. Type classification as accepted in ArkTS is discussed below—along with all aspects of using types in programs written in the language.

Conventionally, the type of an entity is defined as the set of values the entity can take, and the set of operators applicable to the entity of a given type.

ArkTS is a statically typed language. It means that the type of every declared entity and every expression is known at compile time. The type of an entity is either set explicitly by a developer, or inferred implicitly by the compiler.

There are two categories of types:

The types integral to ArkTS are called predefined types (see Predefined Types).

The types introduced, declared, and defined by a developer are called user-defined types. All user-defined types must always have a complete type definition presented as source code in ArkTS.

Predefined types include the following:

Basic numeric value type: number

High-performance value types:

Numeric types: byte, short, int, long, float, and double;

Character type: char;

Boolean type: boolean;

Reference types: object, string, [] (array), bigint, void, never, and undefined;

Class types: Object, String, Array<T>, and BigInt.

Each predefined value type has a corresponding predefined class type that wraps the value of the predefined value type: Number, Byte, Short, Int, Long, Float, Double, Char, and Boolean.

The predefined value types are called primitive types. Primitive type names are reserved, i.e., they cannot be used for user-defined type names.

Type double is an alias to number. Type Double is an alias to Number.

User-defined types include the following:

Class types (see Classes);

Interface types (see Interfaces);

Enumeration types (see Enumerations);

Array types (see Array Types);

Function types (see Function Types);

Tuple types (see Tuple Types);

Union types (see Union Types); and

Type parameters (see Generic Parameters).

All ArkTS types are summarized in the following table:

Value Types (Primitive Types)

number, byte, short, int, long, float, double, char, boolean

Number, Byte, Short, Int, Long, Float, Double, Char, Boolean, Object, object, void, null, String, string, BigInt, bigint, never

class types, interface types, array types, function types, tuple types, union types, type parameters

A type can be referred to in source code by the following:

A reserved name f

*[Content truncated]*

**Examples:**

Example 1 (unknown):
```unknown
type:
    predefinedType
    | typeReference
    | arrayType
    | tupleType
    | functionType
    | unionType
    | keyofType
    | '(' type ')'
    ;
```

Example 2 (javascript):
```javascript
1 let b: boolean  // using primitive value type name
2 let n: number   // using primitive value type name
3 let o: Object   // using predefined class type name
4 let a: number[] // using array type
```

Example 3 (javascript):
```javascript
1 // a nullable array with elements of type string:
 2 let a: string[] | null
 3 let s: string[] = []
 4 a = s    // ok
 5 a = null // ok, a is nullable
 6
 7 // an array with elements whose types are string or null:
 8 let b: (string | null)[]
 9 b = null // error, b is an array and is not nullable
10 b = ["aa", null] // ok
11
12 // a function type that returns string or null
13 let c: () => string | null
14 c = null // error, c is not nullable
15 c = (): string | null => { return null } // ok
16
17 // (a function type that returns string) or null
18 let d: (() => string) | null
19 d = null /
...
```

Example 4 (unknown):
```unknown
typeReference:
    typeReferencePart ('.' typeReferencePart)*
    |  Identifier '!'
    ;

typeReferencePart:
    Identifier typeArguments?
    ;
```

---

## 3. Types¶

**URL:** https://yoyocat.github.io/ArkTSSpec/3_types.html#function-types

**Contents:**
- 3. Types¶
- 3.1. Predefined Types¶
- 3.2. User-Defined Types¶
- 3.3. Types by Category¶
- 3.4. Using Types¶
- 3.5. Named Types¶
- 3.6. Type References¶
- 3.7. Value Types¶
  - 3.7.1. Integer Types and Operations¶
  - 3.7.2. Floating-Point Types and Operations¶

This chapter introduces the notion of type that is one of the fundamental concepts of ArkTS and other programming languages. Type classification as accepted in ArkTS is discussed below—along with all aspects of using types in programs written in the language.

Conventionally, the type of an entity is defined as the set of values the entity can take, and the set of operators applicable to the entity of a given type.

ArkTS is a statically typed language. It means that the type of every declared entity and every expression is known at compile time. The type of an entity is either set explicitly by a developer, or inferred implicitly by the compiler.

There are two categories of types:

The types integral to ArkTS are called predefined types (see Predefined Types).

The types introduced, declared, and defined by a developer are called user-defined types. All user-defined types must always have a complete type definition presented as source code in ArkTS.

Predefined types include the following:

Basic numeric value type: number

High-performance value types:

Numeric types: byte, short, int, long, float, and double;

Character type: char;

Boolean type: boolean;

Reference types: object, string, [] (array), bigint, void, never, and undefined;

Class types: Object, String, Array<T>, and BigInt.

Each predefined value type has a corresponding predefined class type that wraps the value of the predefined value type: Number, Byte, Short, Int, Long, Float, Double, Char, and Boolean.

The predefined value types are called primitive types. Primitive type names are reserved, i.e., they cannot be used for user-defined type names.

Type double is an alias to number. Type Double is an alias to Number.

User-defined types include the following:

Class types (see Classes);

Interface types (see Interfaces);

Enumeration types (see Enumerations);

Array types (see Array Types);

Function types (see Function Types);

Tuple types (see Tuple Types);

Union types (see Union Types); and

Type parameters (see Generic Parameters).

All ArkTS types are summarized in the following table:

Value Types (Primitive Types)

number, byte, short, int, long, float, double, char, boolean

Number, Byte, Short, Int, Long, Float, Double, Char, Boolean, Object, object, void, null, String, string, BigInt, bigint, never

class types, interface types, array types, function types, tuple types, union types, type parameters

A type can be referred to in source code by the following:

A reserved name f

*[Content truncated]*

**Examples:**

Example 1 (unknown):
```unknown
type:
    predefinedType
    | typeReference
    | arrayType
    | tupleType
    | functionType
    | unionType
    | keyofType
    | '(' type ')'
    ;
```

Example 2 (javascript):
```javascript
1 let b: boolean  // using primitive value type name
2 let n: number   // using primitive value type name
3 let o: Object   // using predefined class type name
4 let a: number[] // using array type
```

Example 3 (javascript):
```javascript
1 // a nullable array with elements of type string:
 2 let a: string[] | null
 3 let s: string[] = []
 4 a = s    // ok
 5 a = null // ok, a is nullable
 6
 7 // an array with elements whose types are string or null:
 8 let b: (string | null)[]
 9 b = null // error, b is an array and is not nullable
10 b = ["aa", null] // ok
11
12 // a function type that returns string or null
13 let c: () => string | null
14 c = null // error, c is not nullable
15 c = (): string | null => { return null } // ok
16
17 // (a function type that returns string) or null
18 let d: (() => string) | null
19 d = null /
...
```

Example 4 (unknown):
```unknown
typeReference:
    typeReferencePart ('.' typeReferencePart)*
    |  Identifier '!'
    ;

typeReferencePart:
    Identifier typeArguments?
    ;
```

---

## 3. Types¶

**URL:** https://yoyocat.github.io/ArkTSSpec/3_types.html#nullish-types

**Contents:**
- 3. Types¶
- 3.1. Predefined Types¶
- 3.2. User-Defined Types¶
- 3.3. Types by Category¶
- 3.4. Using Types¶
- 3.5. Named Types¶
- 3.6. Type References¶
- 3.7. Value Types¶
  - 3.7.1. Integer Types and Operations¶
  - 3.7.2. Floating-Point Types and Operations¶

This chapter introduces the notion of type that is one of the fundamental concepts of ArkTS and other programming languages. Type classification as accepted in ArkTS is discussed below—along with all aspects of using types in programs written in the language.

Conventionally, the type of an entity is defined as the set of values the entity can take, and the set of operators applicable to the entity of a given type.

ArkTS is a statically typed language. It means that the type of every declared entity and every expression is known at compile time. The type of an entity is either set explicitly by a developer, or inferred implicitly by the compiler.

There are two categories of types:

The types integral to ArkTS are called predefined types (see Predefined Types).

The types introduced, declared, and defined by a developer are called user-defined types. All user-defined types must always have a complete type definition presented as source code in ArkTS.

Predefined types include the following:

Basic numeric value type: number

High-performance value types:

Numeric types: byte, short, int, long, float, and double;

Character type: char;

Boolean type: boolean;

Reference types: object, string, [] (array), bigint, void, never, and undefined;

Class types: Object, String, Array<T>, and BigInt.

Each predefined value type has a corresponding predefined class type that wraps the value of the predefined value type: Number, Byte, Short, Int, Long, Float, Double, Char, and Boolean.

The predefined value types are called primitive types. Primitive type names are reserved, i.e., they cannot be used for user-defined type names.

Type double is an alias to number. Type Double is an alias to Number.

User-defined types include the following:

Class types (see Classes);

Interface types (see Interfaces);

Enumeration types (see Enumerations);

Array types (see Array Types);

Function types (see Function Types);

Tuple types (see Tuple Types);

Union types (see Union Types); and

Type parameters (see Generic Parameters).

All ArkTS types are summarized in the following table:

Value Types (Primitive Types)

number, byte, short, int, long, float, double, char, boolean

Number, Byte, Short, Int, Long, Float, Double, Char, Boolean, Object, object, void, null, String, string, BigInt, bigint, never

class types, interface types, array types, function types, tuple types, union types, type parameters

A type can be referred to in source code by the following:

A reserved name f

*[Content truncated]*

**Examples:**

Example 1 (unknown):
```unknown
type:
    predefinedType
    | typeReference
    | arrayType
    | tupleType
    | functionType
    | unionType
    | keyofType
    | '(' type ')'
    ;
```

Example 2 (javascript):
```javascript
1 let b: boolean  // using primitive value type name
2 let n: number   // using primitive value type name
3 let o: Object   // using predefined class type name
4 let a: number[] // using array type
```

Example 3 (javascript):
```javascript
1 // a nullable array with elements of type string:
 2 let a: string[] | null
 3 let s: string[] = []
 4 a = s    // ok
 5 a = null // ok, a is nullable
 6
 7 // an array with elements whose types are string or null:
 8 let b: (string | null)[]
 9 b = null // error, b is an array and is not nullable
10 b = ["aa", null] // ok
11
12 // a function type that returns string or null
13 let c: () => string | null
14 c = null // error, c is not nullable
15 c = (): string | null => { return null } // ok
16
17 // (a function type that returns string) or null
18 let d: (() => string) | null
19 d = null /
...
```

Example 4 (unknown):
```unknown
typeReference:
    typeReferencePart ('.' typeReferencePart)*
    |  Identifier '!'
    ;

typeReferencePart:
    Identifier typeArguments?
    ;
```

---

## 5. Generics¶

**URL:** https://yoyocat.github.io/ArkTSSpec/5_generics.html#generic-declarations

**Contents:**
- 5. Generics¶
- 5.1. Generic Declarations¶
- 5.2. Generic Parameters¶
- 5.3. Type Parameter Constraint¶
- 5.4. Generic Instantiations¶
- 5.5. Type Parameter Default¶
- 5.6. Type Arguments¶
- 5.7. Utility Types¶
  - 5.7.1. Partial Utility Type¶
  - 5.7.2. Required Utility Type¶

Class, interface, method, constructor, and function are program entities that can be generalized in the ArkTS language. Generalization is parameterizing an entity by one or several types. A generalized entity is introduced by a generic declaration (called generic for brevity).

Types used as generic parameters in a generic are called type parameters.

A generic must be instantiated in order to be used. Generic instantiation is the action that converts a generic into a real program entity: ordinary class, interface, function, etc. Instantiation can be performed either explicitly or implicitly.

Explicit generic instantiation is the language construct that specifies real types, which substitute type parameters of a generic. Real types specified in the instantiation are called type arguments.

In an implicit instantiation, type arguments are not specified explicitly. They are inferred from the context the generic is referred in. Implicit instantiation is possible only for functions and methods.

The result of instantiation is a real, non-parameterized program entity: class, interface, method, constructor, or function. The entity is handled exactly as an ordinary class, interface, method, constructor, or function.

Conceptually, a generic class, an interface, a method, a constructor, or a function defines a set of classes, interfaces, methods, constructors, or functions respectively (see Generic Instantiations).

A class, an interface, or a function must be parameterized by at least one type parameter to be a generic. The type parameter is declared in the type parameter section. It can be used as an ordinary type inside a generic.

Syntactically, a type parameter is an unqualified identifier (see Scopes for the scope of type parameters). Each type parameter can have a constraint (see Type Parameter Constraint). A type parameter can have a default type (see Type Parameter Default).

A generic class, interface, method, constructor, or function defines a set of parameterized classes, interfaces, methods, constructors, or functions respectively (see Generic Instantiations). One type argument can define only one set for each possible parameterization of the type parameter section.

If a type parameter has restrictions, or constraints, then such constraints must be followed by the corresponding type argument in a generic instantiation.

In every type parameter, a constraint can follow the keyword extends. The constraint is denoted as a single type parameter T. If no

*[Content truncated]*

**Examples:**

Example 1 (unknown):
```unknown
typeParameters:
    '<' typeParameterList '>'
    ;

typeParameterList:
    typeParameter (',' typeParameter)*
    ;

typeParameter:
    ('in' | 'out')? identifier constraint? typeParameterDefault?
    ;

constraint:
    'extends' typeReference | keyofType
    ;

typeParameterDefault:
    '=' typeReference
    ;
```

Example 2 (unknown):
```unknown
extends Object|null|undefined
```

Example 3 (javascript):
```javascript
1 class Base {}
 2 class Derived extends Base { }
 3 class SomeType { }
 4
 5 class G<T extends Base> { }
 6
 7 let x: G<Base>      // correct
 8 let y: G<Derived>   // also correct
 9 let z: G<SomeType>  // error: SomeType is not a subtype of Base
10
11 class A {
12   f1: number = 0
13   f2: string = ""
14   f3: boolean = false
15 }
16 class B<T extends keyof A> {}
17 let b1 = new B<'f1'>    // OK
18 let b2 = new B<'f0'>    // Compile-time error as "f0" does not satisfy the constraint 'keyof A'
19 let b3 = new B<keyof A> // OK
```

Example 4 (javascript):
```javascript
1 class Base {}
 2 class Derived { }
 3 class SomeType { }
 4
 5 class G<T, S extends T> {}
 6
 7 let x: G<Base, Derived>  // correct: the second argument directly
 8                         // depends on the first one
 9 let y: G<Base, SomeType> // error: SomeType doesn't depend on Base
10
11 class A0<T> {
12    data: T
13    constructor (p: T) { this.data = p }
14    foo () {
15       let o: Object = this.data // error: as type T is not compatible with Object
16       console.log (this.data.toString()) // error: type T has no methods or fields
17    }
18 }
19
20 class A1<T extends Object> ex
...
```

---

## 5. Generics¶

**URL:** https://yoyocat.github.io/ArkTSSpec/5_generics.html#type-parameter-constraint

**Contents:**
- 5. Generics¶
- 5.1. Generic Declarations¶
- 5.2. Generic Parameters¶
- 5.3. Type Parameter Constraint¶
- 5.4. Generic Instantiations¶
- 5.5. Type Parameter Default¶
- 5.6. Type Arguments¶
- 5.7. Utility Types¶
  - 5.7.1. Partial Utility Type¶
  - 5.7.2. Required Utility Type¶

Class, interface, method, constructor, and function are program entities that can be generalized in the ArkTS language. Generalization is parameterizing an entity by one or several types. A generalized entity is introduced by a generic declaration (called generic for brevity).

Types used as generic parameters in a generic are called type parameters.

A generic must be instantiated in order to be used. Generic instantiation is the action that converts a generic into a real program entity: ordinary class, interface, function, etc. Instantiation can be performed either explicitly or implicitly.

Explicit generic instantiation is the language construct that specifies real types, which substitute type parameters of a generic. Real types specified in the instantiation are called type arguments.

In an implicit instantiation, type arguments are not specified explicitly. They are inferred from the context the generic is referred in. Implicit instantiation is possible only for functions and methods.

The result of instantiation is a real, non-parameterized program entity: class, interface, method, constructor, or function. The entity is handled exactly as an ordinary class, interface, method, constructor, or function.

Conceptually, a generic class, an interface, a method, a constructor, or a function defines a set of classes, interfaces, methods, constructors, or functions respectively (see Generic Instantiations).

A class, an interface, or a function must be parameterized by at least one type parameter to be a generic. The type parameter is declared in the type parameter section. It can be used as an ordinary type inside a generic.

Syntactically, a type parameter is an unqualified identifier (see Scopes for the scope of type parameters). Each type parameter can have a constraint (see Type Parameter Constraint). A type parameter can have a default type (see Type Parameter Default).

A generic class, interface, method, constructor, or function defines a set of parameterized classes, interfaces, methods, constructors, or functions respectively (see Generic Instantiations). One type argument can define only one set for each possible parameterization of the type parameter section.

If a type parameter has restrictions, or constraints, then such constraints must be followed by the corresponding type argument in a generic instantiation.

In every type parameter, a constraint can follow the keyword extends. The constraint is denoted as a single type parameter T. If no

*[Content truncated]*

**Examples:**

Example 1 (unknown):
```unknown
typeParameters:
    '<' typeParameterList '>'
    ;

typeParameterList:
    typeParameter (',' typeParameter)*
    ;

typeParameter:
    ('in' | 'out')? identifier constraint? typeParameterDefault?
    ;

constraint:
    'extends' typeReference | keyofType
    ;

typeParameterDefault:
    '=' typeReference
    ;
```

Example 2 (unknown):
```unknown
extends Object|null|undefined
```

Example 3 (javascript):
```javascript
1 class Base {}
 2 class Derived extends Base { }
 3 class SomeType { }
 4
 5 class G<T extends Base> { }
 6
 7 let x: G<Base>      // correct
 8 let y: G<Derived>   // also correct
 9 let z: G<SomeType>  // error: SomeType is not a subtype of Base
10
11 class A {
12   f1: number = 0
13   f2: string = ""
14   f3: boolean = false
15 }
16 class B<T extends keyof A> {}
17 let b1 = new B<'f1'>    // OK
18 let b2 = new B<'f0'>    // Compile-time error as "f0" does not satisfy the constraint 'keyof A'
19 let b3 = new B<keyof A> // OK
```

Example 4 (javascript):
```javascript
1 class Base {}
 2 class Derived { }
 3 class SomeType { }
 4
 5 class G<T, S extends T> {}
 6
 7 let x: G<Base, Derived>  // correct: the second argument directly
 8                         // depends on the first one
 9 let y: G<Base, SomeType> // error: SomeType doesn't depend on Base
10
11 class A0<T> {
12    data: T
13    constructor (p: T) { this.data = p }
14    foo () {
15       let o: Object = this.data // error: as type T is not compatible with Object
16       console.log (this.data.toString()) // error: type T has no methods or fields
17    }
18 }
19
20 class A1<T extends Object> ex
...
```

---

## 5. Generics¶

**URL:** https://yoyocat.github.io/ArkTSSpec/5_generics.html#generic-parameters

**Contents:**
- 5. Generics¶
- 5.1. Generic Declarations¶
- 5.2. Generic Parameters¶
- 5.3. Type Parameter Constraint¶
- 5.4. Generic Instantiations¶
- 5.5. Type Parameter Default¶
- 5.6. Type Arguments¶
- 5.7. Utility Types¶
  - 5.7.1. Partial Utility Type¶
  - 5.7.2. Required Utility Type¶

Class, interface, method, constructor, and function are program entities that can be generalized in the ArkTS language. Generalization is parameterizing an entity by one or several types. A generalized entity is introduced by a generic declaration (called generic for brevity).

Types used as generic parameters in a generic are called type parameters.

A generic must be instantiated in order to be used. Generic instantiation is the action that converts a generic into a real program entity: ordinary class, interface, function, etc. Instantiation can be performed either explicitly or implicitly.

Explicit generic instantiation is the language construct that specifies real types, which substitute type parameters of a generic. Real types specified in the instantiation are called type arguments.

In an implicit instantiation, type arguments are not specified explicitly. They are inferred from the context the generic is referred in. Implicit instantiation is possible only for functions and methods.

The result of instantiation is a real, non-parameterized program entity: class, interface, method, constructor, or function. The entity is handled exactly as an ordinary class, interface, method, constructor, or function.

Conceptually, a generic class, an interface, a method, a constructor, or a function defines a set of classes, interfaces, methods, constructors, or functions respectively (see Generic Instantiations).

A class, an interface, or a function must be parameterized by at least one type parameter to be a generic. The type parameter is declared in the type parameter section. It can be used as an ordinary type inside a generic.

Syntactically, a type parameter is an unqualified identifier (see Scopes for the scope of type parameters). Each type parameter can have a constraint (see Type Parameter Constraint). A type parameter can have a default type (see Type Parameter Default).

A generic class, interface, method, constructor, or function defines a set of parameterized classes, interfaces, methods, constructors, or functions respectively (see Generic Instantiations). One type argument can define only one set for each possible parameterization of the type parameter section.

If a type parameter has restrictions, or constraints, then such constraints must be followed by the corresponding type argument in a generic instantiation.

In every type parameter, a constraint can follow the keyword extends. The constraint is denoted as a single type parameter T. If no

*[Content truncated]*

**Examples:**

Example 1 (unknown):
```unknown
typeParameters:
    '<' typeParameterList '>'
    ;

typeParameterList:
    typeParameter (',' typeParameter)*
    ;

typeParameter:
    ('in' | 'out')? identifier constraint? typeParameterDefault?
    ;

constraint:
    'extends' typeReference | keyofType
    ;

typeParameterDefault:
    '=' typeReference
    ;
```

Example 2 (unknown):
```unknown
extends Object|null|undefined
```

Example 3 (javascript):
```javascript
1 class Base {}
 2 class Derived extends Base { }
 3 class SomeType { }
 4
 5 class G<T extends Base> { }
 6
 7 let x: G<Base>      // correct
 8 let y: G<Derived>   // also correct
 9 let z: G<SomeType>  // error: SomeType is not a subtype of Base
10
11 class A {
12   f1: number = 0
13   f2: string = ""
14   f3: boolean = false
15 }
16 class B<T extends keyof A> {}
17 let b1 = new B<'f1'>    // OK
18 let b2 = new B<'f0'>    // Compile-time error as "f0" does not satisfy the constraint 'keyof A'
19 let b3 = new B<keyof A> // OK
```

Example 4 (javascript):
```javascript
1 class Base {}
 2 class Derived { }
 3 class SomeType { }
 4
 5 class G<T, S extends T> {}
 6
 7 let x: G<Base, Derived>  // correct: the second argument directly
 8                         // depends on the first one
 9 let y: G<Base, SomeType> // error: SomeType doesn't depend on Base
10
11 class A0<T> {
12    data: T
13    constructor (p: T) { this.data = p }
14    foo () {
15       let o: Object = this.data // error: as type T is not compatible with Object
16       console.log (this.data.toString()) // error: type T has no methods or fields
17    }
18 }
19
20 class A1<T extends Object> ex
...
```

---

## 5. Generics¶

**URL:** https://yoyocat.github.io/ArkTSSpec/5_generics.html#partial-utility-type

**Contents:**
- 5. Generics¶
- 5.1. Generic Declarations¶
- 5.2. Generic Parameters¶
- 5.3. Type Parameter Constraint¶
- 5.4. Generic Instantiations¶
- 5.5. Type Parameter Default¶
- 5.6. Type Arguments¶
- 5.7. Utility Types¶
  - 5.7.1. Partial Utility Type¶
  - 5.7.2. Required Utility Type¶

Class, interface, method, constructor, and function are program entities that can be generalized in the ArkTS language. Generalization is parameterizing an entity by one or several types. A generalized entity is introduced by a generic declaration (called generic for brevity).

Types used as generic parameters in a generic are called type parameters.

A generic must be instantiated in order to be used. Generic instantiation is the action that converts a generic into a real program entity: ordinary class, interface, function, etc. Instantiation can be performed either explicitly or implicitly.

Explicit generic instantiation is the language construct that specifies real types, which substitute type parameters of a generic. Real types specified in the instantiation are called type arguments.

In an implicit instantiation, type arguments are not specified explicitly. They are inferred from the context the generic is referred in. Implicit instantiation is possible only for functions and methods.

The result of instantiation is a real, non-parameterized program entity: class, interface, method, constructor, or function. The entity is handled exactly as an ordinary class, interface, method, constructor, or function.

Conceptually, a generic class, an interface, a method, a constructor, or a function defines a set of classes, interfaces, methods, constructors, or functions respectively (see Generic Instantiations).

A class, an interface, or a function must be parameterized by at least one type parameter to be a generic. The type parameter is declared in the type parameter section. It can be used as an ordinary type inside a generic.

Syntactically, a type parameter is an unqualified identifier (see Scopes for the scope of type parameters). Each type parameter can have a constraint (see Type Parameter Constraint). A type parameter can have a default type (see Type Parameter Default).

A generic class, interface, method, constructor, or function defines a set of parameterized classes, interfaces, methods, constructors, or functions respectively (see Generic Instantiations). One type argument can define only one set for each possible parameterization of the type parameter section.

If a type parameter has restrictions, or constraints, then such constraints must be followed by the corresponding type argument in a generic instantiation.

In every type parameter, a constraint can follow the keyword extends. The constraint is denoted as a single type parameter T. If no

*[Content truncated]*

**Examples:**

Example 1 (unknown):
```unknown
typeParameters:
    '<' typeParameterList '>'
    ;

typeParameterList:
    typeParameter (',' typeParameter)*
    ;

typeParameter:
    ('in' | 'out')? identifier constraint? typeParameterDefault?
    ;

constraint:
    'extends' typeReference | keyofType
    ;

typeParameterDefault:
    '=' typeReference
    ;
```

Example 2 (unknown):
```unknown
extends Object|null|undefined
```

Example 3 (javascript):
```javascript
1 class Base {}
 2 class Derived extends Base { }
 3 class SomeType { }
 4
 5 class G<T extends Base> { }
 6
 7 let x: G<Base>      // correct
 8 let y: G<Derived>   // also correct
 9 let z: G<SomeType>  // error: SomeType is not a subtype of Base
10
11 class A {
12   f1: number = 0
13   f2: string = ""
14   f3: boolean = false
15 }
16 class B<T extends keyof A> {}
17 let b1 = new B<'f1'>    // OK
18 let b2 = new B<'f0'>    // Compile-time error as "f0" does not satisfy the constraint 'keyof A'
19 let b3 = new B<keyof A> // OK
```

Example 4 (javascript):
```javascript
1 class Base {}
 2 class Derived { }
 3 class SomeType { }
 4
 5 class G<T, S extends T> {}
 6
 7 let x: G<Base, Derived>  // correct: the second argument directly
 8                         // depends on the first one
 9 let y: G<Base, SomeType> // error: SomeType doesn't depend on Base
10
11 class A0<T> {
12    data: T
13    constructor (p: T) { this.data = p }
14    foo () {
15       let o: Object = this.data // error: as type T is not compatible with Object
16       console.log (this.data.toString()) // error: type T has no methods or fields
17    }
18 }
19
20 class A1<T extends Object> ex
...
```

---

## 5. Generics¶

**URL:** https://yoyocat.github.io/ArkTSSpec/5_generics.html#type-arguments

**Contents:**
- 5. Generics¶
- 5.1. Generic Declarations¶
- 5.2. Generic Parameters¶
- 5.3. Type Parameter Constraint¶
- 5.4. Generic Instantiations¶
- 5.5. Type Parameter Default¶
- 5.6. Type Arguments¶
- 5.7. Utility Types¶
  - 5.7.1. Partial Utility Type¶
  - 5.7.2. Required Utility Type¶

Class, interface, method, constructor, and function are program entities that can be generalized in the ArkTS language. Generalization is parameterizing an entity by one or several types. A generalized entity is introduced by a generic declaration (called generic for brevity).

Types used as generic parameters in a generic are called type parameters.

A generic must be instantiated in order to be used. Generic instantiation is the action that converts a generic into a real program entity: ordinary class, interface, function, etc. Instantiation can be performed either explicitly or implicitly.

Explicit generic instantiation is the language construct that specifies real types, which substitute type parameters of a generic. Real types specified in the instantiation are called type arguments.

In an implicit instantiation, type arguments are not specified explicitly. They are inferred from the context the generic is referred in. Implicit instantiation is possible only for functions and methods.

The result of instantiation is a real, non-parameterized program entity: class, interface, method, constructor, or function. The entity is handled exactly as an ordinary class, interface, method, constructor, or function.

Conceptually, a generic class, an interface, a method, a constructor, or a function defines a set of classes, interfaces, methods, constructors, or functions respectively (see Generic Instantiations).

A class, an interface, or a function must be parameterized by at least one type parameter to be a generic. The type parameter is declared in the type parameter section. It can be used as an ordinary type inside a generic.

Syntactically, a type parameter is an unqualified identifier (see Scopes for the scope of type parameters). Each type parameter can have a constraint (see Type Parameter Constraint). A type parameter can have a default type (see Type Parameter Default).

A generic class, interface, method, constructor, or function defines a set of parameterized classes, interfaces, methods, constructors, or functions respectively (see Generic Instantiations). One type argument can define only one set for each possible parameterization of the type parameter section.

If a type parameter has restrictions, or constraints, then such constraints must be followed by the corresponding type argument in a generic instantiation.

In every type parameter, a constraint can follow the keyword extends. The constraint is denoted as a single type parameter T. If no

*[Content truncated]*

**Examples:**

Example 1 (unknown):
```unknown
typeParameters:
    '<' typeParameterList '>'
    ;

typeParameterList:
    typeParameter (',' typeParameter)*
    ;

typeParameter:
    ('in' | 'out')? identifier constraint? typeParameterDefault?
    ;

constraint:
    'extends' typeReference | keyofType
    ;

typeParameterDefault:
    '=' typeReference
    ;
```

Example 2 (unknown):
```unknown
extends Object|null|undefined
```

Example 3 (javascript):
```javascript
1 class Base {}
 2 class Derived extends Base { }
 3 class SomeType { }
 4
 5 class G<T extends Base> { }
 6
 7 let x: G<Base>      // correct
 8 let y: G<Derived>   // also correct
 9 let z: G<SomeType>  // error: SomeType is not a subtype of Base
10
11 class A {
12   f1: number = 0
13   f2: string = ""
14   f3: boolean = false
15 }
16 class B<T extends keyof A> {}
17 let b1 = new B<'f1'>    // OK
18 let b2 = new B<'f0'>    // Compile-time error as "f0" does not satisfy the constraint 'keyof A'
19 let b3 = new B<keyof A> // OK
```

Example 4 (javascript):
```javascript
1 class Base {}
 2 class Derived { }
 3 class SomeType { }
 4
 5 class G<T, S extends T> {}
 6
 7 let x: G<Base, Derived>  // correct: the second argument directly
 8                         // depends on the first one
 9 let y: G<Base, SomeType> // error: SomeType doesn't depend on Base
10
11 class A0<T> {
12    data: T
13    constructor (p: T) { this.data = p }
14    foo () {
15       let o: Object = this.data // error: as type T is not compatible with Object
16       console.log (this.data.toString()) // error: type T has no methods or fields
17    }
18 }
19
20 class A1<T extends Object> ex
...
```

---

## 5. Generics¶

**URL:** https://yoyocat.github.io/ArkTSSpec/5_generics.html#readonly-utility-type

**Contents:**
- 5. Generics¶
- 5.1. Generic Declarations¶
- 5.2. Generic Parameters¶
- 5.3. Type Parameter Constraint¶
- 5.4. Generic Instantiations¶
- 5.5. Type Parameter Default¶
- 5.6. Type Arguments¶
- 5.7. Utility Types¶
  - 5.7.1. Partial Utility Type¶
  - 5.7.2. Required Utility Type¶

Class, interface, method, constructor, and function are program entities that can be generalized in the ArkTS language. Generalization is parameterizing an entity by one or several types. A generalized entity is introduced by a generic declaration (called generic for brevity).

Types used as generic parameters in a generic are called type parameters.

A generic must be instantiated in order to be used. Generic instantiation is the action that converts a generic into a real program entity: ordinary class, interface, function, etc. Instantiation can be performed either explicitly or implicitly.

Explicit generic instantiation is the language construct that specifies real types, which substitute type parameters of a generic. Real types specified in the instantiation are called type arguments.

In an implicit instantiation, type arguments are not specified explicitly. They are inferred from the context the generic is referred in. Implicit instantiation is possible only for functions and methods.

The result of instantiation is a real, non-parameterized program entity: class, interface, method, constructor, or function. The entity is handled exactly as an ordinary class, interface, method, constructor, or function.

Conceptually, a generic class, an interface, a method, a constructor, or a function defines a set of classes, interfaces, methods, constructors, or functions respectively (see Generic Instantiations).

A class, an interface, or a function must be parameterized by at least one type parameter to be a generic. The type parameter is declared in the type parameter section. It can be used as an ordinary type inside a generic.

Syntactically, a type parameter is an unqualified identifier (see Scopes for the scope of type parameters). Each type parameter can have a constraint (see Type Parameter Constraint). A type parameter can have a default type (see Type Parameter Default).

A generic class, interface, method, constructor, or function defines a set of parameterized classes, interfaces, methods, constructors, or functions respectively (see Generic Instantiations). One type argument can define only one set for each possible parameterization of the type parameter section.

If a type parameter has restrictions, or constraints, then such constraints must be followed by the corresponding type argument in a generic instantiation.

In every type parameter, a constraint can follow the keyword extends. The constraint is denoted as a single type parameter T. If no

*[Content truncated]*

**Examples:**

Example 1 (unknown):
```unknown
typeParameters:
    '<' typeParameterList '>'
    ;

typeParameterList:
    typeParameter (',' typeParameter)*
    ;

typeParameter:
    ('in' | 'out')? identifier constraint? typeParameterDefault?
    ;

constraint:
    'extends' typeReference | keyofType
    ;

typeParameterDefault:
    '=' typeReference
    ;
```

Example 2 (unknown):
```unknown
extends Object|null|undefined
```

Example 3 (javascript):
```javascript
1 class Base {}
 2 class Derived extends Base { }
 3 class SomeType { }
 4
 5 class G<T extends Base> { }
 6
 7 let x: G<Base>      // correct
 8 let y: G<Derived>   // also correct
 9 let z: G<SomeType>  // error: SomeType is not a subtype of Base
10
11 class A {
12   f1: number = 0
13   f2: string = ""
14   f3: boolean = false
15 }
16 class B<T extends keyof A> {}
17 let b1 = new B<'f1'>    // OK
18 let b2 = new B<'f0'>    // Compile-time error as "f0" does not satisfy the constraint 'keyof A'
19 let b3 = new B<keyof A> // OK
```

Example 4 (javascript):
```javascript
1 class Base {}
 2 class Derived { }
 3 class SomeType { }
 4
 5 class G<T, S extends T> {}
 6
 7 let x: G<Base, Derived>  // correct: the second argument directly
 8                         // depends on the first one
 9 let y: G<Base, SomeType> // error: SomeType doesn't depend on Base
10
11 class A0<T> {
12    data: T
13    constructor (p: T) { this.data = p }
14    foo () {
15       let o: Object = this.data // error: as type T is not compatible with Object
16       console.log (this.data.toString()) // error: type T has no methods or fields
17    }
18 }
19
20 class A1<T extends Object> ex
...
```

---

## 5. Generics¶

**URL:** https://yoyocat.github.io/ArkTSSpec/5_generics.html#record-utility-type

**Contents:**
- 5. Generics¶
- 5.1. Generic Declarations¶
- 5.2. Generic Parameters¶
- 5.3. Type Parameter Constraint¶
- 5.4. Generic Instantiations¶
- 5.5. Type Parameter Default¶
- 5.6. Type Arguments¶
- 5.7. Utility Types¶
  - 5.7.1. Partial Utility Type¶
  - 5.7.2. Required Utility Type¶

Class, interface, method, constructor, and function are program entities that can be generalized in the ArkTS language. Generalization is parameterizing an entity by one or several types. A generalized entity is introduced by a generic declaration (called generic for brevity).

Types used as generic parameters in a generic are called type parameters.

A generic must be instantiated in order to be used. Generic instantiation is the action that converts a generic into a real program entity: ordinary class, interface, function, etc. Instantiation can be performed either explicitly or implicitly.

Explicit generic instantiation is the language construct that specifies real types, which substitute type parameters of a generic. Real types specified in the instantiation are called type arguments.

In an implicit instantiation, type arguments are not specified explicitly. They are inferred from the context the generic is referred in. Implicit instantiation is possible only for functions and methods.

The result of instantiation is a real, non-parameterized program entity: class, interface, method, constructor, or function. The entity is handled exactly as an ordinary class, interface, method, constructor, or function.

Conceptually, a generic class, an interface, a method, a constructor, or a function defines a set of classes, interfaces, methods, constructors, or functions respectively (see Generic Instantiations).

A class, an interface, or a function must be parameterized by at least one type parameter to be a generic. The type parameter is declared in the type parameter section. It can be used as an ordinary type inside a generic.

Syntactically, a type parameter is an unqualified identifier (see Scopes for the scope of type parameters). Each type parameter can have a constraint (see Type Parameter Constraint). A type parameter can have a default type (see Type Parameter Default).

A generic class, interface, method, constructor, or function defines a set of parameterized classes, interfaces, methods, constructors, or functions respectively (see Generic Instantiations). One type argument can define only one set for each possible parameterization of the type parameter section.

If a type parameter has restrictions, or constraints, then such constraints must be followed by the corresponding type argument in a generic instantiation.

In every type parameter, a constraint can follow the keyword extends. The constraint is denoted as a single type parameter T. If no

*[Content truncated]*

**Examples:**

Example 1 (unknown):
```unknown
typeParameters:
    '<' typeParameterList '>'
    ;

typeParameterList:
    typeParameter (',' typeParameter)*
    ;

typeParameter:
    ('in' | 'out')? identifier constraint? typeParameterDefault?
    ;

constraint:
    'extends' typeReference | keyofType
    ;

typeParameterDefault:
    '=' typeReference
    ;
```

Example 2 (unknown):
```unknown
extends Object|null|undefined
```

Example 3 (javascript):
```javascript
1 class Base {}
 2 class Derived extends Base { }
 3 class SomeType { }
 4
 5 class G<T extends Base> { }
 6
 7 let x: G<Base>      // correct
 8 let y: G<Derived>   // also correct
 9 let z: G<SomeType>  // error: SomeType is not a subtype of Base
10
11 class A {
12   f1: number = 0
13   f2: string = ""
14   f3: boolean = false
15 }
16 class B<T extends keyof A> {}
17 let b1 = new B<'f1'>    // OK
18 let b2 = new B<'f0'>    // Compile-time error as "f0" does not satisfy the constraint 'keyof A'
19 let b3 = new B<keyof A> // OK
```

Example 4 (javascript):
```javascript
1 class Base {}
 2 class Derived { }
 3 class SomeType { }
 4
 5 class G<T, S extends T> {}
 6
 7 let x: G<Base, Derived>  // correct: the second argument directly
 8                         // depends on the first one
 9 let y: G<Base, SomeType> // error: SomeType doesn't depend on Base
10
11 class A0<T> {
12    data: T
13    constructor (p: T) { this.data = p }
14    foo () {
15       let o: Object = this.data // error: as type T is not compatible with Object
16       console.log (this.data.toString()) // error: type T has no methods or fields
17    }
18 }
19
20 class A1<T extends Object> ex
...
```

---

## 5. Generics¶

**URL:** https://yoyocat.github.io/ArkTSSpec/5_generics.html#generic-instantiations

**Contents:**
- 5. Generics¶
- 5.1. Generic Declarations¶
- 5.2. Generic Parameters¶
- 5.3. Type Parameter Constraint¶
- 5.4. Generic Instantiations¶
- 5.5. Type Parameter Default¶
- 5.6. Type Arguments¶
- 5.7. Utility Types¶
  - 5.7.1. Partial Utility Type¶
  - 5.7.2. Required Utility Type¶

Class, interface, method, constructor, and function are program entities that can be generalized in the ArkTS language. Generalization is parameterizing an entity by one or several types. A generalized entity is introduced by a generic declaration (called generic for brevity).

Types used as generic parameters in a generic are called type parameters.

A generic must be instantiated in order to be used. Generic instantiation is the action that converts a generic into a real program entity: ordinary class, interface, function, etc. Instantiation can be performed either explicitly or implicitly.

Explicit generic instantiation is the language construct that specifies real types, which substitute type parameters of a generic. Real types specified in the instantiation are called type arguments.

In an implicit instantiation, type arguments are not specified explicitly. They are inferred from the context the generic is referred in. Implicit instantiation is possible only for functions and methods.

The result of instantiation is a real, non-parameterized program entity: class, interface, method, constructor, or function. The entity is handled exactly as an ordinary class, interface, method, constructor, or function.

Conceptually, a generic class, an interface, a method, a constructor, or a function defines a set of classes, interfaces, methods, constructors, or functions respectively (see Generic Instantiations).

A class, an interface, or a function must be parameterized by at least one type parameter to be a generic. The type parameter is declared in the type parameter section. It can be used as an ordinary type inside a generic.

Syntactically, a type parameter is an unqualified identifier (see Scopes for the scope of type parameters). Each type parameter can have a constraint (see Type Parameter Constraint). A type parameter can have a default type (see Type Parameter Default).

A generic class, interface, method, constructor, or function defines a set of parameterized classes, interfaces, methods, constructors, or functions respectively (see Generic Instantiations). One type argument can define only one set for each possible parameterization of the type parameter section.

If a type parameter has restrictions, or constraints, then such constraints must be followed by the corresponding type argument in a generic instantiation.

In every type parameter, a constraint can follow the keyword extends. The constraint is denoted as a single type parameter T. If no

*[Content truncated]*

**Examples:**

Example 1 (unknown):
```unknown
typeParameters:
    '<' typeParameterList '>'
    ;

typeParameterList:
    typeParameter (',' typeParameter)*
    ;

typeParameter:
    ('in' | 'out')? identifier constraint? typeParameterDefault?
    ;

constraint:
    'extends' typeReference | keyofType
    ;

typeParameterDefault:
    '=' typeReference
    ;
```

Example 2 (unknown):
```unknown
extends Object|null|undefined
```

Example 3 (javascript):
```javascript
1 class Base {}
 2 class Derived extends Base { }
 3 class SomeType { }
 4
 5 class G<T extends Base> { }
 6
 7 let x: G<Base>      // correct
 8 let y: G<Derived>   // also correct
 9 let z: G<SomeType>  // error: SomeType is not a subtype of Base
10
11 class A {
12   f1: number = 0
13   f2: string = ""
14   f3: boolean = false
15 }
16 class B<T extends keyof A> {}
17 let b1 = new B<'f1'>    // OK
18 let b2 = new B<'f0'>    // Compile-time error as "f0" does not satisfy the constraint 'keyof A'
19 let b3 = new B<keyof A> // OK
```

Example 4 (javascript):
```javascript
1 class Base {}
 2 class Derived { }
 3 class SomeType { }
 4
 5 class G<T, S extends T> {}
 6
 7 let x: G<Base, Derived>  // correct: the second argument directly
 8                         // depends on the first one
 9 let y: G<Base, SomeType> // error: SomeType doesn't depend on Base
10
11 class A0<T> {
12    data: T
13    constructor (p: T) { this.data = p }
14    foo () {
15       let o: Object = this.data // error: as type T is not compatible with Object
16       console.log (this.data.toString()) // error: type T has no methods or fields
17    }
18 }
19
20 class A1<T extends Object> ex
...
```

---

## 5. Generics¶

**URL:** https://yoyocat.github.io/ArkTSSpec/5_generics.html#required-utility-type

**Contents:**
- 5. Generics¶
- 5.1. Generic Declarations¶
- 5.2. Generic Parameters¶
- 5.3. Type Parameter Constraint¶
- 5.4. Generic Instantiations¶
- 5.5. Type Parameter Default¶
- 5.6. Type Arguments¶
- 5.7. Utility Types¶
  - 5.7.1. Partial Utility Type¶
  - 5.7.2. Required Utility Type¶

Class, interface, method, constructor, and function are program entities that can be generalized in the ArkTS language. Generalization is parameterizing an entity by one or several types. A generalized entity is introduced by a generic declaration (called generic for brevity).

Types used as generic parameters in a generic are called type parameters.

A generic must be instantiated in order to be used. Generic instantiation is the action that converts a generic into a real program entity: ordinary class, interface, function, etc. Instantiation can be performed either explicitly or implicitly.

Explicit generic instantiation is the language construct that specifies real types, which substitute type parameters of a generic. Real types specified in the instantiation are called type arguments.

In an implicit instantiation, type arguments are not specified explicitly. They are inferred from the context the generic is referred in. Implicit instantiation is possible only for functions and methods.

The result of instantiation is a real, non-parameterized program entity: class, interface, method, constructor, or function. The entity is handled exactly as an ordinary class, interface, method, constructor, or function.

Conceptually, a generic class, an interface, a method, a constructor, or a function defines a set of classes, interfaces, methods, constructors, or functions respectively (see Generic Instantiations).

A class, an interface, or a function must be parameterized by at least one type parameter to be a generic. The type parameter is declared in the type parameter section. It can be used as an ordinary type inside a generic.

Syntactically, a type parameter is an unqualified identifier (see Scopes for the scope of type parameters). Each type parameter can have a constraint (see Type Parameter Constraint). A type parameter can have a default type (see Type Parameter Default).

A generic class, interface, method, constructor, or function defines a set of parameterized classes, interfaces, methods, constructors, or functions respectively (see Generic Instantiations). One type argument can define only one set for each possible parameterization of the type parameter section.

If a type parameter has restrictions, or constraints, then such constraints must be followed by the corresponding type argument in a generic instantiation.

In every type parameter, a constraint can follow the keyword extends. The constraint is denoted as a single type parameter T. If no

*[Content truncated]*

**Examples:**

Example 1 (unknown):
```unknown
typeParameters:
    '<' typeParameterList '>'
    ;

typeParameterList:
    typeParameter (',' typeParameter)*
    ;

typeParameter:
    ('in' | 'out')? identifier constraint? typeParameterDefault?
    ;

constraint:
    'extends' typeReference | keyofType
    ;

typeParameterDefault:
    '=' typeReference
    ;
```

Example 2 (unknown):
```unknown
extends Object|null|undefined
```

Example 3 (javascript):
```javascript
1 class Base {}
 2 class Derived extends Base { }
 3 class SomeType { }
 4
 5 class G<T extends Base> { }
 6
 7 let x: G<Base>      // correct
 8 let y: G<Derived>   // also correct
 9 let z: G<SomeType>  // error: SomeType is not a subtype of Base
10
11 class A {
12   f1: number = 0
13   f2: string = ""
14   f3: boolean = false
15 }
16 class B<T extends keyof A> {}
17 let b1 = new B<'f1'>    // OK
18 let b2 = new B<'f0'>    // Compile-time error as "f0" does not satisfy the constraint 'keyof A'
19 let b3 = new B<keyof A> // OK
```

Example 4 (javascript):
```javascript
1 class Base {}
 2 class Derived { }
 3 class SomeType { }
 4
 5 class G<T, S extends T> {}
 6
 7 let x: G<Base, Derived>  // correct: the second argument directly
 8                         // depends on the first one
 9 let y: G<Base, SomeType> // error: SomeType doesn't depend on Base
10
11 class A0<T> {
12    data: T
13    constructor (p: T) { this.data = p }
14    foo () {
15       let o: Object = this.data // error: as type T is not compatible with Object
16       console.log (this.data.toString()) // error: type T has no methods or fields
17    }
18 }
19
20 class A1<T extends Object> ex
...
```

---

## 5. Generics¶

**URL:** https://yoyocat.github.io/ArkTSSpec/5_generics.html#utility-types

**Contents:**
- 5. Generics¶
- 5.1. Generic Declarations¶
- 5.2. Generic Parameters¶
- 5.3. Type Parameter Constraint¶
- 5.4. Generic Instantiations¶
- 5.5. Type Parameter Default¶
- 5.6. Type Arguments¶
- 5.7. Utility Types¶
  - 5.7.1. Partial Utility Type¶
  - 5.7.2. Required Utility Type¶

Class, interface, method, constructor, and function are program entities that can be generalized in the ArkTS language. Generalization is parameterizing an entity by one or several types. A generalized entity is introduced by a generic declaration (called generic for brevity).

Types used as generic parameters in a generic are called type parameters.

A generic must be instantiated in order to be used. Generic instantiation is the action that converts a generic into a real program entity: ordinary class, interface, function, etc. Instantiation can be performed either explicitly or implicitly.

Explicit generic instantiation is the language construct that specifies real types, which substitute type parameters of a generic. Real types specified in the instantiation are called type arguments.

In an implicit instantiation, type arguments are not specified explicitly. They are inferred from the context the generic is referred in. Implicit instantiation is possible only for functions and methods.

The result of instantiation is a real, non-parameterized program entity: class, interface, method, constructor, or function. The entity is handled exactly as an ordinary class, interface, method, constructor, or function.

Conceptually, a generic class, an interface, a method, a constructor, or a function defines a set of classes, interfaces, methods, constructors, or functions respectively (see Generic Instantiations).

A class, an interface, or a function must be parameterized by at least one type parameter to be a generic. The type parameter is declared in the type parameter section. It can be used as an ordinary type inside a generic.

Syntactically, a type parameter is an unqualified identifier (see Scopes for the scope of type parameters). Each type parameter can have a constraint (see Type Parameter Constraint). A type parameter can have a default type (see Type Parameter Default).

A generic class, interface, method, constructor, or function defines a set of parameterized classes, interfaces, methods, constructors, or functions respectively (see Generic Instantiations). One type argument can define only one set for each possible parameterization of the type parameter section.

If a type parameter has restrictions, or constraints, then such constraints must be followed by the corresponding type argument in a generic instantiation.

In every type parameter, a constraint can follow the keyword extends. The constraint is denoted as a single type parameter T. If no

*[Content truncated]*

**Examples:**

Example 1 (unknown):
```unknown
typeParameters:
    '<' typeParameterList '>'
    ;

typeParameterList:
    typeParameter (',' typeParameter)*
    ;

typeParameter:
    ('in' | 'out')? identifier constraint? typeParameterDefault?
    ;

constraint:
    'extends' typeReference | keyofType
    ;

typeParameterDefault:
    '=' typeReference
    ;
```

Example 2 (unknown):
```unknown
extends Object|null|undefined
```

Example 3 (javascript):
```javascript
1 class Base {}
 2 class Derived extends Base { }
 3 class SomeType { }
 4
 5 class G<T extends Base> { }
 6
 7 let x: G<Base>      // correct
 8 let y: G<Derived>   // also correct
 9 let z: G<SomeType>  // error: SomeType is not a subtype of Base
10
11 class A {
12   f1: number = 0
13   f2: string = ""
14   f3: boolean = false
15 }
16 class B<T extends keyof A> {}
17 let b1 = new B<'f1'>    // OK
18 let b2 = new B<'f0'>    // Compile-time error as "f0" does not satisfy the constraint 'keyof A'
19 let b3 = new B<keyof A> // OK
```

Example 4 (javascript):
```javascript
1 class Base {}
 2 class Derived { }
 3 class SomeType { }
 4
 5 class G<T, S extends T> {}
 6
 7 let x: G<Base, Derived>  // correct: the second argument directly
 8                         // depends on the first one
 9 let y: G<Base, SomeType> // error: SomeType doesn't depend on Base
10
11 class A0<T> {
12    data: T
13    constructor (p: T) { this.data = p }
14    foo () {
15       let o: Object = this.data // error: as type T is not compatible with Object
16       console.log (this.data.toString()) // error: type T has no methods or fields
17    }
18 }
19
20 class A1<T extends Object> ex
...
```

---

## 5. Generics¶

**URL:** https://yoyocat.github.io/ArkTSSpec/5_generics.html#type-parameter-default

**Contents:**
- 5. Generics¶
- 5.1. Generic Declarations¶
- 5.2. Generic Parameters¶
- 5.3. Type Parameter Constraint¶
- 5.4. Generic Instantiations¶
- 5.5. Type Parameter Default¶
- 5.6. Type Arguments¶
- 5.7. Utility Types¶
  - 5.7.1. Partial Utility Type¶
  - 5.7.2. Required Utility Type¶

Class, interface, method, constructor, and function are program entities that can be generalized in the ArkTS language. Generalization is parameterizing an entity by one or several types. A generalized entity is introduced by a generic declaration (called generic for brevity).

Types used as generic parameters in a generic are called type parameters.

A generic must be instantiated in order to be used. Generic instantiation is the action that converts a generic into a real program entity: ordinary class, interface, function, etc. Instantiation can be performed either explicitly or implicitly.

Explicit generic instantiation is the language construct that specifies real types, which substitute type parameters of a generic. Real types specified in the instantiation are called type arguments.

In an implicit instantiation, type arguments are not specified explicitly. They are inferred from the context the generic is referred in. Implicit instantiation is possible only for functions and methods.

The result of instantiation is a real, non-parameterized program entity: class, interface, method, constructor, or function. The entity is handled exactly as an ordinary class, interface, method, constructor, or function.

Conceptually, a generic class, an interface, a method, a constructor, or a function defines a set of classes, interfaces, methods, constructors, or functions respectively (see Generic Instantiations).

A class, an interface, or a function must be parameterized by at least one type parameter to be a generic. The type parameter is declared in the type parameter section. It can be used as an ordinary type inside a generic.

Syntactically, a type parameter is an unqualified identifier (see Scopes for the scope of type parameters). Each type parameter can have a constraint (see Type Parameter Constraint). A type parameter can have a default type (see Type Parameter Default).

A generic class, interface, method, constructor, or function defines a set of parameterized classes, interfaces, methods, constructors, or functions respectively (see Generic Instantiations). One type argument can define only one set for each possible parameterization of the type parameter section.

If a type parameter has restrictions, or constraints, then such constraints must be followed by the corresponding type argument in a generic instantiation.

In every type parameter, a constraint can follow the keyword extends. The constraint is denoted as a single type parameter T. If no

*[Content truncated]*

**Examples:**

Example 1 (unknown):
```unknown
typeParameters:
    '<' typeParameterList '>'
    ;

typeParameterList:
    typeParameter (',' typeParameter)*
    ;

typeParameter:
    ('in' | 'out')? identifier constraint? typeParameterDefault?
    ;

constraint:
    'extends' typeReference | keyofType
    ;

typeParameterDefault:
    '=' typeReference
    ;
```

Example 2 (unknown):
```unknown
extends Object|null|undefined
```

Example 3 (javascript):
```javascript
1 class Base {}
 2 class Derived extends Base { }
 3 class SomeType { }
 4
 5 class G<T extends Base> { }
 6
 7 let x: G<Base>      // correct
 8 let y: G<Derived>   // also correct
 9 let z: G<SomeType>  // error: SomeType is not a subtype of Base
10
11 class A {
12   f1: number = 0
13   f2: string = ""
14   f3: boolean = false
15 }
16 class B<T extends keyof A> {}
17 let b1 = new B<'f1'>    // OK
18 let b2 = new B<'f0'>    // Compile-time error as "f0" does not satisfy the constraint 'keyof A'
19 let b3 = new B<keyof A> // OK
```

Example 4 (javascript):
```javascript
1 class Base {}
 2 class Derived { }
 3 class SomeType { }
 4
 5 class G<T, S extends T> {}
 6
 7 let x: G<Base, Derived>  // correct: the second argument directly
 8                         // depends on the first one
 9 let y: G<Base, SomeType> // error: SomeType doesn't depend on Base
10
11 class A0<T> {
12    data: T
13    constructor (p: T) { this.data = p }
14    foo () {
15       let o: Object = this.data // error: as type T is not compatible with Object
16       console.log (this.data.toString()) // error: type T has no methods or fields
17    }
18 }
19
20 class A1<T extends Object> ex
...
```

---

## 5. Generics¶

**URL:** https://yoyocat.github.io/ArkTSSpec/5_generics.html

**Contents:**
- 5. Generics¶
- 5.1. Generic Declarations¶
- 5.2. Generic Parameters¶
- 5.3. Type Parameter Constraint¶
- 5.4. Generic Instantiations¶
- 5.5. Type Parameter Default¶
- 5.6. Type Arguments¶
- 5.7. Utility Types¶
  - 5.7.1. Partial Utility Type¶
  - 5.7.2. Required Utility Type¶

Class, interface, method, constructor, and function are program entities that can be generalized in the ArkTS language. Generalization is parameterizing an entity by one or several types. A generalized entity is introduced by a generic declaration (called generic for brevity).

Types used as generic parameters in a generic are called type parameters.

A generic must be instantiated in order to be used. Generic instantiation is the action that converts a generic into a real program entity: ordinary class, interface, function, etc. Instantiation can be performed either explicitly or implicitly.

Explicit generic instantiation is the language construct that specifies real types, which substitute type parameters of a generic. Real types specified in the instantiation are called type arguments.

In an implicit instantiation, type arguments are not specified explicitly. They are inferred from the context the generic is referred in. Implicit instantiation is possible only for functions and methods.

The result of instantiation is a real, non-parameterized program entity: class, interface, method, constructor, or function. The entity is handled exactly as an ordinary class, interface, method, constructor, or function.

Conceptually, a generic class, an interface, a method, a constructor, or a function defines a set of classes, interfaces, methods, constructors, or functions respectively (see Generic Instantiations).

A class, an interface, or a function must be parameterized by at least one type parameter to be a generic. The type parameter is declared in the type parameter section. It can be used as an ordinary type inside a generic.

Syntactically, a type parameter is an unqualified identifier (see Scopes for the scope of type parameters). Each type parameter can have a constraint (see Type Parameter Constraint). A type parameter can have a default type (see Type Parameter Default).

A generic class, interface, method, constructor, or function defines a set of parameterized classes, interfaces, methods, constructors, or functions respectively (see Generic Instantiations). One type argument can define only one set for each possible parameterization of the type parameter section.

If a type parameter has restrictions, or constraints, then such constraints must be followed by the corresponding type argument in a generic instantiation.

In every type parameter, a constraint can follow the keyword extends. The constraint is denoted as a single type parameter T. If no

*[Content truncated]*

**Examples:**

Example 1 (unknown):
```unknown
typeParameters:
    '<' typeParameterList '>'
    ;

typeParameterList:
    typeParameter (',' typeParameter)*
    ;

typeParameter:
    ('in' | 'out')? identifier constraint? typeParameterDefault?
    ;

constraint:
    'extends' typeReference | keyofType
    ;

typeParameterDefault:
    '=' typeReference
    ;
```

Example 2 (unknown):
```unknown
extends Object|null|undefined
```

Example 3 (javascript):
```javascript
1 class Base {}
 2 class Derived extends Base { }
 3 class SomeType { }
 4
 5 class G<T extends Base> { }
 6
 7 let x: G<Base>      // correct
 8 let y: G<Derived>   // also correct
 9 let z: G<SomeType>  // error: SomeType is not a subtype of Base
10
11 class A {
12   f1: number = 0
13   f2: string = ""
14   f3: boolean = false
15 }
16 class B<T extends keyof A> {}
17 let b1 = new B<'f1'>    // OK
18 let b2 = new B<'f0'>    // Compile-time error as "f0" does not satisfy the constraint 'keyof A'
19 let b3 = new B<keyof A> // OK
```

Example 4 (javascript):
```javascript
1 class Base {}
 2 class Derived { }
 3 class SomeType { }
 4
 5 class G<T, S extends T> {}
 6
 7 let x: G<Base, Derived>  // correct: the second argument directly
 8                         // depends on the first one
 9 let y: G<Base, SomeType> // error: SomeType doesn't depend on Base
10
11 class A0<T> {
12    data: T
13    constructor (p: T) { this.data = p }
14    foo () {
15       let o: Object = this.data // error: as type T is not compatible with Object
16       console.log (this.data.toString()) // error: type T has no methods or fields
17    }
18 }
19
20 class A1<T extends Object> ex
...
```

---
