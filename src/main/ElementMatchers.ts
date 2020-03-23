import {Task} from "./Task";
import {Person} from "./Person";

/**
 * Returns a task matcher that returns true if the matched task has a certain ID,
 * false otherwise.
 */
export function matchTaskById(id: string): (task: Task) => boolean {
    return task => task.id === id;
}

/**
 * Returns a person matcher that returns true if the matched person has a certain ID,
 * false otherwise.
 */
export function matchPersonById(id: string): (person: Person) => boolean {
    return person => person.id === id;
}

/**
 * Returns a task matcher that returns true if the matched task has a label with the given value.
 */
export function matchTaskByLabel(label: string, value: string): (task: Task) => boolean {
    return task => task.labels.get(label)?.has(value) || false;
}

/**
 * Returns a task matcher that returns true if the matched task has a certain index.
 */
export function matchTaskByIndex(index:number) : (task:Task) => boolean {
    return task => task.index === index;
}

/**
 * Returns a person matcher that returns true if the matched person has has a label with the given value.
 */
export function matchPersonByLabel(label: string, value: string): (person: Person) => boolean {
    return person => person.labels.get(label)?.has(value) || false;
}

/**
 * Returns a task matcher that returns true if the matched task has a given tag.
 */
export function matchTaskByTag(tag: string): (task: Task) => boolean {
    return task => task.tags.has(tag);
}

/**
 * Returns a person matcher that returns true if the matched person has a given tag.
 */
export function matchPersonByTag(tag: string): (person: Person) => boolean {
    return person => person.tags.has(tag);
}

/**
 * Returns a task matcher that returns true if any of the given task matchers returns true. Used to
 * combine multiple task matchers into a single one.
 */
export function combineTaskMatchers(matchers: Array<(task: Task) => boolean>): (task: Task) => boolean {
    return task => matchers.some(it => it(task));
}

/**
 * Returns a person matcher that returns true if any of the given person matchers returns true. Used to
 * combine multiple person matchers into a single one.
 */
export function combinePersonMatchers(matchers: Array<(person: Person) => boolean>): (person: Person) => boolean {
    return person => matchers.some(it => it(person));
}