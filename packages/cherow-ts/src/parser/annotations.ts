import {
  iStartOfMappedType,
  isUnambiguouslyIndexSignature,
  lookahead,
  keywordTypeFromName,
  isStartOfFunctionType,
  isNextTokenCanFollowModifier,
  isTypePredicatePrefix,
  nextTokenIsStartOfConstructSignature
} from '../utilities';
import { parseIdentifier, parseIdentifierWTypeAnnotation, parseRestElement } from './expressions';
import {
  Parser,
  Location,
  report,
  Errors,
  Token,
  tokenDesc,
  Context,
  Flags,
  getLocation,
  consume,
  finishNode,
  expect,
  consumeSemicolon,
  nextToken
} from 'cherow';
import { parseBindingIdentifier } from './pattern';

// AST from Babylon / ESLint

/*
 * Parses mapped type parameter
 *
 * @param {Parser} parser object
 * @param {Context} context Context masks
 * @returns {*}
 */
function parseMappedTypeParameter(parser: Parser, context: Context): any {
  const pos = getLocation(parser);
  const name = parseIdentifier(parser, context);
  expect(parser, context, Token.InKeyword);
  const constraint = parseType(parser, context);
  return finishNode(context, parser, pos, {
    type: 'TypeParameter',
    name
  });
}

/*
* Parser TS intersection types
*
* @param {Parser} parser Parser object
* @param {Context} context Context masks
* @returns {*}
*/
function parseIntersectionType(parser: Parser, context: Context): any {
  const pos = getLocation(parser);
  consume(parser, context, Token.BitwiseAnd);
  const tsType = parseTypeOperator(parser, context);
  const types = [tsType];
  if (parser.token !== Token.BitwiseAnd) return tsType;
  while (consume(parser, context, Token.BitwiseAnd)) {
    types.push(parseTypeOperator(parser, context));
  }
  return finishNode(context, parser, pos, {
    type: 'TSIntersectionType',
    types
  });
}

export function parseTypeParameter(parser: Parser, context: Context): any {
  const pos = getLocation(parser);
  const { tokenValue: name } = parser;
  nextToken(parser, context);
  consume(parser, context, Token.Assign);
  return finishNode(context, parser, pos, {
    type: 'TSTypeParameter',
    name,
    constraint: consume(parser, context, Token.ExtendsKeyword) ? parseType(parser, context) : null,
    default: consume(parser, context, Token.Assign) ? parseType(parser, context) : null
  });
}

export function parseTypeParameters(parser: Parser, context: Context): any {
  const params: any[] = [];
  if (parser.token !== Token.LessThan) return params;
  const pos = getLocation(parser);
  if (parser.token === Token.LessThan || parser.token === Token.JSXClose) {
    nextToken(parser, context);
  } else {
    report(parser, Errors.Unexpected);
  }

  while (!consume(parser, context, Token.GreaterThan)) {
    params.push(parseTypeParameter(parser, context));
  }
  return finishNode(context, parser, pos, {
    type: 'TSTypeParameterDeclaration',
    params
  });
}

function parseFunctionType(parser: Parser, context: Context): any {
  const pos = getLocation(parser);
  const typeParameters = parseTypeParameters(parser, context);
  expect(parser, context, Token.LeftParen);
  const parameters: any[] = [];
  while (parser.token !== Token.RightParen) {
    parameters.push(parser.token === Token.Ellipsis
      ? parseRestElement(parser, context)
      : parseBindingIdentifier(parser, context));
    consume(parser, context, Token.Comma);
  }

  expect(parser, context, Token.RightParen);
  let typeAnnotation: any = null;
  if (parser.token === Token.Arrow) {
    typeAnnotation = parseTypeOrTypePredicateAnnotation(parser, context, Token.Arrow);
  }
  return finishNode(context, parser, pos, {
    type: 'TSFunctionType',
    typeParameters,
    parameters,
    typeAnnotation
  });
}

