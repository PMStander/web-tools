# PM - Orchestrate Project Execution

Bill's command to create and manage orchestration guides for coordinating sub-agents and parallel task execution.

## Usage
```
/pm-orchestrate
```

Create orchestration for specific epic/phase:
```
/pm-orchestrate --epic=<epic-name>
/pm-orchestrate --stories=<stories-file>
```

Update existing orchestration guide:
```
/pm-orchestrate --update
```

## Purpose
As Bill (PM/Orchestrator), create comprehensive orchestration guides that manage task execution across multiple agents, enable parallel work through sub-agents, and enforce the Dev → Reviewer → Changer workflow pattern.

## Implementation
Switch to PM persona (Bill) and execute orchestration creation:

1. **Load PM Context**
   - Read `bmad-agent/personas/pm.md`
   - Load `bmad-agent/tasks/create-orchestration-guide.md`
   - Apply `bmad-agent/checklists/pm-checklist.md`

2. **Analyze Stories for Orchestration**
   - Review all stories in `docs/stories/{epic-name}-stories.md`
   - Identify tasks that can be executed in parallel
   - Map dependencies between tasks and sub-tasks
   - Determine required agent types and sub-agents

3. **Create Task Execution Matrix**
   - **Sequential Tasks**: Must be completed in specific order
   - **Parallel Tasks**: Can be executed simultaneously  
   - **Agent Assignments**: Match tasks to appropriate agent capabilities
   - **Sub-Agent Planning**: Identify when to create specialized sub-agents

4. **Generate Orchestration Guide**
   - Use template: `bmad-agent/templates/orchestration-guide-tmpl.md`
   - Replace all placeholders with actual project data
   - Save to: `docs/stories/{project-name}-orchestration-guide.md`
   - Include current date and project context

## Sub-Agent Coordination Strategy

### Agent Assignment Rules
- **James (Full Stack Engineer)**: Main implementation agent for all development tasks
- **Bill (PM)**: Orchestrator, manages assignments and progress tracking
- **Reviewer Agents**: Specialized by task type (UI, Backend, DevOps, QA)
- **Changer Agents**: Implement reviewer feedback and fixes

### Sub-Agent Creation Triggers
Create sub-agents when:
- Multiple tasks can be executed in parallel
- Tasks require specialized expertise (Frontend vs Backend)
- Work can be distributed without creating conflicts
- Team capacity allows for parallel execution

### Sub-Agent Types
```
Frontend Sub-Agent:
- Tasks: UI component implementation, styling, user interactions
- Reviewer: UI-Reviewer (Design Architect or Senior Frontend)
- Changer: UI-Changer (Frontend specialist)

Backend Sub-Agent:
- Tasks: API endpoints, database operations, business logic
- Reviewer: Code-Reviewer (Senior Backend or Architect)
- Changer: Code-Changer (Backend specialist)

DevOps Sub-Agent:
- Tasks: Infrastructure, deployment, monitoring setup
- Reviewer: Infrastructure-Reviewer (DevOps Lead/Platform Engineer)
- Changer: Infrastructure-Changer (DevOps specialist)

Testing Sub-Agent:
- Tasks: Test creation, test automation, quality validation
- Reviewer: QA-Reviewer (QA Lead or Test Architect)
- Changer: Test-Changer (QA specialist)
```

## Orchestration Workflow

### 1. Task Analysis Phase
- Read story file and extract all tasks/subtasks
- Identify parallel execution opportunities
- Map task dependencies and prerequisites
- Estimate effort and timeline for each task

### 2. Agent Planning Phase
- Assign primary agents (James) to all development tasks
- Identify specialized sub-agent requirements
- Plan reviewer assignments for each task type
- Prepare changer agent availability for rework

### 3. Execution Coordination
- Create orchestration guide with task matrix
- Set up communication protocols for agent reporting
- Establish quality gates and checkpoints
- Define escalation procedures for blockers

### 4. Progress Management
- Update orchestration guide as tasks complete
- Coordinate between parallel sub-agents
- Manage dependencies and integration points
- Monitor quality through review process

## Quality Control Framework

### Dev → Reviewer → Changer Pattern
For every task and sub-task:
1. **James (Dev)** completes initial implementation
2. **Reviewer Agent** validates code quality and requirements
3. **Changer Agent** implements feedback (if changes needed)
4. **Bill (PM)** updates orchestration guide with progress

### Quality Gates
- **Before Task Assignment**: Dependencies verified, agents available
- **Before Task Completion**: Implementation done, review scheduled
- **Before Phase Completion**: All tasks approved, integration tested

### Maximum Parallel Capacity
- **Limit to 3 parallel sub-agents** to maintain quality oversight
- **Ensure reviewer availability** for each sub-agent
- **Coordinate shared resources** (databases, APIs, environments)
- **Synchronize integration points** between parallel work streams

## Communication Protocol

### Daily Standup (Bill Reports)
- **Completed yesterday**: Tasks finished and approved
- **Working today**: Current agent assignments and progress
- **Blockers**: Issues preventing progress or quality concerns
- **Next assignments**: Planned task assignments for upcoming work

### Agent Reporting (To Bill)
Agents report:
- **Task**: Name and ID of current/completed work
- **Status**: Current progress and completion percentage
- **Quality**: Review results and any change requirements
- **Blockers**: Dependencies or issues preventing progress
- **Next steps**: What's needed to proceed or complete

## Integration Points

### With Story Management
- Stories include sub-agent assignment strategy
- Orchestration guide references story acceptance criteria
- Progress updates flow back to story status tracking

### With Development Workflow
- James receives assignments from orchestration guide
- Sub-agents coordinate through orchestration matrix
- Code reviews follow orchestration quality standards

### With Knowledge Management
- Orchestration progress triggers knowledge updates
- Completed phases update agent knowledge base
- Lessons learned improve future orchestration planning

## Quality Checklist
Before completing orchestration:
- [ ] All stories analyzed for parallel opportunities
- [ ] Task dependencies clearly mapped
- [ ] Agent assignments match capabilities
- [ ] Sub-agent creation strategy defined
- [ ] Quality gates established at checkpoints
- [ ] Communication protocols documented
- [ ] Emergency procedures defined
- [ ] File saved with correct naming and location
- [ ] All placeholders replaced with actual data
- [ ] Current date used (no placeholder dates)

## Example Orchestration Execution
```
Bill: "I have analyzed the stories and created the orchestration guide. 
      Ready to assign tasks:
      
      Parallel Group A:
      - James (Frontend Sub-Agent): Implement user dashboard UI
      - James (Backend Sub-Agent): Create user API endpoints
      
      Each will be reviewed by specialized reviewers.
      After completion, we'll proceed to integration testing."
```

## Related Commands
- `/sm-create-stories` - Creates stories that feed into orchestration
- `/dev-implement` - James executes assigned development tasks
- `/qa-review` - Reviewer agents validate completed work
- `/update-knowledge` - Updates knowledge after orchestration phases