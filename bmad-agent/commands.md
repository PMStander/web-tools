# BMAD Method Command Reference Guide

## Core Orchestrator Commands

| Command | Description |
|---------|-------------|
| `*help` / `/help` | Display list of commands or help with workflows |
| `*agents` / `/agent-list` | List all available agent personas with their tasks |
| `*{agent}` / `/{agent}` | Switch to specified agent (e.g., *Dev, *Analyst) |
| `*exit` / `/exit` | Return to base BMAD Orchestrator from any agent |
| `*tasks` / `/tasks` | List tasks available to current agent |
| `*party` / `/party-mode` | Enter group chat mode with all available agents |
| `*yolo` / `/yolo` | Toggle between interactive and YOLO mode |
| `*core-dump` | Save current state and progress to debug log |
| `*mpcs` / `/mpcs` | List available Machine-Powered Capabilities |

## Web-Specific Commands

| Command | Description |
|---------|-------------|
| `/doc-out` | Output the full document being discussed without truncation |
| `/load-{agent}` | Immediately switch to the specified agent and greet the user |
| `/bmad {query}` | Direct a query to the BMAD Orchestrator while in another agent |
| `/{agent} {query}` | Direct a query to a specific agent while in another agent |

## Knowledge Management Commands

| Command | Description |
|---------|-------------|
| `*update-knowledge` / `/update-knowledge` | Update all agents with current project knowledge |
| `*update-module-knowledge {module-name}` / `/update-module-knowledge {module-name}` | Update agents with module-specific knowledge |
| `*generate-knowledge-map` / `/knowledge-map` | Create visual representation of project knowledge |
| `*generate-module-knowledge-map {module-name}` / `/module-knowledge-map {module-name}` | Create visual representation of module knowledge |
| `*knowledge-request {topic}` / `/knowledge-request {topic}` | Flag a knowledge gap for future resolution |
| `*module-knowledge-request {module-name} {topic}` / `/module-knowledge-request {module-name} {topic}` | Flag a module-specific knowledge gap |
| `*validate-knowledge` / `/validate-knowledge` | Validate consistency and completeness of knowledge base |
| `*validate-module-knowledge {module-name}` / `/validate-module-knowledge {module-name}` | Validate module knowledge consistency |

## Memory Management Commands

| Command | Description |
|---------|-------------|
| `*memory-extract` / `/memory-extract` | Extract useful knowledge from current thread |
| `*memory-extract {agent-name}` | Extract knowledge filtered for specific agent |
| `*memory-extract --scope=session` | Extract from current session only |
| `*memory-extract --scope=thread` | Extract from entire thread history |
| `*memory-status` / `/memory-status` | Show current agent memory/context state |
| `*memory-merge` / `/memory-merge` | Merge extracted memories into agent knowledge |

## Workflow Planning Commands

| Command | Description |
|---------|-------------|
| `*plan-workflow "{description}"` / `/plan-workflow "{description}"` | Analyze your goals and recommend optimal BMAD command sequence |

## Project Workflow Commands

### Project Initialization

| Command | Description |
|---------|-------------|
| `*Analyst Create Project Brief` | Start a new project with initial research |
| `*PM Create PRD` | Create Product Requirements Document from brief |
| `*Architect Create Architecture` | Design system architecture based on PRD |
| `*Design Architect Create Frontend Architecture` | Design UI/UX and frontend architecture |

### Story Management

| Command | Description |
|---------|-------------|
| `*SM create` | Create next implementation story with sub-agent assignment strategy |
| `*SM pivot` | Run course correction for project direction |
| `*SM checklist` | Run story validation checklist |
| `*SM doc-shard` | Break down large documents into manageable pieces |
| `*SM create-with-orchestration` | Create stories and immediately generate orchestration guide |

### Development

| Command | Description |
|---------|-------------|
| `*Dev run-tests` | Execute all tests for current implementation |
| `*Dev lint` | Find and fix code style issues |
| `*Dev explain {concept}` | Get explanation of technical concept |
| `*QA create-test-plan` | Create comprehensive test plan for story |
| `*QA run-tests` | Execute tests and report results |
| `*DevOps deploy` | Deploy to specified environment |
| `*DevOps infra-plan` | Plan infrastructure changes |
| `*Data Scientist analyze` | Analyze data patterns and create insights |

