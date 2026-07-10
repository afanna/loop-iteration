# Arkts - Modules

**Pages:** 14

---

## 13. Compilation Units, Packages, and Modules¶

**URL:** https://yoyocat.github.io/ArkTSSpec/13_modules.html#exported-declarations

**Contents:**
- 13. Compilation Units, Packages, and Modules¶
- 13.1. Separate Modules¶
- 13.2. Compilation Units in Host System¶
- 13.3. Import Directives¶
  - 13.3.1. Bind All with Qualified Access¶
  - 13.3.2. Simple Name Binding¶
  - 13.3.3. Several Bindings for One Import Path¶
  - 13.3.4. Default Import Binding¶
  - 13.3.5. Type Binding¶
  - 13.3.6. Import Path¶

Programs are structured as sequences of elements ready for compilation, i.e., compilation units. Each compilation unit creates its own scope (see Scopes). The compilation unit’s variables, functions, classes, interfaces, or other declarations are only accessible within such scope if not explicitly exported.

A variable, function, class, interface, or other declarations exported from a different compilation unit must be imported first.

Compilation units are separate modules or packages. Packages are described in the chapter Experimental Features (see Packages).

All modules are stored in a file system or a database (see Compilation Units in Host System).

A separate module is a module without a package header. It optionally consists of the following four parts:

Import directives that enable referring imported declarations in a module;

Top-level declarations;

Top-level statements; and

Re-export directives.

Every module automatically imports all exported entities from essential kernel packages of the standard library (see Standard Library).

All entities from these packages are accessible as simple names, like the console variable:

Modules and packages are created and stored in a manner that is determined by a host system.

The exact way modules and packages are stored in a file system is determined by a particular implementation of the compiler and other tools.

In a simple implementation:

A module (package module) is stored in a single file.

Files corresponding to a package module are stored in a single folder.

A folder can store several separate modules (one source file to contain a separate module or a package module).

A folder that stores a single package must contain neither separate module files nor package modules from other packages.

Import directives import entities exported from other compilation units, and provide such entities with bindings in the current module.

An import declaration has the following two parts:

Import path that determines a compilation unit to import from;

Import binding that defines what entities, and in what form—qualified or unqualified—can be used by the current module.

Each binding adds a declaration or declarations to the scope of a module or a package (see Scopes). Any declaration added so must be distinguishable in the declaration scope (see Distinguishable Declarations). Otherwise, a compile-time error occurs.

Some import constructions are specific for packages. They are described in the chapter Experi

*[Content truncated]*

**Examples:**

Example 1 (unknown):
```unknown
compilationUnit:
    separateModuleDeclaration
    | packageDeclaration
    ;

packageDeclaration:
    packageModule+
    ;
```

Example 2 (unknown):
```unknown
separateModuleDeclaration:
    importDirective* (topDeclaration | topLevelStatements | exportDirective)*
    ;
```

Example 3 (unknown):
```unknown
1 // Hello, world! module
2 function main() {
3   console.log("Hello, world!")
4 }
```

Example 4 (unknown):
```unknown
importDirective:
    'import' fileBinding|selectiveBindigns|defaultBinding|typeBinding
    'from' importPath
    ;

fileBinding:
    '*' importAlias
    | qualifiedName '.' '*'
    ;

selectiveBindigns:
    '{' importBinding (',' importBinding)* '}'
    ;

defaultBinding:
    Identifier
    ;

typeBinding:
    'type' selectiveBindigns
    ;

importBinding:
    qualifiedName importAlias?
    ;

importAlias:
    'as' Identifier
    ;

importPath:
    StringLiteral
    ;
```

---

## 13. Compilation Units, Packages, and Modules¶

**URL:** https://yoyocat.github.io/ArkTSSpec/13_modules.html#several-bindings-for-one-import-path

**Contents:**
- 13. Compilation Units, Packages, and Modules¶
- 13.1. Separate Modules¶
- 13.2. Compilation Units in Host System¶
- 13.3. Import Directives¶
  - 13.3.1. Bind All with Qualified Access¶
  - 13.3.2. Simple Name Binding¶
  - 13.3.3. Several Bindings for One Import Path¶
  - 13.3.4. Default Import Binding¶
  - 13.3.5. Type Binding¶
  - 13.3.6. Import Path¶

Programs are structured as sequences of elements ready for compilation, i.e., compilation units. Each compilation unit creates its own scope (see Scopes). The compilation unit’s variables, functions, classes, interfaces, or other declarations are only accessible within such scope if not explicitly exported.

A variable, function, class, interface, or other declarations exported from a different compilation unit must be imported first.

Compilation units are separate modules or packages. Packages are described in the chapter Experimental Features (see Packages).

All modules are stored in a file system or a database (see Compilation Units in Host System).

A separate module is a module without a package header. It optionally consists of the following four parts:

Import directives that enable referring imported declarations in a module;

Top-level declarations;

Top-level statements; and

Re-export directives.

Every module automatically imports all exported entities from essential kernel packages of the standard library (see Standard Library).

All entities from these packages are accessible as simple names, like the console variable:

Modules and packages are created and stored in a manner that is determined by a host system.

The exact way modules and packages are stored in a file system is determined by a particular implementation of the compiler and other tools.

In a simple implementation:

A module (package module) is stored in a single file.

Files corresponding to a package module are stored in a single folder.

A folder can store several separate modules (one source file to contain a separate module or a package module).

A folder that stores a single package must contain neither separate module files nor package modules from other packages.

Import directives import entities exported from other compilation units, and provide such entities with bindings in the current module.

An import declaration has the following two parts:

Import path that determines a compilation unit to import from;

Import binding that defines what entities, and in what form—qualified or unqualified—can be used by the current module.

Each binding adds a declaration or declarations to the scope of a module or a package (see Scopes). Any declaration added so must be distinguishable in the declaration scope (see Distinguishable Declarations). Otherwise, a compile-time error occurs.

Some import constructions are specific for packages. They are described in the chapter Experi

*[Content truncated]*

**Examples:**

Example 1 (unknown):
```unknown
compilationUnit:
    separateModuleDeclaration
    | packageDeclaration
    ;

packageDeclaration:
    packageModule+
    ;
```

