// @ts-ignore
import {parseProject} from './test-helpers';
import {calculateDependencies} from "../main";
import {ProjectCalculationSettings} from "../main/ProjectCalculationSettings";

describe("calculating dependencies", () => {

    it("properly calculates dependencies", () => {
        const input =
            "[ ] this is a task :#id1 :@tagged\n" +
            "[ ] this is another task :<#id1 :@tagged\n" +
            "[ ] this is a third task :<@tagged\n" +
            "[ ] this is a fourth task :@label:value\n" +
            "[ ] this is a fifth task :<@label:value";

        const project = parseProject(input);
        const dependencies = calculateDependencies(project, ProjectCalculationSettings.default());

        const [task1, task2, task3, task4, task5] = project.tasks;


        const task1Prerequisites = dependencies.getPrerequisites(task1);
        expect(task1Prerequisites).toHaveLength(0);

        const task2Prerequisites = dependencies.getPrerequisites(task2);
        expect(task2Prerequisites).toHaveLength(1);
        expect(task2Prerequisites).toContain(task1);

        const task3Prerequisites = dependencies.getPrerequisites(task3);
        expect(task3Prerequisites).toHaveLength(2);
        expect(task3Prerequisites).toContain(task1);
        expect(task3Prerequisites).toContain(task2);

        const task4Prerequisites = dependencies.getPrerequisites(task4);
        expect(task4Prerequisites).toHaveLength(0);

        const task5Prerequisites = dependencies.getPrerequisites(task5);
        expect(task5Prerequisites).toHaveLength(1);
        expect(task5Prerequisites).toContain(task4);
    });
});