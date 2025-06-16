# {PROJECT-NAME} Orchestration Guide

**Date Created**: {CURRENT-DATE}  
**PM/Orchestrator**: Bill  
**Project Phase**: {PHASE}  
**Stories Source**: docs/stories/{stories-file}.md

## Overview
This orchestration guide manages the execution of tasks and sub-tasks across multiple agents, ensuring proper sequencing, parallel execution, and quality validation through the Dev → Reviewer → Changer workflow.

## Agent Assignment Workflow

### Primary Workflow Pattern
For each task and sub-task:
1. **James (Full Stack Engineer)** - Initial implementation
2. **Reviewer Agent** - Code review and validation  
3. **Changer Agent** (if needed) - Implement reviewer feedback
4. **PM (Bill)** - Update orchestration guide and assign next tasks

### Sub-Agent Creation Rules
When stories require parallel work, create sub-agents:
- **Frontend Sub-Agent**: UI/UX implementation tasks
- **Backend Sub-Agent**: API/Database implementation tasks  
- **DevOps Sub-Agent**: Infrastructure/deployment tasks
- **Testing Sub-Agent**: Test creation and execution

## Task Execution Matrix

### Sequential Tasks (Must Complete in Order)
| Order | Task | Agent | Dependencies | Status | Notes |
|-------|------|-------|--------------|--------|--------|
| 1 | {Task Name} | {Agent} | {Prerequisites} | ⏳ Pending | {Notes} |
| 2 | {Task Name} | {Agent} | Task 1 | ⏳ Pending | {Notes} |

### Parallel Tasks (Can Execute Simultaneously)  
| Parallel Group | Task | Agent | Sub-Agent | Status | Reviewer | Changer |
|----------------|------|-------|-----------|--------|----------|---------|
| A1 | {Frontend Task} | James | Frontend | ⏳ Pending | Reviewer | Changer |
| A2 | {Backend Task} | James | Backend | ⏳ Pending | Reviewer | Changer |
| B1 | {Infrastructure Task} | James | DevOps | ⏳ Pending | Reviewer | Changer |

## Status Tracking

### Task Status Definitions
- ⏳ **Pending**: Not yet started
- 🔄 **In Progress**: Currently being worked on
- 👀 **Under Review**: Being reviewed by Reviewer agent
- 🔧 **Needs Changes**: Changer agent implementing feedback
- ✅ **Completed**: Task finished and approved
- ❌ **Blocked**: Cannot proceed due to dependencies

### Progress Summary
- **Total Tasks**: {TOTAL-COUNT}
- **Completed**: {COMPLETED-COUNT}
- **In Progress**: {IN-PROGRESS-COUNT}
- **Pending**: {PENDING-COUNT}
- **Blocked**: {BLOCKED-COUNT}

## Agent Coordination Instructions

### For Bill (PM/Orchestrator)
1. **Read this guide before assigning any tasks**
2. **Update task status** when agents report completion
3. **Assign next tasks** based on dependencies and parallel capacity
4. **Create sub-agents** when parallel work is identified
5. **Monitor progress** and update this guide accordingly
6. **Resolve blockers** by coordinating with appropriate agents

### For James (Full Stack Engineer)
1. **Wait for task assignment** from Bill
2. **Complete assigned tasks** following BMAD best practices
3. **Report completion** to Bill for orchestration guide update
4. **Coordinate with sub-agents** when working in parallel

### For Reviewer Agent
1. **Review completed work** thoroughly
2. **Provide specific feedback** if changes needed
3. **Approve work** that meets quality standards
4. **Report review results** to Bill

### For Changer Agent
1. **Implement reviewer feedback** precisely
2. **Re-submit for review** after changes
3. **Report completion** to Bill

## Sub-Agent Coordination

### Creating Sub-Agents
When tasks can be parallelized:
```
Create Sub-Agent: Frontend-Dev
- Task: UI component implementation
- Reports to: James (Full Stack Engineer)
- Reviewer: UI-Reviewer
- Changer: UI-Changer

Create Sub-Agent: Backend-Dev  
- Task: API endpoint implementation
- Reports to: James (Full Stack Engineer)
- Reviewer: Code-Reviewer
- Changer: Code-Changer
```

### Parallel Execution Rules
1. **Maximum 3 parallel sub-agents** to maintain quality
2. **Each sub-agent** follows Dev → Reviewer → Changer pattern
3. **Coordinate dependencies** between parallel tasks
4. **Synchronize completion** before moving to next phase

## Quality Gates

### Before Task Assignment
- [ ] Task dependencies verified
- [ ] Required agents available
- [ ] Sub-agent needs identified
- [ ] Success criteria defined

### Before Task Completion
- [ ] Implementation completed by Dev agent
- [ ] Code reviewed by Reviewer agent
- [ ] Changes implemented by Changer agent (if needed)
- [ ] All acceptance criteria met
- [ ] Orchestration guide updated

### Before Phase Completion
- [ ] All tasks in phase completed
- [ ] Integration testing passed
- [ ] Documentation updated
- [ ] Knowledge base synchronized

## Communication Protocol

### Daily Standup Format
Bill reports:
- **Completed yesterday**: {Tasks completed}
- **Working today**: {Current assignments}
- **Blockers**: {Issues preventing progress}
- **Next assignments**: {Planned task assignments}

### Agent Reporting Format
Agents report to Bill:
- **Task**: {Task name and ID}
- **Status**: {Current status}
- **Completion**: {Percentage or milestone}
- **Blockers**: {Any issues}
- **Next steps**: {What's needed to proceed}

## Emergency Procedures

### When Tasks Are Blocked
1. **Identify blocker type** (dependency, resource, technical)
2. **Escalate to appropriate agent** or external resource
3. **Update orchestration guide** with blocker status
4. **Reassign available agents** to unblocked tasks
5. **Document resolution** when blocker is cleared

### When Quality Issues Arise
1. **Stop parallel work** in affected area
2. **Assign senior reviewer** for additional validation
3. **Implement fixes** before proceeding
4. **Update quality criteria** to prevent recurrence

---

**Last Updated**: {CURRENT-DATE} by {UPDATER-NAME}  
**Next Review**: {NEXT-REVIEW-DATE}