import * as t from 'assert';
import { verifyRegExpPattern } from '../../src/lexer/regexp';
import { createParserObject } from '../../src/parser/parser';
import { Context } from '../../src/common';
import { RegexpState } from '../../src/lexer/common';

describe('Lexer - Regeular expressions', () => {

  describe('Unicode - Invalid', () => {
    const invalidCases = [

        'a\\1/',
        '(a)\\2/',
        '((a))\\3/',
        '[\\1]/',
        '[\\2]/',
        '[\\3]/',
        '[\\4]/',
        '[\\5]/',
        '[\\6]/',
        '[\\7]/',
        '[\\8]/',
        '[\\9]/',
        '(((((((((((a)))))))))))\\12/',
        '((((((((((((a))))))))))))\\13/',
        '(((((((((((((((((((a)))))))))))))))))))\\20/',
        '((((((((((((((((((((a))))))))))))))))))))\\21/',
        '\\u', '\\u0', '\\uf8',
        '\\ubcd', '\\ubcde',
        'x\\u', 'x\\u0', 'x\\uf8',
        'x\\ubcd', 'x\\ubcde',
        `\\u{}/`, `\\u{fail}/`,
        `\\u{afail}/`,
        `\\u{0fail}/`,
        `\\u{xxxx}/`,
        `\\u{/`,
        `\\u{a/`, `\\u{af/`,
        `\\u{012/`, `\\u{01234/`,
        `\\u{012345/`,
        `\\u{1}/`, `\\u{12}/`,
        `\\u{123}/`,
        `\\u{1234}/`,
        `\\u{12345}/`,
        `\\u{103456}/`,
        `\\u{`,
        `\\u{a`,
        `\\u{af`,
        `\\u{123`,
        `\\u{1234`,
        `\\u{12345`,
        `\\u{10ffff}/`,
        `\\u{110000}/`,
        `\\u{0000000000000000000010ffff}/`,
        `\\u{00000000000000000000110000}/`,
        '[\\00]/',
        '[\\01]/',
        '[\\02]/',
        '[\\03]/',
        '[\\04]/',
        '[\\05]/',
        '[\\06]/',
        '[\\07]/',
        '[\\08]/',
        '[\\09]/',
        '[\\90]/', '[\\12]/',
        '[\\23]/', '[\\34]/',
        '[\\45]/',
        '[\\56]/',
        '[\\67]/',
        '[\\78]/',
        '[\\89]/', '[\\91]/',
        '[\\0',
        '[\\1',
        '[\\2',
        '[\\3',
        '[\\4',
        '[\\5', '[\\6',
        '[\\7', '[\\8', '[\\9',
        '[\\_]/', '[abc\\_]/',
        '[\\_abcd]/',
        '[abc\\_abcd]/',
        `[\\^`, `[\\$`,
        `[\\\\`, `[\\.`, `[\\*`,
        `[\\+`, `[\\?`,
        `[\\(`, `[\\)`, `[\\]`, `[\\]`,
        `[\\{`, `[\\}`, `[\\|`,
        `[\\']/`, `[\\"]/`, `[\\\`]/`,
        '(((((((((((((((a)))))))))))))))\\16/',
        '((((((((((((((((a))))))))))))))))\\17/',
        '(((((((((((((((((a)))))))))))))))))\\18/',
        '((((((((((((((((((a))))))))))))))))))\\19/',
        '[\\$', '[abc\\$',
        '[\\$abcd',
        '[abc\\$abcd', '[\\_',
        '[abc\\_',
        '[\\_abcd', '[abc\\_abcd',
        '[\\x]/', '[\\x0]/',
        '[\\x1]/',
        '[\\x2]/',
        '[\\x3]/', '[\\x4]/',
        '[\\x5]/',
        '[\\x6]/', '[\\x7]/', '[\\x8]/', '[\\x9]/',
        '(((a)))\\4/',
        '((((a))))\\5/',
        '(((((a)))))\\6/',
        '((((((a))))))\\7/',
        '(((((((a)))))))\\8/',
        '((((((((a))))))))\\9/',
        '(((((((((a)))))))))\\10/',
        '((((((((((a))))))))))\\11/',
        '[\\x', '[\\x0', '[\\x1', '[\\x2',
        '[\\x3',
        '[\\x4', '[\\x5',
        '[\\x6', '[\\x7', '[\\x8', '[\\x9',
        '[\\x01', '[\\x12',
        '[\\x23',
        '[\\x34',
        '[\\x45',
        '[\\x56',
        '[\\x67',
        '[\\x78',
        '[\\x89',
        '[\\x90',
        '[\\u', '[\\u0', '[\\uf8',
        '[\\ubcd',
        '[\\ubcde',

        '[x\\u', '[x\\u0', '[x\\uf8',
        '[x\\ubcd', '[x\\ubcde',
        `[\\u{0123}]/`, `[\\u{4567}]/`,
        `[\\u{89abc}]/`, `[\\u{defAB}]/`,
        `[\\u{CDEF}]/`,
        `[\\u{`, `[\\u{a`, `[\\u{af`, `[\\u{123`,
        `[\\u{1234`,
        `[\\u{12345`, `[\\u{103456`,
        `[\\u{10ffff}]/`,
        `[\\u{110000}]/`,
        `[\\u{120000}]/`,
        `[\\u{900000}]/`,
        `[\\u{123456789}]/`,
        `[\\u{ffffffffffffffff}]/`,
        '[a-\\d]/', '[A-\\D]/', '[a-\\s]/',
        '[A-\\S]/', '[a-\\w]/', '[A-\\W]/',
        '[a-\\dx]/', '[A-\\Dx]/',
        '[a-\\sx]/',
        '[A-\\Sx]/', '[a-\\wx]/', '[A-\\Wx]/',
        '\\2(x)/',
        '[9-1]/',
        '(((((((((((((a)))))))))))))\\14/',
        '((((((((((((((a))))))))))))))\\15/',
        '[\\u6000-\\u5000]/',
        '[\\uD83D\\uDCA9-\\uD83D\\uDCAB]/',
        '[\uD83D\\uDCA9-\\uD83D\\uDCAB]/',
        '[\\uD83D\uDCA9-\\uD83D\\uDCAB]/',
        '[\\uD83D\\uDCA9-\uD83D\\uDCAB]/',
        '[\\uD83D\\uDCA9-\\uD83D\uDCAB]/',
        '[\uD83D\uDCA9-\\uD83D\\uDCAB]/',
        '[\uD83D\\uDCA9-\uD83D\\uDCAB]/',
        '[\uD83D\\uDCA9-\\uD83D\uDCAB]/', '[\\uD83D\uDCA9-\uD83D\\uDCAB]/',
        '[\\uD83D\uDCA9-\\uD83D\uDCAB]/',
        '[\\uD83D\\uDCA9-\uD83D\uDCAB]/',
        '[\uD83D\uDCA9-\uD83D\\uDCAB]/',
        '[\uD83D\uDCA9-\\uD83D\uDCAB]/',
        '[\\uD83D\uDCA9-\uD83D\uDCAB]/',
        '[\uD83D\uDCA9-\uD83D\uDCAB]/',
        '[1-\\u{500}]/', '\\u{01}-\\x07/',
        '[--+]/', '[0--]/', '[x---]/', '[0---]/',
        '[x-\\uD83D\\uDE07--+]/',
        '[x-\\uD83D\\uDE07--x-\\uD83D\\uDE07--]/',
        '(b)', 'a(b)', '(b)c', 'a(b)c',
        ')',
        '((b', '((b)', '((b))',
        '(a(b', '(a(b)', '(a(b))',
        'a(a(b', 'a(a(b)',
        'a(a(b))',
        '(?x)/',
        '(?',
        '(?:(?:b',
        '(?:(?:b)',
        '(?:(?:b))',
        '(?:a(?:b',
        '(?:a(?:b)',
        '(?:a(?:b))',
        'a(?:a(?:b',
        'a(?:a(?:b)',
        'a(?:a(?:b))',
        '(?=(?=b', '(?=(?=b)', '(?=(?=b))',
        '(?=a(?=b', '(?=a(?=b)', '(?=a(?=b))',
        'a(?=a(?=b', 'a(?=a(?=b)', 'a(?=a(?=b))',
        '(?!b)', 'a(?!b)',
        '(?!b)c', 'a(?!b)c',
        '(?!(?!b', '(?!(?!b)',
        '(?!(?!b))',
        '(?!a(?!b',
        '(?!a(?!b)',
        '(?!a(?!b))',
        'a(?!a(?!b',
        'a(?!a(?!b)', 'a(?!a(?!b))',
        'a(bcde/',
        '[\\d-z]/',
        '[\\D-Z]/',
        '[\\s-z]/',
        '[\\S-S]/',
        '[\\w-z]/',
        '[\\W-Z]/',
        '[x\\d-z]/',
        '[x\\D-Z]/',
        '[x\\s-z]/',
        '[x\\S-S]/',
        '[x\\w-z]/',
        '[x\\W-Z]/',
        'a(b(cde/',
        'a(b(?:cd)e/',
        'a(b(?:cde/',
        'a(b(?=cd)e/',
        'a(b(?=cde/',
        'a(b(?!cd)e/',
        'a(b(?!cde/',
        'a(?:b(cd)e/',
        'a(?:b(cde/',
        'a(?:b(?:cd)e/',
        'a(?:b(?:cde/',
        'a(?:b(?=cd)e/',
        'a(?:b(?=cde/',
        'a(?:b(?!cd)e/',
        'a(?:b(?!cde/',
        'a(?=b(cd)e/',
        'a(?=b(cde/',
        'a(?=b(?:cd)e/',
        'a(?=b(?:cde/',
        'a(?=b(?=cd)e/',
        'a(?=b(?=cde/',
        'a(?=b(?!cd)e/',
        'a(?=b(?!cde/',
        'a(?!b(c)de/',
        'a(?!b(cde/',
        'a(?!b(?:cd)e/',
        'a(?!b(?:cde/',
        'a(?!b(?=cd)e/',
        'a(?!b(?=cde/',
        'a(?!b(?!cd)e/',
        'a(?!b(?!cde/',
        '0{2,1}/',
        '^[z-a]$/',
        'abc/a',
        'a**/', 'a***/', 'a++/', 'a+++/', 'a???/',
        'a????/',
        'x{1}{1,}/', 'x{1,2}{1}/', 'x{1,}{1}/', 'x{0,1}{1,}/',
        '+a/', '++a/', '?a/', '??a/',
        '[b-ac-e]/',
        '[a-dc-b]/', '[\\db-G]/',
        '[\\Db-G]/',
        '[\\sb-G]/',
        '[\\Sb-G]/',
        '[\\wb-G]/', '[\\Wb-G]/',
        '[\\0b-G]/',
        '[\\10b-G]/',
        '[\\bd-G]/',
        '[\\Bd-G]/',
        '[\\td-G]/',
        '[\\nd-G]/',
        '[\\vd-G]/',
        '[\\fd-G]/',
        '[\\rd-G]/',
        '[\\c0001d-G]/',
        '[\\x0061d-G]/', '[\\u0061d-G]/',
        '[\\ad-G]/', '[c-eb-a]/', '[b-G\\d]/',
        '[b-G\\D]/',
        '[b-G\\s]/',
        '[b-G\\S]/', '[b-G\\w]/',
        '[b-G\\W]/',
        '[b-G\\0]/',
        '[b-G\\10]/', '[d-G\\b]/',
        '[d-G\\B]/', '[d-G\\t]/',
        '[d-G\\n]/', '[d-G\\v]/',
        '[d-G\\f]/',
        '[d-G\\r]/',
        '[d-G\\c0001]/',
        '[d-G\\x0061]/', '[d-G\\u0061]/', '[d-G\\a]/',
        '\\\rn/',
        '\\b*/u',
        '\\b+/u', '\\b?/u', '\\b{1}/u',
        '\\b**/u', '\\b++/u',
        '\\b?+/u',
        '\\b{1}+/u',
        '(?=.)**/u', '(?=.)++/u', '(?=.)?+/u',
        '(?=.){1}+/u',
        '\\B*/u', '\\B+/u', '\\B?/u',
        '\\B{1}/u', '\\B**/u', '\\B++/u',
        '\\B?+/u', '\\B{1}+/u',
        '(?!.)**/u',
        '(?!.)++/u',
        '(?!.)?+/u',
        '(?!.){1}+/u',
        '[+9]\\uD83D\\uDE07q\\uD83D(?:q??)\\uDE07\\uDE07\\',
        `^`, `abc$`, `a.`,
        '\\x/',
        '\\x0/',
        '\\x1/',
        '\\x2/',
        '\\x3/',
        '\\x4/',
        '\\x5/', '\\x6/',
        '\\x7/',
        '\\x8/', '\\x9/',
        '\\x', '\\x0', '\\x1',
        '\\x2',
        '\\x3', '\\x4',
        '\\x5',
        '\\x6', '\\x7',
        '\\x8', '\\x9',
        '\\x01', '\\x12',
        '\\x23', '\\x34', '\\x45',
        '\\x56', '\\x67', '\\x78', '\\x89', '\\x90',
        `a*`, `a?`, `a+`,
        `a*?`, `a?*`, `a+?`,
        `?/`, `+/`, `?a/`, `+a/`, `??/`,
        `+?/`, `|*/`,
        `|?/`,
        `|+/`,
        `?`, `+`, `?a`, `+a`, `??`, `+?`,
        `|*`, `|?`, `|+`,
        `a??`,
        `a{1,0}/`, `a{2,1}/`, `a{100,45}/`,
        '\\_/',
        'abc\\_/',
        '\\_abcd/',
        'abc\\_abcd/',
        `\\^`,
        `\\$`,
        `\\\\`,
        `\\.`,
        `\\*`,
        `\\+`,
        `\\?`, `\\(`, `\\)`,
        `\\[`,
        `\\]`,
        `\\{`,
        `\\}`,
        `\\|`,
        `a??`,
        'a{ 1}/', 'a{1 }/', 'a{1, 1}/', 'a{ 1, 1}/',
        'a{1 ,1}/',
        'a{ 1 , 1}/', 'a{1,1 }/', 'a{1, 1 }/',
        'a{ 1, 1 }/', 'a{ 1 , 1 }/',
        '\\a', '\\b', '\\d', '\\e', '\\f', '\\g',
        '\\h',
        '\\i',
        '\\j', '\\k', '\\l', '\\m',
        '\\n', '\\o',
        '\\p', '\\q', '\\r', '\\s',
        '\\t', '\\u', '\\v',
        '\\w', '\\x', '\\y', '\\z',
        '\\A', '\\B', '\\D',
        '\\E', '\\F',
        '\\G', '\\H', '\\I', '\\J',
        '\\K', '\\L',
        '\\M',
        '\\N',
        '\\O',
        '\\P',
        '\\Q',
        '\\R',
        '\\S', '\\T', '\\U', '\\V',
        '\\W', '\\X', '\\Y', '\\Z',
        '\\$', 'abc\\$', '\\$abcd', 'abc\\$abcd',
        '\\_',
        'abc\\_',
        '\\_abcd', 'abc\\_abcd',
        '\\01/', 'a\\02/', '\\03b/', 'a\\04b/',
        '(a)\\05/', '\\06(b)/', '(\\07)/', '\\08/',
        '\\09/', '\\00/',
        '\\0', 'a\\0', '\\0b',
        'a\\0b', '(a)\\0', '\\0(b)', '(\\0)',
        '\\01', 'a\\02', '\\03b', 'a\\04b',
        '(a)\\05', '\\06(b)', '(\\07)', '\\08',
        '\\09', '\\00',
        '\\2(a)/', '(a)\\3/', '(\\4)/',
        '\\5x(a)/', '(a)x\\6/', '(a\\7b)/', '0\\8(a)/',
        '4\\9(a)/',
        '(a)|\\10/',
        '\\11|(a)/', '(\\12|a)/', '(a|\\13)/'

    ];

    for (const arg of invalidCases) {
        it(`${arg}`, () => {
            const parser = createParserObject(`${arg}`, undefined);
            const {
                state
            } = verifyRegExpPattern(parser, Context.OptionsEditorMode);

            t.deepEqual({
                state,
            }, {
                state: RegexpState.Invalid,
            });
        });
    }

});

describe('Unicode - Valid', () => {

const validCases = [
    '[x\\da-z]/u',
    '[x\\DA-Z]/u',
    `[o-o]/`,
    `[object Math]/`,
    `[z-z]/`,
    '[^-]*-/',
    '[^-]*-([^-][^-]*-)*-/',
    '[^-]*-([^-][^-]*-)*->?/',
    '[^<]+/',
    `[a-]/`,
    `[a-b]/`,
    '((b)c)c/u',
    'a((b)c)c/u',
    '(a(b)c)/u',
    'a(a(b)c)/u',
    '(a(b)c)c/u',
    'a(a(b)c)c/u',
    '[---]/u',
    '[-----]/u',
    '[\\x01-\\x17]/u',
    '[\\u0001-\\x17]/u',
    '[\\x01-\\u0007]/u',
    '[\\cx]/u',
    '[\\cw]/u',
    '[\\cu]/u',
    'a()\\1/',
    `\\b/`,
    `\\cC/`,
    `\\cD/`,
    `\\cF/`,
    `\\cG/`,
    `\\cH/`,
    `\\cK/`,
    `\\cM/`,
    `\\cO/`,
    `\\cS/`,
    `\\cV/`,
    `\\cY/`,
    `\\cb/`,
    `\\cf/`,
    `\\cg/`,
    `\\ch/`,
    `\\cj/`,
    `\\ck/`,
    `\\cl/`,
    `\\cm/`,
    `\\cn/`,
    `\\co/`,
    `\\cp/`,
    `\\cs/`,
    `\\cu/`,
    `\\cy/`,
    `\\cz/`,
    `\\u1234/u`,
    `a/`,
    `a*/`,
    `a[a-z]{2,4}/`,
    `abc/`,
    `\\</`,
    `a[a-z]{2,4}?/`,
    `abc{1}/`,
    `a|b/`,
    `a|bc/`,
    `a|b|[]/`,
    `a|b|c/`,
    `d+/`,
    `e{1}/`,
    `e{2,}/`,
    `ll|l/`,
    `nd|ne/`,
    `null/`,
    `t[a-b|q-s]/`,
    `true/`,
    `undefined/`,
    `x/`,
    `x(?=y)/`,
    `|/`,
    `|.|/`,
    `(\\1)+\\1\\1/`,
    `(\\1)a/`,
    `(\\2)(b)a/`,
    `\\u{000000}/u`,
    `\\u{0000000000000000000}/u`,
    `\\u{0000000000000000000}/u`,
    '(?:x)/',
    'AL|se/',
    'B/',
    '\\f\\n/',
    `[ \\f\\n]/`,
    '[ \\n\\t\\r]+/',
    '[^-]*-/',
    '[^-]*-([^-][^-]*-)*-/',
    '[^-]*-([^-][^-]*-)*->?/',
    '[^<]+/',
    `[a-]/`,
    `[a-b]/`,
    '((b)c)c/u',
    'a((b)c)c/u',
    '(a(b)c)/u',
    'a(a(b)c)/u',
    '(a(b)c)c/u',
    'a(a(b)c)c/u',
    '[---]/u',
    '[-----]/u',
    '[\\x01-\\x17]/u',
    '[\\u0001-\\x17]/u',
    '[\\x01-\\u0007]/u',
    '[\\cx]/u',
    '[abc\\vdeff]/u',
    'dddd|ddd|dd|d|MMMM|MMM|MM|M|yyyy|yy|y|hh|h|HH|H|mm|m|ss|s|tt|t|fff|ff|f|zzz|zz|z/g',
    '(\\w+)\\s*,\\s*(\\w+)/',
    '(\\w+)\\s*,\\s*(\\w+)/',
    '[Jj]ava([Ss]cript)?(?=\:)/',
    'a+?/g',
    '(ab)+|(ac)+/',
    '(ab)|(ac)/',
    '(ab)|(ac)+/',
    '(?:ab)+|(?:ac)+/',
    '^([^?]+)/g',
    '(bc)/',
    '[F-e]+/gi',
    '[K-_]+/gi',
    '[a-zA-Z]+/gi',
    '[E-f]+/gi',
    `[|||||||]/`,
    `\\&/`,
    `\\'/`,
    `\\(/`,
    `\\)/`,
    `\\-/`,
    `\\./`,
    `\\.14/`,
    `\\//`,
    `\\0/`,
    `\\:/`,
    `\\</`,
    `\\>/`,
    `\\?/`,
    `\\?>|[\\n\\r\\t ][^?]*\\?+([^>?][^?]*\\?+)*>/`,
    `\\@/`,
    `\\S/`,
    `\\]/`,
    `\\B/`,
    '[^`cehorw¨¯´¸˂-˅˒-˟˥-˫˭˯-˿͵΄-΅᾽᾿-῁῍-῏῝-῟῭-`´-῾゛-゜꜀-꜖꜠-꜡꞉-꞊＾｀￣]/',
    '[+-\/*]/',
    '\\u0041\\u0042\\u0043/',
    '[\\0-\\uD7FF\\uE000-\\uFFFF]|[\\uD800-\\uDBFF][\\uDC00-\\uDFFF]|[\\uD800-\\uDBFF](?![\\uDC00-\\uDFFF])|(?:[^\\uD800-\\uDBFF]|^)[\\uDC00-\\uDFFF]/',
    '^[-+]?[0-9]*\.?[0-9]+([eE][-+]?[0-9]+)?$/',
    '^[-+]?[0-9]*\.?[0-9]+$/',
    '\\b[0-9A-F]+\\b/',
    '&H[0-9A-F]+\\b/',
    '\\b[0-9A-F]{4}\\b/',
    '[abc\\$abcd]/',
    '[\\[]/',
    '[\\]]/',
    '[\\x7d]/',
    '[\\x89]/',
    '[\\x5c]/',
    '[\\x45]/',
    '[\\xb4]/',
    '\\b0[0-7]*\\b/',
    '[?@_\[\]^\\]/',
    '\\\^[A-Z?@_\[\]^\\]/',
    '0x[a-fA-F\\d]{2}/',
    // '(^\\R+)|(\\R+$)|(\\R(?=\\R{2}))/u',
    '[ -~]/',
    's/[^\\040-\\176]/ /g/',
    's/[\\000-\\037]/ /g/',
    '\\d\.\\d/',
    '[\\[\\]]/',
    '\\b0[0-7]*\\b/',
    '^(a*).*\\1$/',
    '^\\w+$/',
    '^\\w+$/u',
    '[^\\x00-\\x7F]+/',
    '([^\\x00-\\x7F]|\\w)+/',
    '^[^\\x20-\\x7e]*$/',
    '^[a-zA-Z0-9.!#$%&\'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\\.[a-zA-Z0-9-]+)*$/',
    '^^[ｧ-ﾝﾞﾟ\\-]*$/u',
    '^[^\\x20-\\x7e]*$/',
    // '^-?([1-9][0-9]*|0)(\\.[0-9]+)?$/u',
    '^\\d{3}-\\d{4}$/u',
    '[N]/',
    '[M]/',
    '[L]/',
    '[G]/',
    '[a\\0b]/',
    '[0\\0b]/',
    '[1\\0b]/',
    '[\\v]/',
    '[\\w]/',
    '[\\t]/',
    '[\\S]/',
    '[\\n]/',
    '[\\f]/',
    '[\\vabcd]/',
    '[\\wabcd]/',
    '(\\0)/',
    '\\0/',
    '(a)\\0/',
    '(((((a)))))\\4/',
    '((((((a))))))\\6/',
    '((((((((((((a))))))))))))\\11/',
    '(((((((((((((((a)))))))))))))))\\14/',
    '((((((((((((((((((a))))))))))))))))))\\17/',
    '((((((((((((((((a))))))))))))))))\\16/',
    '\\ud900y/',
    'x\\udabcy/g',
    'x\\udebcy/g',
    'x\\ubcde\\udabcy/',
    'x\\ubcde\\udebcy/',
    '\\uf89a\\uf89a\\udd00y/',
    'x\\u0567\\u0567\\udc10/',
    '\\u1234\\u1234\\udc00/',
    '\\u1234\\ud800/',
    'x\\udc10\\udc10/',
    '\\ud900\\udd00\\ud900y/',
    'x\\udabc\\udabc\\udebcy/',
    'x\\ubcde\\udebc\\udebcy/',
    'x\\ud810\\udc10\\ud810/',
    'x\\u0567\\udc10/',
    '\\u1234\\udc00\\udc00/',
    '\\ud800\\udc00\\udc00/',
    '[a-z]+\\d+/',
    '(aa)bcd\\1/',
    '(a)?a/',
    '^(A)?(A.*)$/',
    'a|(b)/',
    '(a)?(a)/',
    'abc\\Sdeff/',
    '\\rabcd/',
    '\\tabcd/',
    '\\vabcd/',
    '\\sabcd/',
    'abc\\s/',
    'abc\\S/',
    'abc\\W/',
    'abc\\d/',
    '\\$abcd/',
    'abc\\$abcd/',
    'a|(|)/',
    '(((((((((((((a)))))))))))))\\13/',
    'x\\u0567/',
    '\\f/',
    '(a)(a)(a)(a)(a)(a)(a)(a)(a)(a)(a)\\11/',
    '(a)(a)(a)(a)(a)(a)(a)(a)(a)(a)\\10/',
    '(a)\\1/',
    'a{2,27}/',
    'a{,49}/',
    'a{,72}/',
    'a{,83}/',
    'a{9,9}/',
    'a{0,}/',
    'a{9,}/',
    'a{2,}/',
    'a{67}/',
    'a{34}/',
    'a{11}/',
    'a{4}/',
    'a{2}/',
    'a{0}/',
    'a{0,0}/',
    '\\cu/',
    '\\cv/',
    '\\cx/',
    '\\cy/',
    '\\cz/',
    '\\x4e/',
    '\\x3d/',
    '\\x23/',
    '\\xCD/',
    '\\xEF/',
    '\\x6A/',
    '\\x5f/',
    '\\xc3/',
    '\\x12/',
    '\\x90/',
    '\\x23/',
    '\\x89/',
    'a\\0b/',
    '(a)\\0/',
    '(1\\0)/',
    '\\0/',
    '\\0b/',
    'a\\0/',
    '(a|\\1)/',
    '\\1|(a)/',
    '4\\1(a)/',
    '\\1x(a)/',
    '(a)\\1/',
    '\\x89/',
    '(\\0)/',
    '(1\\0)/',
    'a\\0b/',
    '\\0/',
    '(a)\\1/',
    '((a))\\2/',
    '(((((a)))))\\4/',
    '((((((((((((((((((a))))))))))))))))))\\17/',
    '(((((((((((((((a)))))))))))))))\\14/',
    '((((((((((((((((((((a))))))))))))))))))))\\20/',
    '((((((((((a))))))))))\\10/',
    'x\\u0567/',
    '\\uf89ay/',
    'x\\ubcdey/',
    '\\u1234\\u1234\\udc00/',
    'x\\u0567\\u0567\\udc10/',
    '(?=)/',
    '[]b/',
    'a[]b/',
    'a[]/',
    '[]/',
    '[Y]/',
    '[x]/',
    '[y]/',
    '[Z]/',
    '[K]/',
    '[k]/',
    '[g]/',
    '(?=)/',
    '[\\bc]/',
    '[0\\0b]/',
    '[\\0b]/',
    '[a\\0]/',
    '[\\0]/',
    '||||/',
    '||||/',
    '(?!)/',
    '[a-z]+\\d+/',
    '[a-z]+\\d+/',
    '(aa)bcd\\1/',
    '(aa).+\\1/',
    'q[ax-zb](?=\\s+)/',
    'b{0,93}c/',
    '[]a/',
    '[^]a/m',
    'a[^]/',
    '1?1/mig',
    '\\u0042/i',
    '.[\\b]./',
    '[^a-z]{4}/',
    'a[^b]c/',
    'a[^1-9]c/',
    '<body.*>((.*\\n?)*?)<\\/body>/i',
    '^(([a-z]+)*([a-z])\\.)+[a-z]{2,}$/',
    '[1234567].{2}/',
    'a[^b]c/',
    '.*a.*/',
    '(?=.)*/',
    '(?=.)+/',
    '(?=.)?/',
    '(?=.){1}/',
    '[F]/',
    '[G]/',
    '[I]/',
    'a(?!b(?!c)d)e/',
    '(?!.)*/',
    '(?!.)?/',
    '(?!.){1}/',
    'a|ab/',
    '((a)|(ab))((c)|(bc))/',
    '\\d{3}|[a-z]{4}/',
    '\\d{3}|[a-z]{4}/',
    'ab|cd|ef/i',
    'ab|cd|ef/',
    's$/',
    'e$/',
    '[^o]t\\b/i',
    '\\d{2,4}/',
    '^.*(:|$)/',
    '^.*?/',
    '^.*?$/',
    '.?.?.?.?.?.?.?/',
    '\\??\\??\\??\\??\\??/',
    'ab?c?d?x?y?z/',
    '((((((((((A))))))))))\\1\\2\\3\\4\\5\\6\\7\\8\\9\\10/',
    '[d-h]+/',
    '[1234567].{2}/',
    '[^a-z]{4}/',
    '.[\\b]./',
    'c[\\b]{3}d/',
    '\\t/',
    '\\v/',
    '\\W/',
    '\\rabcd/',
    '\\tabcd/',
    '\\vabcd/',
    '\\sabcd/',
    'abc\\s/',
    'abc\\S/',
    'foo/',
    '[a-]/',
    '[\\b]/',
    '[a\\bc]/',
    '[\\bc]/',
    '[--0]/',
    '[-+]/',
    '[+-]/',
    '[---+]/',
    '[---0]/',
    '[-]/',
    '[--]/',
    '[---]/',
    '[----]/',
    '[------]/',
    '[---------]/',
    'a(b)/',
    '()/',
    '(?:b)/',
    'a(?:b)/',
    '(?:b)c/',
    '(?=b)/',
    '(?!b)/',
    'a(?!b)/',
    'a(?!b)c/',
    'a(?!b(?:c)d)e/',
    'a(?!b(?=c)d)e/',
    '(?:(?:b)c)c/',
    'a(?:(?:b)c)c/',
    '(?:a(?:b)c)/',
    'a(?:a(?:b)c)/',
    '(?!a(?!b)c)/',
    'a(?!a(?!b)c)/',
    '(?!a(?!b)c)c/',
    '(?!a(?!b))c/',
    '(?!a(?!b))/',
    'b{8,}c/',
    '\\d{1,}/',
    '(123){1,}/',
    'a\_/',
    'x\\ubcde\\ubcde\\udebcy/',
    'x\\u0567\\udc10\\udc10/',
    '\\uf89a\\udd00\\udd00y/',
    'x\\ubcde\\udebc\\udebcy/',
    '\\ud800\\ud800\\udc00/',
    'x\\ud810\\ud810\\udc10/',
    '\\ud900\\ud900\\udd00y/',
    'x\\udabc\\udabc\\udebcy/',
    'x\\udabc\\udebc\\udebcy/',
    '\\ud900\\udd00\\udd00y/',
    'x\\ud810\\udc10\\udc10/',
    '\\ud800\\udc00\\udc00/',
    '\\ud800\\udc00\\ud800/',
    'x\\ud810\\udc10\\ud810/',
    'a(a(b)c)/',
    '(a(b)c)c/',
    'a(a(b)c)c/',
    'a((b)c)c/',
    '((b)c)c/',
    'a((b)c)/',
    '((b)c)/',
    'a(?:b)c/',
    'a(?:a(?:b)c)/',
    '(?:a(?:b)c)c/',
    'a(?:a(?:b)c)c/',
    'a(?:a(?:b)c)/',
    '(?:a(?:b)c)/',
    'a(?:(?:b)c)c/',
    '(?:(?:b)c)c/',
    'a(?!a(?!b)c)/',
    '(?!a(?!b)c)c/',
    'a(?=a(?=b)c)c/',
    'a(?!a(?!b)c)c/',
    '(?=a(?=b)c)/',
    'a(?=a(?=b)c)/',
    '(?=(?=b)c)c/',
    'a(?=(?=b)c)c/',
    '(?=a(?=b)c)/',
    '(?=(?=b)c)/',
    'a(?=a(?=b))c/',
    'a(?:a(?:b))c/',
    '(?:(?:b)c)/',
    'a(?:(?:b)c)/',
    'abc\\?/',
    'abc\\(/',
    'abc\\+/',
    '\\+def/',
    'abc\\./',
    'abc\\*/',
    'abc\\+/',
    'abc\\?/',
    'abc\\\\/',
    '$/',
    './',
    'a|(|)/',
    'a|(|)/',
    '\\cG/',
    '\\ca/',
    '\\cs/',
    '\\co/',
    '\\cN/',
    '(\\1|a)/',
    '(a|\\1)/',
    '(a\\1b)/',
    '0\\1(a)/',
    '4\\1(a)/',
    '\\1x(a)/',
    '(\\1)/',
    'a\\0b/',
    '(a)\\0/',
    `d+/`,
    `d+/`,
    'a*/',
    'a*b/',
    'a?b/',
    'a+b/',
    'a??/',
    'a{0}/',
    'a{11}/',
    'a{0,0}/',
    'a{1,16}/',
    'a{23,37}/',
    'a{34,48}/',
    'a{56,60}/',
    'a{67,71}/',
    'a{89,93}/',
    'a{,50}/',
    '(?=a){0}/gm',
    '(?=a){1}/gm',
    '(?!a){0}/gm',
    '^(?=a)?b$/',
    '(?!a){1}/gm',
    'n^/gm',
    'a+/gm',
    'a?/gm',
    'a|/gm',
    'a\_/',
    'a\_/',
    '$abc/',
    'abc$abc/',
    'a+/',
    'a?/',
    'a*/',
    'a*b/',
    'a?b/',
    'a+b/',
    'a??/',
    '1/',
    'a()\\1/',
    '"[^"]*"|\'[^\']*\'/',
    '"[^<"]*"|\'[^<\']*\'/',
    '$sup/',
    '(((hello)))/',
    '((1)|(12))((3)|(23))/',
    '(.)\\1/',
    '(?:(?:hello))/',
    '(?:)/',
    '(?:ab|cd)\\d?/',
    '(?:x)/',
    '([A-Za-z_:]|[^\\x00-\\x7F])([A-Za-z0-9_:.-]|[^\\x00-\\x7F])*/',
    '([A-Za-z_:]|[^\\x00-\\x7F])([A-Za-z0-9_:.-]|[^\\x00-\\x7F])*([ \\n\\t\\r]+([A-Za-z_:]|[^\\x00-\\x7F])([A-Za-z0-9_:.-]|[^\\x00-\\x7F])*([ \\n\\t\\r]+)?=([ \\n\\t\\r]+)?("[^<"]*"|\'[^<\']*\'))*([ \\n\\t\\r]+)?/?>?/',
    '([A-Za-z_:]|[^\\x00-\\x7F])([A-Za-z0-9_:.-]|[^\\x00-\\x7F])*([ \\n\\t\\r]+)?>?/',
    '([A-Za-z_:]|[^\\x00-\\x7F])([A-Za-z0-9_:.-]|[^\\x00-\\x7F])*(\\?>|[\\n\\r\\t ][^?]*\\?+([^>?][^?]*\\?+)*>)?/',
    '([Nn]?ever|([Nn]othing\\s{1,}))more/',
    '(\\1)/',
    '\\u0076/',
    '\\u042D/',
    '\\u0433/',
    '\\x44/',
    '\\x4A/',
    '\\u041B/',
    '\\\\/',
    '\\?>|[\\n\\r\\t ][^?]*\\?+([^>?][^?]*\\?+)*>/',
    '\\x50/',
    '\\x64/',
    '\\x66/',
    '\\x6D/',
    '\\x76/',
    'a[a-z]{2,4}/',
    'a[a-z]{2,4}?/',
    'abc{1}/',
    'a|b/',
    'a|b|[]/',
    // '\\1/',
    // '\\:',
    'a|b|c/',
    'e{2,}/',
    'nd|ne/',
    'null/',
    't[a-b|q-s]/',
    'true/',
    'undefined/',
    'x(?!y)/',
    'x(?=y)/',
    '|/',
    '|.|/',
    '(\\1)+\\1\\1/',
    '(\\1)a/',
    '(\\2)(b)a/',
    'a{0}/',
    'a{1}/',
    'a{11}/',
    'a{0,}/',
    'a{2,2}/',
    'a{3,3}/',
    'a{4,4}/',
    'a{56,60}/',
    'a{,6}/',
    'a{,49}/',
    'a{,6}/',
    'a{67,71}/',
    'a{7,72}/',
    'a{89,}/',
    'a{9,}/',
    'a{89}/',
    'a{4}/',
    'foo/y',
    '\\t/',
    '\\S/',
    '\\s/',
    '\\n/',
    '\\f/',
    '\\D/',
    '\\]/',
    '\\{/',
    // '^a-zA-Z]*$/',
    // '^a-zA-Z]*$/',
    // '^0-9]+$/',
    // '\\/',
    '\\v/',
    '()|/',
    'a{0}/',
    'a{11}/',
    'a{1}/',
    'a{2}/',
    'a{3}/',
    'a{89}/',
    'a{9,}/',
    'a{3,38}/',
    'a{1}?/',
    'a+?/',
    'a*?/',
    'a{1,2}/',
    //        '^-J]/ug',
    // '^-fdsasgJ]/g',
    'oo/i',
    '\\D/',
    '\\f/',
    '\\s/',
    '\\Bo\\B/i',
    '[f-z]e\\B/',
    '\\Bevil\\B/',
    '[1234567].{2}/',
    '^^^^^^^robot$$$$/',
    '[^a-z]{4}/',
    '[d-h]+/',
    '[1234567].{2}/',
    '\\B\\w{4}\\B/',
    '[^a-z]{4}/',
    '[d-h]+/',
    '[1234567].{2}/',
    '\\B[^z]{4}\\B/',
    '[^a-z]{4}/',
    '[d-h]+/',
    '[1234567].{2}/',
    '\\B\\w/',
    '[^a-z]{4}/',
    '((((((((((A))))))))))\\10\\9\\8\\7\\6\\5\\4\\3\\2\\1/',
    '[]a/',
    'q[ax-zb](?=\\s+)/',
    '[^a-z]{4}/',
    'c[\\b]{3}d/',
    '[a-z]+/',
    '([xu]\\d{2}([A-H]{2})?)\\1/',
    '([xu]\\d{2}([A-H]{2})?)\\1/',
    '(?=)/',
    'a*?/',
    'a+?/',
    'a+?/',
    'a??/u',
    'a{1,}?/',
    'a{1,}?/u',
    'a{1,2}?/',
    '(?:b)/',
    'a(?:b)/',
    '\\bot/',
    '^([a-z]+)*[a-z]$/',
    '.+/',
    '.*a.*/',
    '[a-z]+/',
    '\\b(\\w+) \\1\\b/',
    '([xu]\\d{2}([A-H]{2})?)\\1/',
    '(123){1,}x\\1/',
    '(\\.(?!com|org)|\\/)/',
    '(?!a|b)|c/',
    '(?=(a+))/',
    'o+/',
    'Java(?!Script)([A-Z]\\w*)/',
    'b{2,}c/',
    '^.*?(:|$)/',
    '^.*(:|$)/',
    // '\\u0000-\\s]/',
    '([a-z]*)( *)?:( *)?([\'\"`])([^,\\n]*)\\4/',
    // '\\479/',
    '[\\u0000-\\u001fehlo\\u007f-\\u009f\\u00ad\\u0600-\\u0603\\u06dd\\u070f\\u17b4-\\u17b5\\u200b-\\u200f\\u202a-\\u202e\\u2060-\\u2064\\u206a-\\u206f\\ufeff\\ufff9-\\ufffb]|\\ud834[\\udd73-\\udd7a]|\\udb40[\\udc01\\udc20-\\udc7f]/',
    '[0-9fo٠-٩۰-۹߀-߉०-९০-৯੦-੯૦-૯୦-୯௦-௯౦-౯೦-೯൦-൯๐-๙໐-໙༠-༩၀-၉႐-႙០-៩᠐-᠙᥆-᥏᧐-᧙᭐-᭙᮰-᮹᱀-᱉᱐-᱙꘠-꘩꣐-꣙꤀-꤉꩐-꩙０-９]|\\ud801[\\udca0-\\udca9]|\\ud835[\\udfce-\\udfff]/',
    '[\\u0000-~\\u2000-\\u206e]|\\ud809[\\udc00-\\udc7e]/',
    '[cehorwԀ-\\u052e\\u2000-\\u206e]/',
    '[cehorwЀ-Ӿ\\u2000-\\u206e]/',
    '[^`cehorw¨¯´¸ǅǈǋǲ˂-˅˒-˟˥-˫˭˯-˿͵΄-΅Ѐ-ӾԀ-\\u052eᾈ-ᾏᾘ-ᾟᾨ-ᾯᾼ-᾽᾿-῁ῌ-῏῝-῟῭-`ῼ-῾\\u2000-\\u206e\\u2de0-\\u2dfe゛-゜꜀-꜖꜠-꜡꞉-꞊＾｀￣]/',
    '[\\cw]/u',
    `[^<\"]*\"|'[^<']*'/`,
    '$sup/',
    '(((hello)))/',
    '((1)|(12))((3)|(23))/',
    '(.)\\1/',
    '(?:)/',
    '(?:ab|cd)\\d?/',
    '(?:x)/',
    '([A-Za-z_:]|[^\\x00-\\x7F])([A-Za-z0-9_:.-]|[^\\x00-\\x7F])*/',
    `([A-Za-z_:]|[^\\x00-\\x7F])([A-Za-z0-9_:.-]|[^\\x00-\\x7F])*([ \\n\\t\\r]+([A-Za-z_:]|[^\\x00-\\x7F])([A-Za-z0-9_:.-]|[^\\x00-\\x7F])*([ \\n\\t\\r]+)?=([ \\n\\t\\r]+)?(\"[^<\"]*\"|'[^<']*'))*([ \\n\\t\\r]+)?/`,
    '([A-Za-z_:]|[^\\x00-\\x7F])([A-Za-z0-9_:.-]|[^\\x00-\\x7F])*([ \\n\\t\\r]+)?>?/',
    '([Nn]?ever|([Nn]othing\\s{1,}))more/',
    '(\\1)/',
    '(\\d+)/',
    '(a)*/',
    '(aa|aabaac|ba|b|c)*/',
    '(x)/',
    'f$/g',
    '(\\w+)\\s*,\\s*(\\w+)/',
    '(?:\\\\.|[\\w-]|[^\\0-\\xa0])+/',
    '^h\\d$/i/',
    '[a-dk-lx-z]+/g',
    '[\[\}]+/g',
    '[@-k]+/g',
    '[0-_]+/g',
    '[A-a]+/g',
    '[X-kK-b]+/g',
    '^\\s{2,}|\\s{3,}$/g',
    '^e/gm',
    '[abc]+/gi',
    '[E-fk-o]+/gi',
    '[a-dk-lx-z]+/gi',
    '[\[\}]+/gi',
    '[0-\}]+/gi',
    '[A-z]+/gi',
    '[@-k]+/gi',
    '[0-_]+/gi',
    '[X-kK-b]+/gi',
    '[9-k]+/g',
    '[utg]/',
    'a+?/g',
    '[0-K]+/g',
    '[5-\}]+/g',
    '[E-f]+/g',
    '^(?:input|select|textarea|button)$/i',
    '\\1(a)/', '(a)\\1/', '(\\1)/', '\\1x(a)/', '(a)x\\1/', '(a\\1b)/', '0\\1(a)/', '4\\1(a)/', '(a)|\\1/', '\\1|(a)/', '(\\1|a)/', '/(a|\\1)/',
    '\\0/', '(a)\\0/',
    '(a)\\1/', '((a))\\1/',
    '((a))\\2/', '(((a)))\\2/',
    '(((a)))\\3/', '((((a))))\\3/',
    '((((a))))\\4/', '(((((a)))))\\4/',
    '(((((a)))))\\5/', '((((((a))))))\\5/',
    '((((((a))))))\\6/', '(((((((a)))))))\\6/',
    '(((((((a)))))))\\7/', '((((((((a))))))))\\7/',
    '((((((((a))))))))\\8/', '(((((((((a)))))))))\\8/',
    '(((((((((a)))))))))\\9/', '((((((((((a))))))))))\\9/',
    '((((((((((a))))))))))\\10/', '(((((((((((a)))))))))))\\10/',
    '(((((((((((a)))))))))))\\11/', '((((((((((((a))))))))))))\\11/',
    '((((((((((((a))))))))))))\\12/', '(((((((((((((a)))))))))))))\\12/',
    '(((((((((((((a)))))))))))))\\13/', '((((((((((((((a))))))))))))))\\13/',
    '((((((((((((((a))))))))))))))\\14/', '(((((((((((((((a)))))))))))))))\\14/',
    '(((((((((((((((a)))))))))))))))\\15/', '((((((((((((((((a))))))))))))))))\\15/',
    '((((((((((((((((a))))))))))))))))\\16/', '(((((((((((((((((a)))))))))))))))))\\16/',
    '(((((((((((((((((a)))))))))))))))))\\17/', '((((((((((((((((((a))))))))))))))))))\\17/',
    '((((((((((((((((((a))))))))))))))))))\\18/', '(((((((((((((((((((a)))))))))))))))))))\\18/',
    '(((((((((((((((((((a)))))))))))))))))))\\19/',
     '((((((((((((((((((((a))))))))))))))))))))\\19/',
    '((((((((((((((((((((a))))))))))))))))))))\\20/',
     '(((((((((((((((((((((a)))))))))))))))))))))\\20/',
    '\\$/', 'abc\\$/', '\\$abcd/', 'abc\\$abcd/',
    `\\^/`, `\\$/`, `\\\\/`, `\\./`,
     `\\*/`,
    `\\+/`, `\\?/`, `\\(/`, `\\)/`,
    `\\[/`, `\\]/`, `\\{/`, `\\}/`, `\\|/`,
    `\\'/`, `\\"/`, `\\\`/`,
    '^/', '$/', './',
    'a|(|)/', 'a|(|)/',
    '\\ca/', '\\cb/', '\\cd/', '\\ce/',
     '\\cf/', '\\cg/', '\\ch/', '\\ci/',
     '\\cj/', '\\ck/', '\\cl/', '\\cm/', '\\cn/',
      '\\co/', '\\cp/', '\\cq/', '\\cr/', '\\cs/', '\\ct/', '\\cu/', '\\cv/', '\\cw/', '\\cx/', '\\cy/', '\\cz/',
    '\\cA/', '\\cB/', '\\cD/', '\\cE/', '\\cF/',
    '\\cG/', '\\cH/', '\\cI/', '\\cJ/',
     '\\cK/', '\\cL/',
    '\\cM/',
     '\\cN/', '\\cO/',
     '\\cP/', '\\cQ/', '\\cR/', '\\cS/', '\\cT/', '\\cU/', '\\cV/', '\\cW/', '\\cX/', '\\cY/', '\\cZ/',

    '\\x01/', '\\x12/', '\\x23/', '\\x34/', '\\x45/',
     '\\x56/', '\\x67/', '\\x78/', '\\x89/', '\\x90/',
    '\\xa1/', '\\xb2/', '\\xc3/', '\\x3d/', '\\x4e/',
     '\\x5f/', '\\x6A/', '\\xbB/', '\\xCD/', '\\xEF/',
    '\\0/', 'a\\0/', '\\0b/', 'a\\0b/', '(a)\\0/',
     '\\0(b)/', '(\\0)/', '(0\\0)/', '(1\\0)/',
    '\\1(a)/', '(a)\\1/', '(\\1)/', '\\1x(a)/',
     '(a)x\\1/', '(a\\1b)/', '0\\1(a)/', '4\\1(a)/',
     '(a)|\\1/',
     '\\1|(a)/', '(\\1|a)/', '(a|\\1)/',

    '\\ud800/', 'x\\ud810/', '\\ud900y/', 'x\\udabcy/', 'x\\udabcy/g', 'x\\udabcy/m', 'x\\udabcy/iy',
    '\\ud800\\ud800/', 'x\\ud810\\ud810/', '\\ud900\\ud900y/', 'x\\udabc\\udabcy/',
    '\\udc00/', 'x\\udc10/', '\\udd00y/', 'x\\udebcy/', 'x\\udebcy/g', 'x\\udebcy/im', 'x\\udebcy/y',
    '\\udc00\\udc00/', 'x\\udc10\\udc10/', '\\udd00\\udd00y/', 'x\\udebc\\udebcy/', 'x\\udebc\\udebcy/i',
    '\\ud800\\udc00/', 'x\\ud810\\udc10/', '\\ud900\\udd00y/', 'x\\udabc\\udebcy/', 'x\\udabc\\udebcy/g',
    '\\u1234\\ud800/', 'x\\u0567\\ud810/', '\\uf89a\\ud900y/', 'x\\ubcde\\udabcy/', 'x\\ubcde\\udabcy/m',
    '\\u1234\\udc00/', 'x\\u0567\\udc10/', '\\uf89a\\udd00y/', 'x\\ubcde\\udebcy/', 'x\\ubcde\\udebcy/y',
    '\\u1234\\u1234\\udc00/', 'x\\u0567\\u0567\\udc10/', '\\uf89a\\uf89a\\udd00y/', 'x\\ubcde\\ubcde\\udebcy/',
    '\\u1234\\udc00\\udc00/', 'x\\u0567\\udc10\\udc10/', '\\uf89a\\udd00\\udd00y/', 'x\\ubcde\\udebc\\udebcy/',
    '\\ud800\\ud800\\udc00/', 'x\\ud810\\ud810\\udc10/', '\\ud900\\ud900\\udd00y/', 'x\\udabc\\udabc\\udebcy/',
    '\\ud800\\udc00\\udc00/', 'x\\ud810\\udc10\\udc10/', '\\ud900\\udd00\\udd00y/', 'x\\udabc\\udebc\\udebcy/',
    '\\ud800\\udc00\\ud800/', 'x\\ud810\\udc10\\ud810/', '\\ud900\\udd00\\ud900y/', 'x\\udabc\\udebc\\udabcy/',
    `[rD]/`, `[Kq]/`, `[$%]/`,

    '[\\0]/', '[a\\0]/', '[\\0b]/',
    '[a\\0b]/', '[0\\0b]/', '[1\\0b]/',
    '[\\d]/', '[\\D]/', '[\\f]/',
    '[\\n]/', '[\\r]/', '[\\s]/', '[\\S]/'
    , '[\\t]/', '[\\v]/', '[\\w]/',
     '[\\W]/',
    '[\\fabcd]/',
     '[\\dabcd]/',
     '[\\Dabcd]/',
      '[\\nabcd]/',
       '[\\rabcd]/', '[\\sabcd]/',
     '[\\Sabcd]/',
      '[\\tabcd]/',
     '[\\vabcd]/',
      '[\\wabcd]/', '[\\Wabcd]/',
    `[abc\\^]/`, `[abc\\$]/`, `[abc\\\\]/`, `[abc\\.]/`, `[abc\\*]/`, `[abc\\+]/`,
     `[abc\\?]/`,
     `[abc\\(]/`, `[abc\\)]/`, `[abc\\[]/`,
     `[abc\\]]/`,
     `[abc\\{]/`, `[abc\\}]/`, `[abc\\|]/`,
    `[\\^def]/`, `[\\$def]/`, `[\\\\def]/`,
     `[\\.def]/`, `[\\*def]/`, `[\\+def]/`,
    `[\\?def]/`, `[\\(def]/`, `[\\)def]/`,
    `[\\[def]/`,
     `[\\]def]/`,
    `[\\{def]/`,
    `[\\}def]/`,
     `[\\|def]/`,
    '[\\x01]/', '[\\xf2]/',
     '[\\x23]/', '[\\xb4]/',
     '[\\x45]/', '[\\x5c]/',
    '[\\x67]/', '[\\x7d]/',
    '[\\x89]/', '[\\x90]/',
    '[\\xa1]/', '[\\xb2]/',
    '[\\xc3]/', '[\\x3d]/', '[\\x4e]/',
     '[\\x5f]/',
     '[\\x6A]/', '[\\xbB]/', '[\\xCD]/', '[\\xEF]/',
    '[\\u1234]/', '[x\\u0567]/', '[\\uf89ay]/', '[x\\ubcdey]/',
    '[\\da-z]/', '[\\DA-Z]/',
    '[\\sa-z]/', '[\\SA-S]/',
    '[\\wa-z]/', '[\\WA-Z]/',
    '[\\ud800]/', '[x\\ud810]/',
     '[\\ud900y]/', '[x\\udabcy]/', '[x\\udabcy]/g',
     '[x\\udabcy]/m', '[x\\udabcy]/iy',
    '[\\udc00]/', '[x\\udc10]/', '[\\udd00y]/',
    '[x\\udebcy]/', '[x\\udebcy]/g', '[x\\udebcy]/im',
     '[x\\udebcy]/y',
    '[\\udc00\\udc00]/', '[x\\udc10\\udc10]/',
     '[\\udd00\\udd00y]/', '[x\\udebc\\udebcy]/',
      '[x\\udebc\\udebcy]/i',
    '[\\ud800\\udc00]/', '[x\\ud810\\udc10]/',
    '[\\ud900\\udd00y]/', '[x\\udabc\\udebcy]/',
     '[x\\udabc\\udebcy]/g',
    '[\\u1234\\ud800]/', '[x\\u0567\\ud810]/',
     '[\\uf89a\\ud900y]/', '[x\\ubcde\\udabcy]/',
      '[x\\ubcde\\udabcy]/m',
    '[\\u1234\\udc00\\udc00]/',
    '[x\\u0567\\udc10\\udc10]/',
     '[\\uf89a\\udd00\\udd00y]/',
     '[x\\ubcde\\udebc\\udebcy]/',
    '[\\ud800\\ud800\\udc00]/',
     '[x\\ud810\\ud810\\udc10]/',
      '[\\ud900\\ud900\\udd00y]/',
     '[x\\udabc\\udabc\\udebcy]/',
    '[\\ud800\\udc00\\udc00]/',
     '[x\\ud810\\udc10\\udc10]/',
     '[\\ud900\\udd00\\udd00y]/',
      '[x\\udabc\\udebc\\udebcy]/',
    '[\\ud800\\udc00\\ud800]/',
     '[x\\ud810\\udc10\\ud810]/',
      '[\\ud900\\udd00\\ud900y]/',
     '[x\\udabc\\udebc\\udabcy]/',

    '[a-z\\dx]/', '[A-Z\\Dx]/',
    '[a-z\\sx]/', '[A-S\\Sx]/',
    '[a-z\\wx]/', '[A-Z\\Wx]/',
    '[1-9]/',
    '[\\u5000-\\u6000]/',
    '[\\uD83D\\uDCA9]/',
    '[\\uD83D\\uDCAB]/',
    '[--0]/', '[+--]/',
    '[-+]/', '[+-]/', '[---+]/', '[---0]/',
    '[-----]/',
    '[---------]/',
    '((b))/', '(a(b))/', 'a(a(b))/', '(a(b))c/',
    'a(a(b))c/', '((b)c)/', 'a((b)c)/', '((b)c)c/',
    'a((b)c)c/', '(a(b)c)/', 'a(a(b)c)/', '(a(b)c)c/',
    'a(a(b)c)c/',
    '()/',
    '(?:(?:b))/',
    '(?:a(?:b))/',
     'a(?:a(?:b))/',
    '(?:a(?:b))c/', 'a(?:a(?:b))c/',
    '(?:(?:b)c)/',
     'a(?:(?:b)c)/',
     '(?:(?:b)c)c/', 'a(?:(?:b)c)c/', '(?:a(?:b)c)/',
      'a(?:a(?:b)c)/',
     '(?:a(?:b)c)c', 'a(?:a(?:b)c)c/',

    'abc/gim', 'a|ab/',
     '((a)|(ab))((c)|(bc))/',
     '\\d{3}|[a-z]{4}/',
      '\\d{3}|[a-z]{4}/',
     'ab|cd|ef/i',
      'ab|cd|ef/',
    '(?=(?=b))/', '(?=a(?=b))/', 'a(?=a(?=b))/',
     '(?=a(?=b))c/',
    'a(?=a(?=b))c/',
     '(?=(?=b)c)/',
     'a(?=(?=b)c)/',
      '(?=(?=b)c)c/',
     'a(?=(?=b)c)c/',
      '(?=a(?=b)c)/',
     'a(?=a(?=b)c)/',
     '(?=a(?=b)c)c/',
     'a(?=a(?=b)c)c/',
    '(?!(?!b))/',
     '(?!a(?!b))/',
      'a(?!a(?!b))/',
      '(?!a(?!b))c/',
     'a(?!a(?!b))c/',
      '(?!(?!b)c)/',
      'a(?!(?!b)c)/',
     '(?!(?!b)c)c/',
     'a(?!(?!b)c)c/',
      '(?!a(?!b)c)/',
      'a(?!a(?!b)c)/',
     '(?!a(?!b)c)c/',
      'a(?!a(?!b)c)c/',
    'a(b(c)d)e/',
    'a(b(?:c)d)e/',
    'a(b(?=c)d)e/',
    'a(b(?!c)d)e/',
    'a(?:b(c)d)e/',
    'a(?:b(?:c)d)e/',
    'a(?:b(?=c)d)e/',
    'a(?:b(?!c)d)e/',
    'a(?=b(c)d)e/',
    'a(?=b(?:c)d)e/',
    'a(?=b(?=c)d)e/',
    'a(?=b(?!c)d)e/',
    'a(?!b(c)d)e/',
    'a(?!b(?:c)d)e/',
    'a(?!b(?=c)d)e/',
    'a(?!b(?!c)d)e/',
    '(?=.)*/', '(?=.)+/', '(?=.)?/', '(?=.){1}/',
    '(?!.)*/', '(?!.)+/', '(?!.)?/', '(?!.){1}/',

      '(?:ab|cd)+|ef/i', '(?:ab|cd)+|ef/i',
    '11111|111/', 'xyz|.../', '(.)..|abc/', '.+: gr(a|e)y/',
     '(Rob)|(Bob)|(Robert)|(Bobby)/',
      '()|/', '|()/',
      'a[a-z]{2,4}/', 'a[a-z]{2,4}?/',
    '(aa|aabaac|ba|b|c)*/', '(z)((a+)?(b+)?(c))*/',
    '(a*)b\\1+/', 's$/',
    'e$/', 's$/m',
    '[^e]$/mg', 'es$/mg',
        '^m/', '^m/m', '^p[a-z]/',
    '^p[b-z]/m', '^[^p]/m',
     '^ab/', '^..^e/', '^xxx/',
    '^\\^+/', '^\\d+/m',
     '\\bp/',
    'ot\\b/', '\\bot/',
    '\\bso/', 'so\\b/', '[^o]t\\b/',
     '[^o]t\\b/i', '\\bro/',
     'r\\b/',
     '\\brobot\\b/',
      '\\b\\w{5}\\b/',
      '\\bop/',
       'op\\b/', 'e\\b/',
      '\\be/',
      '\\Bevil\\B/', '[f-z]e\\B/',
      '\\Bo\\B/i',
      '\\B\\w\\B/', '\\w\\B/',
    '\\B\\w/', '\\B[^z]{4}\\B/', '\\B\\w{4}\\B/',
    '^^^^^^^robot$$$$/',
    '\\B\\B\\B\\B\\B\\Bbot\\b\\b\\b\\b\\b\\b\\b/',
    '^.*?$/', '^.*?/', '^.*?(:|$)/',
    '^.*(:|$)/', '\\d{2,4}/',
     'b{2,3}c/',
     'b{42,93}c/',
     'b{0,93}c/',
     'bx{0,93}c/', '.{0,93}/', '\\w{3}\\d?/',
    '\\w{3}\\d?/',
     'b{2}c/',
     'b{8}/', '\\s+java\\s+/',
     '[a-z]+\\d+/',
     '[a-z]+\\d+/',
     '[a-z]+(\\d+)/',
     'd+/', 'o+/', '(b+)(b+)(b+)/',
     '(b+)(b*)/', 'b*b+/',
     '[^"]*/',
     '[^"]*/', '[^"]*/',
    `/["'][^"']*["']/`, '(x*)(x+)/', '(\\d*)(\\d+)/', '(\\d*)\\d(\\d+)/',
    '(x+)(x*)/',
     'x*y+$/', '[\\d]*[\\s]*bc./',
      'bc..[\\d]*[\\s]*/',
     '[xyz]*1/',
      'java(script)?/', 'x?y?z?/', 'x?ay?bz?c/',
    'ab?c?d?x?y?z/',
     '\\??\\??\\??\\??\\??/', '.?.?.?.?.?.?.?/',
     'b{2,}c/',
     'b{8,}c/',
     '\\d{1,}/',
     '(123){1,}/',
     '(123){1,}x\\1/', 'x{1,2}x{1,}/', '(?=(a+))/', '(?=(a+))a*b\\1/',
    '[Jj]ava([Ss]cript)?(?=\\:)/', '(.*?)a(?!(a+)b\\2c)\\2(.*)/',
     'Java(?!Script)([A-Z]\\w*)/', 'Java(?!Script)([A-Z]\\w*)/',
     '(\\.(?!com|org)|\\/)/', '(?!a|b)|c/',
    '([Jj]ava([Ss]cript)?)\\sis\\s(fun\\w*)/', '(.{3})(.{4})/',
    '(aa)bcd\\1/', '(aa).+\\1/', '(.{2}).+\\1/',
     '(\\d{3})(\\d{3})\\1\\2/',
    'a(..(..)..)/', '(a(b(c)))(d(e(f)))/',
    '(a(b(c)))(d(e(f)))\\2\\5/', 'a(.?)b\\1c\\1d\\1/', '<body.*>((.*\\n?)*?)<\\/body>/i',
     '(\\|)([\\w\\x81-\\xff ]*)(\\|)([\\/a-z][\\w:\\/\\.]*\\.[a-z]{3,4})(\\|)/ig',
    '([\\S]+([ \\t]+[\\S]+)*)[ \\t]*=[ \\t]*[\\S]+/',
    '^(A)?(A.*)$/',
    '(a)?a/',
     'a|(b)/',
     '(a)?(a)/',
     '^([a-z]+)*[a-z]$/', '^(([a-z]+)*[a-z]\\.)+[a-z]{2,}$/',
    '^(([a-z]+)*([a-z])\\.)+[a-z]{2,}$/', '.*a.*/', '.+/', '[a-z]+/ig', '[a-z]+/', '\\b(\\w+) \\1\\b/', '([xu]\\d{2}([A-H]{2})?)\\1/', '([xu]\\d{2}([A-H]{2})?)\\1/',
    '(a*)b\\1+/', '((((((((((A))))))))))\\1\\2\\3\\4\\5\\6\\7\\8\\9\\10/', '((((((((((A))))))))))\\10\\9\\8\\7\\6\\5\\4\\3\\2\\1/', '[]a/', 'q[ax-zb](?=\\s+)/',
    'ab[ercst]de/', '[d-h]+/', '[1234567].{2}/', '[a-c\\d]+/', 'ab[.]?c/', 'a[b]c/', '[a-z][^1-9][a-z]/', '[*&$]{3}/', '[\\d][\\n][^\\d]/', '[^]a/m', 'a[^]/',
    'a[^b-z]\\s+/', '[^\\b]+/g', 'a[^1-9]c/', 'a[^b]c/', '[^a-z]{4}/', '.[\\b]./', 'c[\\b]{3}d/', '[^\\[\\b\\]]+/', '\\u0042/i', '1?1/mig',
    'a*?/',

    'a*?/',
    //'a{/',
    'a+/',
    //'(?=a){a}/',
    '(?=a)*/',
    '(?=foo)/',
    '(?=)/',
    '||||/',
    'icefapper/',
    '\\d/',
    '\\v/',
    //'\\u{/',
    '\\+/',
    //'\\u{110000}/',
    '\\}/',
    '[^-a-b-]/',
    '[\\u1234]/',
    //'[\\377]/',
    '[\\?]/',
    '[\\]]/',
    '(a)(a)(a)(a)(a)(a)(a)(a)(a)(a)(a)\\11/',
    '\\%([0-9]*)\\[(\\^)?(\\]?[^\\]]*)\\]/',
    '\\%([0-9]*)\\[(\\^)?\\]/',
    '(\\]?[^\\]]*)\\]/',
    '^[0-9]*$/',
    '^[a-zA-Z]*$/',
    '^[0-9a-zA-Z]*$/',
    '^([a-zA-Z0-9]{8,})$/',
    '^[0-9]{8}$/',
    '^\\d{1,3}(.\\d{1,3}){3}$/',
    '^-?([1-9][0-9]*|0)(\\.[0-9]+)?$/',
    '^[ァ-ンヴー]*$/',
    '^\\s*|\\s*$/',
    '^((4\\d{3})|(5[1-5]\\d{2})|(6011))([- ])?\\d{4}([- ])?\\d{4}([- ])?\\d{4}|3[4,7]\\d{13}$/',
    `^abc/`, `abc$/`, `a.c/`,
    `a*/`, `a?/`, `a+/`,
    `a*b/`, `a?b/`, `a+b/`,
    `a??/`,

    `a{0}/`,
    `a{1}/`,
     `a{2}/`,
     `a{3}/`,
      `a{4}/`,
     `a{5}/`,
      `a{6}/`,
       `a{7}/`,
     `a{8}/`, `a{9}/`,
    `a{11}/`,
    `a{12}/`,
    `a{23}/`,
     `a{34}/`,
     `a{45}/`,
     `a{56}/`,
      `a{67}/`,
       `a{78}/`,
       `a{89}/`,
       `a{90}/`,
    `a{11,}/`,
     `a{12,}/`,
     `a{23,}/`,
     `a{34,}/`,
     `a{45,}/`,
     `a{56,}/`,
      `a{67,}/`,
      `a{78,}/`,
      `a{89,}/`, `a{90,}/`,
    `a{0,0}/`,
    `a{1,1}/`,
    `a{2,2}/`,
     `a{3,3}/`,
      `a{4,4}/`,
       `a{5,5}/`,
       `a{6,6}/`,
       `a{7,7}/`,
        `a{8,8}/`,
         `a{9,9}/`,
    `a{0,15}/`,
     `a{1,16}/`,
    `a{2,27}/`,
     `a{3,38}/`, `a{4,49}/`,
    `a{5,50}/`,
     `a{6,61}/`, `a{7,72}/`, `a{8,83}/`, `a{9,94}/`,

    `a{,15}/`, `a{,16}/`,
     `a{,27}/`,
     `a{,38}/`,
    `a{,49}/`,
     `a{,50}/`,
      `a{,61}/`,
     `a{,72}/`,
      `a{,83}/`,
     `a{,94}/`,

    `\\^/`,
     `\\$/`,
     `\\\\/`,
     `\\./`,
     `\\*/`,
     `\\+/`,
     `\\?/`, `\\(/`,
     `\\)/`, `\\[/`, `\\]/`, `\\{/`, `\\}/`, `\\|/`,

];

for (const arg of validCases) {
    it(`${arg}`, () => {
        const parser = createParserObject(`${arg}`, undefined);
        const {
            state
        } = verifyRegExpPattern(parser, Context.OptionsEditorMode);

        t.deepEqual({
            state,
        }, {
            state: RegexpState.Valid,
        });
    });
}


});

});
