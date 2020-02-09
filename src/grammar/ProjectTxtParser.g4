parser grammar ProjectTxtParser;


options {   tokenVocab = ProjectTxtLexer; }

project : entry+;

entry : taskEntry | personEntry;
personEntry: PERSON_START personContent;
personContent: (tag | label |id | email | TEXT | NEW_LINE | DOUBLE_COLON )+;
email: INSTRUCTION EMAIL ADDRESS;


taskEntry: taskState taskContent;
taskState: (TASK_STATE_OPEN | TASK_STATE_DONE | TASK_STATE_IN_PROGRESS | TASK_STATE_MILESTONE);
taskContent: (tag | label | id | dependency | assignment | due | estimation | schedule | TEXT | NEW_LINE | DOUBLE_COLON )+;

estimation: INSTRUCTION ESTIMATION duration;
schedule: INSTRUCTION SCHEDULE date;
due: INSTRUCTION DUE date;

duration: (DAYS|HOURS|MINUTES)+;
date: YEAR HYPHEN MONTH_OR_DAY HYPHEN MONTH_OR_DAY;

id: INSTRUCTION idDefinition;
idDefinition: IDREF IDENTIFIER;

tag: INSTRUCTION tagDefinition;
tagDefinition: LABELREF IDENTIFIER;

label: INSTRUCTION labelDefinition;
labelDefinition: LABELREF IDENTIFIER SEPARATOR IDENTIFIER;

dependency: INSTRUCTION DEPENDENCY ( idDefinition | tagDefinition | labelDefinition );
assignment: INSTRUCTION ASSIGNMENT idDefinition;