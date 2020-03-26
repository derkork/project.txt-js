/**
 * The states of a task.
 */
import {Person} from "./Person";
import {Entry} from "./Entry";
import {Effort} from "./Effort";

/**
 * The state of a task as it is declared in the project file.
 */
export enum TaskState {
    /**
     * The task is not yet done and not started.
     */
    Open = 1,
    /**
     * Work on the task has started but it is not yet done.
     */
    InProgress,
    /**
     * The task is done.
     */
    Done,
    /**
     * The task is on hold, probably for some external reason.
     */
    OnHold,
    /**
     * The task is representing a milestone.
     */
    Milestone
}

/**
 * This represents a task.
 */
export class Task extends Entry {
    /**
     * The title of a task.
     */
    readonly title: string | undefined;

    /**
     * The state of this task.
     */
    readonly state: TaskState;

    /**
     * A selector function which determines if the given
     * task is a prerequisite for this task. If this task has no dependencies
     * this function is undefined.
     */
    readonly dependencies: ((task: Task) => boolean) | undefined;

    /**
     * A selector function which determines if the given person
     * is assigned to this task.
     */
    readonly assignments: ((person: Person) => boolean) | undefined;

    /**
     * A date when the task is due in the local timezone.
     */
    readonly dueDate: Date | undefined;

    /**
     * A date when the task is scheduled in the local timezone.
     */
    readonly doDate: Date | undefined;

    /**
     * A date when the task can start at the earliest in the local timezone.
     */
    readonly startDate: Date | undefined;

    /**
     * An estimation of how long the task may need to finish.
     */
    readonly effort: Effort | undefined;

    constructor(index:number,
                lineNumber: number,
                id: string | undefined = undefined,
                notes: string | undefined = undefined,
                tags: Set<string> = new Set<string>(),
                labels: Map<string, Set<string>> = new Map<string, Set<string>>(),
                state: TaskState = TaskState.Open,
                title: string | undefined = undefined,
                dependencies: ((task: Task) => boolean) | undefined = undefined,
                assignments: ((person: Person) => boolean) | undefined = undefined,
                dueDate: Date | undefined,
                doDate: Date | undefined,
                startDate: Date | undefined,
                effort: Effort | undefined ) {
        super(index, lineNumber, id, notes, tags, labels);

        this.state = state;
        this.title = title;
        this.dependencies = dependencies;
        this.assignments = assignments;
        this.dueDate = dueDate;
        this.doDate = doDate;
        this.startDate = startDate;
        this.effort = effort;
    }
}