# BMAD Method Help Command

Display the BMAD Method command reference guide and available workflows.

## Usage
Display comprehensive help with all BMAD commands and workflows:

```
/help
```

Display help for a specific category:
```
/help agents
/help workflows  
/help knowledge
```

## Implementation
Read and display the contents of `bmad-agent/commands.md` which contains the complete BMAD Method Command Reference Guide including:

- Core Orchestrator Commands
- Web-Specific Commands
- Knowledge Management Commands
- Memory Management Commands
- Project Workflow Commands
- Machine-Powered Capabilities
- Common Scenarios and Workflows
- Best Practices

Focus on the most commonly used commands and direct users to specific workflow commands for complex scenarios.

## Key Workflows to Highlight
1. Complete Project Initialization: `/project-init`
2. Module Development: `/module-dev`
3. Legacy Module Remediation: `/legacy-fix`
4. Competitive Analysis Enhancement: `/competitive-analysis`

## Related Commands
- `/agents` - List all available BMAD agent personas
- `/tasks` - List tasks available to current agent
- `/workflows` - Show available workflow commands