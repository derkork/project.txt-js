/**
 * Base class for entries which has common functionality.
 */
export abstract class Entry {
    /**
     * The ID of this entry, if any.
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
        id: string | undefined,
        notes: string | undefined,
        tags: Set<string>,
        labels: Map<string, Set<string>>
    ) {
        this.id = id;
        this.notes = notes;
        this.tags = tags;
        this.labels = labels;
    }
}