## Machine-Powered Capabilities

| Command | Description |
|---------|-------------|
| `*perplexity {query}` / `/perplexity {query}` | Web search with summarization |
| `*github {query}` / `/github {query}` | Search code repositories and documentation |
| `*firecrawl {query}` / `/firecrawl {query}` | Advanced data extraction and analysis |
| `*dalle {prompt}` / `/dalle {prompt}` | Generate images for UI mockups or concepts |

## Project Extension Workflows

### Adding a New Module

1. `*Architect module-design {module-name}` - Design new module architecture
2. `*PM update-prd {module-name}` - Update PRD with new module requirements
3. `*SM create` - Create implementation stories for the module
4. `*Dev` - Implement the module stories
5. `*QA create-test-plan` - Create test plan for the new module

## Module Development Workflows

### Module-Specific Commands

| Command | Description |
|---------|-------------|
| `*create-module {module-name}` | Create module directory structure and initial documentation |
| `*module-knowledge-update {module-name}` | Update agents with module-specific knowledge |
| `*module-status {module-name}` | Show current status of module development |

### Module Development Workflow
**Purpose:** Develop a specific module within a brownfield project with complete documentation structure

| Step | Agent | Command | Description |
|------|-------|---------|-------------|
| 1 | Analyst | `*Analyst Research Module Requirements {module-name}` | Research and document module requirements and context |
| 2 | PM | `*PM Create Module PRD {module-name}` | Create module-specific Product Requirements Document |
| 3 | Architect | `*Architect Create Module Architecture {module-name}` | Design module architecture and integration points |
| 4 | Design Architect | `*Design Architect Create Module Frontend {module-name}` | Design module UI/UX (if applicable) |
| 5 | BMAD | `*BMAD Update Module Knowledge {module-name}` | Update agents with module-specific knowledge |
| 6 | SM | `*SM Create Module Stories {module-name}` | Create implementation stories for the module |
| 7 | Dev | `*Dev Implement Module {module-name}` | Implement module functionality |
| 8 | QA | `*QA Create Module Test Plan {module-name}` | Create comprehensive test plan for module |
| 9 | DevOps | `*DevOps Deploy Module {module-name}` | Deploy module to appropriate environments |

**Special Considerations:**
- **Modular Documentation**: Each module maintains its own docs/modules/{module-name}/ structure
- **Integration Focus**: Ensure clear integration points with existing project modules
- **Independent Testing**: Module should be testable independently from main project
- **Knowledge Isolation**: Module knowledge updates don't overwrite main project knowledge

## File Organization Guidelines

### Directory Structure Overview

The BMAD Method uses a **hybrid file organization system** that evolved from earlier versions:

| Directory | Purpose | Contents | Auto-Generated |
|-----------|---------|----------|----------------|
| `docs/` | **Human Deliverables** | Project Briefs, PRDs, Architecture docs, Stories, API docs | ❌ Manual |
| `.ai/` | **Agent Knowledge & Logs** | Project context, tech stack, data models, agent logs | ✅ Auto-created |
| `bmad-agent/` | **BMAD System Files** | Personas, tasks, templates, configuration | ❌ Manual |

### What Goes Where

**`docs/` Directory - Project Documentation:**
- Project Briefs (from Analyst)
- Product Requirements Documents (from PM)
- Architecture Documents (from Architect)
- UX/UI Specifications (from Design Architect)
- User Stories (in `docs/stories/`)
- API Reference documentation
- Sharded documents (broken down from large docs)
- **Module Documentation (in `docs/modules/{module-name}/`)**

### Standard File Naming Convention

**All BMAD Method core documents MUST use lowercase filenames with hyphens:**

