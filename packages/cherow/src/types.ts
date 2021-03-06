import { Token } from './token';
import { Flags, LabelState } from './common';
import { Comment } from './estree';

/**
 * `ECMAScript version
 */
export type EcmaVersion = 1 | 2 | 3 | 4 | 5 | 2015 | 2016 | 2017 | 2018 | 2019 | 2020;

/**
 * `onToken` option.
 */
export type OnToken = void | ((token: string, value: string, line?: number, column?: number) => void);

/**
 * `onError` option.
 */
export type OnError = void | ((error: string, line: number, column: number) => void);

/**
 * `onComment` option.
 */
export type OnComment = void | Comment[] | ((type: string, value: string, start: number, end: number) => any);

/**
 * The parser options.
 */
export interface Options {

    // Set to 3, 5 (default), 6, 7, 8, 9, or 10 to specify the version of ECMAScript syntax you want to use.
    // You can also set to 2015 (same as 6), 2016 (same as 7), 2017 (same as 8), 2018 (same as 9), or 2019 (same as 10) to use the year-based naming.
    ecmaVersion?: EcmaVersion;

    // The flag to allow module code
    module?: boolean;

    // Create a top-level comments array containing all comments
    comments?: boolean;

    // The flag to enable stage 3 support (ESNext)
    next?: boolean;

    // The flag to enable start and end offsets to each node
    ranges?: boolean;

    // The flag to enable line/column location information to each node
    loc?: boolean;

    // The flag to enable React JSX parsing
    jsx?: boolean;

    // The flag to attach raw property to each literal node
    raw?: boolean;

    // Attach raw property to each identifier node
    rawIdentifier?: boolean;

    // Set to true to record the source file in every node's loc object when the loc option is set.
    source?: string;

    // The flag to enable implied strict mode
    impliedStrict?: boolean;

    // The flag to allow return in the global scope
    globalReturn?: boolean;

    // The flag to allow experimental features
    experimental?: boolean;

     // The flag to allow to skip shebang - '#'
    skipShebang?: boolean;

    // Enable editor mode
    edit?: OnError;

    // Enables method that should be bypassed when running on NodeJS
    node?: boolean;

    // Enabled tokenizing
    tokenize?: boolean;

    // Option to enable either array or callback for comments
    onComment?: OnComment;
  }

export interface Parser {
    source: string;
    length: number;
    flags: Flags;
    startIndex: number;
    lastIndex: number;
    index: number;
    line: number;
    startLine: number;
    lastLine: number;
    column: number;
    startColumn: number;
    lastColumn: number;
    token: Token;
    tokenValue: any;
    tokenRaw: string;
    tokens: Token[];
    onError?: OnError;
    onComment?: OnComment;
    functionBoundaryStack: any;
    labelSet: any;
    capturingParens: number;
    largestBackReference: number;
    labelSetStack: {[key: string]: boolean}[];
    iterationStack: (boolean | LabelState)[];
    switchStatement: LabelState;
    iterationStatement: LabelState;
    labelDepth: number;
    priorNode: any;
    lastValue: any;
    tokenRegExp: void | {
        pattern: string;
        flags: string;
    };
}
