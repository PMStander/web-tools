# Sub-Agent Coordination Workflow

Coordinate multiple sub-agents for parallel task execution with quality validation.

## Usage
```
/sub-agent-coordination
```

Start coordination for specific orchestration:
```
/sub-agent-coordination --guide=<orchestration-file>
```

Monitor active sub-agents:
```
/sub-agent-coordination --status
```

## Purpose
Enable parallel execution of development tasks through coordinated sub-agents while maintaining quality through the Dev → Reviewer → Changer pattern for each sub-agent.

## Sub-Agent Creation Strategy

### When to Create Sub-Agents
- Multiple tasks can be executed simultaneously
- Tasks require specialized expertise (Frontend vs Backend vs DevOps)
- Work can be distributed without creating conflicts
- Team capacity allows for parallel execution (max 3 concurrent)

### Sub-Agent Types and Responsibilities

#### Frontend Sub-Agent
**Primary Agent**: James (Full Stack Engineer) - Frontend Focus
**Responsibilities**:
- UI component implementation
- Frontend styling and layouts
- User interaction logic
- Client-side validation
- Frontend testing

**Review Chain**:
- **Reviewer**: UI-Reviewer (Design Architect or Senior Frontend Dev)
- **Changer**: UI-Changer (Frontend specialist for implementing feedback)

#### Backend Sub-Agent  
**Primary Agent**: James (Full Stack Engineer) - Backend Focus
**Responsibilities**:
- API endpoint implementation
- Database operations and queries
- Business logic implementation
- Server-side validation
- Backend testing

**Review Chain**:
- **Reviewer**: Code-Reviewer (Senior Backend Dev or Architect)
- **Changer**: Code-Changer (Backend specialist for implementing feedback)

#### DevOps Sub-Agent
**Primary Agent**: James (Full Stack Engineer) - Infrastructure Focus
**Responsibilities**:
- Infrastructure setup and configuration
- Deployment pipeline implementation
- Monitoring and logging setup
- Environment configuration
- Infrastructure testing

**Review Chain**:
- **Reviewer**: Infrastructure-Reviewer (DevOps Lead or Platform Engineer)
- **Changer**: Infrastructure-Changer (DevOps specialist for implementing feedback)

#### Testing Sub-Agent
**Primary Agent**: James (Full Stack Engineer) - Testing Focus
**Responsibilities**:
- Test case creation and implementation
- Test automation setup
- Quality validation processes
- Performance testing
- Test result analysis

**Review Chain**:
- **Reviewer**: QA-Reviewer (QA Lead or Test Architect)
- **Changer**: Test-Changer (QA specialist for implementing feedback)

## Coordination Workflow

### 1. Sub-Agent Initialization
```
For each parallel task group:
1. Create specialized sub-agent with specific focus
2. Assign reviewer agent based on task type
3. Prepare changer agent for potential rework
4. Set up communication channels between agents
```

### 2. Parallel Execution Pattern
```
Sub-Agent A (Frontend):        Sub-Agent B (Backend):         Sub-Agent C (DevOps):
James → UI-Reviewer           James → Code-Reviewer          James → Infra-Reviewer
↓                            ↓                             ↓
UI-Changer (if needed)       Code-Changer (if needed)      Infra-Changer (if needed)
```

### 3. Synchronization Points
- **Daily standup**: All sub-agents report progress to Bill (PM)
- **Integration checkpoints**: Parallel work synchronizes at defined milestones
- **Quality gates**: No sub-agent proceeds until quality standards met
- **Dependency coordination**: Sub-agents coordinate shared resources

### 4. Integration and Handoff
- **Integration testing**: Parallel work merged and tested together
- **Cross-sub-agent reviews**: Sub-agents review each other's integration points
- **Final validation**: Complete feature tested across all sub-agent contributions
- **Knowledge consolidation**: Lessons learned shared across sub-agents

## Quality Assurance Framework

### Per Sub-Agent Quality Process
1. **Implementation**: James completes assigned tasks in specialized focus area
2. **Specialized Review**: Domain expert reviewer validates work quality
3. **Feedback Implementation**: Changer agent addresses reviewer feedback
4. **Re-review**: Reviewer validates changes meet standards
5. **Approval**: Work approved for integration with other sub-agents
6. **Task Completion**: Agent marks task complete in story, Bill marks complete in orchestration guide