| Document Type | Standard Filename | Location | Agent Responsible |
|---------------|-------------------|----------|-------------------|
| Project Brief | `project-brief.md` | `docs/` | Analyst |
| Product Requirements | `prd.md` | `docs/` | PM |
| Architecture | `architecture.md` | `docs/` | Architect |
| Frontend Architecture | `frontend-architecture.md` | `docs/` | Design Architect |
| UX/UI Specification | `uxui-spec.md` | `docs/` | Design Architect |
| Technology Stack | `tech-stack.md` | `docs/` | Architect |
| Data Models | `data-models.md` | `docs/` | Architect/Data Scientist |
| API Reference | `api-reference.md` | `docs/` | Architect |
| Deployment Guide | `deployment-guide.md` | `docs/` | DevOps |
| Platform Architecture | `platform-architecture.md` | `docs/` | Platform Engineer |
| Platform Guidelines | `platform-guidelines.md` | `docs/` | Platform Engineer |
| Test Plan | `test-plan.md` | `docs/` | QA |
| User Stories | `{epic-num}.{story-num}.story.md` | `docs/stories/` | SM |
| Epic Files | `epic-{id}.md` | `docs/stories/` | SM (from sharding) |
| Implementation Summary | `implementation-summary.md` | `docs/` | James |
| Test Results | `test-results.md` | `tests/` | James/QA |

### Module-Specific File Naming Convention

**Module documents follow the same naming pattern with module prefix:**

| Document Type | Module Filename | Agent Responsible |
|---------------|-----------------|-------------------|
| Module Brief | `docs/modules/{module-name}/module-brief.md` | Analyst |
| Module PRD | `docs/modules/{module-name}/module-prd.md` | PM |
| Module Architecture | `docs/modules/{module-name}/module-architecture.md` | Architect |
| Module Frontend Architecture | `docs/modules/{module-name}/module-frontend-architecture.md` | Design Architect |
| Module UX/UI Specification | `docs/modules/{module-name}/module-uxui-spec.md` | Design Architect |
| Module Tech Stack | `docs/modules/{module-name}/module-tech-stack.md` | Architect |
| Module Data Models | `docs/modules/{module-name}/module-data-models.md` | Architect/Data Scientist |
| Module API Reference | `docs/modules/{module-name}/module-api-reference.md` | Architect |
| Module Test Plan | `docs/modules/{module-name}/module-test-plan.md` | QA |
| Module Stories | `docs/modules/{module-name}/stories/{epic-num}.{story-num}.story.md` | SM |
| Module Implementation Summary | `docs/modules/{module-name}/implementation-summary.md` | James |
| Module Test Results | `tests/modules/{module-name}/test-results.md` | James/QA |

### Date Generation Standards

**All agents MUST use actual current dates, not placeholders:**
- Use format: `YYYY-MM-DD` for dates (e.g., `2024-01-15`)
- Use format: `YYYY-MM-DD HH:MM` for timestamps (e.g., `2024-01-15 14:30`)
- **NEVER use placeholders** like `{DATE}`, `[DATE]`, or `TBD`
- **ALWAYS generate actual current date** when creating documents

### Document Creation Standards

**All agents MUST save documents to files, not just output to chat:**
- **MANDATORY**: When creating PRDs, Epics, Stories, or any documentation, SAVE to the appropriate file location
- **NEVER WRITE TO PROJECT ROOT**: All files must go into organized directories (`docs/`, `tests/`, `src/`, etc.)
- **VERIFICATION**: Confirm file creation with file path and brief content preview
- **NO CHAT-ONLY**: Documents must exist as files for other agents to reference
- **STANDARD LOCATIONS**: Use `docs/` for project documentation, `.ai/` for agent knowledge files
- **TESTS**: All test files go in `tests/` directory with appropriate subdirectories

**`.ai/` Directory - Agent Intelligence:**
- `project-context.md` - Project goals, terminology, domain knowledge
- `tech-stack.md` - Technologies, frameworks, patterns in use
- `data-models.md` - Data structures and analytics approaches
- `deployment-info.md` - Infrastructure and deployment details
- `knowledge-versions.md` - Version history of knowledge updates
- Agent working files (test-issues.md, deployment-history.md, etc.)
- **Multi-Model Session Logs (in `.ai/multi-model-sessions/`)**
  - `orchestration/` - Multi-model orchestration planning sessions
  - `research/` - Collaborative market research and analysis sessions
  - `architecture/` - Architectural decision validation sessions
  - `code-review/` - Multi-model code quality analysis sessions
  - `optimization/` - Performance optimization collaboration sessions
