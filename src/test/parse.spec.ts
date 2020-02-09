import {parse, Project} from "../main";

function parseProject(input: string): Project {
    let project = parse(input)?.project;
    expect(project).toBeDefined();
    return project;
}

describe("parsing", () => {
    it("parses stuff", () => {
        let input = "[ ] some task\n[ ] some other task\n+ some person";
        let project = parseProject(input);

        expect(project.tasks).toHaveLength(2);
        expect(project.persons).toHaveLength(1);
    });

    it.each([
            "+ John Doe :#john works on the project",
            "+ John Doe \r\n works on the project"
        ]
    )("correctly splits name and notes on newline", (input: string) => {
        let project = parseProject(input);
        let person = project.persons[0];

        expect(person.name).toContain("John Doe");
        expect(person.name).not.toContain("works on the project");

        expect(person.notes).toContain("works on the project");
        expect(person.notes).not.toContain("John Doe");
    });

    it("correctly parses tags for persons", () => {
        let input = "+ some person :@tag1 :@tag2"

        let project = parseProject(input);
        let person = project.persons[0];

        expect(person.tags.size).toBe(2);
        expect(person.tags).toContain("tag1")
        expect(person.tags).toContain("tag2")
    });

    it("correctly parses labels for persons", () => {
        let input = "+ some person :@label1:value1 :@label1:value2 :@label2:value1";
        let project = parseProject(input);
        let person = project.persons[0];

        expect(person.labels.size).toBe(2);
        expect(person.labels.keys()).toContain("label1");
        expect(person.labels.keys()).toContain("label2");

        let valuesOfLabel1 = person.labels.get("label1");

        expect(valuesOfLabel1?.size).toBe(2);
        expect(valuesOfLabel1).toContain("value1");
        expect(valuesOfLabel1).toContain("value2");

        let valuesOfLabel2 = person.labels.get("label2");
        expect(valuesOfLabel2?.size).toBe(1);
        expect(valuesOfLabel2).toContain("value1");
    })
});

