/**
 * Base class for entries which has common functionality.
 */
import uuid, {v4 as uuidV4} from "uuid";

export abstract class Entry {
    /**
     * The index of this entry in the project. Starts with 0. Index values are per type of entry (Person, Task, ...).
     */
    readonly index : number;

    /**
     * The line number in the source file where this entry was defined.
     */
    readonly lineNumber: number;

    /**
     * The ID of this entry, if defined in the project description.
     */
    readonly id: string | undefined;

    /**
     * Notes belonging to this entry, if any.
     */
    readonly notes: string | undefined;

    /**
     * A set of tags assigned to to this entry.
     */
    readonly tags: Set<string>;

    /**
     * A set of labels assigned to this entry.
     */
    readonly labels: Map<string, Set<string>>;

    protected constructor(
        index: number,
        lineNumber: number,
        id: string | undefined,
        notes: string | undefined,
        tags: Set<string>,
        labels: Map<string, Set<string>>
    ) {
        this.index = index;
        this.lineNumber = lineNumber;
        this.id = id;
        this.notes = notes;
        this.tags = tags;
        this.labels = labels;
    }
}