# Memory Extraction and Agent Context Enhancement Task

## Overview
This task analyzes conversation threads and chat histories to extract valuable, persistent knowledge that will enhance agent performance. It focuses on capturing technical decisions, patterns, structures, and context that agents can leverage in future interactions.

## Execution Instructions

### Phase 1: Thread Analysis and Content Extraction
1. **Scan conversation history** for the specified thread or current session
2. **Identify knowledge categories** present in the conversation:
   - Database schemas and structures
   - API endpoints and interfaces
   - Code patterns and conventions
   - Technical decisions and rationale
   - Configuration details
   - Error patterns and solutions
   - User preferences and requirements
   - Domain-specific terminology
   - Integration patterns
   - Security considerations

### Phase 2: Knowledge Classification and Filtering
1. **Apply relevance filters**:
   - **High Value**: Technical specs, database schemas, API contracts
   - **Medium Value**: Code patterns, configuration examples, user preferences
   - **Low Value**: Temporary decisions, debugging info, conversational context

2. **Categorize by agent relevance**:
   - **Universal**: Database structures, API endpoints, project terminology
   - **Architect**: System design decisions, integration patterns, tech stack choices
   - **Dev**: Code patterns, libraries used, configuration details
   - **PM**: User requirements, feature priorities, business rules
   - **QA**: Test patterns, error scenarios, validation rules
   - **DevOps**: Deployment configs, environment details, infrastructure patterns

### Phase 3: Memory Extraction Logic

#### Database and Data Structures
Extract and format:
```markdown
## Database Schema Information
- **Table/Collection Names**: [List discovered]
- **Key Relationships**: [Important foreign keys, indexes]
- **Data Types Used**: [Common patterns, constraints]
- **Naming Conventions**: [Field naming patterns observed]
```

#### API and Interface Patterns
Extract and format:
```markdown
## API Endpoint Information
- **Base URLs**: [Environment-specific endpoints]
- **Authentication**: [Method, token patterns, headers]
- **Request/Response Formats**: [JSON schemas, required fields]
- **Error Handling**: [Status codes, error response formats]
```

#### Code Patterns and Conventions
Extract and format:
```markdown
## Code Convention Insights
- **Language Preferences**: [Primary languages, frameworks]
- **Naming Patterns**: [Function, variable, file naming]
- **Architecture Patterns**: [MVC, microservices, etc.]
- **Library Preferences**: [Commonly used packages]
```

#### Configuration and Environment Details
Extract and format:
```markdown
## Environment Configuration
- **Build Tools**: [Webpack, Vite, npm scripts, etc.]
- **Testing Frameworks**: [Jest, Mocha, Cypress, etc.]
- **Deployment Targets**: [Cloud providers, container platforms]
- **Environment Variables**: [Key config patterns (no secrets)]
```

### Phase 4: Agent-Specific Memory Enhancement

#### For Architect Agent
Focus on:
- System architecture decisions
- Technology stack rationale
- Integration patterns used
- Scalability considerations
- Security architecture choices

#### For Dev Agent
Focus on:
- Code organization patterns
- Development workflow preferences
- Testing approaches used
- Debugging techniques mentioned
- Library and framework usage

#### For PM Agent
Focus on:
- Feature prioritization logic
- User story patterns
- Business rule definitions
- Stakeholder preferences
- Success metrics mentioned

#### For QA Agent
Focus on:
- Test case patterns
- Bug reporting formats
- Quality criteria used
- Validation approaches
- Performance benchmarks

#### For DevOps Agent
Focus on:
- Deployment strategies
- Infrastructure patterns
- Monitoring approaches
- Security practices
- Performance optimization techniques

### Phase 5: Memory Integration and Storage

#### Knowledge File Updates
1. **Update .ai/project-context.md** with:
   - New domain terminology discovered
   - Business rules and constraints
   - User preference patterns

2. **Update .ai/tech-stack.md** with:
   - New technology choices and rationale
   - Library preferences and versions
   - Configuration patterns

3. **Update .ai/data-models.md** with:
   - Database schema insights
   - Data relationship patterns
   - Validation rules discovered

4. **Create agent-specific memory files** as needed:
   - `.ai/dev-patterns.md` - Development-specific insights
   - `.ai/deployment-preferences.md` - Infrastructure preferences
   - `.ai/testing-approaches.md` - QA methodology insights

#### Memory Categorization System
```markdown
## Memory Categories

### Persistent Knowledge (High Value)
- Database schemas and relationships
- API contracts and interfaces
- Security requirements and patterns
- Performance benchmarks and targets
- Integration specifications

### Contextual Patterns (Medium Value)
- Code organization preferences
- Testing methodologies used
- Deployment workflow patterns
- Error handling approaches
- User interface conventions

### Session Context (Low Value - Filtered Out)
- Temporary debugging information
- Conversational meta-discussion
- One-off troubleshooting steps
- Personal preferences not related to project
- Incomplete or contradictory information
```

## Extraction Algorithms

### Database Schema Detection
```markdown
**Pattern Recognition for**:
- Table/collection creation statements
- Field definitions and types
- Foreign key relationships
- Index definitions
- Migration patterns
- ORM model definitions
```

### API Pattern Detection
```markdown
**Pattern Recognition for**:
- Endpoint URL patterns
- HTTP method usage
- Request/response JSON structures
- Authentication header patterns
- Error response formats
- Rate limiting approaches
```

