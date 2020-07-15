lexer grammar ProjectTxtLexer;

channels {
    COMMENT_CHANNEL
}

fragment WHITESPACE: [ \t]+;
fragment NEWLINE: ( '\r\n' | '\r' | '\n' );
fragment DIGIT: [0-9];

WS: WHITESPACE -> skip;
LINE_COMMENT: '#' ~[\r\n]* -> skip;
INSTRUCTION_ESCAPE: '^^' -> pushMode(TEXT_MODE);
// the two pushMode instructions are to avoid the case when you put a comment
// directly after the first instruction in a line. it ensures that whenever we
// have something that is not a comment in the line we stay in text mode until the
// next line is reached. only at the next line a comment is allowed again.
INSTRUCTION: '^' -> pushMode(TEXT_MODE), pushMode(INSTRUCTION_MODE);
NEW_LINE: NEWLINE;

TEXT: ~[^\r\n]+ -> pushMode(TEXT_MODE);

mode INSTRUCTION_MODE;
    TASK_STATE_OPEN: '[ ]';
    TASK_STATE_DONE: ('[x]' | '[X]');
    TASK_STATE_ON_HOLD: '[!]';
    TASK_STATE_IN_PROGRESS: '[>]';
    TASK_STATE_MILESTONE: ('[m]' | '[M]');
    PERSON_START: '/';
    IDREF: '#';
    LABELREF: '@';
    DEPENDENCY: '<';
    ASSIGNMENT: '>';
    START: '*' -> pushMode(DATE_MODE);
    EFFORT: '~' -> pushMode(DURATION_MODE);
    EMAIL: '=>' -> pushMode(EMAIL_MODE);
    DUE: '!' -> pushMode(DATE_MODE);
    SCHEDULE: '+' -> pushMode(DATE_MODE);
    IDENTIFIER: ~[ \r\t\n:<>#@~+*=!]+;
    SEPARATOR: ':';
    INSTRUCTION_WHITESPACE: WHITESPACE+ -> popMode, type(TEXT);
    INSTRUCTION_NEWLINE: NEWLINE+ -> popMode, type(NEW_LINE);

mode DATE_MODE;
    YEAR: DIGIT DIGIT DIGIT DIGIT;
    HYPHEN: '-';
    MONTH_OR_DAY: DIGIT DIGIT?;
    DATE_WHITESPACE: WHITESPACE -> popMode, popMode, type(TEXT);
    DATE_NEWLINE: NEWLINE+ -> popMode, popMode, type(NEW_LINE);

mode EMAIL_MODE;
    ADDRESS: ~[ \t\r\n]+;
    ADDRESS_WHITESPACE: WHITESPACE -> popMode, popMode, type(TEXT);
    ADDRESS_NEWLINE: NEWLINE+ -> popMode, popMode, type(NEW_LINE);

mode DURATION_MODE;
    AMOUNT: DIGIT+;
    DAY: 'd';
    HOUR: 'h';
    MINUTE: 'm';
    DURATION_WHITESPACE: WHITESPACE -> popMode, popMode, type(TEXT);
    DURATION_NEWLINE: NEWLINE+ -> popMode, popMode, type(NEW_LINE);

mode TEXT_MODE;
    TM_TEXT: ~[^\r\n]+ -> type(TEXT);
    TM_INSTRUCTION: '^' -> type(INSTRUCTION), pushMode(INSTRUCTION_MODE);
    TM_INSTRUCTION_ESCAPE: '^^' -> type(INSTRUCTION_ESCAPE);
    TM_NEW_LINE: NEWLINE -> type(NEW_LINE), popMode;
