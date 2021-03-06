import { Parser } from '../types';
import { Chars } from '../chars';
import { Token } from '../token';
import { Context, Flags } from '../common';
import { consumeOpt, toHex } from './common';
import { Errors, recordErrors, report } from '../errors';
import { isValidIdentifierStart } from '../unicode';

// Numeric literals
//
// - Stage 3 proposals included:
// =============================
//
// - Numeric separators
// . BigInt
//

/**
 *  Scans numeric and decimal literal literal
 *
 * @see [https://tc39.github.io/ecma262/#prod-DecimalLiteral)
 * @see [https://tc39.github.io/ecma262/#prod-NumericLiteral)
 *
 * @param parser Parser object
 * @param context Context masks
 */
export function scanNumeric(parser: Parser, context: Context): Token {
  const { index, column } = parser;

  let next = parser.source.charCodeAt(parser.index);
  let isFloat = next === Chars.Period;

  if (isFloat) {
      parser.tokenValue = scanDecimalDigitsOrSeparator(parser);
  } else {
      let seenSeparator = false;

      // Most number values fit into 4 bytes, but for long numbers
      // we would need a workaround...
      const maximumDigits = 10;
      let digit = maximumDigits - 1;
      parser.tokenValue = 0;
      while (digit >= 0 && (next >= Chars.Zero && next <= Chars.Nine || next === Chars.Underscore)) {
          if (next === Chars.Underscore) {
              parser.index++; parser.column++;
              next = parser.source.charCodeAt(parser.index);
              if (next === Chars.Underscore) report(parser, Errors.Unexpected);
              seenSeparator = true;
              next = next;
              continue;
          }
          seenSeparator = false;
          parser.tokenValue = parser.tokenValue * 10 + next - Chars.Zero;
          parser.index++; parser.column++;
          --digit;
          next = parser.source.charCodeAt(parser.index);
      }

      if (seenSeparator) report(parser, Errors.Unexpected);

      if (digit >= 0 && next !== Chars.Period && (parser.index >= parser.length || !isValidIdentifierStart(next))) {
          if (context & Context.OptionsRaw) parser.tokenRaw = parser.source.slice(index, parser.index);
          return Token.NumericLiteral;
      } else {
          parser.index = index;
          parser.column = column;
          parser.tokenValue = scanDecimalDigitsOrSeparator(parser);
      }
  }

  if (consumeOpt(parser, Chars.Period)) {
      isFloat = true;
      if (parser.source.charCodeAt(parser.index) === Chars.Underscore) report(parser, Errors.ZeroDigitNumericSeparator);
      parser.tokenValue = `${parser.tokenValue}.${scanDecimalDigitsOrSeparator(parser)}`;
  }

  const end = parser.index;

  let bigInt = false;

  if (parser.source.charCodeAt(parser.index) === Chars.LowerN) {
      if (isFloat) report(parser, Errors.Unexpected);
      bigInt = true;
      parser.index++; parser.column++;
  }

  if (consumeOpt(parser, Chars.LowerE) || consumeOpt(parser, Chars.UpperE)) {
      next = parser.source.charCodeAt(parser.index);
      if (consumeOpt(parser, Chars.Plus) || consumeOpt(parser, Chars.Hyphen)) {
          next = parser.source.charCodeAt(parser.index);
      }
      if (!(next >= Chars.Zero && next <= Chars.Nine)) report(parser, Errors.Unexpected);
      const preNumericPart = parser.index;
      const finalFragment = scanDecimalDigitsOrSeparator(parser);
      parser.tokenValue = parser.tokenValue += parser.source.substring(end, preNumericPart) + finalFragment;
  }

  if (isValidIdentifierStart(parser.source.charCodeAt(parser.index))) {
      report(parser, Errors.Unexpected);
  }

  if (context & Context.OptionsRaw) parser.tokenRaw = parser.source.slice(index, parser.index);
  if (isFloat) parser.tokenValue = parseFloat(parser.tokenValue);

  return bigInt ? Token.BigInt : Token.NumericLiteral;
}

/**
 *  Scans binary, octal, hex literal, and numeric literals (Annex B.1.1)
 *
 * @see [https://tc39.github.io/ecma262/#prod-BinaryIntegerLiteral)
 * @see [https://tc39.github.io/ecma262/#prod-OctalIntegerLiteral)
 * @see [https://tc39.github.io/ecma262/#prod-HexIntegerLiteral)
 * @see [https://tc39.github.io/ecma262/#sec-additional-syntax-numeric-literals)
 *
 * @param parser Parser object
 * @param context Context masks
 */
export function parseLeadingZero(parser: Parser, context: Context): Token {

  switch (parser.source.charCodeAt(parser.index + 1)) {
      case Chars.LowerX:
      case Chars.UpperX:
          return scanHexDigits(parser, context);
      case Chars.LowerB:
      case Chars.UpperB:
          return scanOctalOrBinaryDigits(parser, context, 2);
      case Chars.LowerO:
      case Chars.UpperO:
          return scanOctalOrBinaryDigits(parser, context, 8);
      case Chars.Underscore:
          report(parser, Errors.TrailingNumericSeparator);
      case Chars.Zero:
      case Chars.One:
      case Chars.Two:
      case Chars.Three:
      case Chars.Four:
      case Chars.Five:
      case Chars.Six:
      case Chars.Seven:
          return scanImplicitOctalDigits(parser, context);
      case Chars.Eight:
      case Chars.Nine:
          if (context & Context.Strict) recordErrors(parser, context, Errors.Unexpected);
      default:
          return scanNumeric(parser, context);
  }
}

