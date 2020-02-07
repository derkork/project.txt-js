import {parse} from "../main";

describe("parsing", ()=> {
   it("parses stuff", ()=> {
       let input  ="[ ] some task\n[ ] some other task\n+ some person";
       let parseResult = parse(input);

       expect(parseResult).toBeDefined();
       let project = parseResult.project;
       expect(project.tasks).toHaveLength(2);
       expect(project.persons).toHaveLength(1);
   })
});