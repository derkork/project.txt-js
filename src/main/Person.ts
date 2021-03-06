import {Entry} from "./Entry";

/**
 * A person who works on a project.
 */
export class Person extends Entry {
    /**
     * The name of the person.
     */
    readonly name: string | undefined;

    /**
     * The email address of the person.
     */
    readonly emailAddress: string | undefined;

    constructor(
        index: number,
        lineNumber: number,
        id: string | undefined = undefined,
        notes: string | undefined = undefined,
        tags: Set<string> = new Set<string>(),
        labels: Map<string, Set<string>> = new Map<string, Set<string>>(),
        name: string | undefined,
        emailAddress: string | undefined
    ) {
        super(index, lineNumber, id, notes, tags, labels);

        this.name = name;
        this.emailAddress = emailAddress;
    }
}