- **Module Knowledge (in `.ai/modules/{module-name}/`)**
  - `module-context.md` - Module-specific context and terminology
  - `module-tech-stack.md` - Module-specific technologies and patterns
  - `module-data-models.md` - Module data structures and relationships
  - `module-integration.md` - Integration points with main project

### System Evolution Note

**If your project only has `docs/`:** You're likely using an older configuration or haven't run the knowledge update task yet. The current system automatically creates and manages the `.ai/` directory when you run `*BMAD Update Agent Knowledge`.

### Updating Agent Knowledge

#### When to Run Knowledge Updates

**Required Updates (Major Phases):**
- After Project Brief completion
- After PRD creation or major updates
- After Architecture design or significant changes
- After adding new modules or major features
- After tech stack changes

**Frequency Guidelines:**
- **New Projects**: 3-4 times during initial setup
- **Active Development**: Every 2-4 weeks or when major changes occur
- **Mature Projects**: Monthly or when adding significant features

**DON'T Update After:**
- Individual story completions
- Small bug fixes
- Routine development tasks
- Individual test runs

#### Running the Update

1. Complete a project phase (Brief, PRD, Architecture)
2. `*BMAD Update Agent Knowledge` - Extract and distribute knowledge
3. **Automatic Results:**
   - Creates `.ai/` directory if it doesn't exist
   - Generates knowledge files from your `docs/` content
   - Updates agent customization strings
   - Uses semantic versioning (Major.Minor.Patch) to track changes
   - Agents automatically read from `.ai/` for project context

### Creating Custom Agents

1. Copy existing persona file from `bmad-agent/personas/`
2. Modify for specialized role
3. Add to `ide-bmad-orchestrator.cfg.md` with:

```
## Title: {Custom Agent Name}
- Name: {Nickname}
- Customize: "{Specialization details}"
- Description: "{Role description}"
- Persona: "{base-persona-file.md}"
- Tasks:
  - [Task Name](task-file.md)
```

## Common Scenarios

### 1. Complete Project Initialization Flow
**Purpose:** Start a new project from scratch through to coordinated development

| Step | Agent | Command | Description |
|------|-------|---------|-------------|
| 1 | Analyst | `*Analyst Create Project Brief` | Brainstorm and research project concept |
| 2 | PM | `*PM Create PRD` | Create Product Requirements Document with epics and stories |
| 3 | Architect | `*Architect Create Architecture` | Design system architecture based on PRD |
| 4 | Platform Engineer | `*Platform Engineer Create Platform Architecture` | Design platform infrastructure (for complex projects) |
| 5 | Design Architect | `*Design Architect Create Frontend Architecture` | Design UI/UX architecture (if applicable) |
| 6 | Design Architect | `*Design Architect Create UXUI Spec` | Create detailed UI/UX specifications |
| 7 | BMAD | `*BMAD Update Agent Knowledge` | Update all agents with project knowledge |
| 8 | PO | `*PO organize` | Organize and validate all documentation |
| 9 | SM | `*SM doc-shard` | Break down large documents into manageable pieces |
| 10 | SM | `*SM create` | Create implementation stories with sub-agent strategy |
| 11 | Bill (PM) | `*PM orchestrate` | Create orchestration guide for coordinated execution |
| 12 | Bill (PM) | `*PM coordinate-subagents` | Coordinate James across Frontend/Backend/DevOps/Testing sub-agents |
| 13 | James (Dev) | `*Dev` | Implement through specialized sub-agents following Dev→Reviewer→Changer pattern |
| 14 | Reviewers | Review work | UI-Reviewer, Code-Reviewer, Infrastructure-Reviewer, QA-Reviewer validate work |
| 15 | Changers | Implement feedback | UI-Changer, Code-Changer, Infrastructure-Changer, Test-Changer address feedback |
| 16 | Integration | Deploy | Integrate all sub-agent work and deploy with comprehensive testing |

