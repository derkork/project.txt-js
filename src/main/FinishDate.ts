import isBefore from 'date-fns/isBefore';

export class FinishDate {
    /**
     * The date when this task will be finished.
     */
    readonly date: Date;

    /**
     * If the task or any of its dependencies has no effort specification then this is true, otherwise
     * this is false.
     */
    readonly hasUnknowns: boolean;

    /**
     * If the task's projected finish date is after the due date then this is true, otherwise this is false.
     */
    readonly cannotFinishInTime: boolean;


    constructor(date: Date,
                hasUnknowns: boolean,
                cannotFinishInTime: boolean) {
        this.date = date;
        this.hasUnknowns = hasUnknowns;
        this.cannotFinishInTime = cannotFinishInTime;
    }

    isAfterOrEqualTo(other: FinishDate): boolean {
        return !isBefore(this.date, other.date);
    }
}