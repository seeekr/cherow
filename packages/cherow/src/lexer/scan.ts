import { Parser } from '../types';
import { Token } from '../token';
import { Context, Flags } from '../common';
import { consumeOpt, escapeInvalidCharacters, nextUnicodeChar, mapToToken, scanPrivateName } from './common';
import { Chars } from '../chars';
import { scanIdentifier, scanMaybeIdentifier } from './identifier';
import { skipSingleHTMLComment, skipSingleLineComment, skipMultilineComment } from './comments';
import { scanStringLiteral } from './string';
import { scanNumeric, parseLeadingZero } from './numeric';
import { Errors, recordErrors } from '../errors';
import { scanTemplate } from './template';

function unreachable(parser: Parser, context: Context): void {
  recordErrors(parser, context, Errors.UnexpectedToken, escapeInvalidCharacters(nextUnicodeChar(parser)));
}

const table = new Array(128).fill(unreachable, 0, 0xFFFF) as((parser: Parser, context: Context, first: number) => Token)[];

// `,`, `~`, `?`, `[`, `]`, `{`, `}`, `:`, `;`, `(` ,`)`, `"`, `'`
table[Chars.Comma] = mapToToken(Token.Comma);
table[Chars.Tilde] = mapToToken(Token.Complement);
table[Chars.QuestionMark] = mapToToken(Token.QuestionMark);
table[Chars.LeftBracket] = mapToToken(Token.LeftBracket);
table[Chars.RightBracket] = mapToToken(Token.RightBracket);
table[Chars.LeftBrace] = mapToToken(Token.LeftBrace);
table[Chars.RightBrace] = mapToToken(Token.RightBrace);
table[Chars.Colon] = mapToToken(Token.Colon);
table[Chars.Semicolon] = mapToToken(Token.Semicolon);
table[Chars.LeftParen] = mapToToken(Token.LeftParen);
table[Chars.RightParen] = mapToToken(Token.RightParen);
table[Chars.SingleQuote] = table[Chars.DoubleQuote] = scanStringLiteral;
table[Chars.Zero] = parseLeadingZero;

table[Chars.Space] =
  table[Chars.Tab] =
  table[Chars.FormFeed] =
  table[Chars.VerticalTab] =
  table[Chars.FormFeed] = (parser: Parser) => {
      parser.index++; parser.column++;
      return Token.WhiteSpace;
  };

table[Chars.LineFeed] = (parser: Parser) => {
  parser.index++;  parser.column = 0; parser.line++;
  parser.flags |= Flags.NewLine;
  return Token.WhiteSpace;
};

table[Chars.CarriageReturn] = (parser: Parser) => {
  parser.index++;  parser.column = 0; parser.line++;
  parser.flags |= Flags.NewLine;
  if (parser.index < parser.length &&
      parser.source.charCodeAt(parser.index) === Chars.LineFeed) {
      parser.index++;
  }
  return Token.WhiteSpace;
};

// `/`, `/=`, `/>`
table[Chars.Slash] = (parser: Parser) => {
  parser.index++; parser.column++;
  if (parser.index < parser.length) {
      const next = parser.source.charCodeAt(parser.index);
      if (next === Chars.Slash) {
          return skipSingleLineComment(parser);
      }
      if (next === Chars.Asterisk) {
          return skipMultilineComment(parser);
      } else if (next === Chars.EqualSign) {
          parser.index++;
          parser.column++;
          return Token.DivideAssign;
      }
  }
  return Token.Divide;
};

// `!`, `!=`, `!==`
table[Chars.Exclamation] = (parser: Parser) => {
  parser.index++; parser.column++;
  if (!consumeOpt(parser, Chars.EqualSign)) return Token.Negate;
  if (!consumeOpt(parser, Chars.EqualSign)) return Token.LooseNotEqual;
  return Token.StrictNotEqual;
};

// `%`, `%=`
table[Chars.Percent] = (parser: Parser) => {
  parser.index++; parser.column++;
  if (consumeOpt(parser, Chars.EqualSign)) return Token.ModuloAssign;
  return Token.Modulo;
};

