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


    constructor(date: Date,
                hashUnknowns: boolean) {
        this.date = date;
        this.hasUnknowns = hashUnknowns;
    }

    isAfterOrEqualTo(other: FinishDate): boolean {
        return !isBefore(this.date, other.date);
    }
}