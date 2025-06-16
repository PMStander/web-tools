# Module Development Workflow

Develop a specific module within an existing project with complete documentation structure.

## Usage
```
/module-dev <module-name>
```

Example:
```
/module-dev user-authentication
/module-dev payment-processing
/module-dev reporting-dashboard
```

## Purpose
Extend a project beyond original PRD scope by adding new modules with proper integration points.

## Workflow Steps

### Phase 1: Requirements Analysis
1. **Analyst** - Research Module Requirements
   ```
   /analyst-module-research <module-name>
   ```
   - Research and document module requirements and context
   - Save to `docs/modules/{module-name}/module-brief.md`

2. **PM** - Create Module PRD
   ```
   /pm-module-prd <module-name>
   ```
   - Create module-specific Product Requirements Document
   - Save to `docs/modules/{module-name}/module-prd.md`

### Phase 2: Architecture & Design
3. **Architect** - Create Module Architecture
   ```
   /architect-module-design <module-name>
   ```
   - Design module architecture and integration points
   - Save to `docs/modules/{module-name}/module-architecture.md`

4. **Design Architect** - Create Module Frontend *(if applicable)*
   ```
   /design-architect-module-frontend <module-name>
   ```
   - Design module UI/UX components
   - Save to `docs/modules/{module-name}/module-frontend-architecture.md`

### Phase 3: Knowledge Integration
5. **BMAD** - Update Module Knowledge
   ```
   /update-module-knowledge <module-name>
   ```
   - Update agents with module-specific knowledge
   - Create `.ai/modules/{module-name}/` structure
   - Generate module context files

### Phase 4: Implementation Planning & Coordination
6. **SM** - Create Module Stories with Sub-Agent Strategy
   ```
   /sm-module-stories <module-name>
   ```
   - Create implementation stories with sub-agent assignments
   - Include parallel execution planning for module tasks
   - Save to `docs/modules/{module-name}/stories/`

7. **Bill (PM)** - Create Module Orchestration Guide
   ```
   /pm-orchestrate --module=<module-name>
   ```
   - Analyze module stories for parallel execution opportunities
   - Create module-specific orchestration guide
   - Plan sub-agent coordination for module integration
   - Save to `docs/modules/{module-name}/{module-name}-orchestration-guide.md`

8. **Enhanced Coordinated Implementation** - Execute Through Multi-Model Sub-Agents
   ```
   /sub-agent-coordination --guide=<module-orchestration-file>
   ```
   - James (Dev) implements through specialized sub-agents with Zen MCP enhancement
   - Follow Enhanced Dev → Reviewer → Changer pattern with multi-model validation:
     - **Dev Phase**: James uses `analyze` and `thinkdeep` for implementation validation
     - **Reviewer Phase**: Use `codereview` for multi-model code analysis (Claude + Gemini)
     - **Changer Phase**: Apply feedback with `debug` for complex issue resolution
   - Bill (PM) coordinates assignments and progress tracking with multi-model consensus validation

### Phase 5: Testing & Deployment
9. **Enhanced QA** - Create Module Test Plan Through Multi-Model Sub-Agents
   ```
   /qa-module-test-plan <module-name>
   ```
   - Create comprehensive test plan using Testing Sub-Agent with `thinkdeep` validation
   - Follow Enhanced QA-Reviewer → Test-Changer pattern:
     - **QA Phase**: Use `analyze` for comprehensive test coverage analysis
     - **QA-Reviewer Phase**: Use `codereview` for test quality validation
     - **Test-Changer Phase**: Use `debug` for test failure resolution
   - Save to `docs/modules/{module-name}/module-test-plan.md`

10. **Enhanced DevOps** - Deploy Module Through Multi-Model Sub-Agents
    ```
    /devops-deploy-module <module-name>
    ```
    - Deploy module using DevOps Sub-Agent coordination with multi-model validation
    - Follow Enhanced Infrastructure-Reviewer → Infrastructure-Changer pattern:
      - **DevOps Phase**: Use `analyze` for infrastructure assessment and optimization
      - **Infrastructure-Reviewer Phase**: Use `thinkdeep` for deployment strategy validation
      - **Infrastructure-Changer Phase**: Use `debug` for deployment issue resolution
    - Update deployment configurations and monitoring with performance optimization

## File Structure Created
```
docs/modules/{module-name}/
├── module-brief.md
├── module-prd.md  
├── module-architecture.md
├── module-frontend-architecture.md
├── module-tech-stack.md
├── module-data-models.md
├── module-api-reference.md
├── module-test-plan.md
└── stories/
    ├── 1.1.story.md
    └── ...

.ai/modules/{module-name}/
├── module-context.md
├── module-tech-stack.md
├── module-data-models.md
├── module-integration.md
└── multi-model-sessions/
    ├── architecture/
    ├── implementation/
    ├── testing/
    └── deployment/
```

## Special Considerations
- **Modular Documentation**: Each module maintains its own documentation structure
- **Integration Focus**: Ensure clear integration points with existing project modules
- **Independent Testing**: Module should be testable independently from main project
- **Knowledge Isolation**: Module knowledge updates don't overwrite main project knowledge

## Platform vs DevOps Selection
- **Use Platform Engineer**: For modules requiring service mesh, advanced monitoring, or complex infrastructure
- **Use DevOps Engineer**: For modules with standard deployment and infrastructure needs

## Enhanced Multi-Model Orchestration Integration
- **After Phase 4**: Module orchestration guide coordinates all sub-agent work with multi-model planning validation
- **During Implementation**: Bill (PM) manages sub-agent assignments and dependencies using `thinkdeep` for complex coordination decisions
- **Enhanced Quality Control**: Each sub-agent follows Enhanced Dev → Reviewer → Changer pattern:
  - **Multi-Model Code Review**: Use `codereview` for comprehensive analysis across AI models
  - **Performance Optimization**: Apply pattern "Study the code properly, think deeply about improvements, brainstorm with Gemini"
  - **Consensus Validation**: Critical decisions require multi-model agreement before proceeding
  - **Session Logging**: All multi-model collaborations logged in `.ai/modules/{module-name}/multi-model-sessions/`

## Related Commands
- `/pm-orchestrate` - Create module orchestration guide
- `/sub-agent-coordination` - Coordinate module sub-agent execution
- `/project-init` - Initialize new projects
- `/legacy-fix` - Fix problematic existing modules
- `/update-module-knowledge` - Update module-specific knowledge