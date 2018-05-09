import { Parser, Location, Errors, Token, ESTree, Context, Labels, ModifierState, ObjectState, CoverParenthesizedState, CoverCallState } from 'cherow';
export declare function validateBreakOrContinueLabel(parser: Parser, context: Context, label: string, isContinue: boolean): void;
export declare function addLabel(parser: Parser, label: string): void;
export declare function popLabel(parser: Parser, label: string): void;
export declare function hasLabel(parser: Parser, label: string): Labels;
export declare function finishNode<T extends ESTree.Node>(context: Context, parser: Parser, meta: Location, node: Partial<T>): T;
export declare function expect(parser: Parser, context: Context, token: Token, err?: Errors): boolean;
export declare function consume(parser: Parser, context: Context, token: Token): boolean;
export declare function nextToken(parser: Parser, context: Context): Token;
export declare const hasBit: (mask: number, flags: number) => boolean;
export declare function consumeSemicolon(parser: Parser, context: Context): void | boolean;
export declare function parseExpressionCoverGrammar<T>(parser: Parser, context: Context, callback: (parser: Parser, context: Context) => T): T;
export declare function restoreExpressionCoverGrammar<T>(parser: Parser, context: Context, callback: (parser: Parser, context: Context) => T): T;
export declare function swapContext<T>(parser: Parser, context: Context, state: ModifierState, callback: (parser: Parser, context: Context, state: ObjectState) => T, methodState?: ObjectState): T;
export declare function validateParams(parser: Parser, context: Context, params: string[]): void;
export declare const reinterpret: (parser: Parser, context: Context, node: any) => void;
export declare function lookahead<T>(parser: Parser, context: Context, callback: (parser: Parser, context: Context) => T): T;
export declare function isValidSimpleAssignmentTarget(node: ESTree.Node): boolean;
export declare function getLocation(parser: Parser): Location;
export declare function isValidIdentifier(context: Context, t: Token): boolean;
export declare function isLexical(parser: Parser, context: Context): boolean;
export declare function isEndOfCaseOrDefaultClauses(parser: Parser): boolean;
export declare function nextTokenIsLeftParenOrPeriod(parser: Parser, context: Context): boolean;
export declare function nextTokenisIdentifierOrParen(parser: Parser, context: Context): boolean | number;
export declare function nextTokenIsLeftParen(parser: Parser, context: Context): boolean;
export declare function nextTokenIsFuncKeywordOnSameLine(parser: Parser, context: Context): boolean;
export declare function isPropertyWithPrivateFieldKey(expr: any): boolean;
export declare function parseAndValidateIdentifier(parser: Parser, context: Context): void | ESTree.Identifier;
export declare function nameIsArgumentsOrEval(value: string): boolean;
export declare function setPendingError(parser: Parser): void;
export declare function isEqualTagNames(elementName: ESTree.JSXNamespacedName | ESTree.JSXIdentifier | ESTree.JSXMemberExpression): string;
export declare function isInstanceField(parser: Parser): boolean;
export declare function validateUpdateExpression(parser: Parser, context: Context, expr: ESTree.Expression, prefix: string): void;
export declare function setPendingExpressionError(parser: Parser, type: Errors): void;
export declare function validateCoverParenthesizedExpression(parser: Parser, state: CoverParenthesizedState): CoverParenthesizedState;
export declare function validateAsyncArgumentList(parser: Parser, context: Context, state: CoverCallState): CoverCallState;
export declare function isStartOfFunctionType(parser: Parser, context: Context): boolean;
export declare function keywordTypeFromName(value: string): string | undefined;
export declare function iStartOfMappedType(parser: Parser, context: Context): boolean;
export declare function isUnambiguouslyIndexSignature(parser: Parser, context: Context): boolean;
export declare function isNextTokenCanFollowModifier(parser: Parser, context: Context): boolean;
export declare function isTypePredicatePrefix(parser: Parser, context: Context): any;