Example 2 (unknown):
```unknown
separateModuleDeclaration:
    importDirective* (topDeclaration | topLevelStatements | exportDirective)*
    ;
```

Example 3 (unknown):
```unknown
1 // Hello, world! module
2 function main() {
3   console.log("Hello, world!")
4 }
```

Example 4 (unknown):
```unknown
importDirective:
    'import' fileBinding|selectiveBindigns|defaultBinding|typeBinding
    'from' importPath
    ;

fileBinding:
    '*' importAlias
    | qualifiedName '.' '*'
    ;

selectiveBindigns:
    '{' importBinding (',' importBinding)* '}'
    ;

defaultBinding:
    Identifier
    ;

typeBinding:
    'type' selectiveBindigns
    ;

importBinding:
    qualifiedName importAlias?
    ;

importAlias:
    'as' Identifier
    ;

importPath:
    StringLiteral
    ;
```

---

## 13. Compilation Units, Packages, and Modules¶

**URL:** https://yoyocat.github.io/ArkTSSpec/13_modules.html#top-level-declarations

**Contents:**
- 13. Compilation Units, Packages, and Modules¶
- 13.1. Separate Modules¶
- 13.2. Compilation Units in Host System¶
- 13.3. Import Directives¶
  - 13.3.1. Bind All with Qualified Access¶
  - 13.3.2. Simple Name Binding¶
  - 13.3.3. Several Bindings for One Import Path¶
  - 13.3.4. Default Import Binding¶
  - 13.3.5. Type Binding¶
  - 13.3.6. Import Path¶

Programs are structured as sequences of elements ready for compilation, i.e., compilation units. Each compilation unit creates its own scope (see Scopes). The compilation unit’s variables, functions, classes, interfaces, or other declarations are only accessible within such scope if not explicitly exported.

A variable, function, class, interface, or other declarations exported from a different compilation unit must be imported first.

Compilation units are separate modules or packages. Packages are described in the chapter Experimental Features (see Packages).

All modules are stored in a file system or a database (see Compilation Units in Host System).

A separate module is a module without a package header. It optionally consists of the following four parts:

Import directives that enable referring imported declarations in a module;

Top-level declarations;

Top-level statements; and

Re-export directives.

Every module automatically imports all exported entities from essential kernel packages of the standard library (see Standard Library).

All entities from these packages are accessible as simple names, like the console variable:

Modules and packages are created and stored in a manner that is determined by a host system.

The exact way modules and packages are stored in a file system is determined by a particular implementation of the compiler and other tools.

In a simple implementation:

A module (package module) is stored in a single file.

Files corresponding to a package module are stored in a single folder.

A folder can store several separate modules (one source file to contain a separate module or a package module).

A folder that stores a single package must contain neither separate module files nor package modules from other packages.

Import directives import entities exported from other compilation units, and provide such entities with bindings in the current module.

An import declaration has the following two parts:

Import path that determines a compilation unit to import from;

Import binding that defines what entities, and in what form—qualified or unqualified—can be used by the current module.

Each binding adds a declaration or declarations to the scope of a module or a package (see Scopes). Any declaration added so must be distinguishable in the declaration scope (see Distinguishable Declarations). Otherwise, a compile-time error occurs.

Some import constructions are specific for packages. They are described in the chapter Experi

*[Content truncated]*

**Examples:**

Example 1 (unknown):
```unknown
compilationUnit:
    separateModuleDeclaration
    | packageDeclaration
    ;

packageDeclaration:
    packageModule+
    ;
```

Example 2 (unknown):
```unknown
separateModuleDeclaration:
    importDirective* (topDeclaration | topLevelStatements | exportDirective)*
    ;
```

Example 3 (unknown):
```unknown
1 // Hello, world! module
2 function main() {
3   console.log("Hello, world!")
4 }
```

Example 4 (unknown):
```unknown
importDirective:
    'import' fileBinding|selectiveBindigns|defaultBinding|typeBinding
    'from' importPath
    ;

fileBinding:
    '*' importAlias
    | qualifiedName '.' '*'
    ;

selectiveBindigns:
    '{' importBinding (',' importBinding)* '}'
    ;

defaultBinding:
    Identifier
    ;

typeBinding:
    'type' selectiveBindigns
    ;

importBinding:
    qualifiedName importAlias?
    ;

importAlias:
    'as' Identifier
    ;

importPath:
    StringLiteral
    ;
```

---

## 13. Compilation Units, Packages, and Modules¶

**URL:** https://yoyocat.github.io/ArkTSSpec/13_modules.html#bind-all-with-qualified-access

**Contents:**
- 13. Compilation Units, Packages, and Modules¶
- 13.1. Separate Modules¶
- 13.2. Compilation Units in Host System¶
- 13.3. Import Directives¶
  - 13.3.1. Bind All with Qualified Access¶
  - 13.3.2. Simple Name Binding¶
  - 13.3.3. Several Bindings for One Import Path¶
  - 13.3.4. Default Import Binding¶
  - 13.3.5. Type Binding¶
  - 13.3.6. Import Path¶

Programs are structured as sequences of elements ready for compilation, i.e., compilation units. Each compilation unit creates its own scope (see Scopes). The compilation unit’s variables, functions, classes, interfaces, or other declarations are only accessible within such scope if not explicitly exported.

A variable, function, class, interface, or other declarations exported from a different compilation unit must be imported first.

Compilation units are separate modules or packages. Packages are described in the chapter Experimental Features (see Packages).

All modules are stored in a file system or a database (see Compilation Units in Host System).

A separate module is a module without a package header. It optionally consists of the following four parts:

Import directives that enable referring imported declarations in a module;

Top-level declarations;

Top-level statements; and

Re-export directives.

Every module automatically imports all exported entities from essential kernel packages of the standard library (see Standard Library).

All entities from these packages are accessible as simple names, like the console variable:

Modules and packages are created and stored in a manner that is determined by a host system.

The exact way modules and packages are stored in a file system is determined by a particular implementation of the compiler and other tools.

In a simple implementation:

