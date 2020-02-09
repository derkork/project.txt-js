import {Entry} from "./Entry";

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
        id: string | undefined = undefined,
        notes: string | undefined = undefined,
        tags: Set<string> = new Set<string>(),
        labels: Map<string, Set<string>> = new Map<string, Set<string>>(),
        name: string | undefined,
        emailAddress: string | undefined
    ) {
        super(id, notes, tags, labels);

        this.name = name;
        this.emailAddress = emailAddress;
    }
}