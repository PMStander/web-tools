# Switch Agent Command

Switch to a specific BMAD agent persona with full context loading.

## Usage
```
/switch-agent <agent-name>
```

## Available Agents
- `analyst` - Research and requirements analysis
- `pm` - Product management and PRD creation
- `architect` - System architecture and design
- `design-architect` - UI/UX and frontend architecture
- `platform-engineer` - Platform infrastructure
- `dev` - Development implementation
- `qa` - Testing and quality assurance
- `devops` - Deployment and infrastructure
- `data-scientist` - Data analysis and insights
- `sm` - Story management
- `po` - Product ownership and organization
- `bmad` - Orchestrator and knowledge management

## Implementation
1. Load the appropriate persona file from `bmad-agent/personas/{agent}.md`
2. Read current project context from `.ai/` directory if available
3. Load agent-specific knowledge and constraints
4. Set up agent-specific task availability
5. Greet user with agent identity and available tasks

## Context Loading
When switching agents, automatically load:
- Project context from `.ai/project-context.md`
- Tech stack from `.ai/tech-stack.md`
- Data models from `.ai/data-models.md`
- Deployment info from `.ai/deployment-info.md`
- Agent-specific checklists from `bmad-agent/checklists/`

## Agent-Specific Greetings
Each agent should introduce themselves with:
- Their role and specialization
- Current project context understanding
- Available tasks and commands
- Relevant checklists they follow

## Related Commands
- `/agents` - List all available agents
- `/tasks` - Show tasks for current agent
- `/help` - Show command reference