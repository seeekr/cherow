import { Parser } from '../types';
import { Token } from '../token';
import { Context } from '../common';
import { Chars } from '../chars';
import { Errors, recordErrors, report } from '../errors';
import { isValidIdentifierStart, isValidIdentifierPart, mustEscape } from '../unicode';

export const hasBit = (mask: number, flags: number) => (mask & flags) === flags;

/* Numeric literal state */
export const enum NumericState {
  None         = 0,
  IsFloat      = 1 << 0,
  IsBigInt     = 1 << 1,
  HasSeparator = 1 << 2,
}

/* Sting / template literal escapes */
export const enum Escape {
  Empty       = -1,
  StrictOctal = -2,
  EightOrNine = -3,
  InvalidHex  = -4,
  OutOfRange  = -5,
}

/* Regular expression class range state */
export const enum ClassRangesState {
  Empty            = 0,
  IsTrailSurrogate = 1 << 0,
  IsSurrogateLead  = 1 << 2,
  SeenUnicoderange = 1 << 8,
  InCharacterRange = 1 << 10,
}

/* Regular expression flags */
export const enum RegExpFlags {
  Empty       = 0,
  Global      = 1 << 0,
  IgnoreCase  = 1 << 1,
  Multiline   = 1 << 2,
  Unicode     = 1 << 3,
  Sticky      = 1 << 4,
  DotAll      = 1 << 5
}

/* Regular expression quantifier prefix */
const enum QuantifierPrefixState {
  Empty        = 0,
  Start        = 1 << 0,
  IsLow        = 1 << 1,
  IsHigh       = 1 << 2,
  HasBadNumber = 1 << 3
}

/* Regular expression state */
export const enum RegexpState {
  InvalidClassEscape        = 1 << 0,
  ValidClassEscape          = 1 << 6,
  UnicodeMode               = 1 << 10,
  SloppyMode                = 1 << 12,
  OnlySloppy                = 1 << 14,
  Valid                     = 1 << 16,
  Invalid                   = 1 << 18,
  InvalidCharClassInSloppy  = 1 << 24,
  Quantifier                = 1 << 25,
  MissingDigits             = 1 << 26,
  EndOfRegex                = 1 << 27,

  InvalidCharClass          = 0x110000,
  InvalidCharClassRange     = 0x110001,
}

/**
 * Consume an token in the scanner on match. This is an equalent to
 * 'consume' used in the parser code itself.
 *
 * @param parser Parser object
 * @param ch Codepoint
 */
export function consumeOpt(parser: Parser, ch: number): boolean {
  if (parser.source.charCodeAt(parser.index) !== ch) return false;
  parser.index++; parser.column++;
  return true;
}

/**
 * Advance to new line
 *
 * @param parser Parser object
 */
export function advanceNewline(parser: Parser, ch: number): void {
  parser.index++; parser.column = 0; parser.line++;
  if (parser.index < parser.length && ch === Chars.CarriageReturn &&
      parser.source.charCodeAt(parser.index) === Chars.LineFeed) {
      parser.index++;
  }
}

/**
 * Skips BOM and shebang
 *
 * parser Parser object
 */
export function skipBomAndShebang(parser: Parser, context: Context): void {
  let index = parser.index;
  if (index === parser.source.length) return;
  if (parser.source.charCodeAt(index) === Chars.ByteOrderMark) {
      index++;
      parser.index = index;
  }

  if (context & Context.OptionsShebang && index < parser.source.length && parser.source.charCodeAt(index) === Chars.Hash) {
      index++;
      if (index < parser.source.length && parser.source.charCodeAt(index) === Chars.Exclamation) {
          parser.index = index + 1;
          loop:
              while (parser.index < parser.length) {
                  const ch = parser.source.charCodeAt(parser.index);
                  switch (ch) {
                      case Chars.CarriageReturn:
                      case Chars.LineFeed:
                      case Chars.LineSeparator:
                      case Chars.ParagraphSeparator:
                          advanceNewline(parser, ch);
                          break loop;
                      default:
                          parser.index++;
                          parser.column++;
                  }
              }
      }
  }
  // Note: The lexer will take it over from here and either find a private name (#) or simply
  // throw an error
}

