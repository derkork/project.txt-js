import {parse, Project} from "../main";

export function parseProject(input: string): Project {
    let project = parse(input)?.project;
    expect(project).toBeDefined();
    return project;
}