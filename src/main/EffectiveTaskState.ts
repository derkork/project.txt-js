export enum EffectiveTaskState {
    /**
     * The task is not yet done and not started, but can be worked on.
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
     * The prerequisites of this task are not yet finished and the task is not actionable right now.
     */
    Blocked
}