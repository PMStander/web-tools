# Plan Workflow Task

## Task Overview
Create a command that analyzes user goals and recommends the optimal sequence of BMAD commands to achieve them. This addresses the need for non-developers to get guidance on which agents to call and in what order.

## Command Usage
```
*plan-workflow "{description of what you want to accomplish}"
```

## Examples

### Example 1: Dashboard Enhancement
**Input:**
```
*plan-workflow "I want to update my dashboard with new user analytics, add real-time notifications, and research best practices for data visualization"
```

**Expected Output:**
```
## Recommended Workflow for Dashboard Enhancement

### Phase 1: Research & Requirements (Steps 1-3)
1. *Analyst Research Data Visualization Best Practices
2. *Analyst Research Real-time Notification Technologies  
3. *PM Update PRD (dashboard analytics + notifications)

### Phase 2: Architecture & Design (Steps 4-6)
4. *Architect Design Dashboard Analytics Integration
5. *Architect Design Real-time Notification System
6. *Design Architect Create Dashboard UX Updates

### Phase 3: Knowledge Update & Planning (Steps 7-8)
7. *BMAD Update Agent Knowledge
8. *SM doc-shard (break down complex requirements)

### Phase 4: Implementation (Steps 9-12)
9. *SM create (analytics dashboard story)
10. *SM create (notification system story)
11. *Dev implement analytics dashboard
12. *Dev implement notification system

### Phase 5: Testing & Deployment (Steps 13-15)
13. *QA create-test-plan (dashboard + notifications)
14. *QA run-tests
15. *DevOps deploy

**Estimated Timeline:** 2-3 weeks
**Key Dependencies:** Analytics data source, notification service selection
**Recommended Parallel Work:** Steps 4-5 can run in parallel, Steps 11-12 can run in parallel
```

### Example 2: New Feature Module
**Input:**
```
*plan-workflow "I want to add user authentication, create user profiles, and integrate with social media login"
```

**Expected Output:**
```
## Recommended Workflow for User Authentication Module

### Phase 1: Research & Requirements (Steps 1-4)
1. *Analyst Research Authentication Best Practices
2. *Analyst Research Social Media Login Integration
3. *PM Create Module PRD (authentication + profiles + social login)
4. *Architect module-design user-authentication

### Phase 2: Architecture & Design (Steps 5-7)
5. *Design Architect Create Module Frontend Architecture
6. *Design Architect Create UXUI Spec (login/profile pages)
7. *BMAD Update Module Knowledge user-authentication

### Phase 3: Implementation Planning (Steps 8-10)
8. *SM doc-shard (break down auth module requirements)
9. *SM create (authentication core story)
10. *SM create (social login integration story)

### Phase 4: Development (Steps 11-14)
11. *Dev implement authentication core
12. *Dev implement user profiles
13. *Dev implement social login integration
14. *QA create-test-plan (security testing focus)

### Phase 5: Security & Deployment (Steps 15-17)
15. *QA run-tests (include security testing)
16. *DevOps update-env (OAuth credentials, security config)
17. *DevOps deploy

**Estimated Timeline:** 3-4 weeks
**Key Dependencies:** OAuth app registration, database schema updates
**Security Notes:** Requires security review at steps 14-15
```

### Example 3: Bug Fix & Enhancement
**Input:**
```
*plan-workflow "My user registration form has broken validation, the dashboard loads slowly, and I want to add email notifications"
```

**Expected Output:**
```
## Recommended Workflow for Bug Fixes & Enhancements

### Phase 1: Issue Analysis (Steps 1-3) - URGENT
1. *QA create-test-plan (validate current issues)
2. *QA run-tests (catalog all broken functionality)
3. *Analyst Performance Analysis (dashboard speed issues)

### Phase 2: Requirements & Planning (Steps 4-6)
4. *PM Create Remediation PRD (fixes + email feature)
5. *Architect Design Email Notification System
6. *BMAD Update Agent Knowledge

### Phase 3: Priority Implementation (Steps 7-10)
7. *SM create (URGENT: registration validation fix)
8. *Dev implement registration fixes
9. *SM create (dashboard performance optimization)
10. *Dev implement performance fixes

### Phase 4: Enhancement Implementation (Steps 11-13)
11. *SM create (email notification system)
12. *Dev implement email notifications
13. *QA run-tests (regression testing + new features)

### Phase 5: Deployment (Step 14)
14. *DevOps deploy

**Estimated Timeline:** 1-2 weeks
**Priority Order:** Registration fix (immediate), Performance (1 week), Email (2 weeks)
**Risk Mitigation:** Test fixes thoroughly before adding new features
```

