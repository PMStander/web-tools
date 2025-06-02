# Project Cleanup and Generalization Plan

## Overview
This plan details the systematic removal of project-specific content and transformation of the existing project management system into a reusable framework.

## Removal Strategy

### Immediate Removals (No Risk)
These directories/files contain only project-specific content and can be safely removed:

#### 1. Modules Directory
```bash
rm -rf modules/
```
**Content**: All Partners In Biz specific modules (agency, chat, hr, writer, projects, planned-modules)
**Impact**: None on core system functionality

#### 2. Project-Specific Core Directory
```bash
rm -rf core/
```
**Content**: Partners In Biz architecture documentation
**Impact**: None - replaced by .project/core/ structure

#### 3. Project-Specific Documentation
```bash
rm -rf docs/
```
**Content**: Business-specific module documentation and integration summaries
**Impact**: None on system functionality

### Content Clearing (Keep Structure)
These directories should be kept but their current content removed:

#### 1. Plans Directory
```bash
rm plans/*.md
```
**Keep**: Directory structure
**Remove**: All current plan files (all Partners In Biz specific)

#### 2. Task Logs Directory
```bash
rm task-logs/*.md
```
**Keep**: Directory structure
**Remove**: All historical task logs (project-specific)

#### 3. Errors Directory
```bash
rm errors/*.md
```
**Keep**: Directory structure
**Remove**: Historical error logs (project-specific)

### File Modifications
These files need content updates to be project-agnostic:

#### 1. Knowledge/Best Practices
- **File**: `knowledge/best-practices.md`
- **Action**: Remove Partners In Biz and Firebase specific content
- **Keep**: Generic development practices, architecture patterns, code quality guidelines

#### 2. Knowledge Files as Templates
- **Files**: `knowledge/decisions.md`, `knowledge/lessons-learned.md`
- **Action**: Clear current content, convert to templates

#### 3. Status Files as Templates
- **Files**: `status/current-focus.md`, `status/progress-tracker.md`, `status/roadmap.md`
- **Action**: Clear project-specific content, convert to templates

## Retention Strategy

### Core System Components (Keep As-Is)
1. **Templates Directory** - Generic templates for error and task logging
2. **Rules File** - Core system rules and memory bank functionality
3. **Memory Index** - System file tracking
4. **Tasks Directory Structure** - Task management framework
5. **New .project Directory** - Complete memory bank structure

### Directory Structures (Keep Empty)
1. **Plans Directory** - For future project-specific plans
2. **Task Logs Directory** - For future task execution logs
3. **Errors Directory** - For future error tracking
4. **Knowledge Directory** - For project knowledge management

## Template Creation Strategy

### 1. Module Template
Create a generic module template that can be customized for any project:
```
templates/module-template/
├── overview.md
├── architecture.md
├── integration.md
└── implementation-status.md
```

### 2. Project Documentation Templates
```
templates/project-docs/
├── project-overview-template.md
├── architecture-template.md
├── tech-stack-template.md
└── module-integration-template.md
```

### 3. Knowledge Management Templates
Update existing knowledge files to be templates:
- Decision tracking template
- Lessons learned template
- Best practices template (generic)

## Implementation Order

### Phase 1: Safe Removals
1. Remove `/modules/` directory
2. Remove `/core/` directory
3. Remove `/docs/` directory

### Phase 2: Content Clearing
1. Clear `/plans/` content
2. Clear `/task-logs/` content
3. Clear `/errors/` content

### Phase 3: File Modifications
1. Update `knowledge/best-practices.md`
2. Convert knowledge files to templates
3. Convert status files to templates

### Phase 4: Template Creation
1. Create module templates
2. Create project documentation templates
3. Create initialization documentation

## Validation Checklist

### System Functionality Preserved
- [ ] Memory bank system intact (.project/ structure)
- [ ] Task management system functional
- [ ] Error tracking system available
- [ ] Template system available
- [ ] Rules and guidelines preserved

### Project-Specific Content Removed
- [ ] No Partners In Biz references
- [ ] No business-specific modules
- [ ] No Firebase-specific implementations
- [ ] No project-specific plans or documentation

### Generic Templates Available
- [ ] Module creation templates
- [ ] Project documentation templates
- [ ] Knowledge management templates
- [ ] Status tracking templates

## Risk Mitigation

### Backup Strategy
Before any deletions, ensure:
1. Current state is committed to version control
2. Audit document is complete and saved
3. Removal plan is documented and approved

### Recovery Plan
If important generic components are accidentally removed:
1. Restore from version control
2. Re-examine the removed content
3. Extract any generic components
4. Update the retention strategy

### Validation Process
After each phase:
1. Verify system functionality
2. Check for broken references
3. Ensure templates are complete
4. Test initialization process

## Success Criteria

### Functional Requirements
- System can be dropped into any project
- All core functionality works without project-specific dependencies
- Templates are comprehensive and customizable
- Documentation is clear and complete

### Quality Requirements
- No broken references or missing files
- All templates follow consistent format
- System is self-documenting
- Setup process is straightforward

### Usability Requirements
- New users can understand and use the system
- Customization is straightforward
- Integration with existing projects is smooth
- Maintenance overhead is minimal
