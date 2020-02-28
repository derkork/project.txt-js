import {Task} from "./Task";

/**
 * A project dependency tree representation.
 */
export class ProjectDependencies {

    private readonly dependencyMap:Map<Task, Array<Task>>;

    constructor(dependencyMap: Map<Task, Array<Task>>) {
        this.dependencyMap = dependencyMap;
    }

    /**
     * Returns the immediate prerequisites of the given task. If no prerequisites are known for the given task will
     * return an empty array.
     *
     * @param task the task for which the prerequisites should be determined.
     */
    getPrerequisites(task:Task) : Array<Task> {
        return this.dependencyMap.get(task) || [];
    }
}