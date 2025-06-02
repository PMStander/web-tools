# Directory Structure Audit

## Task Information
- **Date**: Current session
- **Time Started**: Current time
- **Purpose**: Analyze existing directory structure to identify project-specific vs generic system components

## Audit Results

### 🟢 KEEP - Generic System Components

#### Templates Directory (`/templates/`)
- **Status**: ✅ Keep - Generic and reusable
- **Files**:
  - `error-template.md` - Generic error documentation template
  - `task-log-template.md` - Generic task logging template
- **Reason**: These are project-agnostic templates that can be used in any project

#### Rules File (`/rules.md`)
- **Status**: ✅ Keep - Core system functionality
- **Reason**: Contains the core rules for the memory bank and task management system

#### Memory Index (`/memory-index.md`)
- **Status**: ✅ Keep - System functionality
- **Reason**: Part of the memory bank system for tracking files

#### Knowledge Directory (`/knowledge/`) - Partial Keep
- **Status**: 🟡 Modify - Keep structure, update content
- **Files to keep with modifications**:
  - `best-practices.md` - Remove project-specific content, keep generic practices
  - `decisions.md` - Keep as template for decision tracking
  - `lessons-learned.md` - Keep as template for lessons learned
- **Reason**: The structure is valuable but content needs to be made generic

#### Tasks Directory (`/tasks/`)
- **Status**: ✅ Keep - System functionality
- **Structure**:
  - `active/` - For tracking active tasks
  - `backlog/` - For task backlog
  - `completed/` - For completed tasks
- **Reason**: Core task management functionality

#### Status Directory (`/status/`)
- **Status**: ✅ Keep - System functionality
- **Files**:
  - `current-focus.md` - Template for current focus tracking
  - `progress-tracker.md` - Template for progress tracking
  - `roadmap.md` - Template for roadmap planning
- **Reason**: Generic project status tracking components

#### Errors Directory (`/errors/`)
- **Status**: ✅ Keep - System functionality
- **Reason**: Part of the error tracking system

### 🔴 REMOVE - Project-Specific Content

#### Modules Directory (`/modules/`)
- **Status**: ❌ Remove - Project-specific
- **Content**: All subdirectories contain Partners In Biz specific modules
  - `agency/` - Specific to Partners In Biz AI agency functionality
  - `chat/` - Specific chat implementation
  - `hr/` - HR module specific to Partners In Biz
  - `projects/` - Project management specific to Partners In Biz
  - `writer/` - Writer module specific to Partners In Biz
  - `planned-modules/` - Business-specific module plans
- **Reason**: All content is specific to the Partners In Biz project

#### Plans Directory (`/plans/`) - Project-Specific Plans
- **Status**: ❌ Remove current content, keep directory
- **Files to remove**:
  - All current `.md` files are Partners In Biz specific
  - `book-writing-agency-plan.md`, `chat-ux-fixes-plan.md`, etc.
- **Reason**: All plans are specific to Partners In Biz features

#### Core Directory (`/core/`) - Project-Specific Content
- **Status**: ❌ Remove - Conflicts with .project/core/
- **Files**: All files contain Partners In Biz specific architecture
- **Reason**: This conflicts with our new .project/core/ structure and contains project-specific content

#### Docs Directory (`/docs/`) - Project-Specific Documentation
- **Status**: ❌ Remove - Project-specific
- **Content**: All documentation is specific to Partners In Biz modules and implementation
- **Reason**: Contains business-specific documentation that won't apply to other projects

#### Task Logs (`/task-logs/`) - Project-Specific Logs
- **Status**: ❌ Remove current content, keep directory
- **Files**: All existing task logs are specific to Partners In Biz development
- **Reason**: Historical logs are project-specific but the directory structure should remain

### 🟡 MODIFY - Keep Structure, Update Content

#### Best Practices (`/knowledge/best-practices.md`)
- **Action**: Remove Partners In Biz specific content, keep generic development practices
- **Keep**: General architecture, code quality, testing, performance guidelines
- **Remove**: Firebase-specific content, Partners In Biz business logic references

## Removal Plan

### Phase 1: Remove Project-Specific Directories
1. Delete `/modules/` entirely
2. Delete `/core/` directory (conflicts with .project/core/)
3. Delete `/docs/` directory
4. Clear contents of `/plans/` (keep directory)
5. Clear contents of `/task-logs/` (keep directory)
6. Clear contents of `/errors/` (keep directory)

### Phase 2: Clean Up Generic Files
1. Update `/knowledge/best-practices.md` to be project-agnostic
2. Clear `/knowledge/decisions.md` and make it a template
3. Clear `/knowledge/lessons-learned.md` and make it a template
4. Update `/status/` files to be templates rather than specific content

### Phase 3: Create Generic Templates
1. Create module template structure
2. Create generic project documentation templates
3. Create initialization documentation

## Risk Assessment

### Low Risk Removals
- `/modules/` - Completely project-specific
- `/docs/` - Business-specific documentation
- Current `/plans/` content - All Partners In Biz specific

### Medium Risk Modifications
- `/knowledge/best-practices.md` - Contains some generic practices mixed with project-specific content
- `/core/` directory - Need to ensure no generic system components are lost

### Validation Required
- Ensure no generic utilities or templates are accidentally removed
- Verify that the task management and memory bank systems remain intact
- Confirm that error handling and logging systems are preserved
