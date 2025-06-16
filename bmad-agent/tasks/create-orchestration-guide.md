# Create Orchestration Guide Task

**Agent**: Bill (PM/Orchestrator)  
**Task Type**: Project Management / Coordination  
**Dependencies**: Stories must be created first  
**Output**: docs/stories/{project-name}-orchestration-guide.md

## Purpose
Create a comprehensive orchestration guide that manages task execution across multiple agents, enables parallel work through sub-agents, and enforces the Dev → Reviewer → Changer workflow pattern.

## Prerequisites
- [ ] All stories for the current phase/epic have been written
- [ ] Story acceptance criteria are clearly defined
- [ ] Dependencies between stories are identified
- [ ] Agent personas and capabilities are understood

## Task Execution Steps

### 1. Analyze Stories for Orchestration
- Review all stories in `docs/stories/{epic-name}-stories.md`
- Identify tasks that can be executed in parallel
- Map dependencies between tasks and sub-tasks
- Determine required agent types and sub-agents

### 2. Create Task Execution Matrix
- **Sequential Tasks**: Must be completed in specific order
- **Parallel Tasks**: Can be executed simultaneously
- **Agent Assignments**: Match tasks to appropriate agent capabilities
- **Sub-Agent Planning**: Identify when to create specialized sub-agents

### 3. Generate Orchestration Guide
- Use template: `bmad-agent/templates/orchestration-guide-tmpl.md`
- Replace all `{PLACEHOLDER}` values with actual project data
- Save to: `docs/stories/{project-name}-orchestration-guide.md`
- Include current date and project context

### 4. Define Sub-Agent Strategy
For parallel work, plan sub-agent creation:
```
Frontend Sub-Agent:
- Tasks: UI component implementation, styling, user interactions
- Reviewer: UI-Reviewer (Design Architect or Senior Frontend Dev)
- Changer: UI-Changer (Frontend specialist)

Backend Sub-Agent:
- Tasks: API endpoints, database operations, business logic
- Reviewer: Code-Reviewer (Senior Backend Dev or Architect)
- Changer: Code-Changer (Backend specialist)

DevOps Sub-Agent:
- Tasks: Infrastructure, deployment, monitoring setup
- Reviewer: Infrastructure-Reviewer (DevOps Lead or Platform Engineer)
- Changer: Infrastructure-Changer (DevOps specialist)

Testing Sub-Agent:
- Tasks: Test creation, test automation, quality validation
- Reviewer: QA-Reviewer (QA Lead or Test Architect)
- Changer: Test-Changer (QA specialist)
```

### 5. Establish Quality Gates
Define checkpoints at:
- Task assignment (before starting)
- Task completion (before review)
- Phase completion (before moving to next epic)

### 6. Set Communication Protocol
- Daily standup format for progress reporting
- Agent reporting templates for status updates
- Escalation procedures for blockers
- Emergency procedures for quality issues

## Agent Assignment Rules

### Primary Agent Selection
- **James (Full Stack Engineer)**: Main implementation agent for all development tasks
- **Bill (PM)**: Orchestrator, manages assignments and progress
- **Reviewer Agents**: Specialized by task type (UI, Backend, DevOps, QA)
- **Changer Agents**: Implement reviewer feedback and fixes

### Sub-Agent Creation Triggers
Create sub-agents when:
- Multiple tasks can be executed in parallel
- Tasks require specialized expertise (Frontend vs Backend)
- Work can be distributed without creating conflicts
- Team capacity allows for parallel execution

### Maximum Parallel Capacity
- **Limit to 3 parallel sub-agents** to maintain quality oversight
- **Ensure reviewer availability** for each sub-agent
- **Coordinate shared resources** (databases, APIs, environments)
- **Synchronize integration points** between parallel work streams

## Workflow Integration

### With Story Management (SM)
- SM creates stories with sub-agent requirements specified
- Orchestration guide references story file and acceptance criteria
- Progress updates flow back to story status tracking

### With Development (Dev/James)
- James receives task assignments from orchestration guide
- Reports completion status for orchestration guide updates
- Coordinates with sub-agents for parallel work execution

### With Quality Assurance (QA/Reviewer)
- Reviewers follow orchestration guide for review assignments
- Review results update orchestration guide status
- Quality gates prevent progression until standards met

### With Knowledge Management (BMAD)
- Orchestration guide progress triggers knowledge updates
- Completed phases update agent knowledge base
- Lessons learned integrate into future orchestration planning

## Template Customization

### Required Placeholder Replacements
- `{PROJECT-NAME}`: Current project name
- `{CURRENT-DATE}`: Actual current date (YYYY-MM-DD format)
- `{PHASE}`: Current project phase or epic name
- `{stories-file}`: Name of the stories file being orchestrated
- `{TOTAL-COUNT}`: Total number of tasks identified
- `{Task Name}`, `{Agent}`, `{Prerequisites}`: Actual task details

### Status Tracking Symbols
- ⏳ Pending - Task not yet started
- 🔄 In Progress - Currently being worked on  
- 👀 Under Review - Being reviewed by Reviewer agent
- 🔧 Needs Changes - Changer agent implementing feedback
- ✅ Completed - Task finished and approved
- ❌ Blocked - Cannot proceed due to dependencies

## Quality Checklist

Before completing orchestration guide creation:
- [ ] All stories analyzed for parallel execution opportunities
- [ ] Task dependencies clearly mapped and documented
- [ ] Agent assignments match task requirements and capabilities
- [ ] Sub-agent creation strategy defined with reviewer assignments
- [ ] Quality gates established at appropriate checkpoints
- [ ] Communication protocols clearly defined
- [ ] Emergency and escalation procedures documented
- [ ] File saved with correct naming convention and location
- [ ] All placeholders replaced with actual project data
- [ ] Current date used (no placeholders like {DATE})

## Success Criteria
- Orchestration guide provides clear task execution roadmap
- Parallel work opportunities identified and planned
- Dev → Reviewer → Changer workflow enforced
- Sub-agent coordination strategy established
- Bill (PM) has complete control over task assignments
- Progress tracking enables real-time project monitoring

## Related Tasks
- `create-next-story-task.md` - Creates stories that feed into orchestration
- `agent-knowledge-update-task.md` - Updates knowledge based on orchestration progress
- `core-dump.md` - Captures orchestration state for debugging

## Integration Commands
- `/sm-create-stories` - Creates stories before orchestration
- `/pm-orchestrate` - Executes this orchestration guide creation
- `/update-knowledge` - Updates agent knowledge after orchestration setup