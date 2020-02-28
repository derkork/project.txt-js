parser grammar ProjectTxtParser;

options {   tokenVocab = ProjectTxtLexer; }

project : entry+;

entry : taskEntry | personEntry;
personEntry: PERSON_START personContent;
personContent: (tag | label |id | email | TEXT | NEW_LINE | DOUBLE_COLON )+;
email: INSTRUCTION EMAIL ADDRESS;

taskEntry: taskState taskContent;
taskState: (TASK_STATE_OPEN | TASK_STATE_DONE | TASK_STATE_IN_PROGRESS | TASK_STATE_ON_HOLD | TASK_STATE_MILESTONE);
taskContent: (tag | label | id | dependency | assignment | dueDate | effort | doDate | startDate | TEXT | NEW_LINE | DOUBLE_COLON )+;

effort: INSTRUCTION EFFORT duration;
doDate: INSTRUCTION SCHEDULE date;
dueDate: INSTRUCTION DUE date;
startDate: INSTRUCTION START date;

duration: (days|hours|minutes)+;
days: AMOUNT DAY;
hours: AMOUNT HOUR;
minutes: AMOUNT MINUTE;

date: YEAR HYPHEN MONTH_OR_DAY HYPHEN MONTH_OR_DAY;

id: INSTRUCTION idDefinition;
idDefinition: IDREF IDENTIFIER;

tag: INSTRUCTION tagDefinition;
tagDefinition: LABELREF IDENTIFIER;

label: INSTRUCTION labelDefinition;
labelDefinition: LABELREF IDENTIFIER SEPARATOR IDENTIFIER;

dependency: INSTRUCTION DEPENDENCY ( idDefinition | tagDefinition | labelDefinition );
assignment: INSTRUCTION ASSIGNMENT ( idDefinition | tagDefinition | labelDefinition);