export function parseTypeOrTypePredicateAnnotation(parser: Parser, context: Context, token: Token): any {
  expect(parser, context, token);
  if (!lookahead(parser, context, isTypePredicatePrefix)) {
    return parseTypeAnnotation(parser, context, false);
  }
  const pos = getLocation(parser);
  const parameterName = parseIdentifier(parser, context);
  nextToken(parser, context);
  const typeAnnotation = parseTypeAnnotation(parser, context, false);
  return finishNode(context, parser, pos, {
     type: 'TSTypePredicate',
     parameterName,
     typeAnnotation
   });
}

function parseConstructorType(parser: Parser, context: Context): any {
  const pos = getLocation(parser);
  expect(parser, context, Token.NewKeyword);
  return finishNode(context, parser, pos, {
    type: 'TSConstructorType'
  });
}

export function parseType(parser: Parser, context: Context): any {
  if (isStartOfFunctionType(parser, context)) {
    return parseFunctionType(parser, context);
  } else if (consume(parser, context, Token.NewKeyword)) {
    return parseConstructorType(parser, context);
  }

  return parseUnionType(parser, context);
}

function parseUnionType(parser: Parser, context: Context): any {
  const pos = getLocation(parser);
  consume(parser, context, Token.BitwiseOr);
  const type = parseIntersectionType(parser, context);
  if (parser.token !== Token.BitwiseOr) return type;
  const types = [type];
  while (consume(parser, context, Token.BitwiseOr)) {
     types.push(parseIntersectionType(parser, context));
  }
  return finishNode(context, parser, pos, {
    type: 'TSUnionType',
    types
  });
}

function parseMappedType(parser: Parser, context: Context): any {
  const pos = getLocation(parser);
  expect(parser, context, Token.LeftBrace);
  const readonly = consume(parser, context, Token.ReadOnlyKeyword);
  expect(parser, context, Token.LeftBracket);
  const typeParameter = parseMappedTypeParameter(parser, context);
  expect(parser, context, Token.RightBracket);
  const optional = consume(parser, context, Token.QuestionMark);
  let typeAnnotation;
  if (consume(parser, context, Token.Colon)) typeAnnotation = parseType(parser, context);
  consumeSemicolon(parser, context);
  expect(parser, context, Token.RightBrace);

  return finishNode(context, parser, pos, {
    type: 'TSMappedType',
    readonly,
    typeParameter,
    optional,
    typeAnnotation
  });
}

function parseIdentifierTypedNode(parser: Parser, context: Context): any {
  const pos = getLocation(parser);
  const tsType: any = keywordTypeFromName(parser.tokenValue);
  if (tsType) {
    expect(parser, context, Token.Identifier);
    return finishNode(context, parser, pos, {
      type: tsType
    });
  }

  return parseTypeReference(parser, context);
}

export function parseEntityName(parser: Parser, context: Context): any {
  const pos = getLocation(parser);
  let entity = parseIdentifier(parser, context);

  while (consume(parser, context, Token.Period)) {
    entity = finishNode(context, parser, pos, {
      type: 'TSQualifiedName',
      left: entity,
      right: parseIdentifier(parser, context)
    });
  }

  return entity;
}

function parseTypeArgumentElements(parser: Parser, context: Context): any {
  const params: any = [];

  expect(parser, context, Token.LessThan);

  while (parser.token !== Token.GreaterThan) {
    params.push(parseType(parser, context));
  }

  expect(parser, context, Token.GreaterThan);
  return params;
}

export function parseTypeArguments(parser: Parser, context: Context): any {
  const pos = getLocation(parser);

  expect(parser, context, Token.LessThan);
  const params: any[] = [];
  while (parser.token !== Token.GreaterThan) {
    params.push(parseType(parser, context));
  }
  expect(parser, context, Token.GreaterThan);
  return finishNode(context, parser, pos, {
    type: 'TypeParameterInstantiation',
    params
  });
}

