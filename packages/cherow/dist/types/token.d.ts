/**
 * https://tc39.github.io/ecma262/#sec-ecmascript-language-source-code
 */
export declare const enum Token {
    Type = 255,
    PrecStart = 8,
    Precedence = 3840,
    Contextual = 4096,
    Reserved = 8192,
    FutureReserved = 16384,
    Invalid = 65536,
    ASI = 131072,
    IsLogical = 262144,
    WhiteSpace = 524288,
    Comments = 1572864,
    NumericLiteral = 2097152,
    StringLiteral = 4194304,
    Identifier = 8388608,
    RegularExpression = 16777216,
    Punctuator = 33554432,
    Template = 67108864,
    /** Misc */
    IsAssignOp = 134217728,
    IsBinaryOp = 268435456,
    IsUnaryOp = 536870912,
    IsUpdateOp = 1073741824,
    /** Constants */
    Keyword = 8417280,
    EndOfSource = 131072,
    FalseKeyword = 8193,
    TrueKeyword = 8194,
    NullKeyword = 8195,
    TemplateHead = 67108868,
    TemplateCont = 67108869,
    TemplateTail = 67108870,
    Arrow = 33554439,
    LeftParen = 33554440,
    LeftBrace = 33554441,
    Period = 33554442,
    Ellipsis = 33554443,
    RightBrace = 33685516,
    RightParen = 33554445,
    Semicolon = 33685518,
    Comma = 33554447,
    LeftBracket = 33554448,
    RightBracket = 33554449,
    Colon = 33554450,
    QuestionMark = 33554451,
    SingleQuote = 33554452,
    DoubleQuote = 33554453,
    JSXClose = 33554454,
    JSXAutoClose = 33554455,
    Increment = 1107296280,
    Decrement = 1107296281,
    Assign = 167772186,
    ShiftLeftAssign = 167772187,
    ShiftRightAssign = 167772188,
    LogicalShiftRightAssign = 167772189,
    ExponentiateAssign = 167772190,
    AddAssign = 167772191,
    SubtractAssign = 167772192,
    MultiplyAssign = 167772193,
    DivideAssign = 167772194,
    ModuloAssign = 167772195,
    BitwiseXorAssign = 167772196,
    BitwiseOrAssign = 167772197,
    BitwiseAndAssign = 167772198,
    TypeofKeyword = 570433575,
    DeleteKeyword = 570433576,
    VoidKeyword = 570433577,
    Negate = 570425386,
    Complement = 570425387,
    Add = 838863148,
    Subtract = 838863149,
    InKeyword = 301999918,
    InstanceofKeyword = 301999919,
    Multiply = 301992496,
    Modulo = 301992497,
    Divide = 301992498,
    Exponentiate = 301992755,
    LogicalAnd = 301990452,
    LogicalOr = 301990197,
    StrictEqual = 301991478,
    StrictNotEqual = 301991479,
    LooseEqual = 301991480,
    LooseNotEqual = 301991481,
    LessThanOrEqual = 301991738,
    GreaterThanOrEqual = 301991739,
    LessThan = 301991740,
    GreaterThan = 301991741,
    ShiftLeft = 301991998,
    ShiftRight = 301991999,
    LogicalShiftRight = 301992000,
    BitwiseAnd = 301991233,
    BitwiseOr = 301990722,
    BitwiseXor = 301990979,
    VarKeyword = 8260,
    LetKeyword = 16453,
    ConstKeyword = 8262,
    BreakKeyword = 8263,
    CaseKeyword = 8264,
    CatchKeyword = 8265,
    ClassKeyword = 8266,
    ContinueKeyword = 8267,
    DebuggerKeyword = 8268,
    DefaultKeyword = 8269,
    DoKeyword = 8270,
    ElseKeyword = 8271,
    ExportKeyword = 8272,
    ExtendsKeyword = 8273,
    FinallyKeyword = 8274,
    ForKeyword = 8275,
    FunctionKeyword = 8276,
    IfKeyword = 8277,
    ImportKeyword = 8278,
    NewKeyword = 8279,
    ReturnKeyword = 8280,
    SuperKeyword = 8281,
    SwitchKeyword = 8282,
    ThisKeyword = 8283,
    ThrowKeyword = 8284,
    TryKeyword = 8285,
    WhileKeyword = 8286,
    WithKeyword = 8287,
    Arguments = 8388704,
    Eval = 8388705,
    At = 8388706,
    Hash = 8388707,
    ImplementsKeyword = 16484,
    InterfaceKeyword = 16485,
    PackageKeyword = 16486,
    PrivateKeyword = 16487,
    ProtectedKeyword = 16488,
    PublicKeyword = 16489,
    StaticKeyword = 16490,
    YieldKeyword = 16491,
    AsKeyword = 4204,
    AsyncKeyword = 4205,
    AwaitKeyword = 4206,
    ConstructorKeyword = 4207,
    GetKeyword = 4208,
    SetKeyword = 4209,
    FromKeyword = 4210,
    OfKeyword = 4211,
    SingleComment = 1572980,
    MultiComment = 1572981,
    HTMLComment = 1572982,
    Space = 524407,
    Tab = 524408,
    LineFeed = 524409,
    CarriageReturn = 524410,
    BigInt = 2097275,
    EnumKeyword = 8316,
    /** Escaped keywords */
    EscapedStrictReserved = 125,
    EscapedKeyword = 126
}
/**
 * The conversion function between token and its string description/representation.
 */
export declare function tokenDesc(token: Token): string;
export declare const descKeywordTable: {
    [key: string]: Token;
};
export declare function descKeyword(value: string): Token;
