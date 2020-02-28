// @ts-ignore
import {parseProject} from './test-helpers';
import {TaskState} from "../main";


describe("parsing tasks", () => {
    it.each([
            "[ ] This is a task :#task It has notes.",
            "[ ] This is a task\nIt has notes."
        ]
    )("correctly splits title and notes on newline or first instruction", (input: string) => {
        const project = parseProject(input);
        const task = project.tasks[0];

        expect(task.title).toContain("This is a task");
        expect(task.title).not.toContain("It has notes.");

        expect(task.notes).toContain("It has notes.");
        expect(task.notes).not.toContain("This is a task");
    });

    it("correctly parses tags for tasks", () => {
        const input = "[ ] some task :@tag1 :@tag2";

        const project = parseProject(input);
        const task = project.tasks[0];

        expect(task.tags.size).toBe(2);
        expect(task.tags).toContain("tag1");
        expect(task.tags).toContain("tag2")
    });

    it("correctly parses labels for tasks", () => {
        const input = "[ ] some task :@label1:value1 :@label1:value2 :@label2:value1";
        const project = parseProject(input);
        const task = project.tasks[0];

        expect(task.labels.size).toBe(2);
        expect(task.labels.keys()).toContain("label1");
        expect(task.labels.keys()).toContain("label2");

        const valuesOfLabel1 = task.labels.get("label1");

        expect(valuesOfLabel1?.size).toBe(2);
        expect(valuesOfLabel1).toContain("value1");
        expect(valuesOfLabel1).toContain("value2");

        const valuesOfLabel2 = task.labels.get("label2");
        expect(valuesOfLabel2?.size).toBe(1);
        expect(valuesOfLabel2).toContain("value1");
    });

    it("correctly parses due dates for tasks", () => {
        const input = "[ ] some task :!2020-10-10";

        const project = parseProject(input);
        const task = project.tasks[0];

        expect(task.dueDate).toBeDefined();
        expect(task.dueDate?.format("YYYY-MM-DD")).toBe("2020-10-10");

    });

    it("correctly parses do dates for tasks", () => {
        const input = "[ ] some task :+2020-10-10";

        const project = parseProject(input);
        const task = project.tasks[0];

        expect(task.doDate).toBeDefined();
        expect(task.doDate?.format("YYYY-MM-DD")).toBe("2020-10-10");
    });

    it("correctly parses start dates for tasks", () => {
        const input = "[ ] some task :*2020-10-10";

        const project = parseProject(input);
        const task = project.tasks[0];

        expect(task.startDate).toBeDefined();
        expect(task.startDate?.format("YYYY-MM-DD")).toBe("2020-10-10");
    });

    it("correctly parses effort for tasks", () => {
        const input = "[ ] some task :~1d2h4m";

        const project = parseProject(input);
        const task = project.tasks[0];

        expect(task.effort).toBeDefined();
        expect(task.effort?.asSeconds()).toBe(24 * 3600 + 2 * 3600 + 4 * 60);
    });


    it("correctly parses ids for tasks", () => {
        const input = "[ ] some task :#tsk1";

        const project = parseProject(input);
        const task = project.tasks[0];

        expect(task.id).toBe("tsk1");
    });


    it("correctly parses dependencies using an ID", () => {
        const input =
            "[ ] some task :#tsk1\n" +
            "[ ] some other task :<#tsk1";

        const project = parseProject(input);
        const [firstTask, secondTask] = project.tasks;

        expect(firstTask.dependencies).toBeUndefined();
        expect(secondTask.dependencies).toBeDefined();

        expect(secondTask.dependencies!(firstTask)).toBe(true);

    });

    it("correctly parses dependencies using a tag", () => {
        const input =
            "[ ] some task :@tag\n" +
            "[ ] yet another task\n" +
            "[ ] some other task :<@tag";

        const project = parseProject(input);
        const [firstTask, secondTask, thirdTask] = project.tasks;

        expect(firstTask.dependencies).toBeUndefined();
        expect(secondTask.dependencies).toBeUndefined();
        expect(thirdTask.dependencies).toBeDefined();

        expect(thirdTask.dependencies!(firstTask)).toBe(true);
        expect(thirdTask.dependencies!(secondTask)).toBe(false);

    });

    it("correctly parses dependencies using a label", () => {
        const input =
            "[ ] some task :@foo:bar\n" +
            "[ ] yet another task :@foo:bar\n" +
            "[ ] some other task :<@foo:bar";

        const project = parseProject(input);
        const [firstTask, secondTask, thirdTask] = project.tasks;

        expect(firstTask.dependencies).toBeUndefined();
        expect(secondTask.dependencies).toBeUndefined();
        expect(thirdTask.dependencies).toBeDefined();

        expect(thirdTask.dependencies!(firstTask)).toBe(true);
        expect(thirdTask.dependencies!(secondTask)).toBe(true);
    });

    it("correctly parses mixed dependencies", () => {
        const input =
            "[ ] some task :@foo\n" +
            "[ ] yet another task :<@foo :#tsk1\n" +
            "[ ] some other task :<@foo :<#tsk1";

        const project = parseProject(input);
        const [firstTask, secondTask, thirdTask] = project.tasks;

        expect(firstTask.dependencies).toBeUndefined();
        expect(secondTask.dependencies).toBeDefined();
        expect(thirdTask.dependencies).toBeDefined();

        expect(secondTask.dependencies!(firstTask)).toBeTruthy();
        expect(secondTask.dependencies!(thirdTask)).toBeFalsy();

        expect(thirdTask.dependencies!(firstTask)).toBeTruthy();
        expect(thirdTask.dependencies!(secondTask)).toBeTruthy();
    });

    it("correctly parses assigments with ids", () => {
        const input =
            "+ Jeff :#jeff\n" +
            "[ ] Task for Jeff :>#jeff\n";

        const project = parseProject(input);
        const task = project.tasks[0];
        const person = project.persons[0];

        expect(task.assignments).toBeDefined();
        expect(task.assignments!(person)).toBeTruthy();
    });

    it("correctly parses assigments with tags", () => {
        const input =
            "+ Jeff :@tag\n" +
            "[ ] Task for Jeff :>@tag\n";

        const project = parseProject(input);
        const task = project.tasks[0];
        const person = project.persons[0];

        expect(task.assignments).toBeDefined();
        expect(task.assignments!(person)).toBeTruthy();
    });

    it("correctly parses assigments with labels", () => {
        const input =
            "+ Jeff :@team:red\n" +
            "+ Josh :@team:blue\n" +
            "[ ] Task for team red :>@team:red\n";

        const project = parseProject(input);
        const task = project.tasks[0];
        const [person1, person2] = project.persons;

        expect(task.assignments).toBeDefined();
        expect(task.assignments!(person1)).toBeTruthy();
        expect(task.assignments!(person2)).toBeFalsy();
    });

    it.each([
        ["[ ] open task", TaskState.Open],
        ["[x] done task", TaskState.Done],
        ["[m] milestone task", TaskState.Milestone],
        ["[M] milestone task", TaskState.Milestone],
        ["[!] on-hold task", TaskState.OnHold],
        ["[>] in-progress task", TaskState.InProgress],
        ]
    )("correctly parses task states: %s => %s", (input:string, expected:TaskState) => {
        const task = parseProject(input).tasks[0];

        expect(task.state).toBe(expected);
    });


});

