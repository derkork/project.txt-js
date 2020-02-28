import {CharStreams, CommonTokenStream} from "antlr4ts";
import {ProjectTxtLexer} from "./parser/ProjectTxtLexer";
import {ProjectTxtParser} from "./parser/ProjectTxtParser";
import {TreeVisitor} from "./TreeVisitor";
import {Project} from "./Project";
import {ParseResult} from "./ParseResult";
import {ProjectDependencies} from "./ProjectDependencies";
import {Task} from "./Task";

//#region Exports
export {Project} from "./Project";
export {Task, TaskState} from "./Task";
export {Person} from "./Person";
export {ParseResult} from "./ParseResult";
export {ProjectDependencies} from "./ProjectDependencies";
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
 */
export function calculateDependencies(project: Project): ProjectDependencies {
    const dependencyMap = new Map<Task,Array<Task>>();

    for (const task of project.tasks) {
        if (!task.dependencies) {
            dependencyMap.set(task, []);
        }
        else {
            dependencyMap.set(task, project.tasks.filter(task.dependencies))
        }
    }

    return new ProjectDependencies(dependencyMap);
}
