# Task Management System

This directory contains the task management system for tracking todos, active work, and completed tasks.

## Directory Structure

```
.project/tasks/
├── active/        # Current tasks being worked on
├── completed/     # Finished tasks
├── backlog/       # Future tasks and ideas
└── README.md      # This file
```

## Task Lifecycle

1. **Creation**: Tasks start in `backlog/` or `active/` depending on priority
2. **Active Work**: Tasks move to `active/` when work begins
3. **Completion**: Tasks move to `completed/` when finished

## Task File Format

Each task is a separate Markdown file with a unique ID and descriptive name:
- Format: `task-YYYYMMDD-HHMMSS_descriptive-name.md`
- Example: `task-20241215-143022_implement-user-authentication.md`

## Using the Task Management System

### Quick Commands

```bash
# Create and manage tasks interactively
python .project/scripts/manage-tasks.py

# List all tasks
python .project/scripts/manage-tasks.py
# Then choose option 2

# Move task between directories
python .project/scripts/manage-tasks.py
# Then choose option 3
```

### Manual Task Management

You can also manage tasks manually:

1. **Create Task**: Copy `.project/templates/task-template.md` to appropriate directory
2. **Update Task**: Edit the task file directly
3. **Move Task**: Move file between `active/`, `completed/`, `backlog/` directories

## Task Template

Tasks use the template in `.project/templates/task-template.md` which includes:

- **Task Information**: ID, priority, estimates, assignments
- **Description**: Detailed task description
- **Acceptance Criteria**: Specific completion requirements
- **Dependencies**: Prerequisites and related tasks
- **Technical Notes**: Implementation details
- **Progress Updates**: Status updates during work
- **Completion Notes**: Final details when finished

## Integration with Other Systems

### Task Logs vs Tasks
- **Tasks** (this system): High-level todo/completed tracking
- **Task Logs** (`.project/task-logs/`): Detailed execution documentation

### Workflow Integration
1. Create task in `active/` or `backlog/`
2. Move to `active/` when starting work
3. Create detailed task log in `.project/task-logs/` during work
4. Move task to `completed/` when finished
5. Link task log in completion notes

### Status Integration
- Update `.project/status/current-focus.md` with active tasks
- Update `.project/status/progress-tracker.md` with completed tasks
- Reference tasks in `.project/core/activeContext.md`

## Best Practices

### Task Creation
- Use descriptive titles
- Include clear acceptance criteria
- Set realistic time estimates
- Add dependencies and prerequisites

### Task Management
- Keep `active/` directory small (5-10 tasks max)
- Move completed tasks promptly
- Update progress regularly
- Link related documentation

### File Organization
- One task per file
- Use consistent naming convention
- Include task ID for uniqueness
- Keep files focused and concise

## Task Status Tracking

### Active Tasks
- Currently being worked on
- Should have recent progress updates
- Limited number to maintain focus

### Completed Tasks
- Finished work with completion notes
- Include actual time taken
- Document lessons learned
- Link to detailed task logs

### Backlog Tasks
- Future work and ideas
- Prioritized list of upcoming tasks
- Can include rough estimates
- May need refinement before activation

## Automation and Scripts

### Available Scripts
- `manage-tasks.py`: Interactive task management
- Task creation and movement automation
- Integration with other system components

### Future Enhancements
- Automatic task ID generation
- Task dependency tracking
- Time tracking integration
- Reporting and analytics

## Examples

### Creating a New Task
1. Run `python .project/scripts/manage-tasks.py`
2. Choose "Create new task"
3. Fill in task details
4. Task is created in `active/` directory

### Completing a Task
1. Run `python .project/scripts/manage-tasks.py`
2. Choose "Move task"
3. Select task to move
4. Move from `active/` to `completed/`
5. Script automatically updates completion date

### Viewing All Tasks
1. Run `python .project/scripts/manage-tasks.py`
2. Choose "List all tasks"
3. See overview of all tasks by status

---

This task management system provides scalable, organized tracking of work items while keeping the files manageable and the workflow efficient.
