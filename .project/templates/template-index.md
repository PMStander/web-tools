# Template Index

This directory contains templates for setting up and managing projects using this project management system.

## Project Setup Templates

### Core Project Files
- **[README-template.md](README-template.md)**: Comprehensive README template for project documentation
- **[CONTRIBUTING-template.md](CONTRIBUTING-template.md)**: Contributing guidelines template for open source projects

### Project Documentation Templates
Located in `project-docs/`:
- **[project-overview-template.md](project-docs/project-overview-template.md)**: Complete project overview and planning template
- **[architecture-template.md](project-docs/architecture-template.md)**: Comprehensive system architecture documentation template

## Module Development Templates

### Module Documentation
Located in `module-template/`:
- **[overview.md](module-template/overview.md)**: Module overview and feature documentation template
- **[architecture.md](module-template/architecture.md)**: Module-specific architecture documentation template
- **[implementation-status.md](module-template/implementation-status.md)**: Module implementation progress tracking template
- **[integration-guide.md](module-template/integration-guide.md)**: Module integration and setup guide template

## Task Management Templates

### Task Documentation
- **[task-log-template.md](task-log-template.md)**: Standardized task execution log with performance scoring
- **[error-template.md](error-template.md)**: Error documentation and resolution tracking template

## How to Use These Templates

### For New Projects

1. **Start with Project Setup**:
   - Copy `README-template.md` to your project root as `README.md`
   - Copy `CONTRIBUTING-template.md` to your project root as `CONTRIBUTING.md`
   - Customize both files with your project-specific information

2. **Create Project Documentation**:
   - Copy `project-docs/project-overview-template.md` to `docs/project-overview.md`
   - Copy `project-docs/architecture-template.md` to `docs/architecture.md`
   - Fill in your project-specific details

3. **Set Up Project Management System**:
   - Ensure `.project/` directory structure exists (should be created automatically)
   - Customize `.project/core/` files with your project information
   - Set up your initial plans in `.project/plans/`

### For New Modules

1. **Create Module Documentation**:
   - Create a new directory for your module (e.g., `modules/[module-name]/`)
   - Copy templates from `module-template/` to your module directory
   - Customize each template with module-specific information

2. **Document Integration**:
   - Use `integration-guide.md` to document how to integrate your module
   - Update the main project documentation to reference your module

### For Task Management

1. **Task Logging**:
   - Use `task-log-template.md` when creating new task logs in `.project/task-logs/`
   - Follow the performance scoring system for consistent evaluation

2. **Error Tracking**:
   - Use `error-template.md` when documenting errors in `.project/errors/`
   - Include all relevant information for future reference and learning

## Template Customization Guidelines

### Placeholders
All templates use placeholder text in brackets:
- `[Project Name]`: Replace with your actual project name
- `[Module Name]`: Replace with your actual module name
- `[Description]`: Replace with relevant descriptions
- `[Date]`: Replace with actual dates
- `[Version]`: Replace with version numbers

### Sections to Customize
Each template includes sections that should be customized:
- **Project-specific information**: Names, descriptions, goals
- **Technology stack**: Frameworks, languages, tools used
- **Team information**: Roles, responsibilities, contact information
- **Process information**: Workflows, standards, procedures

### Optional Sections
Some templates include optional sections:
- Remove sections that don't apply to your project
- Add additional sections as needed
- Modify existing sections to better fit your needs

## Template Maintenance

### Updating Templates
When improving templates:
1. Update the template files in this directory
2. Document changes in the project's change log
3. Notify team members of template updates
4. Consider creating migration guides for existing projects

### Adding New Templates
When adding new templates:
1. Follow the existing template structure and style
2. Include comprehensive placeholder text
3. Add the new template to this index
4. Document the template's purpose and usage

### Template Versioning
- Templates are versioned with the project management system
- Major changes to templates should be documented
- Consider backward compatibility when making changes

## Best Practices

### Using Templates Effectively
1. **Don't just copy**: Understand what each section is for
2. **Customize thoroughly**: Replace all placeholders with relevant information
3. **Keep updated**: Regularly review and update documentation
4. **Be consistent**: Use the same style and format across all documents

### Documentation Standards
1. **Be specific**: Provide concrete, actionable information
2. **Be complete**: Include all necessary details
3. **Be current**: Keep documentation up to date
4. **Be accessible**: Write for your intended audience

### Quality Assurance
1. **Review before publishing**: Have someone else review your documentation
2. **Test instructions**: Verify that setup and integration instructions work
3. **Gather feedback**: Ask users for feedback on documentation quality
4. **Iterate and improve**: Continuously improve based on feedback

## Template Categories

### Documentation Templates
- Project overview and planning
- Architecture and design
- User guides and tutorials
- API documentation

### Process Templates
- Task management and tracking
- Error handling and resolution
- Decision recording
- Lessons learned documentation

### Development Templates
- Module structure and organization
- Integration guides
- Testing strategies
- Deployment procedures

## Integration with Project Management System

### Memory Bank Integration
Templates are designed to work with the memory bank system:
- Core templates populate `.project/core/` files
- Task templates integrate with `.project/task-logs/`
- Error templates work with `.project/errors/`

### Knowledge Management
Templates support knowledge management:
- Decision templates for `knowledge/decisions.md`
- Best practices templates for `knowledge/best-practices.md`
- Lessons learned templates for `knowledge/lessons-learned.md`

### Progress Tracking
Templates include progress tracking elements:
- Status indicators and completion percentages
- Milestone tracking and deadline management
- Risk assessment and mitigation planning

## Support and Resources

### Getting Help with Templates
- Review existing project documentation
- Check the project management system documentation
- Ask team members or maintainers
- Create an issue if templates need improvement

### Contributing to Templates
- Follow the project's contributing guidelines
- Propose improvements through pull requests
- Share feedback on template effectiveness
- Help maintain and update existing templates

---

For more information about the project management system, see the documentation in `.project/core/` and `knowledge/`.