function parseTypeReference(parser: Parser, context: Context): any {
  const pos = getLocation(parser);
  const typeName = parseEntityName(parser, context);
  let typeParameters: any = [];

  if (!(parser.flags & Flags.NewLine) && parser.token === Token.LessThan) {
    typeParameters = parseTypeArguments(parser, context);
  }
  return finishNode(context, parser, pos, {
    type: 'TSTypeReference',
    typeName,
    typeParameters
  });
}

function parseNullTypedNode(parser: Parser, context: Context): any {
  const pos = getLocation(parser);
  expect(parser, context, Token.NullKeyword);
  return finishNode(context, parser, pos, {
    type: 'TSNullKeyword'
  });
}

function parseSubtractTypeNode(parser: Parser, context: Context): any {
  const pos = getLocation(parser);
  expect(parser, context, Token.Subtract);
  // has to be followed by a numeric value
  if (parser.token !== Token.NumericLiteral) report(parser, Errors.Unexpected);

  return finishNode(context, parser, pos, {
    type: 'TSLiteralType',
    literal: Parser.parseLiteral(parser, context)
  });
}

function parseThisTypeNode(parser: Parser, context: Context): any {
  const pos = getLocation(parser);
  expect(parser, context, Token.ThisKeyword);
  return finishNode(context, parser, pos, {
    type: 'TSThisType',
    literal: Parser.parseLiteral(parser, context)
  });
}

function parseThisTypePredicate(parser: Parser, context: Context, parameterName: any): any {
  const pos = getLocation(parser);
  nextToken(parser, context);
  return finishNode(context, parser, pos, {
    type: 'TSTypePredicate',
    parameterName,
    typeAnnotation: parseTypeAnnotation(parser, context, false)
  });
}

/**
 * Parse type annotation
 *
 * @param parser Parser object
 * @param context  Context masks
 * @param consumeColon True if should consume semicolon
 */
export function parseTypeAnnotation(parser: Parser, context: Context, consumeColon: boolean = true): any {
  const pos = getLocation(parser);
  if (consumeColon) expect(parser, context, Token.Colon);
  return finishNode(context, parser, pos, {
    type: 'TypeAnnotation',
    typeAnnotation: parseType(parser, context)
  });
}

function parseVoidTypedNode(parser: Parser, context: Context): any {
  const pos = getLocation(parser);
  expect(parser, context, Token.VoidKeyword);
  return finishNode(context, parser, pos, {
    type: 'TSVoidKeyword'
  });
}

function parseLiteralTypedNode(parser: Parser, context: Context): any {
  const pos = getLocation(parser);
  let literal: any;
  switch (parser.token) {
    case Token.StringLiteral:
    case Token.NumericLiteral:
      literal = Parser.parseLiteral(parser, context);
      break;
    case Token.TrueKeyword:
      literal = {
        type: 'Literal',
        value: true
      };
      nextToken(parser, context);
      break;
    case Token.FalseKeyword:
      literal = {
        type: 'Literal',
        value: false
      };
      nextToken(parser, context);
      break;
    default:
      report(parser, Errors.Unexpected);
  }
  return finishNode(context, parser, pos, {
    type: 'TSLiteralType',
    literal
  });
}

function parseNonArrayType(parser: Parser, context: Context): any {

  switch (parser.token) {
    case Token.Identifier:
      return parseIdentifierTypedNode(parser, context);
    case Token.VoidKeyword:
      return parseVoidTypedNode(parser, context);
    case Token.NullKeyword:
      return parseNullTypedNode(parser, context);
    case Token.StringLiteral:
    case Token.NumericLiteral:
    case Token.TrueKeyword:
    case Token.FalseKeyword:
      return parseLiteralTypedNode(parser, context);
    case Token.Subtract:
      return parseSubtractTypeNode(parser, context);
    case Token.ThisKeyword:
      const thisType = parseThisTypeNode(parser, context);
      switch (parser.token) {
        case Token.IsKeyword:
          if (!(parser.flags & Flags.NewLine)) return parseThisTypePredicate(parser, context, thisType);
        // falls through
        default:
          return thisType;
      }
    case Token.TypeofKeyword:
      return parseTypeQuery(parser, context);
    case Token.LeftBrace:
      return lookahead(parser, context, iStartOfMappedType)
        ? parseMappedType(parser, context)
        : parseTypeLiteral(parser, context);
    case Token.LeftBracket:
      return parseTupleType(parser, context);
    case Token.LeftParen:
      return parseParenthesizedType(parser, context);
    default:
      report(parser, Errors.Unexpected);
  }
}

