lexer grammar ProjectTxtLexer;

channels {
    COMMENT_CHANNEL
}

fragment WHITESPACE: [ \t]+;
fragment NEWLINE: [\r\n]+;
fragment DIGIT: [0-9];

TASK_STATE_OPEN: '[ ]';
TASK_STATE_DONE: ('[x]' | '[X]');
TASK_STATE_ON_HOLD: '[!]';
TASK_STATE_IN_PROGRESS: '[>]';
TASK_STATE_MILESTONE: ('[m]' | '[M]');

COMMENT_START: '#' -> channel(COMMENT_CHANNEL), pushMode(COMMENT_MODE);
PERSON_START: '+';

DOUBLE_COLON: '::';
INSTRUCTION: ':' -> pushMode(INSTRUCTION_MODE);
NEW_LINE: NEWLINE;

TEXT: ~[:+[#\r\n]+;

mode INSTRUCTION_MODE;
    IDREF: '#';
    LABELREF: '@';
    DEPENDENCY: '<';
    ASSIGNMENT: '>';
    START: '*' -> pushMode(DATE_MODE);
    ESTIMATION: '~' -> pushMode(DURATION_MODE);
    EMAIL: '=>' -> pushMode(EMAIL_MODE);
    DUE: '!' -> pushMode(DATE_MODE);
    SCHEDULE: '?' -> pushMode(DATE_MODE);
    PLUS: '+';
    IDENTIFIER: ~[ \r\t\n:<>#@~+*=!?]+;
    SEPARATOR: ':';
    INSTRUCTION_WHITESPACE: WHITESPACE+ -> popMode, type(TEXT);
    INSTRUCTION_NEWLINE: NEWLINE+ -> popMode, type(NEW_LINE);

mode DATE_MODE;
    YEAR: DIGIT DIGIT DIGIT DIGIT;
    HYPHEN: '-';
    MONTH_OR_DAY: DIGIT DIGIT?;
    DATE_WHITESPACE: WHITESPACE -> popMode, popMode, type(TEXT);

mode EMAIL_MODE;
    ADDRESS: ~[ \t\r\n]+;
    ADDRESS_WHITESPACE: WHITESPACE -> popMode, popMode, type(TEXT);
    ADDRESS_NEWLINE: NEWLINE -> popMode, popMode, type(NEW_LINE);

mode DURATION_MODE;
    DAYS: DIGIT+ 'd';
    HOURS: DIGIT+ 'h';
    MINUTES: DIGIT+ 'm';
    DURATION_WHITESPACE: WHITESPACE -> popMode, popMode, type(TEXT);

mode COMMENT_MODE;
    COMMENT: ~[\r\n]+ -> channel(COMMENT_CHANNEL);
    END_OF_COMMENT: ([\r\n]+ | EOF) -> channel(COMMENT_CHANNEL), popMode;


