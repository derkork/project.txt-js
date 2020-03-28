import {CharStreams, CommonTokenStream} from "antlr4ts";
import {ProjectTxtLexer} from './parser/ProjectTxtLexer';
import {ProjectTxtParser} from './parser/ProjectTxtParser';
import {TreeVisitor} from "./TreeVisitor";
import {Project} from "./Project";
import {ParseResult} from "./ParseResult";
import {ProjectDependencies} from "./ProjectDependencies";
import {Task, TaskState} from "./Task";
import {Person} from "./Person";
import {ProjectCalculationSettings} from "./ProjectCalculationSettings";
import {FinishDate} from "./FinishDate";
import max from 'date-fns/max';
import addDays from 'date-fns/addDays';
import startOfDay from 'date-fns/startOfDay';
import addBusinessDays from 'date-fns/addBusinessDays';
import addMinutes from 'date-fns/addMinutes';
import isBefore from 'date-fns/isBefore';
import differenceInMinutes from 'date-fns/differenceInMinutes';
import {EffectiveTaskState} from "./EffectiveTaskState";

//#region Exports
export {Project} from "./Project";
export {Task, TaskState} from "./Task";
export {Person} from "./Person";
export {ParseResult} from "./ParseResult";
export {ProjectDependencies} from "./ProjectDependencies";
export {EffectiveTaskState} from "./EffectiveTaskState";
export {FinishDate} from "./FinishDate";
export {ProjectCalculationSettings} from "./ProjectCalculationSettings";

//#endregion

/**
 * Parses the given input model into a parse result.
 * @param input the text to be parsed.
 */
export function parse(input: string): ParseResult {
    let chars = CharStreams.fromString(input);
    let lexer = new ProjectTxtLexer(chars);
    let tokens = new CommonTokenStream(lexer);
    let parser = new ProjectTxtParser(tokens);

    parser.buildParseTree = true;
    let tree = parser.project();

    let element = new TreeVisitor().visit(tree);
    return new ParseResult(element.element as Project, element.errors.length > 0, element.errors);
}

/**
 * Calculates the project dependency tree for the given project.
 * @param project the project for which the dependency tree should be calculated.
 * @param settings settings to be used when calculating task finish dates.
 */