A module (package module) is stored in a single file.

Files corresponding to a package module are stored in a single folder.

A folder can store several separate modules (one source file to contain a separate module or a package module).

A folder that stores a single package must contain neither separate module files nor package modules from other packages.

Import directives import entities exported from other compilation units, and provide such entities with bindings in the current module.

An import declaration has the following two parts:

Import path that determines a compilation unit to import from;

Import binding that defines what entities, and in what form—qualified or unqualified—can be used by the current module.

Each binding adds a declaration or declarations to the scope of a module or a package (see Scopes). Any declaration added so must be distinguishable in the declaration scope (see Distinguishable Declarations). Otherwise, a compile-time error occurs.

Some import constructions are specific for packages. They are described in the chapter Experi

*[Content truncated]*

**Examples:**

Example 1 (unknown):
```unknown
compilationUnit:
    separateModuleDeclaration
    | packageDeclaration
    ;

packageDeclaration:
    packageModule+
    ;
```

Example 2 (unknown):
```unknown
separateModuleDeclaration:
    importDirective* (topDeclaration | topLevelStatements | exportDirective)*
    ;
```

Example 3 (unknown):
```unknown
1 // Hello, world! module
2 function main() {
3   console.log("Hello, world!")
4 }
```

Example 4 (unknown):
```unknown
importDirective:
    'import' fileBinding|selectiveBindigns|defaultBinding|typeBinding
    'from' importPath
    ;

fileBinding:
    '*' importAlias
    | qualifiedName '.' '*'
    ;

selectiveBindigns:
    '{' importBinding (',' importBinding)* '}'
    ;

defaultBinding:
    Identifier
    ;

typeBinding:
    'type' selectiveBindigns
    ;

importBinding:
    qualifiedName importAlias?
    ;

importAlias:
    'as' Identifier
    ;

importPath:
    StringLiteral
    ;
```

---

## 13. Compilation Units, Packages, and Modules¶

**URL:** https://yoyocat.github.io/ArkTSSpec/13_modules.html

**Contents:**
- 13. Compilation Units, Packages, and Modules¶
- 13.1. Separate Modules¶
- 13.2. Compilation Units in Host System¶
- 13.3. Import Directives¶
  - 13.3.1. Bind All with Qualified Access¶
  - 13.3.2. Simple Name Binding¶
  - 13.3.3. Several Bindings for One Import Path¶
  - 13.3.4. Default Import Binding¶
  - 13.3.5. Type Binding¶
  - 13.3.6. Import Path¶

Programs are structured as sequences of elements ready for compilation, i.e., compilation units. Each compilation unit creates its own scope (see Scopes). The compilation unit’s variables, functions, classes, interfaces, or other declarations are only accessible within such scope if not explicitly exported.

A variable, function, class, interface, or other declarations exported from a different compilation unit must be imported first.

Compilation units are separate modules or packages. Packages are described in the chapter Experimental Features (see Packages).

All modules are stored in a file system or a database (see Compilation Units in Host System).

A separate module is a module without a package header. It optionally consists of the following four parts:

Import directives that enable referring imported declarations in a module;

Top-level declarations;

Top-level statements; and

Re-export directives.

Every module automatically imports all exported entities from essential kernel packages of the standard library (see Standard Library).

All entities from these packages are accessible as simple names, like the console variable:

Modules and packages are created and stored in a manner that is determined by a host system.

The exact way modules and packages are stored in a file system is determined by a particular implementation of the compiler and other tools.

In a simple implementation:

A module (package module) is stored in a single file.

Files corresponding to a package module are stored in a single folder.

A folder can store several separate modules (one source file to contain a separate module or a package module).

A folder that stores a single package must contain neither separate module files nor package modules from other packages.

Import directives import entities exported from other compilation units, and provide such entities with bindings in the current module.

An import declaration has the following two parts:

Import path that determines a compilation unit to import from;

Import binding that defines what entities, and in what form—qualified or unqualified—can be used by the current module.

Each binding adds a declaration or declarations to the scope of a module or a package (see Scopes). Any declaration added so must be distinguishable in the declaration scope (see Distinguishable Declarations). Otherwise, a compile-time error occurs.

Some import constructions are specific for packages. They are described in the chapter Experi

*[Content truncated]*

**Examples:**

Example 1 (unknown):
```unknown
compilationUnit:
    separateModuleDeclaration
    | packageDeclaration
    ;

packageDeclaration:
    packageModule+
    ;
```

Example 2 (unknown):
```unknown
separateModuleDeclaration:
    importDirective* (topDeclaration | topLevelStatements | exportDirective)*
    ;
```

Example 3 (unknown):
```unknown
1 // Hello, world! module
2 function main() {
3   console.log("Hello, world!")
4 }
```

Example 4 (unknown):
```unknown
importDirective:
    'import' fileBinding|selectiveBindigns|defaultBinding|typeBinding
    'from' importPath
    ;

fileBinding:
    '*' importAlias
    | qualifiedName '.' '*'
    ;

selectiveBindigns:
    '{' importBinding (',' importBinding)* '}'
    ;

defaultBinding:
    Identifier
    ;

typeBinding:
    'type' selectiveBindigns
    ;

importBinding:
    qualifiedName importAlias?
    ;

importAlias:
    'as' Identifier
    ;

importPath:
    StringLiteral
    ;
```

---

## 13. Compilation Units, Packages, and Modules¶

**URL:** https://yoyocat.github.io/ArkTSSpec/13_modules.html#separate-modules

**Contents:**
- 13. Compilation Units, Packages, and Modules¶
- 13.1. Separate Modules¶
- 13.2. Compilation Units in Host System¶
- 13.3. Import Directives¶
  - 13.3.1. Bind All with Qualified Access¶
  - 13.3.2. Simple Name Binding¶
  - 13.3.3. Several Bindings for One Import Path¶
  - 13.3.4. Default Import Binding¶
  - 13.3.5. Type Binding¶
  - 13.3.6. Import Path¶

Programs are structured as sequences of elements ready for compilation, i.e., compilation units. Each compilation unit creates its own scope (see Scopes). The compilation unit’s variables, functions, classes, interfaces, or other declarations are only accessible within such scope if not explicitly exported.