## Task Implementation Instructions

### Step 1: Analyze User Input
- **Parse Goals**: Extract main objectives from user description
- **Identify Complexity**: Determine if this is bug fix, new feature, enhancement, or mixed
- **Assess Scope**: Single module vs. multi-module vs. full project

### Step 2: Determine Workflow Type
Match user goals to standard workflow patterns:

- **New Project**: Complete initialization flow (Analyst → PM → Architect → etc.)
- **New Module**: Module development workflow
- **Bug Fixes**: Legacy remediation workflow  
- **Enhancements**: Feature addition workflow
- **Mixed Scope**: Hybrid workflow with prioritized phases

### Step 3: Generate Command Sequence
Create logical sequence based on:

1. **Dependencies**: Research before design, design before implementation
2. **Risk**: Fix critical issues before adding features
3. **Efficiency**: Group related work, identify parallel opportunities
4. **Knowledge Updates**: Include BMAD updates after major phases
5. **Testing**: Include QA checkpoints throughout

### Step 4: Add Context & Recommendations
Include:
- **Estimated Timeline**: Based on complexity and scope
- **Dependencies**: External requirements or blockers
- **Parallel Work**: Steps that can run simultaneously  
- **Risk Factors**: Security, performance, or complexity concerns
- **Priority Order**: If multiple goals, recommend sequencing

### Step 5: Format Output
Structure as:
- **Phase Headers**: Logical groupings of work
- **Numbered Steps**: Clear command sequence
- **Timing Estimates**: Realistic timelines
- **Key Considerations**: Dependencies, risks, opportunities

## Workflow Pattern Library

### Pattern 1: New Feature Development
```
Research → Requirements → Architecture → Design → Knowledge Update → 
Story Creation → Implementation → Testing → Deployment
```

### Pattern 2: Bug Fix & Remediation  
```
Issue Analysis → Testing → Requirements → Priority Implementation → 
Regression Testing → Deployment
```

### Pattern 3: Enhancement & Optimization
```
Current State Analysis → Competitive Research → Requirements → 
Architecture Updates → Implementation → Performance Testing → Deployment
```

### Pattern 4: Mixed Scope (Fixes + Features)
```
Critical Fix Analysis → Emergency Fixes → Requirements Planning → 
Feature Implementation → Integration Testing → Deployment
```

## Command Integration Points

### With Existing Commands
- **Integrates with**: All existing BMAD commands
- **Enhances**: `*help` command by providing contextual guidance
- **Complements**: `*task-flow` orchestration commands
- **Supports**: All workflow scenarios in commands.md

### Agent Assignment Logic
- **Research Tasks**: Analyst
- **Requirements**: PM  
- **Architecture**: Architect or Platform Engineer (based on complexity)
- **UI/UX**: Design Architect
- **Implementation**: Dev (James with sub-agents)
- **Testing**: QA
- **Deployment**: DevOps
- **Knowledge**: BMAD

### Complexity Assessment
- **Simple**: Single agent, 1-3 steps
- **Moderate**: 2-3 agents, 4-8 steps, single phase
- **Complex**: Multiple agents, 9+ steps, multiple phases
- **Enterprise**: Platform Engineer required, extensive coordination

## Success Metrics

### User Experience
- **Clarity**: Commands are clearly explained with context
- **Actionability**: Each step is a specific, executable command
- **Efficiency**: Optimal sequence with minimal redundancy
- **Completeness**: All necessary steps included

### Technical Quality
- **Dependency Management**: Proper sequencing of dependent tasks
- **Risk Management**: Critical issues addressed first
- **Resource Optimization**: Parallel work identified where possible
- **Quality Gates**: Testing and review steps included

## Error Handling

### Invalid Input
- **Vague Goals**: Request clarification with examples
- **Conflicting Goals**: Highlight conflicts and suggest prioritization
- **Out of Scope**: Redirect to appropriate resources or agents

### Complex Scenarios
- **Multiple Projects**: Suggest breaking into separate workflows
- **Unclear Dependencies**: Recommend discovery phase
- **High Risk**: Flag for manual review and additional planning

## Implementation Notes

### Agent Behavior
This task should be implemented to:
1. **Analyze** user input for key objectives and complexity
2. **Match** to appropriate workflow patterns
3. **Generate** specific command sequences with context
4. **Provide** timing estimates and dependency information
5. **Format** output for easy execution

### Integration Requirements
- **Access** to all BMAD command definitions
- **Understanding** of agent capabilities and limitations  
- **Knowledge** of project workflow patterns
- **Ability** to assess complexity and risk factors