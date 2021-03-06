import {AbstractParseTreeVisitor, TerminalNode} from "antlr4ts/tree";
import {Project} from "./Project";
import {ProjectTxtParserVisitor} from "./parser/ProjectTxtParserVisitor";
import {Person} from "./Person";
import {Task, TaskState} from "./Task";
import {TreeElement} from "./TreeElement";
import {
    combinePersonMatchers,
    combineTaskMatchers,
    matchPersonById,
    matchPersonByLabel,
    matchPersonByTag,
    matchTaskById, matchTaskByIndex,
    matchTaskByLabel,
    matchTaskByTag
} from "./ElementMatchers";

import {
    DateContext,
    EmailContext,
    EntryContext,
    IdContext,
    LabelContext,
    PersonEntryContext,
    ProjectContext,
    TagContext,
    TaskContentContext,
    TaskEntryContext,
    TaskStateContext
} from "./parser/ProjectTxtParser";
import {ParserRuleContext} from "antlr4ts";
import {ProjectTxtLexer} from "./parser/ProjectTxtLexer";
import parseISO from 'date-fns/parseISO';
import isValid from 'date-fns/isValid';
import IndexTracker from "./IndexTracker";
import {Effort} from "./Effort";

/**
 * Helper for representing text content as a first and a last part.
 */
class TextContent {
    first: string | undefined;
    last: string | undefined;

    constructor(first: string | undefined, last: string | undefined) {
        this.first = first;
        this.last = last;
    }
}

/**
 * Visitor which runs the AST and produces a model of the parsed file.
 */