A variable, function, class, interface, or other declarations exported from a different compilation unit must be imported first.

Compilation units are separate modules or packages. Packages are described in the chapter Experimental Features (see Packages).

All modules are stored in a file system or a database (see Compilation Units in Host System).

A separate module is a module without a package header. It optionally consists of the following four parts:

Import directives that enable referring imported declarations in a module;

Top-level declarations;

Top-level statements; and

Re-export directives.

Every module automatically imports all exported entities from essential kernel packages of the standard library (see Standard Library).

All entities from these packages are accessible as simple names, like the console variable:

Modules and packages are created and stored in a manner that is determined by a host system.

The exact way modules and packages are stored in a file system is determined by a particular implementation of the compiler and other tools.

In a simple implementation:

A module (package module) is stored in a single file.

Files corresponding to a package module are stored in a single folder.

A folder can store several separate modules (one source file to contain a separate module or a package module).

A folder that stores a single package must contain neither separate module files nor package modules from other packages.

Import directives import entities exported from other compilation units, and provide such entities with bindings in the current module.

An import declaration has the following two parts:

Import path that determines a compilation unit to import from;

Import binding that defines what entities, and in what form—qualified or unqualified—can be used by the current module.

Each binding adds a declaration or declarations to the scope of a module or a package (see Scopes). Any declaration added so must be distinguishable in the declaration scope (see Distinguishable Declarations). Otherwise, a compile-time error occurs.

Some import constructions are specific for packages. They are described in the chapter Experi

*[Content truncated]*

**Examples:**

Example 1 (unknown):
```unknown
compilationUnit:
    separateModuleDeclaration
    | packageDeclaration
    ;

packageDeclaration:
    packageModule+
    ;
```

Example 2 (unknown):
```unknown
separateModuleDeclaration:
    importDirective* (topDeclaration | topLevelStatements | exportDirective)*
    ;
```

Example 3 (unknown):
```unknown
1 // Hello, world! module
2 function main() {
3   console.log("Hello, world!")
4 }
```

Example 4 (unknown):
```unknown
importDirective:
    'import' fileBinding|selectiveBindigns|defaultBinding|typeBinding
    'from' importPath
    ;

fileBinding:
    '*' importAlias
    | qualifiedName '.' '*'
    ;

selectiveBindigns:
    '{' importBinding (',' importBinding)* '}'
    ;

defaultBinding:
    Identifier
    ;

typeBinding:
    'type' selectiveBindigns
    ;

importBinding:
    qualifiedName importAlias?
    ;

importAlias:
    'as' Identifier
    ;

importPath:
    StringLiteral
    ;
```

---

## 13. Compilation Units, Packages, and Modules¶

**URL:** https://yoyocat.github.io/ArkTSSpec/13_modules.html#import-path

**Contents:**
- 13. Compilation Units, Packages, and Modules¶
- 13.1. Separate Modules¶
- 13.2. Compilation Units in Host System¶
- 13.3. Import Directives¶
  - 13.3.1. Bind All with Qualified Access¶
  - 13.3.2. Simple Name Binding¶
  - 13.3.3. Several Bindings for One Import Path¶
  - 13.3.4. Default Import Binding¶
  - 13.3.5. Type Binding¶
  - 13.3.6. Import Path¶

Programs are structured as sequences of elements ready for compilation, i.e., compilation units. Each compilation unit creates its own scope (see Scopes). The compilation unit’s variables, functions, classes, interfaces, or other declarations are only accessible within such scope if not explicitly exported.

A variable, function, class, interface, or other declarations exported from a different compilation unit must be imported first.

Compilation units are separate modules or packages. Packages are described in the chapter Experimental Features (see Packages).

All modules are stored in a file system or a database (see Compilation Units in Host System).

A separate module is a module without a package header. It optionally consists of the following four parts:

Import directives that enable referring imported declarations in a module;

Top-level declarations;

Top-level statements; and

Re-export directives.

Every module automatically imports all exported entities from essential kernel packages of the standard library (see Standard Library).

All entities from these packages are accessible as simple names, like the console variable:

Modules and packages are created and stored in a manner that is determined by a host system.

The exact way modules and packages are stored in a file system is determined by a particular implementation of the compiler and other tools.

In a simple implementation:

A module (package module) is stored in a single file.

Files corresponding to a package module are stored in a single folder.

A folder can store several separate modules (one source file to contain a separate module or a package module).

A folder that stores a single package must contain neither separate module files nor package modules from other packages.

Import directives import entities exported from other compilation units, and provide such entities with bindings in the current module.

An import declaration has the following two parts:

Import path that determines a compilation unit to import from;

Import binding that defines what entities, and in what form—qualified or unqualified—can be used by the current module.

Each binding adds a declaration or declarations to the scope of a module or a package (see Scopes). Any declaration added so must be distinguishable in the declaration scope (see Distinguishable Declarations). Otherwise, a compile-time error occurs.

Some import constructions are specific for packages. They are described in the chapter Experi

*[Content truncated]*

**Examples:**

Example 1 (unknown):
```unknown
compilationUnit:
    separateModuleDeclaration
    | packageDeclaration
    ;

packageDeclaration:
    packageModule+
    ;
```

Example 2 (unknown):
```unknown
separateModuleDeclaration:
    importDirective* (topDeclaration | topLevelStatements | exportDirective)*
    ;
```

Example 3 (unknown):
```unknown
1 // Hello, world! module
2 function main() {
3   console.log("Hello, world!")
4 }
```

Example 4 (unknown):
```unknown
importDirective:
    'import' fileBinding|selectiveBindigns|defaultBinding|typeBinding
    'from' importPath
    ;

fileBinding:
    '*' importAlias
    | qualifiedName '.' '*'
    ;

selectiveBindigns:
    '{' importBinding (',' importBinding)* '}'
    ;

defaultBinding:
    Identifier
    ;

typeBinding:
    'type' selectiveBindigns
    ;

importBinding:
    qualifiedName importAlias?
    ;

importAlias:
    'as' Identifier
    ;

importPath:
    StringLiteral
    ;
```