export function calculateDependencies(project: Project, settings: ProjectCalculationSettings): ProjectDependencies {
    const dependencyMap = new Map<Task, Array<Task>>();
    const assignmentMap = new Map<Task, Array<Person>>();
    const finishDatesMap = new Map<Task, FinishDate>();
    const effectiveTaskStateMap = new Map<Task, EffectiveTaskState>();

    for (const task of project.tasks) {
        if (!task.dependencies) {
            dependencyMap.set(task, []);
        } else {
            dependencyMap.set(task, project.tasks.filter(task.dependencies));
        }

        if (!task.assignments) {
            assignmentMap.set(task, []);
        } else {
            assignmentMap.set(task, project.persons.filter(task.assignments));
        }
    }


    // a set for keeping track of which tasks we already visited so we don't run endless recursions in case
    // the dependency structure contains circles.
    const visited = new Set<Task>();

    function calculateFinishingDate(task: Task): FinishDate {
        if (finishDatesMap.has(task)) {
            // @ts-ignore  we know that the finish date is in there.
            return finishDatesMap.get(task);
        }

        if (visited.has(task)) {
            // we detected a circle.
            let finishDate = new FinishDate(startOfDay(new Date()), true);
            // put in some dummy date to break the circle.
            // TODO: we need some consistent error handling (also for parsing).
            finishDatesMap.set(task, finishDate);
            return finishDate;
        }

        visited.add(task);

        const dependencies = dependencyMap.get(task) || []; // it actually cannot be undefined, but TS doesn't know.

        // find the largest finishing date of all the dependencies
        const finishDatesOfDependencies = dependencies.map((it) => calculateFinishingDate(it));

        const latest = finishDatesOfDependencies
            .reduce((previousValue, currentValue) => {
                if (previousValue && previousValue.isAfterOrEqualTo(currentValue)) {
                    return previousValue;
                }
                return currentValue
            }, new FinishDate(startOfDay(new Date()), false));

        // find out the earliest date the dependencies will be finished.
        const dependenciesEarliestStart = latest.date;
        // if any of the input dependencies has unknowns, this task will also have unknowns.
        const hasUnknowns = finishDatesOfDependencies
            .map(it => it.hasUnknowns)
            .reduce((previousValue, currentValue) => previousValue || currentValue, false);

        // if the task has a start date and this is later than the earliest start date
        // use the tasks start date as earliest start
        const taskEarliestStart = task.startDate ? max([task.startDate, dependenciesEarliestStart]) : dependenciesEarliestStart;


        // if the task is already done, it has no remaining effort and we can stop here.
        // also if the task has no effort specification, there is nothing to calculate, so we can stop here as well.
        if (task.state == TaskState.Done || !task.effort) {
            const result = new FinishDate(taskEarliestStart, hasUnknowns || !task.effort);
            finishDatesMap.set(task, result);
            return result;
        }

        // otherwise we can to calculate stuff
        // for calculation we normalize everything down to minutes.
        const minutesPerWorkDay = settings.hoursPerDay * 60;

        const minutes =
            task.effort.minutes +
            task.effort.hours * 60 +
            task.effort.days * minutesPerWorkDay;

        // for every full work day we roll over the date for one full day
        const fullWorkDays = Math.floor(minutes / minutesPerWorkDay);
        const remainingMinutes = minutes % minutesPerWorkDay;

        // first add the full work days
        const endDateWithDaysApplied = settings.workOnWeekends ? addDays(taskEarliestStart, fullWorkDays) : addBusinessDays(taskEarliestStart, fullWorkDays);

        // now we need to add the remaining minutes. This could lead to a date that rolls over to the next work day
        // so we first need to calculate how many minutes of the current day we already spent. if the remaining minutes
        // plus the already spent minutes are larger than one work day, we need to roll over the day once more.
        const minutesSpent = differenceInMinutes(endDateWithDaysApplied, startOfDay(endDateWithDaysApplied));

        let finalEndDate: Date;

        if (minutesSpent + remainingMinutes >= minutesPerWorkDay) {
            // calculate how many minutes we have left after rolling over one more working day
            const remainingMinutesAfterRollOver = minutesSpent + remainingMinutes - minutesPerWorkDay;

            // roll over one more day
            finalEndDate = addMinutes(
                settings.workOnWeekends
                    ? addDays(endDateWithDaysApplied, 1)
                    : addBusinessDays(endDateWithDaysApplied, 1),
                remainingMinutesAfterRollOver);
        } else {
            // no roll-over needed, just add the remaining minutes
            finalEndDate = addMinutes(endDateWithDaysApplied, remainingMinutes);
        }

        const result = new FinishDate(finalEndDate, hasUnknowns);
        finishDatesMap.set(task, result);
        return result;
    }

    for (const task of project.tasks) {
        calculateFinishingDate(task);
    }


    function calculateEffectiveTaskState(task: Task): EffectiveTaskState {
        if (effectiveTaskStateMap.has(task)) {
            // @ts-ignore we know that the task is in the map
            return effectiveTaskStateMap.get(task);
        }

        if (visited.has(task)) {
            // this is a circle, so we go "blocked"
            return EffectiveTaskState.Blocked;
        }

        visited.add(task);

        switch (task.state) {
            // the following tasks states are always IS states, that is they override the PLAN
            // e.g. if a standard task is marked as Done, this will not be changed by any
            // prerequisite task anymore. same goes for "on hold" and "in progress" tasks.
            case TaskState.Done:
                effectiveTaskStateMap.set(task, EffectiveTaskState.Done);
                return EffectiveTaskState.Done;
            case TaskState.InProgress:
                effectiveTaskStateMap.set(task, EffectiveTaskState.InProgress);
                return EffectiveTaskState.InProgress;
            case TaskState.OnHold:
                effectiveTaskStateMap.set(task, EffectiveTaskState.OnHold);
                return EffectiveTaskState.OnHold;
            // tasks in state OPEN and Milestone are PLAN tasks, that is their effective state
            // changes depending on their surroundings and their settings.
            case TaskState.Open:
            case TaskState.Milestone:
                // if an open task or milestone has a start date which is not yet reached
                // we mark it as blocked, no matter what their dependencies have to say.
                if (task.startDate && isBefore(new Date(), task.startDate)) {
                    effectiveTaskStateMap.set(task, EffectiveTaskState.Blocked);
                    return EffectiveTaskState.Blocked;
                }

                // Now check the dependencies and see if all prerequisites are done. If there is a single
                // dependency not done, we mark this as "blocked".
                for (let dependency of dependencyMap.get(task) || []) {
                    // if any dependency is not yet done, this task is blocked.
                    if (calculateEffectiveTaskState(dependency) !== EffectiveTaskState.Done) {
                        effectiveTaskStateMap.set(task, EffectiveTaskState.Blocked);
                        return EffectiveTaskState.Blocked;
                    }
                }

                // no dependency is blocking then an Open task will have effective task state of
                // Open, while a mile stone will get an effective task state of Done.
                const effectiveState = task.state === TaskState.Open ? EffectiveTaskState.Open : EffectiveTaskState.Done;
                effectiveTaskStateMap.set(task, effectiveState);
                return effectiveState;
        }
    }

    visited.clear();
    for (const task of project.tasks) {
        calculateEffectiveTaskState(task);
    }
    return new ProjectDependencies(dependencyMap, assignmentMap, finishDatesMap, effectiveTaskStateMap);
}
