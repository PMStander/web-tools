# Documentation Cleanup and Organization Task

## Overview
This task provides intelligent cleanup and reorganization of the docs/ folder, automatically categorizing files, removing orphaned content, and updating the index file with proper links and organization.

## Execution Instructions

### Phase 1: Analysis and Categorization
1. **Scan docs/ directory** for all markdown files
2. **Categorize files** based on content analysis:
   - Core Documentation (README, CONTRIBUTING, etc.)
   - Architecture Documents
   - Project Requirements (PRDs, project briefs)
   - User Stories and Epics
   - Technical Specifications
   - API Documentation
   - Deployment and DevOps docs
   - Legacy/Archive content
   - Orphaned or outdated files

### Phase 2: Content Analysis
1. **Analyze each file** for:
   - Last modified date
   - Content relevance to current project
   - Broken internal links
   - Duplicate or redundant content
   - Incomplete or placeholder content
   - File size and complexity

### Phase 3: Reorganization Logic
1. **Create logical folder structure**:
   ```
   docs/
   ├── README.md (updated index)
   ├── project/
   │   ├── project-brief.md
   │   ├── prd.md
   │   └── architecture.md
   ├── stories/
   │   ├── epic-1.md
   │   ├── epic-2.md
   │   └── [individual stories]
   ├── technical/
   │   ├── api-reference.md
   │   ├── tech-stack.md
   │   └── data-models.md
   ├── deployment/
   │   ├── deployment-guide.md
   │   └── environment-setup.md
   ├── guides/
   │   ├── contributing.md
   │   ├── ide-setup.md
   │   └── workflow-diagram.md
   ├── tests/
   │   ├── unit/
   │   ├── integration/
   │   ├── e2e/
   │   └── fixtures/
   └── archive/
       └── [outdated content]
   ```

2. **Handle test files in root**:
   - Move any `test_*.py`, `*.test.*`, `*.spec.*` files from root to `docs/tests/`
   - Organize by test type (unit, integration, e2e)
   - Update test runner configurations

### Phase 4: File Processing
1. **For each category**:
   - Move files to appropriate folders
   - Update internal links to reflect new paths
   - Remove duplicate content
   - Archive outdated files
   - Flag incomplete content for review

### Phase 5: Index Generation
1. **Create comprehensive README.md** with:
   - Project overview section
   - Quick start guide
   - Documentation navigation
   - Links to all major documents
   - Status indicators for document completeness
   - Last updated timestamps

### Phase 6: Validation
1. **Verify all links** work correctly
2. **Check for orphaned files**
3. **Validate markdown syntax**
4. **Ensure consistent formatting**

## Cleanup Rules

### Auto-Archive Criteria
- Files not modified in 60+ days with no current project relevance
- Duplicate content (keep most recent/complete version)
- Files with placeholder content only
- Broken or incomplete documents marked as drafts

### Preservation Rules
- Always preserve: README.md, CONTRIBUTING.md, LICENSE
- Keep recent user stories and epics
- Maintain current architecture and PRD documents
- Preserve deployment and technical guides

### Link Management
- Update all relative links after file moves
- Convert absolute local paths to relative paths
- Flag external links for validation
- Create redirect stubs for moved important files

## Output Requirements

### Summary Report
Generate a cleanup report including:
- Files moved/reorganized
- Files archived
- Broken links fixed
- Duplicate content removed
- New folder structure created
- Index file updates made

### Updated Index Structure
The README.md should include:
```markdown
# Project Documentation

## Quick Navigation
- [Project Overview](#project-overview)
- [Getting Started](#getting-started)
- [Architecture](./project/architecture.md)
- [Requirements](./project/prd.md)
- [User Stories](./stories/)
- [Technical Documentation](./technical/)
- [Deployment Guide](./deployment/)

## Document Status
| Category | Files | Status | Last Updated |
|----------|-------|--------|--------------|
| Project Docs | 3 | Complete | 2024-01-15 |
| User Stories | 8 | In Progress | 2024-01-14 |
| Technical | 5 | Complete | 2024-01-13 |
```

## Configuration Options

### Cleanup Aggressiveness
- **Conservative**: Only move obvious duplicates and clearly outdated content
- **Standard**: Apply all cleanup rules with confirmation prompts
- **Aggressive**: Auto-archive based on age and relevance scoring

### Folder Structure
- **Flat**: Minimal folder structure (current state)
- **Organized**: Logical categorization (recommended)
- **Detailed**: Deep folder hierarchy with sub-categories

## Command Integration

Add to bmad-agent/commands.md:
```markdown
| `*doc-cleanup` / `/doc-cleanup` | Clean up and reorganize docs/ folder with auto-indexing |
| `*doc-cleanup conservative` | Run cleanup with minimal changes |
| `*doc-cleanup aggressive` | Run full cleanup with auto-archiving |
```

## Usage Examples

### Standard Cleanup
```
*doc-cleanup
```
Runs standard cleanup with confirmation prompts.

### Conservative Cleanup  
```
*doc-cleanup conservative
```
Only handles obvious duplicates and broken links.

### Aggressive Cleanup
```
*doc-cleanup aggressive
```
Full cleanup including auto-archiving of old content.

## Implementation Notes

### File Operation Safety
- Always backup docs/ folder before major operations
- Use git status to avoid cleaning uncommitted work
- Provide rollback option for major reorganizations

### Content Preservation
- Never delete files without user confirmation
- Move to archive/ rather than delete
- Maintain version history through git

### Integration Points
- Works with existing BMAD file naming conventions
- Respects .gitignore patterns
- Integrates with knowledge update workflows

## Success Criteria

1. **Organization**: Clear, logical folder structure
2. **Navigation**: Updated index with working links
3. **Cleanliness**: No duplicate or orphaned content
4. **Maintainability**: Structure that scales with project growth
5. **Integration**: Works seamlessly with BMAD workflows