function parseParenthesizedType(parser: Parser, context: Context): any {
  const pos = getLocation(parser);
  expect(parser, context, Token.LeftParen);
  const typeAnnotation = parseType(parser, context);
  expect(parser, context, Token.RightParen);

  return finishNode(context, parser, pos, {
    type: 'TSParenthesizedType',
    typeAnnotation
  });
}

function parseTupleElementTypes(parser: Parser, context: Context): any {
  const pos = getLocation(parser);
  return finishNode(context, parser, pos, {
    type: 'TupleElementTypes'
  });
}

function parseTupleType(parser: Parser, context: Context): any {
  const pos = getLocation(parser);
  expect(parser, context, Token.LeftBracket);
  const elementTypes = [parseType(parser, context)];
  while (consume(parser, context, Token.Comma)) {
    elementTypes.push(parseType(parser, context));
  }
  expect(parser, context, Token.RightBracket);
  return finishNode(context, parser, pos, {
    type: 'TSTupleType',
    elementTypes
  });
}

function parseTypeLiteral(parser: Parser, context: Context): any {
  const pos = getLocation(parser);
  return finishNode(context, parser, pos, {
    type: 'TSTypeLiteral',
    members: parseObjectTypeMembers(parser, context)
  });
}

function parseTypeQuery(parser: Parser, context: Context): any {
  const pos = getLocation(parser);
  expect(parser, context, Token.TypeofKeyword);
  return finishNode(context, parser, pos, {
    type: 'TSTypeQuery',
    exprName: parseEntityName(parser, context)
  });
}

function parseIndexSignature(parser: Parser, context: Context): any {
  if (!(parser.token === Token.LeftBracket && lookahead(parser, context, isUnambiguouslyIndexSignature))) {
    return null;
  }

  const pos = getLocation(parser);

  expect(parser, context, Token.LeftBracket);
  const id = parseIdentifierWTypeAnnotation(parser, context);
  expect(parser, context, Token.RightBracket);
  const typeAnnotation  = parser.token === Token.Colon ? parseTypeAnnotation(parser, context, true) : null;
  if (parser.token !== Token.Comma) consumeSemicolon(parser, context);
  return finishNode(context, parser, pos, {
    type: 'TSIndexSignature',
    typeAnnotation,
    parameters: [id]
  });
}

function parsePropertyOrMethodSignature(parser: Parser, context: Context, readonly: boolean): any {
  const pos = getLocation(parser);
  const key = Parser.parsePropertyName(parser, context);
  const option = consume(parser, context, Token.QuestionMark);
  if (!readonly && (parser.token === Token.LeftParen || parser.token === Token.LessThan)) {
      const typeParameters = parseTypeParameters(parser, context);
      expect(parser, context, Token.LeftParen);
      const parameters: any[] = [];
      while (parser.token !== Token.RightParen) {
          parameters.push(parser.token === Token.Ellipsis
            ? parseRestElement(parser, context)
            : parseBindingIdentifier(parser, context));
          consume(parser, context, Token.Comma);
      }
      expect(parser, context, Token.RightParen);
      let typeAnnotation: any = null;
      if (parser.token === Token.Colon) {
          typeAnnotation = parseTypeOrTypePredicateAnnotation(parser, context, Token.Colon);
      }

      if (parser.token !== Token.Comma) consumeSemicolon(parser, context);
      return finishNode(context, parser, pos, {
          type: 'TSMethodSignature',
          key,
          computed: false,
          parameters,
          typeAnnotation,
          readonly
      });
  } else {
      const typeAnnotation = parser.token === Token.Colon ? parseTypeAnnotation(parser, context) : null;
      if (parser.token === Token.Semicolon) consumeSemicolon(parser, context);
      return finishNode(context, parser, pos, {
          type: 'TSPropertySignature',
          computed: false,
          key,
          typeAnnotation
      });
  }
}
function parseModifier(parser: Parser, context: Context, allowedModifiers: any): any {
  if (!(parser.token & Token.IsIdentifier)) return false;
  if (allowedModifiers.indexOf(parser.tokenValue) !== -1 &&
  lookahead(parser, context, isNextTokenCanFollowModifier)) {
    return parser.tokenValue;
  }
  return false;
}