**Special Considerations:**
- **Bill (PM) Orchestration**: Bill manages all agent assignments and progress tracking
- **Sub-Agent Coordination**: Maximum 3 parallel sub-agents for quality control
- **Quality Pattern**: Every task follows James→Reviewer→Changer workflow
- Run `*BMAD Update Agent Knowledge` after each major phase
- Consider using `*perplexity` during research phases
- For UI-heavy projects, add `*dalle` for mockup generation after step 6
- **Include Platform Engineer (step 4)** for complex infrastructure, microservices, or enterprise projects
- **Skip Platform Engineer** for simple applications with basic infrastructure needs

### 2. Brownfield Project Takeover
**Purpose:** Integrate BMAD Method into an existing project

| Step | Agent | Command | Description |
|------|-------|---------|-------------|
| 1 | Analyst | `*Analyst Analyze Existing Project` | Document current state and challenges |
| 2 | PM | `*PM Reverse Engineer PRD` | Create PRD based on existing functionality |
| 3 | Architect | `*Architect Document Current Architecture` | Map out existing architecture |
| 4 | SM | `*SM doc-shard` | Break down documentation into manageable pieces |
| 5 | BMAD | `*BMAD Update Agent Knowledge` | Update all agents with project knowledge |
| 6 | PO | `*PO audit` | Identify documentation gaps |
| 7 | SM | `*SM create` | Create first enhancement story |
| 8 | Dev | `*Dev` | Implement the enhancement |

**Special Considerations:**
- Use `*github` to search for patterns in the existing codebase
- Consider `*SM pivot` if significant course correction is needed
- Create a project structure document if one doesn't exist

### 3. Adding New Module to Existing Project
**Purpose:** Extend a project beyond original PRD scope

| Step | Agent | Command | Description |
|------|-------|---------|-------------|
| 1 | Analyst | `*Analyst Research Module Requirements` | Research requirements for new module |
| 2 | PM | `*PM update-prd {module-name}` | Update PRD with new module requirements |
| 3 | Architect | `*Architect module-design {module-name}` | Design new module architecture |
| 4 | Design Architect | `*Design Architect Update Frontend Architecture` | Update UI/UX for new module (if applicable) |
| 5 | BMAD | `*BMAD Update Agent Knowledge` | Update all agents with new module knowledge |
| 6 | SM | `*SM doc-shard` | Break down module documentation |
| 7 | SM | `*SM create` | Create first module implementation story |
| 8 | Dev | `*Dev` | Implement the module story |
| 9 | QA | `*QA create-test-plan` | Create test plan for the module |
| 10 | Platform Engineer | `*Platform Engineer platform-change-management` | Plan platform infrastructure for complex modules |
| 11 | DevOps | `*DevOps infra-plan` | Plan basic infrastructure changes for new module |

**Special Considerations:**
- Ensure integration points with existing modules are clearly defined
- Consider impact on existing architecture and data models
- Update knowledge files to include new module terminology
- **Use Platform Engineer** for modules requiring service mesh, advanced monitoring, or complex infrastructure
- **Use DevOps Engineer** for modules with standard deployment and infrastructure needs

### 4. UI Redesign Workflow
**Purpose:** Implement frontend changes with minimal backend modifications

| Step | Agent | Command | Description |
|------|-------|---------|-------------|
| 1 | Design Architect | `*Design Architect Analyze Current UI` | Document current UI state and issues |
| 2 | PM | `*PM Create UI PRD` | Create UI-focused requirements document |
| 3 | Design Architect | `*Design Architect Create UXUI Spec` | Create detailed UI/UX specifications |
| 4 | Design Architect | `*Design Architect Create Frontend Architecture` | Update frontend architecture |
| 5 | Design Architect | `*Design Architect Create AI Frontend Prompt` | Create prompt for AI UI generation |
| 6 | BMAD | `*BMAD Update Agent Knowledge` | Update agents with UI knowledge |
| 7 | SM | `*SM create` | Create UI implementation story |
| 8 | Dev | `*Dev` | Implement UI changes |
| 9 | QA | `*QA create-test-plan` | Create UI-focused test plan |

