import startOfDay from 'date-fns/startOfDay';

export class ProjectCalculationSettings {
    readonly hoursPerDay: number;
    readonly workOnWeekends: boolean;

    constructor(hoursPerDay: number,
                workOnWeekends: boolean
    ) {
        if (hoursPerDay > 24 || hoursPerDay < 1) {
            throw new Error("Hours per day needs to be between 1 and 24");
        }
        this.hoursPerDay = Math.floor(hoursPerDay);
        this.workOnWeekends = workOnWeekends;

    }

    /**
     * Returns settings for the standard eight hour work day without working weekends.
     */
    static default(): ProjectCalculationSettings {
        return new ProjectCalculationSettings(
            8,
            false
        )
    }
}