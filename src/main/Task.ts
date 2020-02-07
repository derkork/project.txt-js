/**
 * The states of a task.
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
export class Task {
    /**
     * The ID of a task.
     */
    readonly id: string | undefined;

    /**
     * The title of a task.
     */
    readonly title: string | undefined;

    /**
     * Notes attached to a task.
     */
    readonly notes: string | undefined;


    constructor(id: string | undefined = undefined, title: string | undefined = undefined, notes: string | undefined = undefined) {
        this.id = id;
        this.title = title;
        this.notes = notes;
    }
}