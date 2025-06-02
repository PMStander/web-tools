# LLM Interaction Prompts

This directory contains pre-written prompts for common interactions with LLMs when using the project management system.

## Available Prompts

### 🚀 [initialize-project.md](initialize-project.md)
**Use when**: First time setting up the project management system in an existing project

**What it does**:
- Analyzes current project structure
- Creates comprehensive memory bank documentation
- Sets up status tracking and progress monitoring
- Generates initial implementation plans
- Establishes project workflows

**Expected time**: 10-15 minutes for LLM to complete

### 📦 [create-module.md](create-module.md)
**Use when**: Adding a new module or component to your project

**What it does**:
- Creates module directory structure
- Generates module-specific documentation
- Creates implementation plan with phases
- Updates project documentation
- Sets up integration guidelines

**Expected time**: 5-10 minutes for LLM to complete

### 🔄 [update-context.md](update-context.md)
**Use when**: Regular updates after completing work or at end of work sessions

**What it does**:
- Updates active context with current work
- Creates task logs for completed work
- Updates progress tracking
- Documents decisions and lessons learned
- Sets priorities for next work

**Expected time**: 3-5 minutes for LLM to complete

### 🔍 [analyze-project.md](analyze-project.md)
**Use when**: Wanting comprehensive project analysis and recommendations

**What it does**:
- Analyzes project structure and organization
- Reviews technology choices and architecture
- Evaluates documentation and processes
- Identifies improvement opportunities
- Provides prioritized recommendations

**Expected time**: 15-20 minutes for LLM to complete

### ✅ [manage-tasks.md](manage-tasks.md)
**Use when**: Creating, updating, or managing individual tasks

**What it does**:
- Creates new tasks with unique IDs
- Updates existing task information
- Moves tasks between active/completed/backlog
- Provides task overview and status
- Integrates with project status tracking

**Expected time**: 2-5 minutes for LLM to complete

### 🔄 [validate-and-sync.md](validate-and-sync.md)
**Use when**: Ensuring all documentation is consistent and up-to-date

**What it does**:
- Validates core project documentation against current implementation
- Updates outdated information and inconsistencies
- Ensures module documentation matches actual code
- Synchronizes progress tracking with current state
- Generates comprehensive validation report

**Expected time**: 10-20 minutes for LLM to complete

## How to Use These Prompts

### Step 1: Choose the Right Prompt
Select the prompt that matches your current need:
- **New project setup** → `initialize-project.md`
- **Adding functionality** → `create-module.md`
- **Regular updates** → `update-context.md`
- **Project review** → `analyze-project.md`
- **Task management** → `manage-tasks.md`
- **Documentation validation** → `validate-and-sync.md`

### Step 2: Customize the Prompt
1. Open the relevant prompt file
2. Fill in any placeholders with your specific information
3. Adjust focus areas or requirements as needed
4. Remove sections that don't apply to your situation

### Step 3: Execute the Prompt
1. Copy the customized prompt
2. Paste it into your LLM conversation
3. Ensure the LLM has access to your project files
4. Wait for the LLM to complete the tasks

### Step 4: Review and Refine
1. Review all generated/updated files
2. Make any necessary corrections or additions
3. Validate the system using `python .project/scripts/validate-system.py`
4. Continue with your development work

## Prompt Customization Tips

### For Better Results
- **Be specific**: Include concrete details about your project
- **Provide context**: Explain your current situation and goals
- **Set expectations**: Clarify what level of detail you need
- **Include constraints**: Mention any limitations or requirements

### Common Customizations
- **Technology stack**: Specify your exact frameworks and tools
- **Team size**: Adjust recommendations for your team structure
- **Project stage**: Indicate if you're starting, mid-development, or maintaining
- **Focus areas**: Emphasize what's most important for your current needs

## Workflow Integration

### Daily Workflow
1. **Morning**: Use `update-context.md` to review current priorities
2. **During work**: Create modules with `create-module.md` as needed
3. **Evening**: Use `update-context.md` to log progress and set next steps

### Weekly Workflow
1. **Monday**: Review and update project context
2. **Wednesday**: Mid-week progress check and adjustments
3. **Friday**: Weekly analysis and planning for next week

### Monthly Workflow
1. **First week**: Comprehensive project analysis
2. **Second week**: Implement high-priority improvements
3. **Third week**: Update documentation and processes
4. **Fourth week**: Plan for next month and review progress

## Advanced Usage

### Combining Prompts
You can combine elements from different prompts for specific needs:
```markdown
I want to create a new module AND analyze how it fits into the overall project architecture...
```

### Custom Prompts
Create your own prompts by:
1. Following the structure of existing prompts
2. Including specific tasks and guidelines
3. Adding your organization's standards and requirements
4. Testing and refining based on results

### Automation Integration
These prompts can be integrated with:
- **Git hooks**: Trigger context updates on commits
- **CI/CD pipelines**: Run analysis on builds
- **Scheduled tasks**: Regular project health checks
- **IDE extensions**: Quick access to common prompts

## Troubleshooting

### If Prompts Don't Work as Expected
1. **Check file access**: Ensure LLM can read project files
2. **Verify structure**: Confirm project management system is properly set up
3. **Review customization**: Make sure placeholders are filled correctly
4. **Simplify scope**: Try focusing on fewer tasks at once

### Common Issues
- **Incomplete output**: Break large prompts into smaller parts
- **Generic responses**: Provide more specific project details
- **Missing files**: Run system validation to check completeness
- **Inconsistent format**: Specify exact format requirements

## Contributing

To improve these prompts:
1. Test prompts with different project types
2. Document what works well and what doesn't
3. Suggest improvements based on real usage
4. Share successful customizations with the community

---

**Need help?** Check the main documentation in the project root or create an issue with your specific question.
