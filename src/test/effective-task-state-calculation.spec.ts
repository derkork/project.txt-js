// @ts-ignore
import {parseProject} from './test-helpers';
import {calculateDependencies} from "../main";
import {ProjectCalculationSettings} from '../main';
import {EffectiveTaskState} from '../main';


describe("calculating effective task states", () => {
    it("calculates proper state if no dependencies are set", () => {
        const input =
            '[ ] open task\n' +
            "[>] in progress task \n" +
            "[x] done task \n" +
            "[!] on hold task \n" +
            "[m] Milestone";
        const project = parseProject(input);
        const dependencies = calculateDependencies(project, ProjectCalculationSettings.default());

        const [task1, task2, task3, task4, task5] = project.tasks;


        expect(dependencies.getEffectiveTaskState(task1)).toBe(EffectiveTaskState.Open);
        expect(dependencies.getEffectiveTaskState(task2)).toBe(EffectiveTaskState.InProgress);
        expect(dependencies.getEffectiveTaskState(task3)).toBe(EffectiveTaskState.Done);
        expect(dependencies.getEffectiveTaskState(task4)).toBe(EffectiveTaskState.OnHold);
        expect(dependencies.getEffectiveTaskState(task5)).toBe(EffectiveTaskState.Done);
    });

    it("unfinished prerequisites block open tasks", () => {
        const input =
            "[ ] open task\n" +
            "[ ] open task :<<\n";

        const project = parseProject(input);
        const dependencies = calculateDependencies(project, ProjectCalculationSettings.default());

        const [task1, task2] = project.tasks;

        expect(dependencies.getEffectiveTaskState(task1)).toBe(EffectiveTaskState.Open);
        expect(dependencies.getEffectiveTaskState(task2)).toBe(EffectiveTaskState.Blocked);
    });

    it("finished prerequisites don't block open tasks", () => {
        const input =
            "[x] open task\n" +
            "[ ] open task :<<\n";

        const project = parseProject(input);
        const dependencies = calculateDependencies(project, ProjectCalculationSettings.default());

        const [task1, task2] = project.tasks;

        expect(dependencies.getEffectiveTaskState(task1)).toBe(EffectiveTaskState.Done);
        expect(dependencies.getEffectiveTaskState(task2)).toBe(EffectiveTaskState.Open);
    });

    it("unfinished prerequisites block milestones", () => {
        const input =
            "[ ] open task\n" +
            "[m] milestone :<<\n";

        const project = parseProject(input);
        const dependencies = calculateDependencies(project, ProjectCalculationSettings.default());

        const [task1, task2] = project.tasks;

        expect(dependencies.getEffectiveTaskState(task1)).toBe(EffectiveTaskState.Open);
        expect(dependencies.getEffectiveTaskState(task2)).toBe(EffectiveTaskState.Blocked);
    });

    it("milestones are done when all prerequisites are done", () => {
        const input =
            "[x] open task\n" +
            "[m] milestone :<<\n";

        const project = parseProject(input);
        const dependencies = calculateDependencies(project, ProjectCalculationSettings.default());

        const [task1, task2] = project.tasks;

        expect(dependencies.getEffectiveTaskState(task1)).toBe(EffectiveTaskState.Done);
        expect(dependencies.getEffectiveTaskState(task2)).toBe(EffectiveTaskState.Done);
    });

    it("effective state is recursively calculated", () => {
        const input =
            "[ ] open task\n" +
            "[m] milestone :<<\n" +
            "[m] milestone :<<\n";

        const project = parseProject(input);
        const dependencies = calculateDependencies(project, ProjectCalculationSettings.default());

        const [task1, task2, task3] = project.tasks;

        expect(dependencies.getEffectiveTaskState(task1)).toBe(EffectiveTaskState.Open);
        expect(dependencies.getEffectiveTaskState(task2)).toBe(EffectiveTaskState.Blocked);
        expect(dependencies.getEffectiveTaskState(task3)).toBe(EffectiveTaskState.Blocked);
    });

    it("effective state is recursively calculated #2", () => {
        const input =
            "[x] open task\n" +
            "[m] milestone :<<\n" +
            "[m] milestone :<<\n";

        const project = parseProject(input);
        const dependencies = calculateDependencies(project, ProjectCalculationSettings.default());

        const [task1, task2, task3] = project.tasks;

        expect(dependencies.getEffectiveTaskState(task1)).toBe(EffectiveTaskState.Done);
        expect(dependencies.getEffectiveTaskState(task2)).toBe(EffectiveTaskState.Done);
        expect(dependencies.getEffectiveTaskState(task3)).toBe(EffectiveTaskState.Done);
    });

});

