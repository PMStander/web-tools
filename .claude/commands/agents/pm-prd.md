# PM - Create Product Requirements Document

Create a comprehensive PRD based on the project brief and requirements analysis.

## Usage
```
/pm-prd
```

For module-specific PRDs:
```
/pm-prd --module=<module-name>
```

For specific PRD types:
```
/pm-prd --type=ui-redesign
/pm-prd --type=api-integration
/pm-prd --type=migration
```

## Implementation
Switch to PM persona and execute PRD creation:

1. **Load PM Context**
   - Read `bmad-agent/personas/pm.md`
   - Load `bmad-agent/tasks/create-prd.md`
   - Apply `bmad-agent/checklists/pm-checklist.md`

2. **Requirements Analysis**
   - Review project brief from `docs/project-brief.md`
   - Analyze existing project context if available
   - Identify functional and non-functional requirements
   - Define user stories and acceptance criteria

3. **Epic and Story Planning**
   - Break down requirements into logical epics
   - Create detailed user stories for each epic
   - Define story acceptance criteria
   - Estimate story complexity and effort

4. **Documentation**
   - Use template from `bmad-agent/templates/prd-tmpl.md`
   - Save to `docs/prd.md` (or `docs/modules/{module-name}/module-prd.md`)
   - Include detailed specifications and wireframes if needed
   - Use actual current date (YYYY-MM-DD format)

## PRD Structure
The PRD should include:
- **Executive Summary**: Project overview and business case
- **Product Goals**: Objectives and success metrics
- **User Personas**: Target users and their needs
- **Features & Requirements**: Detailed feature specifications
- **User Stories**: Organized by epics with acceptance criteria
- **Technical Requirements**: Performance, security, integration needs
- **Timeline & Milestones**: Development phases and deliverables
- **Assumptions & Dependencies**: Known constraints and dependencies

## Story Writing Guidelines
Follow BMAD story format:
- **Epic Structure**: Logical grouping of related stories
- **Story Format**: As a [user], I want [goal] so that [benefit]
- **Acceptance Criteria**: Clear, testable conditions
- **Story Numbering**: {epic-num}.{story-num} format

## Quality Checklist
Before completion, verify:
- [ ] All requirements from project brief addressed
- [ ] User stories have clear acceptance criteria
- [ ] Technical requirements specified
- [ ] Success metrics defined
- [ ] Dependencies and assumptions documented
- [ ] File saved to correct location with actual date

## Integration Points
Consider integration with:
- Existing system APIs and data models
- Third-party services and dependencies
- Authentication and authorization systems
- Monitoring and analytics platforms

## Next Steps
After completing the PRD:
1. Run `/update-knowledge` to distribute product knowledge
2. Execute `/architect-design` to create system architecture
3. Use `/sm-create-stories` to begin story implementation

## Related Commands
- `/architect-design` - Create architecture based on PRD
- `/sm-create-stories` - Create implementation stories
- `/update-knowledge` - Update agent knowledge with PRD details