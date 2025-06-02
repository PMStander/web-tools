# Project Initialization Prompt

Use this prompt when dropping the project management system into an existing project for the first time.

## Prompt

```
I have just added a comprehensive project management system to this existing project. The system includes a memory bank architecture, templates, and automation tools. Please help me initialize it properly.

**Your tasks:**

1. **Analyze the current project structure** and identify:
   - Project name and purpose
   - Technology stack (languages, frameworks, databases)
   - Architecture patterns and design decisions
   - Team size and structure (if evident from code/docs)
   - Current development stage and maturity

2. **Initialize the memory bank** by creating/updating these files in `.project/core/`:
   - `projectbrief.md` - Project overview, goals, and success criteria
   - `productContext.md` - Problem statement, solution, and user needs
   - `systemPatterns.md` - Architecture patterns and design principles
   - `techContext.md` - Technology stack, dependencies, and setup
   - `activeContext.md` - Current work focus and immediate priorities
   - `userStories.md` - User requirements and scenarios (if applicable)
   - `acceptanceCriteria.md` - Success criteria and validation requirements
   - `progress.md` - Current implementation status and roadmap

3. **Set up project status tracking** by updating:
   - `.project/status/current-focus.md` - Current development priorities
   - `.project/status/progress-tracker.md` - Project milestones and progress
   - `.project/status/roadmap.md` - Timeline and future planning

4. **Create initial documentation** using the templates:
   - Generate a comprehensive README.md if one doesn't exist or needs updating
   - Document any existing architectural decisions in `.project/knowledge/decisions.md`
   - Capture any lessons learned so far in `.project/knowledge/lessons-learned.md`

5. **Create an initial implementation plan** in `.project/plans/` for current/upcoming work

6. **Update the memory index** (`.project/memory-index.md`) to reflect the current project state

**Guidelines:**
- Base all documentation on actual code and existing files
- Be specific and accurate - don't make assumptions
- Use the existing templates in `.project/templates/` as guides for structure and content
- Focus on capturing current state rather than ideal state
- Include concrete details like specific technologies, versions, and patterns used
- If information is unclear or missing, note it as "To be determined" or "Needs investigation"

**Output format:**
- Create each file with comprehensive, project-specific content
- Use proper Markdown formatting
- Include all relevant sections from the templates
- Provide a summary of what was created and any areas that need further attention

Please start by analyzing the project structure and then systematically create all the required documentation.
```

## Usage Instructions

1. **Copy this prompt** and paste it into your LLM conversation
2. **Ensure the LLM has access** to the project files and directory structure
3. **Review the generated files** and make any necessary adjustments
4. **Run validation** using `python .project/scripts/validate-system.py` to ensure completeness

## Expected Outcome

After running this prompt, you should have:
- Complete memory bank initialization
- Project-specific documentation
- Current status tracking
- Initial implementation plans
- Validated system setup

## Follow-up Actions

After initialization:
1. Review all generated files for accuracy
2. Update any missing or incorrect information
3. Customize templates further if needed
4. Begin using the task logging system for ongoing work
5. Establish team workflows around the system
