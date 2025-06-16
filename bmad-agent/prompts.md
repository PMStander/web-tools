# Prompt for Task Executor Agent (TaskExec)

I want to start running through the tasks. I want you to get James our Full Stack Engineer agent that works through a task and sub-task, and after each sub-task is done, have a 2nd agent Reviewer that reviews the code. If there are changes to make, have a 3rd  agent Changer go ahead and implement the changes. Do this for all sub-tasks and tasks


# Prompt for Code Reviewer Agent (Reviewer)

I want to start running through the an error {}. I want you to get James our Full Stack Engineer agent that works through a task and sub-task, and after each sub-task is done, have a 2nd agent Reviewer that reviews the code. If there are changes to make, have a 3rd  agent Changer go ahead and implement the changes. Do this for all sub-tasks and tasks


# Prompt for Orchestrator Agent (Orchestrator)

Hi Orchastrator, I want to start working on our book creator @layers/crm/ module. First we need to make sure we understand it 100%. \
   Here's what you can now use:

    Module Development Commands:

    Start Module Development:

    *Analyst Research Module Requirements {module-name}
    *PM Create Module PRD {module-name}
    *Architect Create Module Architecture {module-name}
    *Design Architect Create Module Frontend
    {module-name}
    *BMAD Update Module Knowledge {module-name}
    *SM Create Module Stories {module-name}
    *Dev Implement Module {module-name}
    *QA Create Module Test Plan {module-name}
    *DevOps Deploy Module {module-name}

    Module Knowledge Management:

    *update-module-knowledge {module-name}
    *generate-module-knowledge-map {module-name}
    *module-knowledge-request {module-name} {topic}
    *validate-module-knowledge {module-name}

    File Structure Created:

    docs/modules/{module-name}/
    ├── module-brief.md
    ├── module-prd.md
    ├── module-architecture.md
    ├── module-tech-stack.md
    ├── module-data-models.md
    ├── module-api-reference.md
    ├── module-test-plan.md
    └── stories/

    .ai/modules/{module-name}/
    ├── module-context.md
    ├── module-tech-stack.md
    ├── module-data-models.md
    └── module-integration.md

    Templates Created:

    - module-brief-tmpl.md - For module overview and
    requirements
    - module-prd-tmpl.md - For detailed module
    requirements
    - module-architecture-tmpl.md - For module technical
    design

    Ready to use! Just replace {module-name} with your
    actual module name and start the workflow.

Take over and fix a problematic existing module with multiple issues

Please run these steps

| Step | Agent | Command | Description |
|------|-------|---------|-------------|
| 1 | Analyst | `*Analyst Analyze Legacy Module` | Document current issues, broken functionality, and technical debt |
| 2 | QA | `*QA create-test-plan` | Create comprehensive test plan to identify all defects |
| 3 | QA | `*QA run-tests` | Execute tests to catalog all broken functionality |
| 4 | Architect | `*Architect Document Current Architecture` | Map existing architecture and identify structural problems |
| 5 | PM | `*PM Create Remediation PRD` | Document remediation requirements and priorities |
| 6 | BMAD | `*BMAD Update Agent Knowledge` | Update agents with module knowledge and issues |