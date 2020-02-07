import {Person} from "./Person";
import {Task} from "./Task";

/**
 * A project.
 */
export class Project {
    readonly persons: Array<Person>;
    readonly tasks: Array<Task>;

    /**
     * Creates a new project.
     * @param persons the persons to work in the project
     * @param tasks the tasks that are part of the project
     */
    constructor(persons: Array<Person> = [],
                tasks: Array<Task> = []) {
        this.persons = persons;
        this.tasks = tasks;
    }

}