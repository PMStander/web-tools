# Module Creation Prompt

Use this prompt when you want to create a new module within your project using the project management system.

## Prompt

```
I want to create a new module for this project using the project management system. Please help me set up comprehensive documentation and structure for the new module.

**Module Information:**
- Module name: [SPECIFY MODULE NAME]
- Module purpose: [DESCRIBE WHAT THIS MODULE DOES]
- Module type: [web-frontend/web-backend/mobile/library/generic]
- Integration points: [HOW IT CONNECTS TO OTHER MODULES]
- Key dependencies: [MAIN DEPENDENCIES OR REQUIREMENTS]

**Your tasks:**

1. **Create module directory structure** in `modules/[module-name]/`:
   - Set up appropriate subdirectories based on module type
   - Create placeholder files with proper naming conventions
   - Include .gitkeep files to ensure directories are tracked

2. **Generate module documentation** using the templates in `.project/templates/module-template/`:
   - `overview.md` - Module purpose, features, and target users
   - `architecture.md` - Module-specific architecture and design patterns
   - `implementation-status.md` - Development progress and milestones
   - `integration-guide.md` - How to integrate and use this module

3. **Create implementation plan** in `.project/plans/[module-name]-implementation-plan.md`:
   - Break down development into phases
   - Define success criteria and acceptance requirements
   - Identify risks and dependencies
   - Estimate timeline and resources needed

4. **Update project documentation**:
   - Add module to main project overview in `.project/core/`
   - Update system architecture documentation
   - Include module in progress tracking
   - Update roadmap with module milestones

5. **Create initial task log** for module creation in `.project/task-logs/`

6. **Update active context** in `.project/core/activeContext.md` to reflect new module work

**Guidelines:**
- Use the module templates as the foundation
- Be specific about module responsibilities and boundaries
- Include concrete technical details where known
- Document integration patterns and dependencies clearly
- Consider security, performance, and scalability requirements
- Plan for testing and quality assurance
- Include deployment and maintenance considerations

**Output format:**
- Create all files with comprehensive, module-specific content
- Use consistent naming conventions
- Follow the established documentation patterns
- Provide clear next steps for development

Please create the complete module structure and documentation based on the information provided.
```

## Usage Instructions

1. **Fill in the module information** in the prompt (name, purpose, type, etc.)
2. **Copy the completed prompt** and paste it into your LLM conversation
3. **Review the generated structure** and documentation
4. **Customize as needed** for your specific requirements
5. **Begin development** following the created plan

## Module Types

Choose the appropriate module type:

- **web-frontend**: User interface components and pages
- **web-backend**: API endpoints and business logic
- **mobile**: Mobile app screens and functionality
- **library**: Reusable utilities and shared code
- **generic**: General-purpose module

## Expected Outcome

After running this prompt, you should have:
- Complete module directory structure
- Comprehensive module documentation
- Implementation plan with phases and milestones
- Updated project documentation
- Clear next steps for development

## Follow-up Actions

After module creation:
1. Begin implementing according to the plan
2. Update implementation status regularly
3. Create task logs for significant work
4. Update integration guide as development progresses
5. Test module integration with existing components
