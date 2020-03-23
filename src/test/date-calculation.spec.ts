// @ts-ignore
import {parseProject} from './test-helpers';
import {calculateDependencies, TaskState} from "../main";
import isSameDay from 'date-fns/isSameDay';
import differenceInCalendarDays from 'date-fns/differenceInCalendarDays';
import {ProjectCalculationSettings} from "../main/ProjectCalculationSettings";


describe("calculating task finish dates", () => {
    it("calculates proper date if no dependencies are set", () => {
        const input =
            "[ ] some task\n" +
            "[ ] some other task";
        const project = parseProject(input);
        const dependencies = calculateDependencies(project, ProjectCalculationSettings.default());


        const now = new Date();
        const firstFinishDate = dependencies.getFinishDate(project.tasks[0]);
        const secondFinishDate = dependencies.getFinishDate(project.tasks[1]);

        expect(isSameDay(firstFinishDate.date, now)).toBeTruthy();
        expect(isSameDay(secondFinishDate.date, now)).toBeTruthy();

        expect(firstFinishDate.hasUnknowns).toBeTruthy();
        expect(secondFinishDate.hasUnknowns).toBeTruthy();
    });

    it("calculates finish date for dependent tasks", () => {
        const input =
            "[ ] some task :~3d \n" +
            "[ ] some other task :~3d :<<";

        const project = parseProject(input);
        const dependencies = calculateDependencies(project, ProjectCalculationSettings.default());

        // these two tasks should always have a weekend in-between, so the finish date of the second
        // one should always be at least 8 days away (6 days time + 2 days weekend in between)
        const now = new Date();
        const secondFinishDate = dependencies.getFinishDate(project.tasks[1]);

        expect(differenceInCalendarDays(secondFinishDate.date, now)).toBeGreaterThan(7);
        expect(secondFinishDate.hasUnknowns).toBeFalsy();
    });



});