**Special Considerations:**
- Use `*dalle` for UI mockup generation
- Focus on component-based architecture for reusability
- Consider accessibility requirements in specifications

### 5. API Integration Project
**Purpose:** Integrate external APIs into an existing project

| Step | Agent | Command | Description |
|------|-------|---------|-------------|
| 1 | Analyst | `*Analyst Research API` | Research API capabilities and limitations |
| 2 | PM | `*PM Create API Integration PRD` | Document API integration requirements |
| 3 | Architect | `*Architect Design API Integration` | Design integration architecture |
| 4 | BMAD | `*BMAD Update Agent Knowledge` | Update agents with API knowledge |
| 5 | SM | `*SM create` | Create API integration story |
| 6 | Dev | `*Dev` | Implement API integration |
| 7 | QA | `*QA create-test-plan` | Create API testing plan |
| 8 | DevOps | `*DevOps update-env` | Update environment with API credentials |

**Special Considerations:**
- Use `*perplexity` to research API best practices
- Create mock API responses for testing
- Document rate limits and fallback strategies

### 6. Database Migration Project
**Purpose:** Migrate from one database technology to another

| Step | Agent | Command | Description |
|------|-------|---------|-------------|
| 1 | Analyst | `*Analyst Research Database Options` | Research database technologies |
| 2 | Architect | `*Architect Design Database Migration` | Design migration architecture |
| 3 | Data Scientist | `*Data Scientist analyze` | Analyze data patterns and migration challenges |
| 4 | PM | `*PM Create Migration PRD` | Document migration requirements and phases |
| 5 | BMAD | `*BMAD Update Agent Knowledge` | Update agents with database knowledge |
| 6 | SM | `*SM create` | Create database migration story |
| 7 | Dev | `*Dev` | Implement migration code |
| 8 | QA | `*QA create-test-plan` | Create data validation test plan |
| 9 | DevOps | `*DevOps infra-plan` | Plan infrastructure changes for new database |

**Special Considerations:**
- Create data validation strategies for before and after migration
- Plan for rollback scenarios
- Consider performance testing with representative data volumes

### 7. Performance Optimization Project
**Purpose:** Improve performance of an existing application

| Step | Agent | Command | Description |
|------|-------|---------|-------------|
| 1 | Analyst | `*Analyst Performance Analysis` | Identify performance bottlenecks |
| 2 | Architect | `*Architect Performance Optimization Plan` | Design optimization strategy |
| 3 | PM | `*PM Create Optimization PRD` | Document optimization requirements |
| 4 | BMAD | `*BMAD Update Agent Knowledge` | Update agents with performance knowledge |
| 5 | SM | `*SM create` | Create optimization story |
| 6 | Dev | `*Dev` | Implement optimizations |
| 7 | QA | `*QA create-performance-test-plan` | Create performance test plan |
| 8 | Data Scientist | `*Data Scientist analyze-metrics` | Analyze performance metrics |

**Special Considerations:**
- Establish performance baselines before changes
- Use `*github` to research optimization patterns
- Consider both frontend and backend optimizations

### 8. Platform Infrastructure Setup
**Purpose:** Establish comprehensive platform infrastructure for complex projects

| Step | Agent | Command | Description |
|------|-------|---------|-------------|
| 1 | Analyst | `*Analyst Research Platform Requirements` | Research platform needs and constraints |
| 2 | Architect | `*Architect Create Architecture` | Design overall system architecture |
| 3 | Platform Engineer | `*Platform Engineer Create Platform Architecture` | Design platform infrastructure and services |
| 4 | Platform Engineer | `*Platform Engineer platform-change-management` | Implement platform infrastructure |
| 5 | BMAD | `*BMAD Update Agent Knowledge` | Update agents with platform knowledge |
| 6 | DevOps | `*DevOps deploy` | Set up basic deployment pipelines |
| 7 | QA | `*QA create-test-plan` | Create platform testing and validation plan |