function parseTypeMember(parser: Parser, context: Context): any {
  // call
  if (parser.token === Token.LeftParen || parser.token === Token.LessThan) {
    return parseSignatureMember(parser, context, 'TSConstructSignatureDeclaration');
  }
  if (parser.token === Token.NewKeyword && lookahead(parser, context, nextTokenIsStartOfConstructSignature)) {
    expect(parser, context, Token.NewKeyword);
    return parseSignatureMember(parser, context, 'TSConstructSignatureDeclaration');
  }

  const readonly = parseModifier(parser, context, ['readonly']);
  const idx = parseIndexSignature(parser, context);
  if (idx) return idx;

  return parsePropertyOrMethodSignature(parser, context, readonly);
}
export function parseSignatureMember(parser: Parser, context: Context, type: string): any {
  const pos = getLocation(parser);
  expect(parser, context, Token.LeftParen);
  const parameters: any[] = [];
  while (parser.token !== Token.RightParen) {
    parameters.push(parser.token === Token.Ellipsis
      ? parseRestElement(parser, context)
      : parseBindingIdentifier(parser, context));
    consume(parser, context, Token.Comma);
  }

  expect(parser, context, Token.RightParen);
  let typeAnnotation: any = null;
  if (parser.token === Token.Colon) {
    typeAnnotation = parseTypeOrTypePredicateAnnotation(parser, context, Token.Colon);
  }
  if (parser.token !== Token.Comma) consumeSemicolon(parser, context);
  return finishNode(context, parser, pos, {
    type,
    parameters,
    typeAnnotation
  });
}

export function parseObjectTypeMembers(parser: Parser, context: Context): any {
  const members: any = [];
  expect(parser, context, Token.LeftBrace);
  while (parser.token !== Token.RightBrace) {
    members.push(parseTypeMember(parser, context));
  }
  expect(parser, context, Token.RightBrace);
  return members;
}

function parseArrayType(parser: Parser, context: Context): any {
  const pos = getLocation(parser);
  let elementType = parseNonArrayType(parser, context);

  while (!(parser.flags & Flags.NewLine) && consume(parser, context, Token.LeftBracket)) {
    if (consume(parser, context, Token.RightBracket)) {
      elementType = finishNode(context, parser, pos, {
        type: 'TSArrayType',
        elementType
      });
    } else {
      const indexType = parseType(parser, context);
      expect(parser, context, Token.RightBracket);
      elementType = finishNode(context, parser, pos, {
        type: 'TSIndexedAccessType',
        elementType,
        indexType
      });
    }
  }
  return elementType;
}

function parseTypeOperator(parser: Parser, context: Context): any {
  if (parser.token !== Token.KeyOfKeyword && parser.token !== Token.UniqueKeyword) {
    return parseArrayType(parser, context);
  }

  const pos = getLocation(parser);
  const operator = parser.token;
  nextToken(parser, context);
  return finishNode(context, parser, pos, {
    type: 'TSTypeOperator',
    operator: tokenDesc(operator),
    typeAnnotation: parseTypeOperator(parser, context)
  });
}
