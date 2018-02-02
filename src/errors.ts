export const enum Errors {
    Unexpected,
    UnexpectedToken,
    BadGetterArity,
    BadSetterArity,
    BadSetterRestParameter,
    NoCatchOrFinally,
    NewlineAfterThrow,
    ParamAfterRest,
    InvalidDuplicateArgs,
    MisingFormal,
    InvalidParameterAfterRest,
    DefaultRestProperty,
    PropertyAfterRestProperty,
    LineBreakAfterAsync,
    InvalidParenthesizedPattern,
    UnexpectedStrictReserved,
    StrictFunction,
    InvalidNestedStatement,
    SloppyFunction,
    DisallowedInContext,
    DuplicateProtoProperty,
    ConstructorSpecialMethod,
    StaticPrototype,
    DuplicateConstructor,
    ForbiddenAsStatement,
    ForbiddenAsIfDeclaration,
    StrictLHSPrefixPostFix,
    InvalidLhsInPrefixPostFixOp,
    StrictDelete,
    StrictLHSAssignment,
    UnicodeOutOfRange,
    TemplateOctalLiteral,
    StrictOctalEscape,
    InvalidEightAndNine,
    InvalidHexEscapeSequence,
    UnterminatedString,
    UnexpectedEscapedKeyword,
    UnexpectedSurrogate,
    InvalidUnicodeEscapeSequence,
    StrictOctalLiteral,
    InvalidRestBindingPattern,
    InvalidRestDefaultValue,
    ElementAfterRest,
    InitializerAfterRest,
    StrictModeWith,
    UnknownLabel,
    Redeclaration,
    InvalidVarDeclInForLoop,
    DeclarationMissingInitializer,
    InvalidVarInitForOf,
    MissingInitializer,
    LetInLexicalBinding,
    InvalidStrictExpPostion,
    UnexpectedReservedWord,
    InvalidGeneratorParam,
    UnexpectedSuper,
    BadSuperCall,
    NewTargetArrow,
    MetaNotInFunctionBody,
    IllegalReturn,
    InvalidBindingStrictMode,
    InvalidAwaitInArrowParam,
    UnNamedFunctionStmt,
    InvalidLHSInForLoop,
    ForInOfLoopMultiBindings,
    InvalidArrowYieldParam,
    IllegalUseStrict,
    InvalidLHSInAssignment,
    AsyncFunctionInSingleStatementContext,
    ExportDeclAtTopLevel,
    ImportDeclAtTopLevel,
    GeneratorInLegacyContext
}