---

## 13. Compilation Units, Packages, and Modules¶

**URL:** https://yoyocat.github.io/ArkTSSpec/13_modules.html#type-binding

**Contents:**
- 13. Compilation Units, Packages, and Modules¶
- 13.1. Separate Modules¶
- 13.2. Compilation Units in Host System¶
- 13.3. Import Directives¶
  - 13.3.1. Bind All with Qualified Access¶
  - 13.3.2. Simple Name Binding¶
  - 13.3.3. Several Bindings for One Import Path¶
  - 13.3.4. Default Import Binding¶
  - 13.3.5. Type Binding¶
  - 13.3.6. Import Path¶

Programs are structured as sequences of elements ready for compilation, i.e., compilation units. Each compilation unit creates its own scope (see Scopes). The compilation unit’s variables, functions, classes, interfaces, or other declarations are only accessible within such scope if not explicitly exported.

A variable, function, class, interface, or other declarations exported from a different compilation unit must be imported first.

Compilation units are separate modules or packages. Packages are described in the chapter Experimental Features (see Packages).

All modules are stored in a file system or a database (see Compilation Units in Host System).

A separate module is a module without a package header. It optionally consists of the following four parts:

Import directives that enable referring imported declarations in a module;

Top-level declarations;

Top-level statements; and

Re-export directives.

Every module automatically imports all exported entities from essential kernel packages of the standard library (see Standard Library).

All entities from these packages are accessible as simple names, like the console variable:

Modules and packages are created and stored in a manner that is determined by a host system.

The exact way modules and packages are stored in a file system is determined by a particular implementation of the compiler and other tools.

In a simple implementation:

A module (package module) is stored in a single file.

Files corresponding to a package module are stored in a single folder.

A folder can store several separate modules (one source file to contain a separate module or a package module).

A folder that stores a single package must contain neither separate module files nor package modules from other packages.

Import directives import entities exported from other compilation units, and provide such entities with bindings in the current module.

An import declaration has the following two parts:

Import path that determines a compilation unit to import from;

Import binding that defines what entities, and in what form—qualified or unqualified—can be used by the current module.

Each binding adds a declaration or declarations to the scope of a module or a package (see Scopes). Any declaration added so must be distinguishable in the declaration scope (see Distinguishable Declarations). Otherwise, a compile-time error occurs.

Some import constructions are specific for packages. They are described in the chapter Experi

*[Content truncated]*

**Examples:**

Example 1 (unknown):
```unknown
compilationUnit:
    separateModuleDeclaration
    | packageDeclaration
    ;

packageDeclaration:
    packageModule+
    ;
```

Example 2 (unknown):
```unknown
separateModuleDeclaration:
    importDirective* (topDeclaration | topLevelStatements | exportDirective)*
    ;
```

Example 3 (unknown):
```unknown
1 // Hello, world! module
2 function main() {
3   console.log("Hello, world!")
4 }
```

Example 4 (unknown):
```unknown
importDirective:
    'import' fileBinding|selectiveBindigns|defaultBinding|typeBinding
    'from' importPath
    ;

fileBinding:
    '*' importAlias
    | qualifiedName '.' '*'
    ;

selectiveBindigns:
    '{' importBinding (',' importBinding)* '}'
    ;

defaultBinding:
    Identifier
    ;

typeBinding:
    'type' selectiveBindigns
    ;

importBinding:
    qualifiedName importAlias?
    ;

importAlias:
    'as' Identifier
    ;

importPath:
    StringLiteral
    ;
```

---

## 13. Compilation Units, Packages, and Modules¶

**URL:** https://yoyocat.github.io/ArkTSSpec/13_modules.html#default-import

**Contents:**
- 13. Compilation Units, Packages, and Modules¶
- 13.1. Separate Modules¶
- 13.2. Compilation Units in Host System¶
- 13.3. Import Directives¶
  - 13.3.1. Bind All with Qualified Access¶
  - 13.3.2. Simple Name Binding¶
  - 13.3.3. Several Bindings for One Import Path¶
  - 13.3.4. Default Import Binding¶
  - 13.3.5. Type Binding¶
  - 13.3.6. Import Path¶

Programs are structured as sequences of elements ready for compilation, i.e., compilation units. Each compilation unit creates its own scope (see Scopes). The compilation unit’s variables, functions, classes, interfaces, or other declarations are only accessible within such scope if not explicitly exported.

A variable, function, class, interface, or other declarations exported from a different compilation unit must be imported first.

Compilation units are separate modules or packages. Packages are described in the chapter Experimental Features (see Packages).

All modules are stored in a file system or a database (see Compilation Units in Host System).

A separate module is a module without a package header. It optionally consists of the following four parts:

Import directives that enable referring imported declarations in a module;

Top-level declarations;

Top-level statements; and

Re-export directives.

Every module automatically imports all exported entities from essential kernel packages of the standard library (see Standard Library).

All entities from these packages are accessible as simple names, like the console variable:

Modules and packages are created and stored in a manner that is determined by a host system.

The exact way modules and packages are stored in a file system is determined by a particular implementation of the compiler and other tools.

In a simple implementation:

A module (package module) is stored in a single file.

Files corresponding to a package module are stored in a single folder.

A folder can store several separate modules (one source file to contain a separate module or a package module).

A folder that stores a single package must contain neither separate module files nor package modules from other packages.

Import directives import entities exported from other compilation units, and provide such entities with bindings in the current module.

An import declaration has the following two parts:

Import path that determines a compilation unit to import from;

Import binding that defines what entities, and in what form—qualified or unqualified—can be used by the current module.

Each binding adds a declaration or declarations to the scope of a module or a package (see Scopes). Any declaration added so must be distinguishable in the declaration scope (see Distinguishable Declarations). Otherwise, a compile-time error occurs.

Some import constructions are specific for packages. They are described in the chapter Experi

*[Content truncated]*

**Examples:**

Example 1 (unknown):
```unknown
compilationUnit:
    separateModuleDeclaration
    | packageDeclaration
    ;

packageDeclaration:
    packageModule+
    ;
```

