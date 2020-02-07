import {CharStreams, CommonTokenStream} from "antlr4ts";
import {ProjectTxtLexer} from "./parser/ProjectTxtLexer";
import {ProjectTxtParser} from "./parser/ProjectTxtParser";
import {TreeVisitor} from "./TreeVisitor";
import {Project} from "./Project";
import {ParseResult} from "./ParseResult";

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