// `&`, `&&`, `&=`
table[Chars.Ampersand] = (parser: Parser) => {
  parser.index++; parser.column++;
  if (parser.index >= parser.length) return Token.BitwiseAnd;
  const next = parser.source.charCodeAt(parser.index);
  if (next === Chars.Ampersand) {
      parser.index++; parser.column++;
      return Token.LogicalAnd;
  }
  if (next === Chars.EqualSign) {
      parser.index++; parser.column++;
      return Token.BitwiseAndAssign;
  }
  return Token.BitwiseAnd;
};

// `*`, `**`, `*=`, `**=`
table[Chars.Asterisk] = (parser: Parser) => {
  parser.index++; parser.column++;
  if (parser.index >= parser.length) return Token.Multiply;
  const next = parser.source.charCodeAt(parser.index);
  if (next === Chars.EqualSign) {
      parser.index++; parser.column++;
      return Token.MultiplyAssign;
  }
  if (next !== Chars.Asterisk) return Token.Multiply;
  parser.index++; parser.column++;
  if (!consumeOpt(parser, Chars.EqualSign)) return Token.Exponentiate;
  return Token.ExponentiateAssign;
};

// `+`, `++`, `+=`
table[Chars.Plus] = (parser: Parser) => {
  parser.index++; parser.column++;
  if (parser.index >= parser.length) return Token.Add;

  const next = parser.source.charCodeAt(parser.index);
  if (next === Chars.Plus) {
      parser.index++; parser.column++;
      return Token.Increment;
  }

  if (next === Chars.EqualSign) {
      parser.index++; parser.column++;
      return Token.AddAssign;
  }

  return Token.Add;
};

// `-`, `--`, `-=`
table[Chars.Hyphen] = (parser: Parser, context) => {
  parser.index++; parser.column++;
  const next = parser.source.charCodeAt(parser.index);
  if (next === Chars.Hyphen &&
      parser.source.charCodeAt(parser.index + 1) === Chars.GreaterThan) {
      return skipSingleHTMLComment(parser, context);
  } else if (parser.index < parser.source.length) {
      if (next === Chars.Hyphen) {
          parser.index++; parser.column++;
          return Token.Decrement;
      } else if (next === Chars.EqualSign) {
          parser.index++; parser.column++;
          return Token.SubtractAssign;
      }
  }

  return Token.Subtract;
};

// `.`, `...`, `.123` (numeric literal)
table[Chars.Period] = (parser: Parser, context: Context) => {
  let index = parser.index + 1;
  const next = parser.source.charCodeAt(index);

  if (next === Chars.Period) {
      index++;
      if (index < parser.source.length &&
          parser.source.charCodeAt(index) === Chars.Period) {
          parser.index = index + 1;
          parser.column += 3;
          return Token.Ellipsis;
      }
  } else if (next >= Chars.Zero && next <= Chars.Nine) {
      return scanNumeric(parser, context);
  }
  parser.index++; parser.column++;
  return Token.Period;
};

// `1`...`9`
for (let i = Chars.One; i <= Chars.Nine; i++) {
  table[i] = scanNumeric;
}

// `<`, `<=`, `<<`, `<<=`, `</`,  <!--
table[Chars.LessThan] = (parser: Parser, context: Context) => {
  parser.index++; parser.column++;
  if (parser.index < parser.source.length) {

      switch (parser.source.charCodeAt(parser.index)) {
          case Chars.LessThan:
              parser.index++; parser.column++;
              if (consumeOpt(parser, Chars.EqualSign)) {
                  return Token.ShiftLeftAssign;
              } else {
                  return Token.ShiftLeft;
              }

          case Chars.EqualSign:
              parser.index++;
              parser.column++;
              return Token.LessThanOrEqual;

          case Chars.Exclamation:
              {
                  if (parser.source.charCodeAt(parser.index + 1) === Chars.Hyphen &&
                      parser.source.charCodeAt(parser.index + 2) === Chars.Hyphen) {
                      return skipSingleHTMLComment(parser, context);
                  }
                  break;
              }

          default: // ignore
      }
  }

  return Token.LessThan;
};

