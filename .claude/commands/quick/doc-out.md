# Document Output

Output the full content of a document without truncation.

## Usage
```
/doc-out
```

Output specific document:
```
/doc-out <file-path>
```

Output with formatting options:
```
/doc-out --format=markdown
/doc-out --format=plain
/doc-out --no-line-numbers
```

## Purpose
Display complete document contents when normal output is truncated, especially useful for long documents like PRDs, architecture docs, or comprehensive reports.

## Implementation
1. **File Detection**
   - If no file specified, detect current document context
   - Look for recently created or modified docs
   - Prioritize main project documents (PRD, architecture, etc.)

2. **Content Retrieval**
   - Read complete file contents
   - Preserve original formatting and structure
   - Include metadata (file path, size, last modified)

3. **Output Formatting**
   - Display with proper markdown rendering
   - Include line numbers by default
   - Show file header with path and info
   - Handle large files appropriately

## Common Use Cases
- **PRD Review**: Output complete PRD for review
- **Architecture Documentation**: Show full architecture with diagrams
- **Story Collections**: Display all stories in an epic
- **Configuration Files**: Show complete config files
- **Knowledge Files**: Display agent knowledge files

## File Priority Order
When no file specified, check in order:
1. Most recently modified file in `docs/`
2. Current agent's primary deliverable
3. Main project documents (PRD, architecture, brief)
4. Recently created stories or epics

## Output Examples
```
📄 docs/prd.md (15.2 KB, modified 2024-01-15 14:30)
═══════════════════════════════════════════════════════

     1→ # Product Requirements Document
     2→ 
     3→ ## Executive Summary
     4→ [Full content without truncation...]
```

## Large File Handling
For very large files:
- Show file size warning
- Offer section-by-section output
- Provide table of contents with jump links
- Allow filtering by sections or headings

## Related Documents
Automatically suggest related documents:
- If showing PRD, suggest architecture
- If showing stories, suggest epic overview
- If showing knowledge files, suggest related context

## Quality Features
- **Link Validation**: Check internal document links
- **Format Verification**: Ensure proper markdown syntax
- **Completeness Check**: Verify required sections present
- **Recent Changes**: Highlight recently modified sections

## Related Commands
- `/help` - Show command reference
- `/agents` - List available agents and their documents
- `/tasks` - Show current agent's deliverables