/**
* Scans private name. Stage 3 proposal related
*
* @param parser Parser object
* @param context Context masks
*/

export function scanPrivateName(parser: Parser, context: Context): Token {
  let index = parser.index;
  const next = parser.source.charCodeAt(index + 1);
  if (!(context & Context.InClass) || index < parser.source.length && !isValidIdentifierStart(next)) {
      index++;
      report(parser, Errors.InvalidPrivateFieldAccess, escapeInvalidCharacters(next));
  }
  return Token.Hash;
}

export function readNext(parser: Parser, ch: number): number {
  parser.index++;
  parser.column++;
  if (ch > 0xffff) parser.index++;
  if (parser.index >= parser.length) recordErrors(parser, Context.Empty, Errors.Unexpected);
  return nextUnicodeChar(parser);
}

export function nextUnicodeChar(parser: Parser) {
  let {
      index
  } = parser;
  const hi = parser.source.charCodeAt(index++);

  if (hi < 0xd800 || hi > 0xdbff) return hi;
  if (index === parser.source.length) return hi;
  const lo = parser.source.charCodeAt(index);

  if (lo < 0xdc00 || lo > 0xdfff) return hi;
  return (hi & 0x3ff) << 10 | lo & 0x3ff | 0x10000;
}

export function isDecimalDigit(code: number): boolean {
  return code >= Chars.Zero && code <= Chars.Nine;
}

export function toHex(code: number): number {
  if (code < Chars.Zero) return -1;
  if (code <= Chars.Nine) return code - Chars.Zero;
  if (code < Chars.UpperA) return -1;
  if (code <= Chars.UpperF) return code - Chars.UpperA + 10;
  if (code < Chars.LowerA) return -1;
  if (code <= Chars.LowerF) return code - Chars.LowerA + 10;
  return -1;
}

export const fromCodePoint = (code: Chars) => {
  return code <= 0xFFFF ?
      String.fromCharCode(code) :
      String.fromCharCode(
          ((code - Chars.NonBMPMin) >> 10) + Chars.LeadSurrogateMin,
          ((code - Chars.NonBMPMin) & (1024 - 1)) + Chars.TrailSurrogateMin);
};

// QuantifierPrefix ::
//   { DecimalDigits }
//   { DecimalDigits , }
//   { DecimalDigits , DecimalDigits }
//
// Returns true if parsing succeeds, and set the min_out and max_out
// values. Values are truncated to RegExpTree::kInfinity if they overflow.
export function validateQuantifierPrefix(parser: Parser): boolean | number {

  let state = QuantifierPrefixState.Start;
  let min = 0;
  let max = 0;
  let ch = parser.source.charCodeAt(parser.index);
  const missingDigits = !(ch >= Chars.Zero && ch <= Chars.Nine);

  while (ch >= Chars.Zero && ch <= Chars.Nine) {
      state = state | QuantifierPrefixState.IsLow;
      parser.index++;
      parser.column++;
      if (hasBit(state, QuantifierPrefixState.Start)) {
          state = state & ~QuantifierPrefixState.Start;
          if (ch === Chars.Zero) {
              if (parser.index >= parser.length) return false;
              ch = parser.source.charCodeAt(parser.index);
              if (!(ch >= Chars.Zero && ch <= Chars.Nine)) break;
              state = state | QuantifierPrefixState.HasBadNumber;
              parser.index++;
              parser.column++;
          }
      }
      min = (min * 10) + (ch - Chars.Zero);
      ch = parser.source.charCodeAt(parser.index);
  }

  if (consumeOpt(parser, Chars.Comma)) {
      state = state | QuantifierPrefixState.Start;
      if (parser.index >= parser.length) return false;
      while (parser.index < parser.length) {
          ch = parser.source.charCodeAt(parser.index);
          if (!(ch >= Chars.Zero && ch <= Chars.Nine)) break;
          parser.index++;
          parser.column++;
          state = state | QuantifierPrefixState.IsHigh;
          if (hasBit(state, QuantifierPrefixState.Start)) {
              state = state & ~QuantifierPrefixState.Start;
              if (ch === Chars.Zero) {
                  if (parser.index >= parser.length) return false;
                  ch = parser.source.charCodeAt(parser.index);
                  if (!(ch >= Chars.Zero && ch <= Chars.Nine)) break;
                  state = state | QuantifierPrefixState.HasBadNumber;
                  parser.index++;
                  parser.column++;
              }
          }
          max = (max * 10) + (ch - Chars.Zero);
      }
  }

  if (hasBit(state, QuantifierPrefixState.HasBadNumber) || !consumeOpt(parser, Chars.RightBrace)) return false;
  const hasLow = hasBit(state, QuantifierPrefixState.IsLow);
  const hasHi = hasBit(state, QuantifierPrefixState.IsHigh);
  const res: any = (hasLow !== hasHi || (hasLow && hasHi && min <= max));
  return missingDigits ? res | RegexpState.MissingDigits : res;
}