**Special Considerations:**
- **Use for**: Microservices, service mesh, complex monitoring, developer platforms
- **Focus on**: Developer experience, self-service capabilities, observability
- **Include**: Security scanning, compliance frameworks, cost optimization
- **Document**: Platform APIs, developer onboarding, troubleshooting guides

### 9. Legacy Module Remediation
**Purpose:** Take over and fix a problematic existing module with multiple issues

| Step | Agent | Command | Description |
|------|-------|---------|-------------|
| 1 | Analyst | `*Analyst Analyze Legacy Module` | Document current issues, broken functionality, and technical debt |
| 2 | QA | `*QA create-test-plan` | Create comprehensive test plan to identify all defects |
| 3 | QA | `*QA run-tests` | Execute tests to catalog all broken functionality |
| 4 | Architect | `*Architect Document Current Architecture` | Map existing architecture and identify structural problems |
| 5 | PM | `*PM Create Remediation PRD` | Document remediation requirements and priorities |
| 6 | BMAD | `*BMAD Update Agent Knowledge` | Update agents with module knowledge and issues |
| 7 | SM | `*SM doc-shard` | Break down remediation work into manageable pieces |
| 8 | SM | `*SM create` | Create first remediation story (highest priority fixes) |
| 9 | Dev | `*Dev` | Implement fixes and improvements |
| 10 | QA | `*QA run-tests` | Validate fixes and regression testing |
| 11 | DevOps | `*DevOps deploy` | Deploy fixes to appropriate environments |

**Special Considerations:**
- **Start with critical issues**: Fix broken core functionality first
- **Document everything**: Catalog all issues before starting fixes
- **Incremental approach**: Fix issues in small, testable chunks
- **Regression testing**: Ensure fixes don't break other functionality
- **Data cleanup**: Address dummy data and placeholder content
- **User experience**: Prioritize user-facing issues (popups, forms, navigation)
- **Technical debt**: Plan for architectural improvements alongside bug fixes

### 10. Competitive Analysis Enhancement
**Purpose:** Use competitor research to identify improvements and missing features for existing modules

| Step | Agent | Command | Description |
|------|-------|---------|-------------|
| 1 | Analyst | `*Analyst Analyze Competitor Research` | Document competitive landscape and feature gaps |
| 2 | Architect | `*Architect Document Current Architecture` | Map existing module architecture and capabilities |
| 3 | Architect | `*Architect Compare Competitor Features` | Compare current architecture against competitor strengths |
| 4 | PM | `*PM Create Enhancement PRD` | Document enhancement requirements based on competitive analysis |
| 5 | Design Architect | `*Design Architect Analyze Competitor UX` | Analyze competitor UX patterns and improvements |
| 6 | BMAD | `*BMAD Update Agent Knowledge` | Update agents with competitive insights |
| 7 | SM | `*SM doc-shard` | Break down enhancement work into manageable epics |
| 8 | SM | `*SM create` | Create first enhancement story (highest priority features) |
| 9 | Dev | `*Dev` | Implement enhancements |
| 10 | QA | `*QA create-test-plan` | Create test plan comparing against competitor benchmarks |
| 11 | QA | `*QA run-tests` | Validate enhancements meet competitive standards |

**Special Considerations:**
- **Focus on differentiation**: Don't just copy - identify opportunities to exceed competitor capabilities
- **User value first**: Prioritize features that provide clear user value over feature parity
- **Technical feasibility**: Assess implementation complexity against business value
- **Incremental rollout**: Implement competitive features in phases to validate impact
- **Performance benchmarking**: Compare performance metrics against competitor standards
- **Market positioning**: Consider how enhancements affect overall product positioning

### Best Practices for Scenario Execution

**Documentation First:** Complete documentation phases before implementation

**Knowledge Updates:** Run `*BMAD Update Agent Knowledge` after each major phase

**Incremental Implementation:** Create and implement stories one at a time

**Regular Testing:** Integrate QA testing throughout the process

**Feedback Loops:** Use `*SM pivot` if significant course correction is needed

