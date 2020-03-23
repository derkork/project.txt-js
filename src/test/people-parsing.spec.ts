// @ts-ignore
import {parseProject} from './test-helpers';


describe("parsing people", () => {
    it.each([
            "+ John Doe :#john works on the project",
            "+ John Doe \r\n works on the project"
        ]
    )("correctly splits name and notes on newline for persons", (input: string) => {
        let project = parseProject(input);
        let person = project.persons[0];

        expect(person.name).toContain("John Doe");
        expect(person.name).not.toContain("works on the project");

        expect(person.notes).toContain("works on the project");
        expect(person.notes).not.toContain("John Doe");
    });

    it("correctly parses tags for persons", () => {
        let input = "+ some person :@tag1 :@tag2";

        let project = parseProject(input);
        let person = project.persons[0];

        expect(person.tags.size).toBe(2);
        expect(person.tags).toContain("tag1");
        expect(person.tags).toContain("tag2")
    });

    it("assigns indices to persons", () => {
        const input =
            "+ another person\n"+
            "[ ] some task\n" +
            "+  some person \n" +
            "[ ] some other task";
        const project = parseProject(input);
        const [person1, person2] = project.persons;

        expect(person1.index).toBe(0);
        expect(person2.index).toBe(1);
    });


    it("correctly parses ids for persons", () => {
        const input = "+ some person :#person";

        const project = parseProject(input);
        const person = project.persons[0];

        expect(person.id).toBe("person");
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
    });
});

