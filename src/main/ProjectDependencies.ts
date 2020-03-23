import {Task} from "./Task";
import {Person} from "./Person";
import {FinishDate} from "./FinishDate";

/**
 * A project dependency tree representation.
 */
export class ProjectDependencies {

    private readonly dependencyMap: Map<Task, Array<Task>>;
    private readonly assignmentMap: Map<Task, Array<Person>>;
    private readonly finishDatesMap: Map<Task, FinishDate>;

    constructor(dependencyMap: Map<Task, Array<Task>>,
                assignmentMap: Map<Task, Array<Person>>,
                finishDatesMap: Map<Task, FinishDate>) {
        this.dependencyMap = dependencyMap;
        this.assignmentMap = assignmentMap;
        this.finishDatesMap = finishDatesMap;
    }

    /**
     * Returns the immediate prerequisites of the given task. If no prerequisites are known for the given task will
     * return an empty array.
     *
     * @param task the task for which the prerequisites should be determined.
     */
    getPrerequisites(task: Task): Array<Task> {
        return this.dependencyMap.get(task) || [];
    }

    /**
     * Returns the persons assigned to the given task. If no persons are assigned to this task, will return an empty
     * array.
     * @param task the task for which the assignments should be determined.
     */
    getAssignments(task: Task): Array<Person> {
        return this.assignmentMap.get(task) || [];
    }

    /**
     * Returns a structure defining the finish date of a given task.
     * @param task the task for which the finish date should be determined.
     */
    getFinishDate(task: Task): FinishDate {
        // TODO: proper error handling
        return this.finishDatesMap.get(task) || new FinishDate(new Date(), true);
    }


}