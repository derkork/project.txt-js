import {parse, Project} from "../main";
import {lightFormat} from "date-fns";

export function parseProject(input: string): Project {
    let project = parse(input)?.project;
    expect(project).toBeDefined();
    return project;
}

export function toYearMonthDay(date:Date) : string {
    return lightFormat(date, "yyyy-MM-dd");
}