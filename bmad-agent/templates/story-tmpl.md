# Story {epic-num}.{story-num}: {Short Title Copied from Epic File}

**IMPORTANT:** Use BMAD standard naming: {epic-num}.{story-num} with hyphens, not {EpicNum}.{StoryNum}

## Status: { Draft | Approved | InProgress | Review | Done }

## Story

- As a [role]
- I want [action]
- so that [benefit]

## Acceptance Criteria (ACs)

{ Copy the Acceptance Criteria numbered list }

## Tasks / Subtasks

- [ ] Task 1 (AC: # if applicable)
  - [ ] Subtask1.1...
- [ ] Task 2 (AC: # if applicable)
  - [ ] Subtask 2.1...
- [ ] Task 3 (AC: # if applicable)
  - [ ] Subtask 3.1...

## Sub-Agent Assignment Strategy

### Agent Workflow Pattern
Each task follows: **James (Dev) → Reviewer → Changer (if needed)**

### Parallel Execution Plan
- **Sequential Tasks**: {List tasks that must be completed in order}
- **Parallel Tasks**: {List tasks that can be executed simultaneously}

### Sub-Agent Assignments
- **Frontend Sub-Agent**: {UI/UX tasks requiring frontend expertise}
  - Reviewer: {UI-Reviewer or Design Architect}
  - Changer: {Frontend specialist}
- **Backend Sub-Agent**: {API/Database tasks requiring backend expertise}  
  - Reviewer: {Code-Reviewer or Architect}
  - Changer: {Backend specialist}
- **DevOps Sub-Agent**: {Infrastructure/deployment tasks}
  - Reviewer: {Infrastructure-Reviewer or Platform Engineer}
  - Changer: {DevOps specialist}
- **Testing Sub-Agent**: {Test creation and validation tasks}
  - Reviewer: {QA-Reviewer or QA Lead}
  - Changer: {Test specialist}

### Coordination Requirements
- **Dependencies**: {Tasks that depend on other story completions}
- **Shared Resources**: {Databases, APIs, environments that need coordination}
- **Integration Points**: {Where parallel work must synchronize}

## Dev Technical Guidance {detail not covered in tasks/subtasks}

## Story Progress Notes

### Agent Model Used: `<Agent Model Name/Version>`

### Completion Notes List

{Any notes about implementation choices, difficulties, or follow-up needed}

### Change Log
