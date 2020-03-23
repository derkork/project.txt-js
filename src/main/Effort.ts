/**
 * Representation of effort required for a task as given in the task specification. This is not normalized, so hours
 * and minutes are not automatically normalized to days because how many hours are in a day may vary from project to
 * project.
 */
export class Effort {
    readonly days: number;
    readonly hours: number;
    readonly minutes: number;

    constructor(days: number, hours: number, minutes: number) {
        this.days = days;
        this.hours = hours;
        this.minutes = minutes;
    }

    /**
     * Helper
     */
    static zero() : Effort {
        return new Effort(0,0,0);
    }

}