### Configuration Pattern Detection
```markdown
**Pattern Recognition for**:
- Environment variable usage
- Configuration file formats
- Build script patterns
- Dependency declarations
- Feature flag usage
- Logging configuration
```

## Command Integration

Add to bmad-agent/commands.md:
```markdown
## Memory Management Commands

| Command | Description |
|---------|-------------|
| `*memory-extract` / `/memory-extract` | Extract useful knowledge from current thread |
| `*memory-extract {agent-name}` | Extract knowledge filtered for specific agent |
| `*memory-extract --scope=session` | Extract from current session only |
| `*memory-extract --scope=thread` | Extract from entire thread history |
| `*memory-status` / `/memory-status` | Show current agent memory/context state |
| `*memory-merge` / `/memory-merge` | Merge extracted memories into agent knowledge |
```

## Configuration Options

### Extraction Scope
- **Session**: Current conversation session only
- **Thread**: Entire conversation thread
- **Recent**: Last N messages (configurable)
- **Targeted**: Specific message range

### Agent Filtering
- **Universal**: Extract knowledge useful for all agents
- **Specific**: Filter for particular agent type
- **Multiple**: Extract for multiple specified agents

### Knowledge Depth
- **Surface**: Basic patterns and explicit information
- **Deep**: Inferred patterns and implicit knowledge
- **Comprehensive**: Full analysis including context clues

## Usage Examples

### Extract General Knowledge
```
*memory-extract
```
Analyzes current thread for all useful knowledge categories.

### Extract for Specific Agent
```
*memory-extract Dev
```
Focuses on development-specific patterns and information.

### Extract from Session with Scope
```
*memory-extract --scope=session --depth=deep
```
Deep analysis of current session only.

### Check Memory Status
```
*memory-status
```
Shows what knowledge has been captured for each agent.

## Quality Filters

### Information Validity Checks
- **Consistency**: Cross-reference with existing knowledge
- **Completeness**: Identify partial or incomplete information
- **Currency**: Prefer recent decisions over outdated ones
- **Specificity**: Favor concrete details over vague statements

### Relevance Scoring
- **High Relevance**: Technical specifications, business rules
- **Medium Relevance**: Preferences, patterns, conventions
- **Low Relevance**: Debugging info, temporary solutions

### Deduplication Logic
- Compare with existing knowledge in .ai/ directory
- Merge similar information rather than duplicate
- Update existing knowledge with new details
- Flag conflicts for manual resolution

## Integration Points

### With Knowledge Update System
- Automatically trigger knowledge update after memory extraction
- Integrate with existing agent knowledge files
- Maintain version history of knowledge changes

### With Agent Performance
- Provide agents with relevant extracted memories
- Enable agents to reference conversation-specific knowledge
- Improve agent decision-making with historical context

### With Project Documentation
- Contribute to project documentation updates
- Enhance API documentation with discovered endpoints
- Update technical specifications with new patterns

## Output Formats

### Memory Extraction Report
```markdown
## Memory Extraction Report

**Thread**: [Thread identifier]
**Extraction Date**: [Current date]
**Scope**: [Session/Thread/Range]
**Knowledge Items Found**: [Count by category]

### High-Value Knowledge Extracted

#### Database Structures
[List of schemas, tables, relationships discovered]

#### API Patterns
[Endpoints, authentication, response formats found]

#### Technical Decisions
[Architecture choices, technology selections, rationale]

### Agent-Specific Enhancements

#### For Dev Agent
[Development-specific patterns and preferences]

#### For Architect Agent
[Architecture and design insights]

### Integration Recommendations
- Update .ai/project-context.md with [specific items]
- Enhance .ai/tech-stack.md with [technology insights]
- Create new knowledge file for [specialized domain knowledge]
```

### Agent Memory Enhancement Summary
```markdown
## Agent Context Enhancement Summary

**Agent**: [Specific agent name]
**Knowledge Added**: [Count of new items]
**Categories Enhanced**: [List of knowledge categories]

### New Capabilities Gained
- [Enhanced understanding of X]
- [Better context for Y decisions]
- [Improved handling of Z scenarios]

### Recommended Actions
- [Update agent persona with new context]
- [Modify task instructions based on new knowledge]
- [Add specialized tasks for discovered patterns]
```

## Success Metrics

### Extraction Quality
- Accuracy of pattern recognition
- Relevance of extracted knowledge
- Reduction in redundant agent questions
- Improvement in agent decision quality

### Agent Performance Enhancement
- Faster task completion times
- Fewer clarification requests from agents
- Better adherence to project patterns
- Improved consistency across agent interactions

### Knowledge Management
- Growth of useful project knowledge base
- Reduction in knowledge duplication
- Better organization of project context
- Enhanced agent specialization

## Implementation Notes

### Thread Analysis Techniques
- Natural language processing for pattern recognition
- Regular expressions for technical pattern detection
- Context analysis for implicit knowledge extraction
- Cross-referencing with existing project knowledge

### Memory Storage Strategy
- Append to existing knowledge files when possible
- Create specialized memory files for complex domains
- Maintain knowledge versioning and change history
- Enable easy rollback of problematic extractions

### Performance Considerations
- Limit analysis scope to prevent overwhelming processing
- Cache extraction results for repeated analysis
- Provide progress indicators for long extractions
- Enable partial extraction and incremental updates