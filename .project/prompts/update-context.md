# Context Update Prompt

Use this prompt to update the project management system with current work progress and context.

## Prompt

```
Please help me update the project management system with my current work progress and context.

**Current Work Information:**
- What I've been working on: [DESCRIBE RECENT WORK]
- Tasks completed: [LIST COMPLETED TASKS]
- Current challenges: [DESCRIBE ANY OBSTACLES]
- Decisions made: [IMPORTANT DECISIONS OR CHANGES]
- Next priorities: [WHAT'S COMING UP NEXT]
- New modules/components added: [LIST ANY NEW MODULES OR MAJOR COMPONENTS]
- Architecture changes: [ANY SIGNIFICANT SYSTEM ARCHITECTURE CHANGES]
- Technology changes: [NEW TECHNOLOGIES, FRAMEWORKS, OR MAJOR UPDATES]
- Scope changes: [CHANGES TO PROJECT SCOPE, GOALS, OR REQUIREMENTS]

**Your tasks:**

1. **Update active context** (`.project/core/activeContext.md`):
   - Reflect current work focus and priorities
   - Update recent activities section
   - Note any blockers or challenges
   - Set clear next steps

2. **Create task log** for significant work completed:
   - Use the task log template in `.project/templates/task-log-template.md`
   - Document implementation details and decisions
   - Include performance self-assessment using 23-point scale
   - Capture lessons learned and challenges overcome

3. **Update progress tracking** (`.project/status/progress-tracker.md`):
   - Mark completed milestones and tasks
   - Update percentage completion estimates
   - Note any timeline changes or adjustments
   - Add recent achievements

4. **Update current focus** (`.project/status/current-focus.md`):
   - Set immediate priorities for upcoming work
   - Update sprint/iteration goals if applicable
   - Note any changes in direction or scope

5. **Document decisions** (if any major decisions were made):
   - Add to `.project/knowledge/decisions.md` using the decision template
   - Include context, alternatives considered, and rationale
   - Note consequences and trade-offs

6. **Capture lessons learned** (if applicable):
   - Add insights to `.project/knowledge/lessons-learned.md`
   - Include specific situations and solutions
   - Document prevention strategies for future work

7. **Update implementation plans** (if scope or approach changed):
   - Modify relevant plans in `.project/plans/`
   - Adjust timelines and milestones as needed
   - Note any new risks or dependencies

8. **Update core project documentation** (if significant changes detected):
   - **Project Brief** (`.project/core/projectbrief.md`): Update if project goals, scope, or success criteria have changed
   - **System Patterns** (`.project/core/systemPatterns.md`): Update if new architectural patterns or design decisions were made
   - **Tech Context** (`.project/core/techContext.md`): Update if new technologies, frameworks, or major dependencies were added
   - **User Stories** (`.project/core/userStories.md`): Update if new features or user requirements were identified
   - **Progress** (`.project/core/progress.md`): Update implementation status and roadmap

9. **Update module documentation** (if new modules were added):
   - Create module documentation using `.project/templates/module-template/`
   - Update system architecture to reflect new modules
   - Document module integration points and dependencies
   - Update overall project structure documentation

10. **Validate system consistency** (after major changes):
    - Check that all documentation is consistent with current implementation
    - Verify that module documentation matches actual code structure
    - Ensure project brief still accurately reflects current project state
    - Update any outdated information discovered during validation

**Guidelines:**
- Be honest about progress and challenges
- Include specific technical details where relevant
- Use the 23-point scoring system for task evaluation
- Focus on actionable next steps
- Document both successes and failures for learning
- Keep information current and accurate
- **Automatically detect significant changes**: If work involves major architectural changes, new modules, technology updates, or scope changes, update core documentation
- **Maintain consistency**: Ensure all documentation reflects current project state
- **Validate accuracy**: Check that project brief, tech context, and system patterns match actual implementation

**Scoring Guidelines for Task Logs:**
- **Rewards**: +10 elegant solutions, +5 optimization, +3 good style, +2 minimal code, +2 edge cases, +1 reusability
- **Penalties**: -10 bugs/failures, -5 placeholders/lazy output, -5 inefficient algorithms, -3 style violations, -2 missed edge cases, -1 overcomplicated, -1 deprecated usage
- **Target**: Aim for 18+ points (78% or higher)

Please update all relevant files based on the work information provided.
```

## Usage Instructions

1. **Fill in your current work information** in the prompt
2. **Be specific about what you've accomplished** and what you're working on
3. **Copy the completed prompt** and paste it into your LLM conversation
4. **Review the updates** to ensure accuracy
5. **Continue with your next work** using the updated context

## When to Use This Prompt

Use this prompt:
- **Daily**: At the end of significant work sessions
- **Weekly**: For comprehensive progress updates
- **After major milestones**: When completing important features or phases
- **When changing direction**: If priorities or approach changes
- **Before breaks**: To preserve context before time away from project
- **After adding modules**: When new modules or major components are created
- **After architecture changes**: When significant system design changes are made
- **After technology updates**: When new frameworks, libraries, or tools are adopted
- **After scope changes**: When project requirements or goals are modified

## Expected Outcome

After running this prompt, you should have:
- Updated active context reflecting current state
- Task logs documenting completed work
- Current progress tracking
- Updated focus and priorities
- Documented decisions and lessons learned
- **Updated core documentation** (if significant changes were made)
- **New module documentation** (if modules were added)
- **Consistent system documentation** that accurately reflects current project state

## Follow-up Actions

After updating context:
1. Review all updated files for accuracy
2. Plan next work session based on updated priorities
3. Share updates with team if applicable
4. Use updated context to guide future decisions
5. Continue regular context updates as work progresses
