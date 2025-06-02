# System Validation and Synchronization Prompt

Use this prompt when you want to ensure all project documentation is consistent and up-to-date with the current implementation.

## Prompt

```
Please perform a comprehensive validation and synchronization of the project management system to ensure all documentation accurately reflects the current project state.

**Validation Focus:**
[Choose areas to validate or select "all" for comprehensive check:]
- [ ] All documentation (comprehensive validation)
- [ ] Core project documentation only
- [ ] Module documentation only
- [ ] Technology and architecture documentation
- [ ] Progress and status tracking
- [ ] Custom focus: [SPECIFY SPECIFIC AREAS]

**Recent Changes to Consider:**
- Major features added: [LIST ANY MAJOR FEATURES OR COMPONENTS]
- New modules created: [LIST NEW MODULES]
- Architecture changes: [DESCRIBE ARCHITECTURAL CHANGES]
- Technology updates: [NEW TECHNOLOGIES OR MAJOR UPDATES]
- Scope modifications: [CHANGES TO PROJECT SCOPE OR GOALS]
- Team changes: [TEAM SIZE OR STRUCTURE CHANGES]

**Your tasks:**

1. **Analyze Current Implementation**:
   - Examine actual codebase structure and organization
   - Identify all modules, components, and major features
   - Review technology stack and dependencies
   - Assess current project scope and goals

2. **Validate Core Documentation**:
   - **Project Brief** (`.project/core/projectbrief.md`):
     * Verify project goals and success criteria are current
     * Check that project description matches current scope
     * Update team information if needed
     * Ensure timeline and milestones are accurate
   
   - **Tech Context** (`.project/core/techContext.md`):
     * Verify all technologies and frameworks are listed
     * Update dependency information
     * Check setup and installation instructions
     * Validate development environment requirements
   
   - **System Patterns** (`.project/core/systemPatterns.md`):
     * Ensure architectural patterns match implementation
     * Update design decisions and rationale
     * Document new patterns introduced
     * Remove outdated architectural information

3. **Validate Module Documentation**:
   - Check that all existing modules have proper documentation
   - Verify module descriptions match actual functionality
   - Update integration points and dependencies
   - Ensure module status reflects current implementation state
   - Create missing module documentation using templates

4. **Validate Progress and Status**:
   - **Progress** (`.project/core/progress.md`):
     * Update implementation status for all features
     * Reflect current development phase
     * Update roadmap and future plans
   
   - **Current Focus** (`.project/status/current-focus.md`):
     * Ensure current priorities are accurate
     * Update immediate goals and objectives
   
   - **Progress Tracker** (`.project/status/progress-tracker.md`):
     * Update milestone completion status
     * Reflect actual progress percentages

5. **Check System Consistency**:
   - Verify all cross-references between documents are valid
   - Ensure consistent terminology throughout documentation
   - Check that all mentioned files and components actually exist
   - Validate that examples and code snippets are current

6. **Update Memory Index**:
   - Update `.project/memory-index.md` with any new files or changes
   - Ensure all documentation is properly indexed
   - Add descriptions for new components or modules

7. **Generate Validation Report**:
   - List all updates made during validation
   - Identify any inconsistencies found and resolved
   - Note any missing documentation that should be created
   - Provide recommendations for maintaining consistency

**Guidelines:**
- Be thorough in checking actual implementation vs. documentation
- Update any outdated information discovered
- Create missing documentation using appropriate templates
- Maintain consistency in terminology and formatting
- Focus on accuracy over completeness - it's better to have accurate partial documentation than complete but outdated documentation
- If major discrepancies are found, prioritize updating core documentation first

**Output format:**
- Update all relevant documentation files
- Provide a summary of changes made
- List any issues that require manual attention
- Include recommendations for ongoing maintenance

Please perform a comprehensive validation and update all documentation to match the current project state.
```

## Usage Instructions

1. **Choose validation scope** based on recent changes and needs
2. **Fill in recent changes** to help guide the validation process
3. **Copy the completed prompt** and paste it into your LLM conversation
4. **Review all updated files** to ensure accuracy
5. **Run system validation** using `python .project/scripts/validate-system.py`

## When to Use This Prompt

Use this prompt:
- **Monthly**: Regular comprehensive validation
- **After major development phases**: When significant features are completed
- **After team changes**: When team members join or leave
- **After architecture refactoring**: When system design changes significantly
- **Before project reviews**: To ensure documentation is current for stakeholders
- **After long development periods**: When documentation may have fallen behind
- **Before releases**: To ensure all documentation is accurate for the release

## Expected Outcome

After running this prompt, you should have:
- All documentation accurately reflecting current implementation
- Consistent terminology and cross-references throughout the system
- Updated progress and status tracking
- Proper module documentation for all components
- Validated and updated memory index
- Comprehensive validation report with recommendations

## Integration with Other Prompts

This prompt complements:
- **update-context.md**: Use this for daily updates, validate-and-sync for comprehensive checks
- **initialize-project.md**: Use this after initial setup to ensure everything is properly documented
- **create-module.md**: Use this after creating multiple modules to ensure system consistency

## Follow-up Actions

After validation and synchronization:
1. Review the validation report and address any manual items
2. Update team members on any significant documentation changes
3. Schedule regular validation sessions to prevent documentation drift
4. Consider automating some validation checks if patterns emerge
5. Update project processes if documentation maintenance issues are identified
