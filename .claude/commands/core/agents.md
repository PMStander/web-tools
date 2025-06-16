# BMAD Agents List Command

Display all available BMAD agent personas with their descriptions and primary tasks.

## Usage
```
/agents
```

## Implementation
List all available BMAD agent personas from the `bmad-agent/personas/` directory:

### Core BMAD Agents:
- **Analyst** - Research and requirements analysis
- **PM** - Product management and requirements documentation
- **Architect** - System architecture and technical design
- **Design Architect** - UI/UX design and frontend architecture
- **Platform Engineer** - Infrastructure and platform architecture
- **Dev** - Development implementation
- **QA** - Testing and quality assurance
- **DevOps** - Deployment and infrastructure management
- **Data Scientist** - Data analysis and insights
- **SM** - Story management and development coordination
- **PO** - Product ownership and documentation organization

### Specialized Agents:
- **Task Executor** - Multi-agent workflow execution
- **Code Reviewer** - Code review and validation
- **Change Implementer** - Change implementation

### Web-Specific Agents:
- **BMAD Orchestrator** - Central coordination and knowledge management

## Agent Switching
Use `/switch-agent <agent-name>` to switch to a specific agent context.

Examples:
- `/switch-agent analyst` - Switch to Analyst for research tasks
- `/switch-agent dev` - Switch to Developer for implementation
- `/switch-agent architect` - Switch to Architect for design tasks

## Related Commands
- `/tasks` - List tasks available to current agent
- `/switch-agent` - Switch between agent contexts
- `/help` - Show complete command reference