Example 2 (unknown):
```unknown
separateModuleDeclaration:
    importDirective* (topDeclaration | topLevelStatements | exportDirective)*
    ;
```

Example 3 (unknown):
```unknown
1 // Hello, world! module
2 function main() {
3   console.log("Hello, world!")
4 }
```

Example 4 (unknown):
```unknown
importDirective:
    'import' fileBinding|selectiveBindigns|defaultBinding|typeBinding
    'from' importPath
    ;

fileBinding:
    '*' importAlias
    | qualifiedName '.' '*'
    ;

selectiveBindigns:
    '{' importBinding (',' importBinding)* '}'
    ;

defaultBinding:
    Identifier
    ;

typeBinding:
    'type' selectiveBindigns
    ;

importBinding:
    qualifiedName importAlias?
    ;

importAlias:
    'as' Identifier
    ;

importPath:
    StringLiteral
    ;
```

---

## 13. Compilation Units, Packages, and Modules¶

**URL:** https://yoyocat.github.io/ArkTSSpec/13_modules.html#default-import-binding

**Contents:**
- 13. Compilation Units, Packages, and Modules¶
- 13.1. Separate Modules¶
- 13.2. Compilation Units in Host System¶
- 13.3. Import Directives¶
  - 13.3.1. Bind All with Qualified Access¶
  - 13.3.2. Simple Name Binding¶
  - 13.3.3. Several Bindings for One Import Path¶
  - 13.3.4. Default Import Binding¶
  - 13.3.5. Type Binding¶
  - 13.3.6. Import Path¶

Programs are structured as sequences of elements ready for compilation, i.e., compilation units. Each compilation unit creates its own scope (see Scopes). The compilation unit’s variables, functions, classes, interfaces, or other declarations are only accessible within such scope if not explicitly exported.

A variable, function, class, interface, or other declarations exported from a different compilation unit must be imported first.

Compilation units are separate modules or packages. Packages are described in the chapter Experimental Features (see Packages).

All modules are stored in a file system or a database (see Compilation Units in Host System).

A separate module is a module without a package header. It optionally consists of the following four parts:

Import directives that enable referring imported declarations in a module;

Top-level declarations;

Top-level statements; and

Re-export directives.

Every module automatically imports all exported entities from essential kernel packages of the standard library (see Standard Library).

All entities from these packages are accessible as simple names, like the console variable:

Modules and packages are created and stored in a manner that is determined by a host system.

The exact way modules and packages are stored in a file system is determined by a particular implementation of the compiler and other tools.

In a simple implementation:

A module (package module) is stored in a single file.

Files corresponding to a package module are stored in a single folder.

A folder can store several separate modules (one source file to contain a separate module or a package module).

A folder that stores a single package must contain neither separate module files nor package modules from other packages.

Import directives import entities exported from other compilation units, and provide such entities with bindings in the current module.

An import declaration has the following two parts:

Import path that determines a compilation unit to import from;

Import binding that defines what entities, and in what form—qualified or unqualified—can be used by the current module.

Each binding adds a declaration or declarations to the scope of a module or a package (see Scopes). Any declaration added so must be distinguishable in the declaration scope (see Distinguishable Declarations). Otherwise, a compile-time error occurs.

Some import constructions are specific for packages. They are described in the chapter Experi

*[Content truncated]*

**Examples:**

Example 1 (unknown):
```unknown
compilationUnit:
    separateModuleDeclaration
    | packageDeclaration
    ;

packageDeclaration:
    packageModule+
    ;
```

Example 2 (unknown):
```unknown
separateModuleDeclaration:
    importDirective* (topDeclaration | topLevelStatements | exportDirective)*
    ;
```

Example 3 (unknown):
```unknown
1 // Hello, world! module
2 function main() {
3   console.log("Hello, world!")
4 }
```

Example 4 (unknown):
```unknown
importDirective:
    'import' fileBinding|selectiveBindigns|defaultBinding|typeBinding
    'from' importPath
    ;

fileBinding:
    '*' importAlias
    | qualifiedName '.' '*'
    ;

selectiveBindigns:
    '{' importBinding (',' importBinding)* '}'
    ;

defaultBinding:
    Identifier
    ;

typeBinding:
    'type' selectiveBindigns
    ;

importBinding:
    qualifiedName importAlias?
    ;

importAlias:
    'as' Identifier
    ;

importPath:
    StringLiteral
    ;
```

---

## 13. Compilation Units, Packages, and Modules¶

**URL:** https://yoyocat.github.io/ArkTSSpec/13_modules.html#import-directives

**Contents:**
- 13. Compilation Units, Packages, and Modules¶
- 13.1. Separate Modules¶
- 13.2. Compilation Units in Host System¶
- 13.3. Import Directives¶
  - 13.3.1. Bind All with Qualified Access¶
  - 13.3.2. Simple Name Binding¶
  - 13.3.3. Several Bindings for One Import Path¶
  - 13.3.4. Default Import Binding¶
  - 13.3.5. Type Binding¶
  - 13.3.6. Import Path¶

Programs are structured as sequences of elements ready for compilation, i.e., compilation units. Each compilation unit creates its own scope (see Scopes). The compilation unit’s variables, functions, classes, interfaces, or other declarations are only accessible within such scope if not explicitly exported.

A variable, function, class, interface, or other declarations exported from a different compilation unit must be imported first.

Compilation units are separate modules or packages. Packages are described in the chapter Experimental Features (see Packages).

All modules are stored in a file system or a database (see Compilation Units in Host System).

A separate module is a module without a package header. It optionally consists of the following four parts:

Import directives that enable referring imported declarations in a module;

Top-level declarations;

Top-level statements; and

Re-export directives.

Every module automatically imports all exported entities from essential kernel packages of the standard library (see Standard Library).

All entities from these packages are accessible as simple names, like the console variable:

Modules and packages are created and stored in a manner that is determined by a host system.

The exact way modules and packages are stored in a file system is determined by a particular implementation of the compiler and other tools.

In a simple implementation:

A module (package module) is stored in a single file.

Files corresponding to a package module are stored in a single folder.