// `=`, `==`, `===`, `=>`
table[Chars.EqualSign] = (parser: Parser) => {
  parser.index++; parser.column++;
  if (parser.index >= parser.length) return Token.Assign;
  const next = parser.source.charCodeAt(parser.index);
  if (next === Chars.EqualSign) {
      parser.index++; parser.column++;
      if (consumeOpt(parser, Chars.EqualSign)) {
          return Token.StrictEqual;
      } else {
          return Token.LooseEqual;
      }
  } else if (next === Chars.GreaterThan) {
      parser.index++; parser.column++;
      return Token.Arrow;
  }
  return Token.Assign;
};

// `>`, `>=`, `>>`, `>>>`, `>>=`, `>>>=`
table[Chars.GreaterThan] = (parser: Parser) => {
  parser.index++; parser.column++;
  if (parser.index >= parser.length) return Token.GreaterThan;
  let next = parser.source.charCodeAt(parser.index);

  if (next === Chars.EqualSign) {
      parser.index++; parser.column++;
      return Token.GreaterThanOrEqual;
  }

  if (next !== Chars.GreaterThan) return Token.GreaterThan;
  parser.index++; parser.column++;

  if (parser.index < parser.length) {
      next = parser.source.charCodeAt(parser.index);

      if (next === Chars.GreaterThan) {
          parser.index++; parser.column++;
          if (consumeOpt(parser, Chars.EqualSign)) {
              return Token.LogicalShiftRightAssign;
          } else {
              return Token.LogicalShiftRight;
          }
      } else if (next === Chars.EqualSign) {
          parser.index++; parser.column++;
          return Token.ShiftRightAssign;
      }
  }
  return Token.ShiftRight;
};

// `A`...`Z`
for (let i = Chars.UpperA; i <= Chars.UpperZ; i++) {
  table[i] = scanIdentifier;
}
// `a`...z`
for (let i = Chars.LowerA; i <= Chars.LowerZ; i++) {
  table[i] = scanIdentifier;
}

// `\\u{N}var` , `$foo`, `_var`
table[Chars.Backslash] = table[Chars.Dollar] = table[Chars.Underscore] = scanIdentifier;

// ``string``
table[Chars.Backtick] = scanTemplate;

// `^`, `^=`
table[Chars.Caret] = (parser: Parser) => {
  parser.index++; parser.column++;
  if (consumeOpt(parser, Chars.EqualSign)) {
      return Token.BitwiseXorAssign;
  } else {
      return Token.BitwiseXor;
  }
};

// `|`, `||`, `|=`
table[Chars.VerticalBar] = (parser: Parser) => {
  parser.index++; parser.column++;
  if (parser.index < parser.length) {
      const next = parser.source.charCodeAt(parser.index);
      if (next === Chars.VerticalBar) {
          parser.index++;
          parser.column++;
          return Token.LogicalOr;
      }
      if (next === Chars.EqualSign) {
          parser.index++; parser.column++;
          return Token.BitwiseOrAssign;
      }
  }
  return Token.BitwiseOr;
};

// '#'
table[Chars.Hash] = scanPrivateName;

/**
*
* parser Parser object
* context Context masks
*/
export function nextToken(parser: Parser, context: Context): Token {
  parser.flags &= ~Flags.NewLine;
  // remember last token position before scanning
  parser.lastIndex = parser.index;
  parser.lastLine = parser.line;
  parser.lastColumn = parser.column;
  let token: Token;
  while (parser.index < parser.length) {
      const first = parser.source.charCodeAt(parser.index);
      parser.startIndex = parser.index;
      parser.startColumn = parser.column;
      parser.startLine = parser.line;
      if (first < 128) token = table[first](parser, context, first);
      else token = scanMaybeIdentifier(parser, context, first);
      if ((token & Token.WhiteSpace) === Token.WhiteSpace) continue;
      return parser.token = token;
  }
  return parser.token = Token.EndOfSource;
}
