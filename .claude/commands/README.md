# BMAD Method Claude Commands

This directory contains Claude Code custom commands for the BMAD Method workflow system.

## Directory Structure

```
.claude/commands/
├── core/              # Core orchestrator commands
│   ├── help.md        # Display BMAD command reference
│   ├── agents.md      # List available agent personas
│   ├── switch-agent.md # Switch between agents
│   └── tasks.md       # List available tasks
├── agents/            # Agent-specific commands  
│   ├── analyst-brief.md    # Create project brief
│   ├── pm-prd.md          # Create PRD
│   └── architect-design.md # Create architecture
├── workflows/         # Multi-step workflows
│   ├── project-init.md        # Complete project initialization
│   ├── module-dev.md          # Module development workflow
│   └── legacy-fix.md          # Legacy module remediation
├── knowledge/         # Knowledge management
│   ├── update-knowledge.md    # Update agent knowledge
│   └── memory-extract.md      # Extract conversation insights
└── quick/             # Quick utility commands
    └── doc-out.md     # Output full documents
```

## Command Categories

### Core Commands (`/core/`)
Essential commands for navigating and managing the BMAD Method:
- `/help` - Display comprehensive command reference
- `/agents` - List all available agent personas
- `/switch-agent` - Switch to specific agent context
- `/tasks` - Show available tasks for current agent

### Agent Commands (`/agents/`)
Direct agent task execution:
- `/analyst-brief` - Create project brief through research
- `/pm-prd` - Create Product Requirements Document
- `/architect-design` - Design system architecture

### Workflow Commands (`/workflows/`)
Complete multi-step workflows:
- `/project-init` - Full project initialization from brief to deployment
- `/module-dev` - Add new modules to existing projects
- `/legacy-fix` - Remediate problematic existing modules

### Knowledge Commands (`/knowledge/`)
Knowledge and memory management:
- `/update-knowledge` - Synchronize agent knowledge base
- `/memory-extract` - Extract insights from conversations

### Quick Commands (`/quick/`)
Utility commands for common tasks:
- `/doc-out` - Display full document contents without truncation

## Usage Examples

### Starting a New Project
```bash
/project-init
```

### Adding a New Module
```bash
/module-dev user-authentication
```

### Fixing Legacy Code
```bash
/legacy-fix billing-system
```

### Switching Contexts
```bash
/switch-agent analyst
/analyst-brief
/switch-agent pm
/pm-prd
```

## Integration with BMAD System

These commands integrate seamlessly with the existing BMAD Method files:

- **Personas**: Load from `bmad-agent/personas/`
- **Tasks**: Execute from `bmad-agent/tasks/`
- **Templates**: Use from `bmad-agent/templates/`
- **Checklists**: Apply from `bmad-agent/checklists/`
- **Knowledge**: Read/write to `.ai/` directory

## Command Development

Each command file follows this structure:
- **Purpose**: Clear description of command function
- **Usage**: Command syntax and options
- **Implementation**: Step-by-step execution details
- **Integration**: How it connects to BMAD system
- **Quality Checks**: Validation and verification steps
- **Related Commands**: Cross-references to other commands

## Benefits

- **Native Integration**: Works directly with Claude Code
- **Streamlined Workflows**: Reduces complex multi-step processes
- **Project Context**: Maintains context across agent switches
- **Quality Assurance**: Built-in checklists and validation
- **Discoverability**: Easy-to-find `/command` syntax

## Getting Started

1. Start with `/help` to see all available commands
2. Use `/agents` to understand available personas
3. Execute `/project-init` for new projects
4. Use `/switch-agent` to work with different specialists
5. Run `/update-knowledge` after major project phases

For detailed information about the BMAD Method, see `bmad-agent/commands.md`.