A folder can store several separate modules (one source file to contain a separate module or a package module).

A folder that stores a single package must contain neither separate module files nor package modules from other packages.

Import directives import entities exported from other compilation units, and provide such entities with bindings in the current module.

An import declaration has the following two parts:

Import path that determines a compilation unit to import from;

Import binding that defines what entities, and in what form—qualified or unqualified—can be used by the current module.

Each binding adds a declaration or declarations to the scope of a module or a package (see Scopes). Any declaration added so must be distinguishable in the declaration scope (see Distinguishable Declarations). Otherwise, a compile-time error occurs.

Some import constructions are specific for packages. They are described in the chapter Experi

*[Content truncated]*

**Examples:**

Example 1 (unknown):
```unknown
compilationUnit:
    separateModuleDeclaration
    | packageDeclaration
    ;

packageDeclaration:
    packageModule+
    ;
```

Example 2 (unknown):
```unknown
separateModuleDeclaration:
    importDirective* (topDeclaration | topLevelStatements | exportDirective)*
    ;
```

Example 3 (unknown):
```unknown
1 // Hello, world! module
2 function main() {
3   console.log("Hello, world!")
4 }
```

Example 4 (unknown):
```unknown
importDirective:
    'import' fileBinding|selectiveBindigns|defaultBinding|typeBinding
    'from' importPath
    ;

fileBinding:
    '*' importAlias
    | qualifiedName '.' '*'
    ;

selectiveBindigns:
    '{' importBinding (',' importBinding)* '}'
    ;

defaultBinding:
    Identifier
    ;

typeBinding:
    'type' selectiveBindigns
    ;

importBinding:
    qualifiedName importAlias?
    ;

importAlias:
    'as' Identifier
    ;

importPath:
    StringLiteral
    ;
```

---

## 13. Compilation Units, Packages, and Modules¶

**URL:** https://yoyocat.github.io/ArkTSSpec/13_modules.html#compilation-units-in-host-system

**Contents:**
- 13. Compilation Units, Packages, and Modules¶
- 13.1. Separate Modules¶
- 13.2. Compilation Units in Host System¶
- 13.3. Import Directives¶
  - 13.3.1. Bind All with Qualified Access¶
  - 13.3.2. Simple Name Binding¶
  - 13.3.3. Several Bindings for One Import Path¶
  - 13.3.4. Default Import Binding¶
  - 13.3.5. Type Binding¶
  - 13.3.6. Import Path¶

Programs are structured as sequences of elements ready for compilation, i.e., compilation units. Each compilation unit creates its own scope (see Scopes). The compilation unit’s variables, functions, classes, interfaces, or other declarations are only accessible within such scope if not explicitly exported.

A variable, function, class, interface, or other declarations exported from a different compilation unit must be imported first.

Compilation units are separate modules or packages. Packages are described in the chapter Experimental Features (see Packages).

All modules are stored in a file system or a database (see Compilation Units in Host System).

A separate module is a module without a package header. It optionally consists of the following four parts:

Import directives that enable referring imported declarations in a module;

Top-level declarations;

Top-level statements; and

Re-export directives.

Every module automatically imports all exported entities from essential kernel packages of the standard library (see Standard Library).

All entities from these packages are accessible as simple names, like the console variable:

Modules and packages are created and stored in a manner that is determined by a host system.

The exact way modules and packages are stored in a file system is determined by a particular implementation of the compiler and other tools.

In a simple implementation:

A module (package module) is stored in a single file.

Files corresponding to a package module are stored in a single folder.

A folder can store several separate modules (one source file to contain a separate module or a package module).

A folder that stores a single package must contain neither separate module files nor package modules from other packages.

Import directives import entities exported from other compilation units, and provide such entities with bindings in the current module.

An import declaration has the following two parts:

Import path that determines a compilation unit to import from;

Import binding that defines what entities, and in what form—qualified or unqualified—can be used by the current module.

Each binding adds a declaration or declarations to the scope of a module or a package (see Scopes). Any declaration added so must be distinguishable in the declaration scope (see Distinguishable Declarations). Otherwise, a compile-time error occurs.

Some import constructions are specific for packages. They are described in the chapter Experi

*[Content truncated]*

**Examples:**

Example 1 (unknown):
```unknown
compilationUnit:
    separateModuleDeclaration
    | packageDeclaration
    ;

packageDeclaration:
    packageModule+
    ;
```

Example 2 (unknown):
```unknown
separateModuleDeclaration:
    importDirective* (topDeclaration | topLevelStatements | exportDirective)*
    ;
```

Example 3 (unknown):
```unknown
1 // Hello, world! module
2 function main() {
3   console.log("Hello, world!")
4 }
```

Example 4 (unknown):
```unknown
importDirective:
    'import' fileBinding|selectiveBindigns|defaultBinding|typeBinding
    'from' importPath
    ;

fileBinding:
    '*' importAlias
    | qualifiedName '.' '*'
    ;

selectiveBindigns:
    '{' importBinding (',' importBinding)* '}'
    ;

defaultBinding:
    Identifier
    ;

typeBinding:
    'type' selectiveBindigns
    ;

importBinding:
    qualifiedName importAlias?
    ;

importAlias:
    'as' Identifier
    ;

importPath:
    StringLiteral
    ;
```

---

## 13. Compilation Units, Packages, and Modules¶

**URL:** https://yoyocat.github.io/ArkTSSpec/13_modules.html#export-directives

**Contents:**
- 13. Compilation Units, Packages, and Modules¶
- 13.1. Separate Modules¶
- 13.2. Compilation Units in Host System¶
- 13.3. Import Directives¶
  - 13.3.1. Bind All with Qualified Access¶
  - 13.3.2. Simple Name Binding¶
  - 13.3.3. Several Bindings for One Import Path¶
  - 13.3.4. Default Import Binding¶
  - 13.3.5. Type Binding¶
  - 13.3.6. Import Path¶

Programs are structured as sequences of elements ready for compilation, i.e., compilation units. Each compilation unit creates its own scope (see Scopes). The compilation unit’s variables, functions, classes, interfaces, or other declarations are only accessible within such scope if not explicitly exported.