export class TreeVisitor
    extends AbstractParseTreeVisitor<TreeElement>
    implements ProjectTxtParserVisitor<TreeElement> {

    public defaultResult(): TreeElement {
        return new TreeElement("invalid");
    }


    public visitProject(ctx: ProjectContext): TreeElement {
        const indexTracker = new IndexTracker();

        const projectElements = ctx.entry()
            .map(value => TreeVisitor.visitEntry(indexTracker, value));

        const people = projectElements
            .filter(it => it.element instanceof Person)
            .map(it => it.element as Person);

        const tasks = projectElements
            .filter(it => it.element instanceof Task)
            .map(it => it.element as Task);

        return new TreeElement(new Project(people, tasks));
    }

    private static visitEntry(indexTracker:IndexTracker, ctx: EntryContext): TreeElement {


        let personEntry = ctx.personEntry();
        if (personEntry) {
            return TreeVisitor.visitPersonEntry(indexTracker.getAndAdd(Person), personEntry);
        }
        let taskEntry = ctx.taskEntry();
        if (taskEntry) {
            return TreeVisitor.visitTaskEntry(indexTracker.getAndAdd(Task), taskEntry);
        }

        return new TreeElement("Error");
    }

    /**
     * Visits a task entry and creates a tree element containing a <code>Task</code> object.
     */
    private static visitTaskEntry(index:number, ctx: TaskEntryContext): TreeElement {
        let taskContent = ctx.taskContent();
        let state = TreeVisitor.visitForTaskState(ctx.taskState());

        let id = TreeVisitor.visitForId(taskContent);
        let tags = TreeVisitor.visitForTags(taskContent);
        let labels = TreeVisitor.visitForLabels(taskContent);
        let text = TreeVisitor.visitForText(taskContent);
        let dependencies = TreeVisitor.visitForDependencies(index, taskContent);
        let assignments = TreeVisitor.visitForAssignments(taskContent);
        let dueDate = TreeVisitor.visitForDueDate(taskContent);
        let doDate = TreeVisitor.visitForDoDate(taskContent);
        let startDate = TreeVisitor.visitForStartDate(taskContent);
        let effort = TreeVisitor.visitForEffort(taskContent);


        return new TreeElement(new Task(
            index,
            ctx._start.line,
            id,
            text.last,
            tags,
            labels,
            state,
            text.first,
            dependencies,
            assignments,
            dueDate,
            doDate,
            startDate,
            effort
        ));
    }


    /**
     * Visits a person entry and creates a tree element containing a <code>Person</code> object.
     */
    private static visitPersonEntry(index:number, ctx: PersonEntryContext): TreeElement {
        let personContent = ctx.personContent();

        let id = TreeVisitor.visitForId(personContent);
        let tags = TreeVisitor.visitForTags(personContent);
        let labels = TreeVisitor.visitForLabels(personContent);
        let text = TreeVisitor.visitForText(personContent);
        let emailAddress = TreeVisitor.visitForEmail(personContent);

        return new TreeElement(
            new Person(
                index,
                ctx._start.line,
                id,
                text.last,
                tags,
                labels,
                text.first,
                emailAddress
            )
        );
    }

    /**
     * Visits the given context and searches for an email instruction.
     */
    private static visitForEmail(ctx: ParserRuleContext): string | undefined {
        let emails = ctx.getRuleContexts<EmailContext>(EmailContext);
        if (emails.length > 0) {
            // TODO: +error-handling we notify the user about multiple email addresses
            return emails[0].ADDRESS().text;
        }
        return undefined;
    }

    /**
     * Visits the given context and searches for an ID instruction.
     */
    private static visitForId(ctx: ParserRuleContext): string | undefined {
        let ids = ctx.getRuleContexts<IdContext>(IdContext);
        if (ids.length > 0) {
            // TODO: +error-handling we notify the user about multiple ids
            return ids[0].idDefinition().IDENTIFIER().text;
        }
        return undefined;
    }


    /**
     * Visits the given context and searches for defined tags returning them as a set of strings. Duplicate tags will
     * automatically be filtered.
     */
    private static visitForTags(ctx: ParserRuleContext): Set<string> {
        return new Set<string>(ctx
            .getRuleContexts<TagContext>(TagContext)
            .map(it => it.tagDefinition().IDENTIFIER().text)
        )
    }

    /**
     * Visits the given context and searches for defined labels returning them as a map of strings to a set of strings.
     * Duplicates will be automatically filtered.
     */
    private static visitForLabels(ctx: ParserRuleContext): Map<string, Set<string>> {
        let result = new Map<string, Set<string>>();

        let labelContexts = ctx.getRuleContexts<LabelContext>(LabelContext);
        for (let labelContext of labelContexts) {
            let key = labelContext.labelDefinition().IDENTIFIER(0).text;
            let value = labelContext.labelDefinition().IDENTIFIER(1).text;
            let set = result.get(key);

            if (!set) {
                set = new Set<string>();
                result.set(key, set);
            }

            set.add(value);
        }

        return result;
    }

    /**
     * Returns the entire text content of the node split into a first
     * and last section. Everything coming before a newline or any non-terminal
     * child is put into the first section, the rest is put into the last section.
     */
    private static visitForText(ctx: ParserRuleContext): TextContent {
        let count = ctx.childCount;
        let first = "";
        let last = "";
        let firstIsDone = false;
        for (let i = 0; i < count; i++) {
            let child = ctx.getChild(i);
            if (child instanceof TerminalNode) {
                if (child.symbol.type === ProjectTxtLexer.TEXT) {
                    const text = child.text;
                    if (firstIsDone) {
                        last += text;
                    } else {
                        first += text;
                    }
                } else if (child.symbol.type === ProjectTxtLexer.NEW_LINE) {
                    firstIsDone = true;
                    last += child.text;
                } else if (child.symbol.type === ProjectTxtLexer.INSTRUCTION_ESCAPE) {
                    const text = '^';
                    if (firstIsDone) {
                        last += text;
                    }
                    else {
                        first += text;
                    }
                }
                else {
                    // this actually should not happen
                    // TODO: +refactor decide for some error handling strategy.
                }
            } else {
                firstIsDone = true;
            }
        }
        return new TextContent(first, last);
    }

    /**
     * Returns a task state enum for the given task state context.
     */
    private static visitForTaskState(ctx: TaskStateContext): TaskState {
        if (ctx.TASK_STATE_DONE()) {
            return TaskState.Done;
        }
        if (ctx.TASK_STATE_IN_PROGRESS()) {
            return TaskState.InProgress;
        }
        if (ctx.TASK_STATE_MILESTONE()) {
            return TaskState.Milestone;
        }
        if (ctx.TASK_STATE_ON_HOLD()) {
            return TaskState.OnHold;
        }
        // everything else is just treated as OPEN.
        return TaskState.Open;
    }

    /**
     * Returns a function that can resolve the task's dependencies as indicated by
     * the task content. Returns undefined if the task has no declared dependencies.
     */
    private static visitForDependencies(taskIndex:number, ctx: TaskContentContext): ((task: Task) => boolean) | undefined {
        let dependencies = ctx.dependency();
        if (dependencies.length === 0) {
            return undefined;
        }

        return combineTaskMatchers(
            // walk over all dependency declarations create a matcher for each
            dependencies.map(it => {
                let idDefinition = it.idDefinition();
                if (idDefinition) {
                    return matchTaskById(idDefinition.IDENTIFIER().text)
                }

                let tagDefinition = it.tagDefinition();
                if (tagDefinition) {
                    return matchTaskByTag(tagDefinition.IDENTIFIER().text);
                }

                let labelDefinition = it.labelDefinition();
                if (labelDefinition) {
                    return matchTaskByLabel(labelDefinition.IDENTIFIER()[0].text, labelDefinition.IDENTIFIER()[1].text);
                }

                let previousTaskDefinition = it.previousTask();
                if (previousTaskDefinition) {
                    return matchTaskByIndex(taskIndex - 1);
                }

                // TODO: +error-handling
                return () => false;
            })
        ); // the 'any' combines all created matchers into a single matcher.
    }

    /**
     * Returns a function that can resolve the task's dependencies as indicated by
     * the task content. Returns undefined if the task has no declared dependencies.
     */
    private static visitForAssignments(ctx: TaskContentContext): ((person: Person) => boolean) | undefined {
        let assignments = ctx.assignment();
        if (assignments.length === 0) {
            return undefined;
        }

        return combinePersonMatchers(
            // walk over all dependency declarations create a matcher for each
            assignments.map(it => {
                let idDefinition = it.idDefinition();
                if (idDefinition) {
                    return matchPersonById(idDefinition.IDENTIFIER().text)
                }

                let tagDefinition = it.tagDefinition();
                if (tagDefinition) {
                    return matchPersonByTag(tagDefinition.IDENTIFIER().text);
                }

                let labelDefinition = it.labelDefinition();
                if (labelDefinition) {
                    return matchPersonByLabel(labelDefinition.IDENTIFIER()[0].text, labelDefinition.IDENTIFIER()[1].text);
                }

                // TODO: +error-handling
                return () => false;
            })
        ); // the 'any' combines all created matchers into a single matcher.
    }

    /**
     * Returns a date at which the task is due as indicated by the due instruction of the task.
     */
    private static visitForDueDate(ctx: TaskContentContext): Date | undefined {
        let dueContexts = ctx.dueDate();
        if (dueContexts.length === 0) {
            return undefined;
        }

        // todo: +error-handling report if there is more than one due date set.
        return this.visitForDate(dueContexts[0].date());
    }

    /**
     * Returns a date at which the task is planned to be done as indicated by the do instruction of the task.
     */
    private static visitForDoDate(ctx: TaskContentContext): Date | undefined {
        let scheduleContexts = ctx.doDate();
        if (scheduleContexts.length === 0) {
            return undefined;
        }

        // todo: +error-handling report if there is more than one do date set.
        return this.visitForDate(scheduleContexts[0].date());
    }

    /**
     * Returns a date at which the task can start at the earliest as indicated by the start instruction of the task.
     */
    private static visitForStartDate(ctx: TaskContentContext): Date | undefined {
        let startContexts = ctx.startDate();
        if (startContexts.length === 0) {
            return undefined;
        }

        // todo: +error-handling report if there is more than one start date set.
        return this.visitForDate(startContexts[0].date());
    }


    /**
     * Tries to parse a date from the given date context. If it is not parsable returns undefined, otherwise a Moment.
     */
    private static visitForDate(dateContext: DateContext): Date | undefined {
        const dateString = dateContext.text;

        const date = parseISO(dateString);
        if (isValid(date)) {
            return date;
        }

        // todo: +error-handling report invalid date
        return undefined;
    }

    /**
     * Returns an effort estimation of the task as indicated by the effort instruction.
     */
    private static visitForEffort(ctx: TaskContentContext): Effort | undefined {
        const effortContexts = ctx.effort();
        if (effortContexts.length === 0) {
            return undefined;
        }

        // todo: +error-handling handle duplicate effort estimation
        const effortContext = effortContexts[0];

        let days = 0;
        let hours = 0;
        let minutes = 0;
        const daysContexts = effortContext.duration().days();
        if (daysContexts.length !== 0) {
            // todo: +error handling duplicate days
            days = parseInt(daysContexts[0].AMOUNT().text);
        }

        const hoursContexts = effortContext.duration().hours();
        if (hoursContexts.length !== 0) {
            // todo: +error handling duplicate hours
            hours = parseInt(hoursContexts[0].AMOUNT().text);
        }

        const minutesContexts = effortContext.duration().minutes();
        if (minutesContexts.length !== 0) {
            // todo: +error handling duplicate minutes
            minutes = parseInt(minutesContexts[0].AMOUNT().text);
        }

        return new Effort(
            days,
            hours,
            minutes
        );
    }
}