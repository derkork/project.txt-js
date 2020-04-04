// @ts-ignore
import {parseProject} from './test-helpers';
import {calculateDependencies} from "../main";
import isSameDay from 'date-fns/isSameDay';
import differenceInCalendarDays from 'date-fns/differenceInCalendarDays';
import {ProjectCalculationSettings} from "../main";


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

    it("properly handles uncertainty in task chains", () => {
        const input = "[ ] task without effort :#t1\n" +
            "[ ] task with effort :~2d :#t2\n" +
            "[ ] task depending on the other ones :~2d :<#t1 :<#t2";

        const project = parseProject(input);
        const dependencies = calculateDependencies(project, ProjectCalculationSettings.default());

        const [task1, task2, task3] = project.tasks;
        expect(dependencies.getFinishDate(task1).hasUnknowns).toBeTruthy();
        expect(dependencies.getFinishDate(task2).hasUnknowns).toBeFalsy();
        expect(dependencies.getFinishDate(task3).hasUnknowns).toBeTruthy();

    });

    it("marks finished tasks as having a certain end date", () => {
        const input = "[x] task 1 \n" +
            "[x] task 2 :<<\n" +
            "[ ] task 3 :~2d :<<";

        const project = parseProject(input);
        const dependencies = calculateDependencies(project, ProjectCalculationSettings.default());

        const [task1, task2, task3] = project.tasks;
        expect(dependencies.getFinishDate(task1).hasUnknowns).toBeFalsy();
        expect(dependencies.getFinishDate(task2).hasUnknowns).toBeFalsy();
        expect(dependencies.getFinishDate(task3).hasUnknowns).toBeFalsy();

    })

});

