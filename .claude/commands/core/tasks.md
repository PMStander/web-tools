# Tasks Command

List all available tasks for the current agent context or a specific agent.

## Usage
```
/tasks
```

Show tasks for a specific agent:
```
/tasks <agent-name>
```

## Implementation
Based on the current agent context, display available tasks from the `bmad-agent/tasks/` directory:

### Core Tasks by Agent:

**Analyst Tasks:**
- Research project requirements
- Analyze existing projects  
- Research competitor features
- Research API capabilities
- Research database options
- Research platform requirements
- Performance analysis

**PM Tasks:**
- Create PRD
- Create module PRD
- Update PRD with modules
- Create UI PRD
- Create API integration PRD
- Create migration PRD
- Create optimization PRD
- Create remediation PRD
- Create enhancement PRD

**Architect Tasks:**
- Create architecture
- Create module architecture
- Document current architecture
- Design API integration
- Design database migration
- Performance optimization plan
- Compare competitor features

**Dev Tasks:**
- Implement stories
- Implement modules
- Run tests
- Code review
- Explain concepts

**QA Tasks:**
- Create test plans
- Run tests
- Create performance test plans

**SM Tasks:**
- Create stories
- Course correction (pivot)
- Story validation checklist
- Document sharding

### Universal Tasks:
- Update agent knowledge
- Memory extraction
- Knowledge validation
- Core dump
- Generate knowledge maps

## Task Execution
Most tasks can be executed with:
```
/run-task <task-name>
```

Or use specific agent commands like:
```
/analyst-brief
/pm-prd  
/architect-design
```

## Related Commands
- `/agents` - List available agents
- `/switch-agent` - Switch to different agent
- `/help` - Show command reference