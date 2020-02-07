import {Project} from "./Project";

export class ParseResult {
    /**
     * The parsed project. In case of errors this may be incomplete.
     */
    readonly project:Project;
    /**
     * If errors occurred while parsing and validating.
     */
    readonly hasErrors:boolean;
    /**
     * The errors that occurred.
     */
    readonly errors:Array<String>;


    constructor(project: Project, hasErrors: boolean, errors: Array<String>) {
        this.project = project;
        this.hasErrors = hasErrors;
        this.errors = errors;
    }
}