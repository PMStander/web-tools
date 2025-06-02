# Task Management Prompt

Use this prompt when you want to create, update, or manage tasks in the project management system.

## Prompt

```
I want to manage tasks in this project using the task management system. Please help me with task operations.

**Task Operation Type:**
[Choose one or specify custom operation:]
- [ ] Create new task
- [ ] Update existing task
- [ ] Move task between statuses
- [ ] List all tasks
- [ ] Complete task
- [ ] Plan task breakdown

**Task Information (for creation/updates):**
- Task title: [SPECIFY TASK TITLE]
- Description: [DESCRIBE WHAT NEEDS TO BE DONE]
- Priority: [High/Medium/Low]
- Estimated time: [TIME ESTIMATE]
- Due date: [YYYY-MM-DD or N/A]
- Dependencies: [LIST ANY PREREQUISITES]
- Acceptance criteria: [SPECIFIC COMPLETION REQUIREMENTS]

**Your tasks:**

1. **For New Task Creation**:
   - Generate unique task ID using timestamp format
   - Create task file in appropriate directory (active/backlog)
   - Use the task template from `.project/templates/task-template.md`
   - Fill in all provided information
   - Set initial status and creation date

2. **For Task Updates**:
   - Locate existing task file in `.project/tasks/`
   - Update specified fields
   - Add progress update with current date
   - Maintain task history and notes

3. **For Task Movement**:
   - Move task file between directories (active/completed/backlog)
   - Update task status in the file content
   - Add completion date if moving to completed
   - Update any related documentation

4. **For Task Completion**:
   - Move task from active to completed directory
   - Update completion date and actual time taken
   - Add completion notes and lessons learned
   - Link to any related task logs
   - Update project status tracking

5. **For Task Listing**:
   - Scan all task directories (active/completed/backlog)
   - Provide organized overview by status
   - Include task titles, IDs, and key information
   - Show priority and due dates

6. **For Task Planning**:
   - Break down large tasks into smaller subtasks
   - Create multiple related task files
   - Set up dependencies between tasks
   - Estimate timelines and priorities

**Integration with Other Systems**:
- Update `.project/status/current-focus.md` with active tasks
- Reference tasks in `.project/core/activeContext.md`
- Create detailed task logs in `.project/task-logs/` for significant work
- Update progress tracking when tasks are completed

**Guidelines:**
- Each task should be a separate file for scalability
- Use consistent naming: `task-YYYYMMDD-HHMMSS_descriptive-name.md`
- Keep active tasks limited (5-10 max) for focus
- Move completed tasks promptly to avoid clutter
- Include clear acceptance criteria for all tasks
- Link related documentation and dependencies

**Output format:**
- Create/update task files with complete information
- Provide summary of actions taken
- Show current task overview by status
- Include next steps or recommendations

Please perform the requested task management operation.
```

## Usage Instructions

1. **Specify the operation type** you want to perform
2. **Fill in task information** if creating or updating tasks
3. **Copy the completed prompt** and paste it into your LLM conversation
4. **Review the results** and verify task files are created/updated correctly
5. **Use the task management script** for interactive operations: `python .project/scripts/manage-tasks.py`

## Task Management Workflow

### Creating Tasks
1. Use this prompt to create new tasks
2. Tasks are created in `active/` or `backlog/` directories
3. Each task gets a unique ID and separate file
4. Template ensures consistent structure

### Managing Active Work
1. Keep `active/` directory focused (5-10 tasks max)
2. Move tasks from `backlog/` to `active/` when starting work
3. Update progress regularly in task files
4. Create detailed task logs for significant work

### Completing Tasks
1. Move completed tasks to `completed/` directory
2. Add completion notes and lessons learned
3. Update project status and progress tracking
4. Link to any detailed task logs created

### Task Organization
- **Active**: Current work in progress
- **Completed**: Finished tasks with completion notes
- **Backlog**: Future tasks and ideas

## Integration Examples

### With Status Tracking
```markdown
Update current focus with active tasks:
- Task: Implement user authentication (task-20241215-143022)
- Task: Fix database connection issue (task-20241215-150145)
```

### With Task Logs
```markdown
Link detailed work documentation:
- Task: task-20241215-143022_implement-user-authentication.md
- Task Log: task-log_2024-12-15-14-30_user-authentication-implementation.md
```

### With Progress Tracking
```markdown
Update milestones with completed tasks:
- ✅ User Authentication System (completed: 2024-12-15)
- ✅ Database Schema Design (completed: 2024-12-14)
```

## Expected Outcome

After using this prompt, you should have:
- Well-organized task files in appropriate directories
- Clear task status and progress tracking
- Integration with other project management components
- Scalable system that grows with your project

## Follow-up Actions

After task management operations:
1. Review created/updated task files for accuracy
2. Update project status and focus documents
3. Use interactive script for ongoing task management
4. Create detailed task logs for significant work
5. Regularly review and prioritize backlog tasks