export function isFlagStart(code: number) {
  return isValidIdentifierPart(code) ||
      code === Chars.Backslash ||
      code === Chars.Dollar ||
      code === Chars.Underscore ||
      code === Chars.Zwnj ||
      code === Chars.Zwj;
}

/**
* Returns true if valid unicode continue
*
* @param {number} code
* @returns {boolean}
*/
export function isValidUnicodeidcontinue(code: number): boolean {
  return isValidIdentifierPart(code) ||
      code === Chars.Dollar ||
      code === Chars.Underscore ||
      code >= Chars.Zero && code <= Chars.Nine;
}

/**
* Adjust correct regexp validator state
*
*
* @param parser Parser object
* @param code Code point
*/
export function setValidationState(prevState: RegexpState, currState: RegexpState): RegexpState {
  if (currState & RegexpState.Invalid) return RegexpState.Invalid;
  if (currState & RegexpState.SloppyMode) {
      if (prevState & RegexpState.Valid) return RegexpState.SloppyMode;
      if (prevState & RegexpState.UnicodeMode) return RegexpState.Invalid;
  } else if (currState & RegexpState.UnicodeMode) {
      if (prevState & RegexpState.Valid) return RegexpState.UnicodeMode;
      if (prevState & RegexpState.SloppyMode) return RegexpState.Invalid;
  }
  return prevState;
}

/**
* Adjust correct regexp validator state
*
*
* @param parser Parser object
* @param flagState State returned by the regular expression flag
* @param bodyState State returned after parsing the regex body
*/

export function setRegExpState(parser: Parser, flagState: RegexpState, bodyState: RegexpState): RegexpState {
  if (parser.capturingParens < parser.largestBackReference) return RegexpState.Invalid;
  if (bodyState & RegexpState.Invalid || flagState & RegexpState.Invalid) return RegexpState.Invalid;
  if (bodyState & RegexpState.UnicodeMode) return flagState & RegexpState.UnicodeMode ? RegexpState.Valid : RegexpState.Invalid;
  if (bodyState & RegexpState.OnlySloppy) return !(flagState & RegexpState.UnicodeMode) ? RegexpState.Valid : RegexpState.Invalid;
  if (bodyState & RegexpState.SloppyMode) return !(flagState & RegexpState.UnicodeMode) ? RegexpState.Valid : RegexpState.Invalid;
  return RegexpState.Valid;
}

/**
 * Parse back reference index
 *
 * @see [Link](https://www.ecma-international.org/ecma-262/8.0/#prod-DecimalEscape)
 *
 * @param parser Parser object
 * @param code Code point
 */
export function parseBackReferenceIndex(parser: Parser, code: number): RegexpState {
  let value = code - Chars.Zero;
  while (parser.index < parser.length) {
      code = parser.source.charCodeAt(parser.index);
      if (code >= Chars.Zero && code <= Chars.Nine) {
          value = value * 10 + (code - Chars.Zero);
          parser.index++;
      } else {
          break;
      }
  }

  parser.largestBackReference = value;
  return RegexpState.Valid;
}