### Cross-Sub-Agent Quality Process
1. **Integration Testing**: All sub-agent work tested together
2. **Cross-Domain Review**: Sub-agents review integration points
3. **Performance Validation**: Complete feature meets performance requirements
4. **User Acceptance**: Feature meets original story acceptance criteria

### Quality Gates
- **Before Integration**: All sub-agent work individually approved
- **Before Deployment**: Integrated work passes all quality checks
- **Before Phase Completion**: All features meet acceptance criteria

## Task Completion Requirements

### Double-Check System
- **Agent Responsibility**: When work is approved by reviewer OR when Changer agent completes updates, the implementing agent MUST mark the task as complete in the story
- **PM Confirmation**: Bill (PM) MUST mark the same task as complete in the orchestration guide
- **Verification**: This double-check ensures no tasks are missed and progress is accurately tracked across both story-level and orchestration-level documentation

### Completion Triggers
- **Direct Approval**: Reviewer approves work without changes → Agent marks complete
- **Post-Change Approval**: Changer implements feedback and work is re-approved → Changer marks complete
- **Integration Success**: Task passes integration testing → Agent confirms completion
- **Bill's Validation**: Bill validates completion in orchestration guide within 24 hours

## Coordination Rules

### Resource Management
- **Shared Databases**: Coordinate schema changes and data access
- **Shared APIs**: Ensure API contract consistency across sub-agents
- **Shared Environments**: Schedule deployments to avoid conflicts
- **Shared Dependencies**: Coordinate library and framework updates

### Communication Protocol
- **Real-time Chat**: Sub-agents communicate directly for immediate coordination
- **Daily Updates**: Progress reported to Bill (PM) for orchestration updates
- **Task Completion Updates**: Agent marks task complete in story, Bill confirms completion in orchestration guide
- **Issue Escalation**: Blockers reported immediately to appropriate resolver
- **Knowledge Sharing**: Technical decisions shared across relevant sub-agents

### Dependency Management
- **Sequential Dependencies**: Some tasks must complete before others start
- **Shared Dependencies**: Multiple sub-agents depend on same external resource
- **Cross-Domain Dependencies**: Frontend depends on backend API completion
- **Integration Dependencies**: All sub-agents must complete before integration

## Maximum Capacity Guidelines

### Optimal Configuration
- **3 parallel sub-agents maximum** for quality management
- **1 primary agent (James)** working across all sub-agents
- **Specialized reviewers** for each domain (UI, Backend, DevOps, QA)
- **Dedicated changers** for implementing reviewer feedback

### Resource Allocation
- **James's time**: Distributed across active sub-agents based on priority
- **Reviewer availability**: Scheduled review cycles for timely feedback
- **Changer bandwidth**: On-demand availability for implementing changes
- **Bill's coordination**: Continuous orchestration and progress management

## Emergency Procedures

### When Sub-Agent Work Conflicts
1. **Immediate coordination meeting** between affected sub-agents
2. **Technical decision** made by appropriate architect or lead
3. **Rework coordination** to align conflicting implementations
4. **Integration testing** to validate conflict resolution

### When Quality Issues Arise
1. **Stop parallel work** in affected area until resolution
2. **Escalate to senior reviewer** for additional validation
3. **Implement quality fixes** before resuming parallel work
4. **Update quality criteria** to prevent recurrence

### When Dependencies Block Progress
1. **Identify dependency blocker** and escalate to resolver
2. **Reassign available sub-agents** to unblocked work
3. **Update orchestration guide** with revised timeline
4. **Resume blocked work** once dependency resolved

## Success Metrics

### Efficiency Gains
- **Parallel execution**: Multiple tasks completed simultaneously
- **Specialized expertise**: Right agent for right task type
- **Reduced bottlenecks**: Work continues while individual tasks under review

### Quality Maintenance
- **Specialized reviews**: Domain experts validate appropriate work
- **Cross-domain integration**: Different specialties work together effectively
- **Consistent standards**: Quality maintained across all parallel work streams

## Related Commands
- `/pm-orchestrate` - Create orchestration guide that defines sub-agent strategy
- `/dev-implement` - James executes tasks across multiple sub-agent contexts
- `/qa-review` - Reviewers validate sub-agent work in their specialization
- `/update-knowledge` - Knowledge updates include sub-agent coordination lessons