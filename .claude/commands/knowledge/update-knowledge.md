# Update Agent Knowledge

Extract and distribute project knowledge to all BMAD agents for synchronized context.

## Usage
```
/update-knowledge
```

For module-specific knowledge updates:
```
/update-module-knowledge <module-name>
```

## Purpose
This command creates and updates the `.ai/` directory structure with extracted knowledge from project documentation, ensuring all agents have consistent, up-to-date project context.

## Implementation
Execute the agent knowledge update task:

1. **Load Update Task**
   - Read `bmad-agent/tasks/agent-knowledge-update-task.md`
   - Use `bmad-agent/tasks/create-knowledge-files.js` if available

2. **Knowledge Extraction**
   - Scan `docs/` directory for all project documentation
   - Extract key information from:
     - Project brief
     - PRD and requirements
     - Architecture documentation
     - Technical specifications
     - User stories and epics

3. **Knowledge File Creation**
   Create/update files in `.ai/` directory:
   ```
   .ai/
   ├── project-context.md       # Project goals, terminology, domain knowledge
   ├── tech-stack.md           # Technologies, frameworks, patterns
   ├── data-models.md          # Data structures and relationships
   ├── deployment-info.md      # Infrastructure and deployment details
   ├── knowledge-versions.md   # Version history of updates
   └── modules/               # Module-specific knowledge
       └── {module-name}/
           ├── module-context.md
           ├── module-tech-stack.md
           ├── module-data-models.md
           └── module-integration.md
   ```

4. **Version Management**
   - Use semantic versioning (Major.Minor.Patch)
   - Track what changed in each update
   - Maintain update history

## Knowledge File Templates
Use templates from `bmad-agent/templates/`:
- `project-context-tmpl.md`
- `tech-stack-tmpl.md`
- `data-models-tmpl.md`
- `deployment-info-tmpl.md`
- `knowledge-version-tmpl.md`

## When to Run Knowledge Updates

### Required Updates (Major Phases)
- After Project Brief completion
- After PRD creation or major updates
- After Architecture design or significant changes
- After adding new modules or major features
- After tech stack changes

### Frequency Guidelines
- **New Projects**: 3-4 times during initial setup
- **Active Development**: Every 2-4 weeks or when major changes occur
- **Mature Projects**: Monthly or when adding significant features

### DON'T Update After
- Individual story completions
- Small bug fixes
- Routine development tasks
- Individual test runs

## Automatic Results
When knowledge update completes:
- Creates `.ai/` directory if it doesn't exist
- Generates knowledge files from `docs/` content
- Updates agent customization strings
- Agents automatically read from `.ai/` for project context
- All agents receive synchronized project understanding

## Quality Checklist
Verify knowledge update includes:
- [ ] Project goals and objectives
- [ ] Technical architecture and constraints
- [ ] Data models and relationships
- [ ] Integration points and dependencies
- [ ] Domain-specific terminology
- [ ] Current technology stack
- [ ] Deployment and infrastructure info
- [ ] Version tracking updated

## Agent Synchronization
After knowledge update, all agents will have access to:
- Current project context and goals
- Technical architecture understanding
- Data model awareness
- Integration point knowledge
- Domain terminology and concepts

## Related Commands
- `/memory-extract` - Extract knowledge from conversation threads
- `/knowledge-map` - Generate visual knowledge representation
- `/validate-knowledge` - Validate knowledge consistency
- `/knowledge-request` - Flag knowledge gaps