/**
* Get unicode range
*
* @param range Left unicode range
* @param state Current lexer state
* @param right Right unicode range
*/
export function getUnicodeRange(range: any, state: RegexpState, right: number): RegexpState {
  if (range === RegexpState.InvalidCharClassRange || right === RegexpState.InvalidCharClassRange || range > right) {
      if (state === RegexpState.UnicodeMode) return RegexpState.Invalid;
      else if (state !== RegexpState.Invalid) return RegexpState.SloppyMode;
  }
  return state;
}

/**
* Get non-unicode range
*
* @param range Left unicode range
* @param state Current lexer state
* @param right Right unicode range
*/

export function getRange(ch: number, range: number, state: RegexpState): RegexpState {
  if (range === RegexpState.InvalidCharClassRange || ch === RegexpState.InvalidCharClassRange || range > ch) {
      if (state === RegexpState.SloppyMode) return RegexpState.Invalid;
      else if (state !== RegexpState.Invalid) return RegexpState.UnicodeMode;
  }
  return state;
}

export function mapToToken(token: Token) {
  return (parser: Parser) => {
      parser.index++;
      parser.column++;
      return token;
  };
}

export function escapeInvalidCharacters(code: number): string {
  switch (code) {
      case Chars.Null:
          return '\\0';
      case Chars.Backspace:
          return '\\b';
      case Chars.Tab:
          return '\\t';
      case Chars.LineFeed:
          return '\\n';
      case Chars.VerticalTab:
          return '\\v';
      case Chars.FormFeed:
          return '\\f';
      case Chars.CarriageReturn:
          return '\\r';
      case Chars.Hash:
          return '\\#';
      case Chars.At:
          return '\\@';
      default:
          if (!mustEscape(code)) return fromCodePoint(code);
          if (code < 0x10) return `\\x0${code.toString(16)}`;
          if (code < 0x100) return `\\x${code.toString(16)}`;
          if (code < 0x1000) return `\\u0${code.toString(16)}`;
          if (code < 0x10000) return `\\u${code.toString(16)}`;
          return `\\u{${code.toString(16)}}`;
  }
}

/**
* Throws a string error for either string or template literal
*
* @param parser Parser object
* @param context Context masks
*/
export function recordStringErrors(
  parser: Parser,
  code: Escape,
): void {
  switch (code) {
      case Escape.Empty:
          return;
      case Escape.StrictOctal:
          report(parser, Errors.StrictOctalEscape);
      case Escape.EightOrNine:
          report(parser, Errors.InvalidEightAndNine);
      case Escape.InvalidHex:
          report(parser, Errors.InvalidEscape);
      case Escape.OutOfRange:
          report(parser, Errors.InvalidEscape);
      default:
          // ignore
  }
}

export function isIdentifierPart(code: Chars): boolean {
  const letter = code | 32;
  return (letter >= Chars.LowerA && letter <= Chars.LowerZ) ||
      code === Chars.Underscore ||
      code === Chars.Dollar ||
      code === Chars.Backslash ||
      (code >= Chars.Zero && code <= Chars.Nine // 0..9;
          || isValidIdentifierPart(code));
}


export function isWhiteSpaceSingleLine(ch: number): boolean {
  return ch === Chars.Space ||
      ch === Chars.Tab ||
      ch === Chars.VerticalTab ||
      ch === Chars.FormFeed ||
      ch === Chars.NonBreakingSpace ||
      ch === Chars.NextLine ||
      ch === Chars.Ogham ||
      ch >= Chars.EnQuad && ch <= Chars.ZeroWidthSpace ||
      ch === Chars.NarrowNoBreakSpace ||
      ch === Chars.MathematicalSpace ||
      ch === Chars.IdeographicSpace;
}

/**
 * Returns true if ascii identifier - no unicode
 *
 * @param code Code point
 */
export function isAsciiCodePoint(code: number): boolean {
  const letter = code | 32;
  if (letter >= Chars.LowerA && letter <= Chars.LowerZ) return true;
  return letter >= Chars.LowerA && letter <= Chars.LowerZ ||
          code === Chars.Dollar ||
          code === Chars.Underscore ||
          (code >= Chars.Zero && code <= Chars.Nine);
}
