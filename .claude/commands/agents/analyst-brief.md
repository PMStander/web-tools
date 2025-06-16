# Analyst - Create Project Brief

Create a comprehensive project brief through research and requirements analysis.

## Usage
```
/analyst-brief
```

For specific project types:
```
/analyst-brief --type=web-app
/analyst-brief --type=api
/analyst-brief --type=mobile-app
/analyst-brief --type=platform
```

## Implementation
Switch to Analyst persona and execute the project brief creation task:

1. **Load Analyst Context**
   - Read `bmad-agent/personas/analyst.md`
   - Load `bmad-agent/tasks/create-project-brief.md`
   - Apply `bmad-agent/checklists/analyst-checklist.md`

2. **Enhanced Research Phase (Multi-Model)**
   - Brainstorm and research project concept using `chat` with Gemini for diverse perspectives
   - Use `thinkdeep` to validate target audience analysis and use case identification
   - Research competitive landscape with `analyze` for comprehensive market understanding
   - Document technical constraints and requirements with multi-model feasibility validation

3. **Multi-Model Requirements Gathering**
   - Define project goals and objectives using `thinkdeep` for strategic validation
   - Use `chat` to brainstorm core features with Gemini for innovation opportunities
   - Document user personas and scenarios with cross-model validation
   - Establish success metrics validated through multi-model consensus

4. **Enhanced Multi-Model Documentation**
   - Use template from `bmad-agent/templates/project-brief-tmpl.md`
   - Cross-validate final brief content using `analyze` with multiple AI models
   - Save to `docs/project-brief.md`
   - Include research sources and references
   - Document multi-model insights in `.ai/multi-model-sessions/research/`
   - Use actual current date (YYYY-MM-DD format)
   - Include multi-model consensus levels for key strategic decisions

## Template Structure
The project brief should include:
- **Project Overview**: Vision, goals, target audience
- **Market Research**: Competitive analysis, market opportunity
- **Requirements**: Functional and non-functional requirements
- **Constraints**: Technical, budget, timeline constraints
- **Success Criteria**: Key performance indicators and metrics
- **Assumptions & Risks**: Known assumptions and potential risks

## Enhanced Research Tools (Multi-Model)
Leverage Machine-Powered and Multi-Model Capabilities during research:
- `/perplexity` - Web search with summarization for market research
- `/github` - Search code repositories for technical patterns
- `/firecrawl` - Advanced data extraction for competitive analysis
- **Zen MCP Tools for Enhanced Analysis**:
  - `thinkdeep` - Deep market analysis validation with Gemini/O3
  - `chat` - Collaborative competitive analysis with multiple AI models
  - `analyze` - Multi-model technical feasibility assessment

## Enhanced Multi-Model Quality Checklist
Before completion, verify:
- [ ] Clear project vision and goals defined (validated with `thinkdeep`)
- [ ] Target audience and use cases documented (cross-validated with Gemini)
- [ ] Competitive landscape analyzed (multi-model consensus achieved)
- [ ] Technical requirements identified (feasibility validated with `analyze`)
- [ ] Success metrics established (strategic validation with multiple AI models)
- [ ] Multi-model insights documented in `.ai/multi-model-sessions/research/`
- [ ] Key strategic decisions show multi-model consensus levels
- [ ] File saved to correct location with actual date

## Next Steps
After completing the project brief:
1. Run `/update-knowledge` to distribute research findings
2. Execute `/pm-prd` to create Product Requirements Document
3. Consider `/perplexity` for additional domain research if needed

## Related Commands
- `/pm-prd` - Create PRD based on project brief
- `/update-knowledge` - Update agent knowledge with research
- `/competitive-analysis` - Deep competitive analysis workflow