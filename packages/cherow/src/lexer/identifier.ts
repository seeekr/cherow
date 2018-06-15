import { Parser } from '../types';
import { Chars } from '../chars';
import { Token, descKeyword } from '../token';
import { Context, Flags } from '../common';
import { isValidIdentifierStart, isValidIdentifierPart } from '../unicode';
import { Errors, report } from '../errors';
import {
  hasBit,
  fromCodePoint,
  toHex,
  escapeInvalidCharacters,
  isIdentifierPart,
  isWhiteSpaceSingleLine,
  isAsciiCodePoint,
  consumeOpt
} from './common';

/**
 * Scans identifier
 *
 * @param parser Parser object
 */
export function scanIdentifier(parser: Parser): Token {
  const { index } = parser;
  let first = parser.source.charCodeAt(parser.index);
  // Hot path - fast scanning for identifiers and non-escaped keywords
  while (isAsciiCodePoint(first)) {
      parser.index++; parser.column++;
      first = parser.source.charCodeAt(parser.index);
  }

  parser.tokenValue = parser.source.slice(index, parser.index);

  if (parser.index >= parser.length || first <= 127 && first !== Chars.Backslash) {
      return getIdentifierToken(parser);
  }

  // slow path
  return parseIdentifierSuffix(parser);
}

/**
 * Parse identifier suffix
 *
 * @param parser Parser object
 * @param context Context masks
 * @param first codepoint
 */
function parseIdentifierSuffix(parser: Parser): Token {
  let start = parser.index;
  let hasEscape = false;

  while (parser.index < parser.length) {
      let ch = parser.source.charCodeAt(parser.index);
      if (ch === Chars.Backslash) {
          const pendingIndex = parser.index;
          const cherow = scanIdentifierUnicodeEscape(parser);
          if (cherow < 0 || cherow === Chars.Backslash || !isValidIdentifierStart(cherow)) return Token.Invalid;
          parser.tokenValue += parser.source.slice(start, pendingIndex);
          parser.tokenValue += fromCodePoint(cherow);
          hasEscape = true;
          start = parser.index;
      } else {
          if ((ch & 0xFC00) === Chars.LeadSurrogateMin) {
              const lo = parser.source.charCodeAt(parser.index + 1);
              parser.column++;
              ch = (ch & 0x3FF) << 10 | lo & 0x3FF | Chars.NonBMPMin;
          }
          if (!isIdentifierPart(ch)) break;
          parser.index++; parser.column++;
          if (ch > 0xFFFF) parser.index++;
      }
  }
  if (start < parser.index) parser.tokenValue += parser.source.slice(start, parser.index);

  const token = getIdentifierToken(parser);

  if (hasEscape) {
      if (hasBit(token, Token.Identifier) || hasBit(token, Token.Contextual)) {
          return token;
      } else if (hasBit(token, Token.FutureReserved) ||
          token === Token.LetKeyword ||
          token === Token.StaticKeyword) {
          return Token.EscapedStrictReserved;
      } else return Token.EscapedKeyword;
  }
  return token;
}

/**
 * Scans identifier unicode escape
 *
 * @param parser Parser object
 */
export function scanIdentifierUnicodeEscape(parser: Parser): number {
  parser.index++; parser.column++;
  if (parser.source.charCodeAt(parser.index) !== Chars.LowerU) report(parser, Errors.Unexpected);
  parser.index++; parser.column++;
  if (consumeOpt(parser, Chars.LeftBrace)) {
      //\u{HexDigits}
      let value = 0;
      let digit = toHex(parser.source.charCodeAt(parser.index));
      if (digit < 0) return -1;
      while (digit >= 0) {
          value = (value << 4) | digit;
          if (value > Chars.NonBMPMax) report(parser, Errors.Unexpected);
          parser.index++; parser.column++;
          digit = toHex(parser.source.charCodeAt(parser.index));
      }
      if (value < 0 || !consumeOpt(parser, Chars.RightBrace)) {
          report(parser, Errors.Unexpected);
      }
      return value;
  }
  //\uHex4Digits
  if (parser.index + 4 > parser.length) return -1;
  const char1 = toHex(parser.source.charCodeAt(parser.index));
  if (char1 < 0) return -1;
  const char2 = toHex(parser.source.charCodeAt(parser.index + 1));
  if (char2 < 0) return -1;
  const char3 = toHex(parser.source.charCodeAt(parser.index + 2));
  if (char3 < 0) return -1;
  const char4 = toHex(parser.source.charCodeAt(parser.index + 3));
  if (char4 < 0) return -1;
  parser.index += 4;
  parser.column += 4;
  return char1 << 12 | char2 << 8 | char3 << 4 | char4;
}

/**
* Get identifier token
*
* @param parser Parser object
*/
function getIdentifierToken(parser: Parser): Token {
  const len = parser.tokenValue.length;
  if (len >= 2 && len <= 11) {
      const token = descKeyword(parser.tokenValue);
      if (token > 0) {
          return token;
      }
  }
  return Token.Identifier;
}

/**
* Scans maybe identifier
*
* @param parser Parser object
*/
export function scanMaybeIdentifier(parser: Parser, context: Context, first: number): Token {
  let c = context;
  if (isWhiteSpaceSingleLine(first)) {
      parser.index++; parser.column++;
      return Token.WhiteSpace;
  } else if (first === Chars.LineSeparator || first === Chars.ParagraphSeparator) {
      parser.index++; parser.column = 0; parser.line++;
      parser.flags |= Flags.NewLine;
      return Token.WhiteSpace;
  }

  // TODO: Collect ideas for optimization?
  first = parser.source.charCodeAt(parser.index++);

  if ((first & 0xFC00) === Chars.LeadSurrogateMin) {
      const lo = parser.source.charCodeAt(parser.index);
      if (lo >= Chars.TrailSurrogateMin && lo <= Chars.TrailSurrogateMax) {
          first = (first & 0x3FF) << 10 | lo & 0x3FF | Chars.NonBMPMin;
          parser.index++; parser.column++;
      }
  }

  if (!isValidIdentifierStart(first)) report(parser, Errors.Unexpected, escapeInvalidCharacters(first));
  parser.column++;
  parser.tokenValue = fromCodePoint(first);
  if (parser.index < parser.length) return parseIdentifierSuffix(parser)
  return Token.Identifier;
}