export const ErrorMessages: {
    [key: string]: string
} = {
    [Errors.Unexpected]: 'Unexpected token',
    [Errors.UnexpectedToken]: 'Unexpected token %0',
    [Errors.BadGetterArity]: `Getter functions must have no arguments`,
    [Errors.BadSetterArity]: 'Setter function must have exactly one argument',
    [Errors.BadSetterRestParameter]: 'Setter function argument must not be a rest parameter',
    [Errors.NoCatchOrFinally]: 'Missing catch or finally after try',
    [Errors.NewlineAfterThrow]: 'Illegal newline after throw',
    [Errors.ParamAfterRest]: 'Rest parameter must be last formal parameter',
    [Errors.InvalidDuplicateArgs]: 'Duplicate binding %0',
    [Errors.MisingFormal]: 'Missing formal parameter',
    [Errors.InvalidParameterAfterRest]: 'Parameter after rest parameter',
    [Errors.DefaultRestProperty]: 'Parameter after rest parameter',
    [Errors.PropertyAfterRestProperty]: 'Parameter after rest parameter',
    [Errors.LineBreakAfterAsync]: 'No line break is allowed after async',
    [Errors.InvalidParenthesizedPattern]: 'Invalid parenthesized pattern',
    [Errors.UnexpectedStrictReserved]: 'Unexpected eval or arguments in strict mode',
    [Errors.StrictFunction]: 'In strict mode code, functions can only be declared at top level or inside a block',
    [Errors.SloppyFunction]: 'In non-strict mode code, functions can only be declared at top level, inside a block, or as the body of an if statement',
    [Errors.InvalidNestedStatement]: '%0  statement must be nested within an iteration statement',
    [Errors.DisallowedInContext]: '\'%0\' may not be used as an identifier in this context',
    [Errors.DuplicateProtoProperty]: 'Property name __proto__ appears more than once in object literal',
    [Errors.ConstructorSpecialMethod]: 'Class constructor may not be an accessor',
    [Errors.StaticPrototype]: 'Classes may not have static property named prototype',
    [Errors.DuplicateConstructor]: 'A class may only have one constructor',
    [Errors.ForbiddenAsStatement]: '%0 can\'t appear in single-statement context',
    [Errors.ForbiddenAsIfDeclaration]: 'FunctionDeclarations in IfStatements are disallowed in strict mode',
    [Errors.StrictLHSPrefixPostFix]: '%0 increment/decrement may not have eval or arguments operand in strict mode',
    [Errors.InvalidLhsInPrefixPostFixOp]: 'Invalid left-hand side expression in %0 operation',
    [Errors.StrictDelete]: 'Identifier expressions must not be deleted in strict mode',
    [Errors.StrictLHSAssignment]: 'Eval or arguments can\'t be assigned to in strict mode code',
    [Errors.UnicodeOutOfRange]: 'Unicode escape code point out of range',
    [Errors.StrictOctalEscape]: 'Octal escapes are not allowed in strict mode',
    [Errors.InvalidEightAndNine]: 'Escapes \\8 or \\9 are not syntactically valid escapes',
    [Errors.TemplateOctalLiteral]: 'Template literals may not contain octal escape sequences',
    [Errors.InvalidHexEscapeSequence]: 'Invalid hexadecimal escape sequence',
    [Errors.UnterminatedString]: 'Unterminated string literal',
    [Errors.UnexpectedEscapedKeyword]: 'Unexpected escaped keyword',
    [Errors.InvalidUnicodeEscapeSequence]: 'Invalid Unicode escape sequence',
    [Errors.UnexpectedSurrogate]: 'Unexpected surrogate pair',
    [Errors.StrictOctalLiteral]: 'Octal literals are not allowed in strict mode',
    [Errors.InvalidRestBindingPattern]: '`...` must be followed by an identifier in declaration contexts',
    [Errors.InvalidRestDefaultValue]: 'Rest elements cannot have a default value',
    [Errors.ElementAfterRest]: 'Rest elements cannot have a default value',
    [Errors.InitializerAfterRest]: 'Rest elements cannot have a initializer',
    [Errors.StrictModeWith]: 'Strict mode code may not include a with statement',
    [Errors.Redeclaration]: 'Label \'%0\' has already been declared',
    [Errors.InvalidVarDeclInForLoop]: 'Invalid variable declaration in for-%0 statement',
    [Errors.InvalidVarInitForOf]: 'for-of loop variable declaration may not have an initializer',
    [Errors.DeclarationMissingInitializer]: 'Missing initializer in destructuring declaration',
    [Errors.LetInLexicalBinding]: 'let is disallowed as a lexically bound name',
    [Errors.InvalidStrictExpPostion]: 'The identifier \'%0\' must not be in expression position in strict mode',
    [Errors.UnexpectedReservedWord]: 'Unexpected reserved word',
    [Errors.InvalidGeneratorParam]: 'Generator parameters must not contain yield expressions',
    [Errors.UnexpectedSuper]: '\'super\' keyword unexpected here',
    [Errors.BadSuperCall]: 'super() is only valid in derived class constructors',
    [Errors.NewTargetArrow]: 'new.target must be within function (but not arrow expression) code',
    [Errors.MetaNotInFunctionBody]: 'new.target only allowed within functions',
    [Errors.IllegalReturn]: 'Illegal return statement',
    [Errors.InvalidBindingStrictMode]: 'The identifier \'%0\' must not be in binding position in strict mode',
    [Errors.InvalidAwaitInArrowParam]: '\'await\' is not a valid identifier name in an async function',
    [Errors.UnNamedFunctionStmt]: 'Function statement requires a name',
    [Errors.InvalidLHSInForLoop]: 'Invalid left-hand side in for-loop',
    [Errors.ForInOfLoopMultiBindings]: 'Invalid left-hand side in %0 loop: Must have a single binding.',
    [Errors.InvalidArrowYieldParam]: 'Arrow parameters must not contain yield expressions',
    [Errors.IllegalUseStrict]: 'Illegal \'use strict\' directive in function with non-simple parameter list',
    [Errors.InvalidLHSInAssignment]: 'Invalid left-hand side in assignment',
    [Errors.AsyncFunctionInSingleStatementContext]: 'Async functions can only be declared at the top level or inside a block',
    [Errors.ExportDeclAtTopLevel]: 'Export declarations may only appear at top level of a module',
    [Errors.ImportDeclAtTopLevel]: 'Import declarations may only appear at top level of a module',
    [Errors.UnknownLabel]: 'Undefined label \'%0\'',
    [Errors.GeneratorInLegacyContext]: 'Generator declarations are not allowed in legacy contexts',
};

function constructError(msg: string, column: number): Error {
    let error: Error = new Error(msg);
    try {
        throw error;
    } catch (base) {
        // istanbul ignore else
        if (Object.create && Object.defineProperty) {
            error = Object.create(base);
            Object.defineProperty(error, 'column', {
                enumerable: true,
                writable: true,
                value: column
            });
        }
    }
    // istanbul ignore next
    return error;
}

export function createError(type: Errors, index: number, line: number, column: number,  ...params: string[]): any {
    const description = ErrorMessages[type].replace(/%(\d+)/g, (_: string, i: number) => params[i]);
    const error: any = constructError(description + ' at ' + ':' + line + ':' + column, column);
    error.index = index;
    error.lineNumber = line;
    error.description = description;
    error.columnNumber = column;

    return error;
}