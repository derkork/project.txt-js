lexer grammar ProjectTxtLexer;

fragment WHITESPACE: [ \r\t\n]+;
fragment DIGIT: [0-9];

TASK_STATE_OPEN: '[ ]';
TASK_STATE_DONE: ('[x]' | '[X]');
TASK_STATE_ON_HOLD: '[!]';
TASK_STATE_IN_PROGRESS: '[>]';
TASK_STATE_MILESTONE: ('[m]' | '[M]');

PERSON_START: '+';

DOUBLE_COLON: '::';
INSTRUCTION: ':' -> pushMode(INSTRUCTION_MODE);

TEXT: ~[:+[]+;

mode INSTRUCTION_MODE;
    IDREF: '#';
    LABELREF: '@';
    DEPENDENCY: '<';
    ASSIGNMENT: '>';
    ESTIMATION: '~' -> pushMode(DURATION_MODE);
    EMAIL: '=>' -> pushMode(EMAIL_MODE);
    DUE: '!' -> pushMode(DATE_MODE);
    SCHEDULE: '?' -> pushMode(DATE_MODE);
    PLUS: '+';
    IDENTIFIER: ~[ \r\t\n:<>#@~+=!?]+;
    SEPARATOR: ':';
    INSTRUCTION_WHITESPACE: [ \r\t\n]+ -> popMode, type(TEXT);

mode DATE_MODE;
    YEAR: DIGIT DIGIT DIGIT DIGIT;
    HYPHEN: '-';
    MONTH_OR_DAY: DIGIT DIGIT?;
    DATE_WHITESPACE: WHITESPACE -> popMode, popMode, type(TEXT);

mode EMAIL_MODE;
    ADDRESS: ~[ \t\r\n]+;
    ADDRESS_WHITESPACE: WHITESPACE -> popMode, popMode, type(TEXT);

mode DURATION_MODE;
    DAYS: DIGIT+ 'd';
    HOURS: DIGIT+ 'h';
    MINUTES: DIGIT+ 'm';
    DURATION_WHITESPACE: WHITESPACE -> popMode, popMode, type(TEXT);




