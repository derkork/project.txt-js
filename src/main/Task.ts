/**
 * The states of a task.
 */
import {Person} from "./Person";
import {Entry} from "./Entry";

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
    readonly state:TaskState;

    /**
     * A selector function which determines if the given
     * task is a prerequisite for this task.
     */
    readonly dependencies: ((task: Task) => boolean) | undefined;

    /**
     * An indicator whether or not this task has any expressed dependencies.
     * This is mainly there in order to avoid needless computation cycles
     * if this task has not expressed any dependencies to other tasks.
     */
    readonly hasDependencies: boolean;

    /**
     * A selector function which determines if the given person
     * is assigned to this task.
     */
    readonly assignments: ((person: Person) => boolean) | undefined;

    /**
     * An indicator whether or not this task has any expressed assignments.
     * This is mainly there in order to avoid needles computation cycles if
     * this task has not expressed any assignments.
     */
    readonly hasAssignments: boolean;

    constructor(id: string | undefined = undefined,
                notes: string | undefined = undefined,
                tags: Set<string> = new Set<string>(),
                labels: Map<string, Set<string>> = new Map<string, Set<string>>(),
                state: TaskState = TaskState.Open,
                title: string | undefined = undefined,
                dependencies: ((task: Task) => boolean) | undefined = undefined,
                assignments: ((person: Person) => boolean) | undefined = undefined) {
        super(id, notes, tags, labels);

        this.state = state;
        this.title = title;
        this.dependencies = dependencies;
        this.hasDependencies = dependencies !== undefined;

        this.assignments = assignments;
        this.hasAssignments = assignments !== undefined;
    }
}