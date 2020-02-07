import {AbstractParseTreeVisitor} from "antlr4ts/tree";
import {Project} from "./Project";
import {ProjectTxtParserVisitor} from "./parser/ProjectTxtParserVisitor";
import {Person} from "./Person";
import {Task} from "./Task";
import {TreeElement} from "./TreeElement";
import {EntryContext, PersonEntryContext, ProjectContext, TaskEntryContext} from "./parser/ProjectTxtParser";

/**
 * Visitor which runs the AST and produces a model of the parsed file.
 */
export class TreeVisitor
    extends AbstractParseTreeVisitor<TreeElement>
    implements ProjectTxtParserVisitor<TreeElement> {

    public defaultResult(): TreeElement {
        return  new TreeElement(
            new Project([], [])
        );
    }


    public visitProject(ctx:ProjectContext) : TreeElement {
        let projectElements = ctx.entry()
            .map(value => this.visitEntry(value));

        let people = projectElements
            .filter(it => it.element instanceof Person )
            .map(it => it.element as Person);

        let tasks = projectElements
            .filter(it => it.element instanceof Task)
            .map(it => it.element as Task);

        return new TreeElement(new Project(people, tasks));
    }

    public visitEntry(ctx:EntryContext) : TreeElement {
        let personEntry = ctx.personEntry();
        if (personEntry) {
            return this.visitPersonEntry(personEntry);
        }
        let taskEntry = ctx.taskEntry();
        if (taskEntry) {
            return this.visitTaskEntry(taskEntry);
        }

        return new TreeElement("Error");
    }

    public visitTaskEntry(ctx:TaskEntryContext) : TreeElement {
        return new TreeElement(new Task());
    }

    
    public visitPersonEntry(ctx:PersonEntryContext) : TreeElement {
        return new TreeElement(new Person());
    }


}