/**
 * Scans octal or binary digits
 *
 * @see [https://tc39.github.io/ecma262/#prod-BinaryDigits)
 * @see [https://tc39.github.io/ecma262/#prod-OctalDigit)
 *
 * @param parser Parser object
 * @param base base number
 */

export function scanOctalOrBinaryDigits(parser: Parser, context: Context, base: number): Token {
  const { index } = parser;
  parser.index += 2; parser.column += 2;
  let code = parser.source.charCodeAt(parser.index);
  if (!(code >= Chars.Zero && code <= Chars.Nine)) report(parser, Errors.InvalidOrUnexpectedToken);
  let seenSeparator = false;
  let digits = 0;
  parser.tokenValue = 0;
  while (parser.index < parser.length) {
      code = parser.source.charCodeAt(parser.index);
      if (code === Chars.Underscore) {
          parser.index++; parser.column++;
          if (parser.source.charCodeAt(parser.index) === Chars.Underscore) report(parser, Errors.ContinuousNumericSeparator);
          seenSeparator = true;
          continue;
      }
      seenSeparator = false;
      const converted = code - Chars.Zero;
      if (!(code >= Chars.Zero && code <= Chars.Nine) || converted >= base) break;
      parser.tokenValue = parser.tokenValue * base + converted;
      parser.index++; parser.column++;
      digits++;
  }

  if (digits === 0) {
      report(parser, Errors.InvalidOrUnexpectedToken);
  }

  if (seenSeparator) report(parser, Errors.TrailingNumericSeparator);
  const bigInt = consumeOpt(parser, Chars.LowerN);
  if (isValidIdentifierStart(parser.source.charCodeAt(parser.index))) {
      report(parser, Errors.Unexpected);
  }
  if (context & Context.OptionsRaw) parser.tokenRaw = parser.source.slice(index, parser.index);
  return bigInt ? Token.BigInt : Token.NumericLiteral;
}

/**
 * Scans hex digits
 *
 * @see [https://tc39.github.io/ecma262/#prod-HexDigits)
 *
 * @param parser Parser object
 * @param context Context masks
 */
export function scanHexDigits(parser: Parser, context: Context): Token {
  const { index } = parser;
  parser.index += 2; parser.column += 2;
  parser.tokenValue = toHex(parser.source.charCodeAt(parser.index));
  if (parser.tokenValue < 0) report(parser, Errors.Unexpected);
  parser.index++; parser.column++;
  let seenSeparator = false;
  while (parser.index < parser.length) {
      const next = parser.source.charCodeAt(parser.index);
      if (next === Chars.Underscore) {
          parser.index++; parser.column++;
          if (seenSeparator) report(parser, Errors.TrailingNumericSeparator);
          seenSeparator = true;
          continue;
      }

      const digit = toHex(next);
      if (digit < 0) break;
      seenSeparator = false;
      parser.tokenValue = parser.tokenValue * 16 + digit;
      parser.index++; parser.column++;
  }
  if (seenSeparator) report(parser, Errors.TrailingNumericSeparator);
  const bigInt = consumeOpt(parser, Chars.LowerN);
  if (context & Context.OptionsRaw) parser.tokenRaw = parser.source.slice(index, parser.index);
  return bigInt ? Token.BigInt : Token.NumericLiteral;
}

/**
* Scans implicit octals
*
* @see [https://tc39.github.io/ecma262/#sec-additional-syntax-numeric-literals)
*
* @param parser Parser object
* @param context Context masks
*/
export function scanImplicitOctalDigits(parser: Parser, context: Context): Token {
  let { index, column } = parser;
  let c = index;
  if (context & Context.Strict) recordErrors(parser, context, Errors.Unexpected);
  let next = parser.source.charCodeAt(parser.index);
  parser.tokenValue = 0;
  parser.flags |= Flags.HasOctal;

  // Implicit octal, unless there is a non-octal digit.
  // (Annex B.1.1 on Numeric Literals)
  while (index < parser.length) {
      next = parser.source.charCodeAt(index);
      if (next === Chars.Underscore) report(parser, Errors.TrailingNumericSeparator);
      if (next === Chars.Eight || next === Chars.Nine) return scanNumeric(parser, context);
      if (!(next >= Chars.Zero && next <= Chars.Seven)) break;
      parser.tokenValue = parser.tokenValue * 8 + (next - Chars.Zero);
      index++; column++;
  }

  parser.index = index;
  parser.column = column;
  if (isValidIdentifierStart(next)) report(parser, Errors.Unexpected);
  if (context & Context.OptionsRaw) parser.tokenRaw = parser.source.slice(c, parser.index);
  return Token.NumericLiteral;
}

/**
* Scans decimal digit or separator
*
* @param parser Parser object
* @param context Context masks
*/
export function scanDecimalDigitsOrSeparator(parser: Parser): string {
  let start = parser.index;
  let allowSeparator = false;
  let result = '';
  while (parser.index < parser.length) {
      const ch = parser.source.charCodeAt(parser.index);
      if (ch === Chars.Underscore) {
          result += parser.source.substring(start, parser.index);
          if (parser.source.charCodeAt(parser.index + 1) === Chars.Underscore) report(parser, Errors.TrailingNumericSeparator);
          allowSeparator = true;
          parser.index++; parser.column++;
          start = parser.index;
          continue;
      }

      if (!(ch >= Chars.Zero && ch <= Chars.Nine)) break;
      allowSeparator = false;
      parser.index++; parser.column++;

  }
  if (allowSeparator) {
      report(parser, Errors.TrailingNumericSeparator);
  }
  return result + parser.source.substring(start, parser.index);
}
