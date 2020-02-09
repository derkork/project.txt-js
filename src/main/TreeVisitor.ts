import {AbstractParseTreeVisitor, TerminalNode} from "antlr4ts/tree";
import {Project} from "./Project";
import {ProjectTxtParserVisitor} from "./parser/ProjectTxtParserVisitor";
import {Person} from "./Person";
import {Task} from "./Task";
import {TreeElement} from "./TreeElement";
import {
    EntryContext, LabelContext,
    PersonEntryContext,
    ProjectContext,
    TagContext,
    TaskEntryContext
} from "./parser/ProjectTxtParser";
import {ParserRuleContext} from "antlr4ts";
import {ProjectTxtLexer} from "./parser/ProjectTxtLexer";

class TextContent {
    first:string |undefined;
    last:string | undefined;

    constructor(first: string | undefined, last: string | undefined) {
        this.first = first;
        this.last = last;
    }
}

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
        let personContent = ctx.personContent();

        let tags = TreeVisitor.visitForTags(personContent);
        let labels = TreeVisitor.visitForLabels(personContent);
        let text = TreeVisitor.visitForText(personContent);

        let person = new Person(undefined,text.last,tags, labels, text.first, undefined);
        return new TreeElement(person);
    }

    /**
     * Visits the given context and searches for defined tags returning them as a set of strings. Duplicate tags will
     * automatically be filtered.
     */
    private static visitForTags(ctx:ParserRuleContext) : Set<string> {
        return new Set<string>(ctx
            .getRuleContexts<TagContext>(TagContext)
            .map(it => it.tagDefinition().IDENTIFIER().text)
        )
    }

    /**
     * Visits the given context and searches for defined labels returning them as a map of strings to a set of strings.
     * Duplicates will be automatically filtered.
     */
    private static visitForLabels(ctx:ParserRuleContext) : Map<string,Set<string>> {
        let result = new Map<string,Set<string>>();

        let labelContexts = ctx.getRuleContexts<LabelContext>(LabelContext);
        for (let labelContext of labelContexts) {
            let key = labelContext.labelDefinition().IDENTIFIER(0).text;
            let value = labelContext.labelDefinition().IDENTIFIER(1).text;
            let set = result.get(key);

            if (set === undefined) {
                set = new Set<string>();
                result.set(key, set);
            }

            set.add(value);
        }

        return result;
    }

    /**
     * Returns the entire text content of the node split into a first
     * and last section. Everything coming before a newline or any non-terminal
     * child is put into the first section, the rest is put into the last section.
     */
    private static visitForText(ctx:ParserRuleContext) : TextContent {
        let count = ctx.childCount;
        let first = "";
        let last = "";
        let firstIsDone = false;
        for (let i = 0; i < count; i++) {
            let child = ctx.getChild(i);
            if (child instanceof TerminalNode) {
                if (child.symbol.type == ProjectTxtLexer.TEXT) {
                    let text = child.text;
                    if (firstIsDone) {
                        last += text;
                    } else {
                        first += text;
                    }
                }
                else if (child.symbol.type == ProjectTxtLexer.NEW_LINE) {
                    firstIsDone = true;
                    last += child.text;
                }
                else {
                    // this actually should not happen
                    // TODO: +refactor decide for some error handling strategy.
                }
            }
            else {
                firstIsDone = true;
            }
        }
        return new TextContent(first, last);
    }

}