A variable, function, class, interface, or other declarations exported from a different compilation unit must be imported first.

Compilation units are separate modules or packages. Packages are described in the chapter Experimental Features (see Packages).

All modules are stored in a file system or a database (see Compilation Units in Host System).

A separate module is a module without a package header. It optionally consists of the following four parts:

Import directives that enable referring imported declarations in a module;

Top-level declarations;

Top-level statements; and

Re-export directives.

Every module automatically imports all exported entities from essential kernel packages of the standard library (see Standard Library).

All entities from these packages are accessible as simple names, like the console variable:

Modules and packages are created and stored in a manner that is determined by a host system.

The exact way modules and packages are stored in a file system is determined by a particular implementation of the compiler and other tools.

In a simple implementation:

A module (package module) is stored in a single file.

Files corresponding to a package module are stored in a single folder.

A folder can store several separate modules (one source file to contain a separate module or a package module).

A folder that stores a single package must contain neither separate module files nor package modules from other packages.

Import directives import entities exported from other compilation units, and provide such entities with bindings in the current module.

An import declaration has the following two parts:

Import path that determines a compilation unit to import from;

Import binding that defines what entities, and in what form—qualified or unqualified—can be used by the current module.

Each binding adds a declaration or declarations to the scope of a module or a package (see Scopes). Any declaration added so must be distinguishable in the declaration scope (see Distinguishable Declarations). Otherwise, a compile-time error occurs.

Some import constructions are specific for packages. They are described in the chapter Experi

*[Content truncated]*

**Examples:**

Example 1 (unknown):
```unknown
compilationUnit:
    separateModuleDeclaration
    | packageDeclaration
    ;

packageDeclaration:
    packageModule+
    ;
```

Example 2 (unknown):
```unknown
separateModuleDeclaration:
    importDirective* (topDeclaration | topLevelStatements | exportDirective)*
    ;
```

Example 3 (unknown):
```unknown
1 // Hello, world! module
2 function main() {
3   console.log("Hello, world!")
4 }
```

Example 4 (unknown):
```unknown
importDirective:
    'import' fileBinding|selectiveBindigns|defaultBinding|typeBinding
    'from' importPath
    ;

fileBinding:
    '*' importAlias
    | qualifiedName '.' '*'
    ;

selectiveBindigns:
    '{' importBinding (',' importBinding)* '}'
    ;

defaultBinding:
    Identifier
    ;

typeBinding:
    'type' selectiveBindigns
    ;

importBinding:
    qualifiedName importAlias?
    ;

importAlias:
    'as' Identifier
    ;

importPath:
    StringLiteral
    ;
```

---

## 13. Compilation Units, Packages, and Modules¶

**URL:** https://yoyocat.github.io/ArkTSSpec/13_modules.html#simple-name-binding

**Contents:**
- 13. Compilation Units, Packages, and Modules¶
- 13.1. Separate Modules¶
- 13.2. Compilation Units in Host System¶
- 13.3. Import Directives¶
  - 13.3.1. Bind All with Qualified Access¶
  - 13.3.2. Simple Name Binding¶
  - 13.3.3. Several Bindings for One Import Path¶
  - 13.3.4. Default Import Binding¶
  - 13.3.5. Type Binding¶
  - 13.3.6. Import Path¶

Programs are structured as sequences of elements ready for compilation, i.e., compilation units. Each compilation unit creates its own scope (see Scopes). The compilation unit’s variables, functions, classes, interfaces, or other declarations are only accessible within such scope if not explicitly exported.

A variable, function, class, interface, or other declarations exported from a different compilation unit must be imported first.

Compilation units are separate modules or packages. Packages are described in the chapter Experimental Features (see Packages).

All modules are stored in a file system or a database (see Compilation Units in Host System).

A separate module is a module without a package header. It optionally consists of the following four parts:

Import directives that enable referring imported declarations in a module;

Top-level declarations;

Top-level statements; and

Re-export directives.

Every module automatically imports all exported entities from essential kernel packages of the standard library (see Standard Library).

All entities from these packages are accessible as simple names, like the console variable:

Modules and packages are created and stored in a manner that is determined by a host system.

The exact way modules and packages are stored in a file system is determined by a particular implementation of the compiler and other tools.

In a simple implementation:

A module (package module) is stored in a single file.

Files corresponding to a package module are stored in a single folder.

A folder can store several separate modules (one source file to contain a separate module or a package module).

A folder that stores a single package must contain neither separate module files nor package modules from other packages.

Import directives import entities exported from other compilation units, and provide such entities with bindings in the current module.

An import declaration has the following two parts:

Import path that determines a compilation unit to import from;

Import binding that defines what entities, and in what form—qualified or unqualified—can be used by the current module.

Each binding adds a declaration or declarations to the scope of a module or a package (see Scopes). Any declaration added so must be distinguishable in the declaration scope (see Distinguishable Declarations). Otherwise, a compile-time error occurs.

Some import constructions are specific for packages. They are described in the chapter Experi

*[Content truncated]*

**Examples:**

Example 1 (unknown):
```unknown
compilationUnit:
    separateModuleDeclaration
    | packageDeclaration
    ;

packageDeclaration:
    packageModule+
    ;
```

Example 2 (unknown):
```unknown
separateModuleDeclaration:
    importDirective* (topDeclaration | topLevelStatements | exportDirective)*
    ;
```

Example 3 (unknown):
```unknown
1 // Hello, world! module
2 function main() {
3   console.log("Hello, world!")
4 }
```

Example 4 (unknown):
```unknown
importDirective:
    'import' fileBinding|selectiveBindigns|defaultBinding|typeBinding
    'from' importPath
    ;

fileBinding:
    '*' importAlias
    | qualifiedName '.' '*'
    ;

selectiveBindigns:
    '{' importBinding (',' importBinding)* '}'
    ;

defaultBinding:
    Identifier
    ;

typeBinding:
    'type' selectiveBindigns
    ;

importBinding:
    qualifiedName importAlias?
    ;

importAlias:
    'as' Identifier
    ;

importPath:
    StringLiteral
    ;
```

---
