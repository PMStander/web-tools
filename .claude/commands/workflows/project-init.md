# Complete Project Initialization Workflow

Start a new project from scratch through to development readiness.

## Usage
```
/project-init
```

For complex projects requiring platform infrastructure:
```
/project-init --complex
```

## Workflow Steps
Execute this complete workflow for new project initialization:

### Phase 1: Requirements & Design
1. **Analyst** - Create Project Brief
   - Research and brainstorm project concept
   - Document requirements and constraints
   - Save to `docs/project-brief.md`

2. **PM** - Create PRD  
   - Create Product Requirements Document with epics and stories
   - Save to `docs/prd.md`

3. **Architect** - Create Architecture
   - Design system architecture based on PRD
   - Save to `docs/architecture.md`

4. **Platform Engineer** *(Complex projects only)*
   - Design platform infrastructure for microservices/enterprise
   - Save to `docs/platform-architecture.md`

5. **Design Architect** - Create Frontend Architecture
   - Design UI/UX architecture if applicable
   - Save to `docs/frontend-architecture.md`

6. **Design Architect** - Create UX/UI Spec
   - Create detailed UI/UX specifications
   - Save to `docs/uxui-spec.md`

### Phase 2: Knowledge & Organization
7. **BMAD** - Update Agent Knowledge
   - Extract and distribute project knowledge
   - Create `.ai/` directory structure
   - Update all agent contexts

8. **PO** - Organize Documentation
   - Organize and validate all documentation
   - Ensure consistency and completeness

### Phase 3: Implementation Setup  
9. **SM** - Document Sharding
   - Break down large documents into manageable pieces
   - Create epic files in `docs/stories/`

10. **SM** - Create Stories with Sub-Agent Strategy
    - Create implementation stories with sub-agent assignments
    - Include parallel execution planning in each story
    - Save to `docs/stories/1.1.story.md` (and subsequent stories)

11. **Bill (PM)** - Create Orchestration Guide
    - Analyze all stories for parallel execution opportunities
    - Create task execution matrix with sub-agent assignments
    - Save orchestration guide to `docs/stories/{project-name}-orchestration-guide.md`
    - Use `/pm-orchestrate` command

### Phase 4: Coordinated Development Execution
12. **Bill (PM)** - Coordinate Sub-Agent Execution
    - Follow orchestration guide for task assignments
    - Create sub-agents for parallel work (Frontend, Backend, DevOps, Testing)
    - Use `/sub-agent-coordination` workflow

13. **James (Dev)** - Execute Through Sub-Agents
    - Implement tasks following Dev → Reviewer → Changer pattern
    - Coordinate across multiple sub-agent contexts
    - Report progress to Bill for orchestration updates

14. **Specialized Reviewers** - Quality Validation
    - UI-Reviewer validates frontend work
    - Code-Reviewer validates backend work  
    - Infrastructure-Reviewer validates DevOps work
    - QA-Reviewer validates testing work

15. **Changer Agents** - Implement Feedback
    - UI-Changer implements frontend feedback
    - Code-Changer implements backend feedback
    - Infrastructure-Changer implements DevOps feedback
    - Test-Changer implements testing feedback

16. **Integration and Deployment**
    - Integrate all sub-agent work
    - Execute comprehensive testing across all components
    - Deploy to appropriate environment with monitoring

## Special Considerations
- **Complex Projects**: Include Platform Engineer for microservices, service mesh, enterprise infrastructure
- **Simple Projects**: Skip Platform Engineer for basic applications
- **UI-Heavy Projects**: Use `/dalle` for mockup generation after UI specs
- **Research-Heavy**: Use `/perplexity` during research phases

## Orchestration Integration
- **After Phase 3**: Use `/pm-orchestrate` to create coordination strategy
- **During Phase 4**: Use `/sub-agent-coordination` for parallel execution
- **Throughout**: Bill (PM) manages all agent assignments and progress tracking

## Knowledge Updates
Run `/update-knowledge` after each major phase to keep all agents synchronized.

## Related Commands
- `/pm-orchestrate` - Create orchestration guide for coordinated execution
- `/sub-agent-coordination` - Manage parallel sub-agent execution
- `/module-dev` - Add modules to existing projects
- `/legacy-fix` - Take over existing problematic projects
- `/update-knowledge` - Update agent knowledge base