# Project.txt JS

## What is it?
This is is a library for parsing and processing project plans in the [`project.txt` format](https://github.com/derkork/project.txt-spec). It provides no rendering functionality. If you want a ready-to-use editor, have a look at [project.txt Viewer](https://github.com/derkork/project.txt-viewer).

Note, that this library is currently in development and the API is not stable. If you want to use this in your own projects be prepared for API changes. This library uses [semantic versioning](https://semver.org/).

## Usage

The library is written in TypeScript but should be consumable by any JavaScript project. Add it to your project using `npm install project.txt`. 

```typescript
import {parse, calculateDependencies, ProjectCalculationSettings} from "/project.txt";

// The project definition is expected as a string. You can get this from
// any source you would like, be it a file, a git repo, etc.
const projectDefinition = "[ ] some task";

const parseResult = parse(projectDefinition);
const project = parseResult.project;

// now you can extract the parsed information from the project
const tasks = project.tasks;
const firstTask = tasks[0];
const persons = project.persons;

// the library also has functionality to calculate task dependencies and
// task finish dates from the parsed project

const projectDependencyInformation = calculateDependencies(project, ProjectCalculationSettings.default());

// now you can find out which tasks are prerequisite for another task:
const prerequisitesForFirstTask = projectDependencyInformation.getPrerequisites(firstTask);

// or which persons are assigned to a task
const personsAssignedToFirstTask = projectDependencyInformation.getAssigments(firstTask);

// or when a task will be finished
const taskFinishDateOfFirstTask = projectDependencyInformation.getFinishDate(firstTask);

```