**MPC Integration:** Leverage appropriate MPCs for each scenario:
- Research: `*perplexity`
- Code patterns: `*github`
- Data analysis: `*firecrawl`
- UI visualization: `*dalle`

## Documentation Management

| Command | Description |
|---------|-------------|
| `*doc-out` / `/doc-out` | Output full document without truncation |
| `*PO organize` | Organize project documentation |
| `*PO audit` | Audit documentation for completeness |
| `*doc-cleanup` / `/doc-cleanup` | Clean up and reorganize docs/ folder with auto-indexing |
| `*doc-cleanup conservative` | Run cleanup with minimal changes |
| `*doc-cleanup aggressive` | Run full cleanup with auto-archiving |
| `*test-organize` | Move all test files from root to docs/tests/ structure |

## Task Orchestration Commands

| Command | Session | Description |
|---------|---------|-------------|
| `*task-flow {task-name}` | TaskExec | Start 3-agent workflow execution |
| `*task-flow-next` | TaskExec | Move to next sub-task after approval |
| `*task-flow-status` | Any | Show current workflow progress |
| `*task-flow-handoff` | Any | Generate handoff summary for next agent |

### Sub-Agent Orchestration Commands
| Command | Description |
|---------|-------------|
| `*PM orchestrate` / `*Bill orchestrate` | Create orchestration guide for coordinating sub-agents and parallel execution |
| `*PM assign-task {task}` / `*Bill assign-task {task}` | Assign specific task to appropriate agent based on orchestration guide |
| `*PM update-progress` / `*Bill update-progress` | Update orchestration guide with task completion status |
| `*PM coordinate-subagents` / `*Bill coordinate-subagents` | Coordinate parallel sub-agent execution |
| `*create-orchestration-guide` | Generate task execution matrix for stories |

### Multi-Agent Setup Commands
| Command | Description |
|---------|-------------|
| `*TaskExec` | Open Task Executor agent session |
| `*Reviewer` | Open Code Reviewer agent session |
| `*Changer` | Open Change Implementer agent session |
| `*Frontend-SubAgent` | Create Frontend specialized sub-agent |
| `*Backend-SubAgent` | Create Backend specialized sub-agent |
| `*DevOps-SubAgent` | Create DevOps specialized sub-agent |
| `*Testing-SubAgent` | Create Testing specialized sub-agent |

### Sub-Agent Workflow Pattern
**Standard Pattern**: James (Dev) → Reviewer → Changer (if needed)

**Sub-Agent Specializations**:
- **Frontend Sub-Agent**: James → UI-Reviewer → UI-Changer
- **Backend Sub-Agent**: James → Code-Reviewer → Code-Changer  
- **DevOps Sub-Agent**: James → Infrastructure-Reviewer → Infrastructure-Changer
- **Testing Sub-Agent**: James → QA-Reviewer → Test-Changer

## Best Practices

### Project Initialization Flow:
**Standard Projects**: Analyst → PM → Architect → Design Architect → PO → SM → Dev → QA → DevOps
**Complex Projects**: Analyst → PM → Architect → Platform Engineer → Design Architect → PO → SM → Dev → QA → DevOps

### Infrastructure Role Selection:
**Use DevOps Engineer for**:
- Basic deployment and CI/CD
- Standard monitoring and logging
- Simple infrastructure management
- Single-team projects

**Use Platform Engineer for**:
- Complex infrastructure (microservices, service mesh)
- Developer experience platforms
- Multi-team environments
- Advanced observability and monitoring
- Internal tooling and self-service platforms

### Knowledge Updates:
Run `*BMAD Update Agent Knowledge` after completing each major phase

### Story Development:
- Use SM to create stories
- Use Dev to implement
- Use QA to validate
- Use DevOps to deploy

### MPC Usage:
- Use `*perplexity` during research phases
- Use `*github` during implementation
- Use `*firecrawl` for data analysis
- Use `*dalle` for UI concept visualization

### Agent Switching:
- Use `*{agent}` for temporary switches
- Start new chat for major workflow transitions

---

This reference guide covers the core commands and workflows for effectively using the BMAD Method in your projects.