# Memory Extract

Extract useful knowledge from current conversation thread for agent learning.

## Usage
```
/memory-extract
```

Extract for specific agent:
```
/memory-extract --agent=<agent-name>
```

Extract with specific scope:
```
/memory-extract --scope=session
/memory-extract --scope=thread
```

## Purpose
Extract valuable insights, decisions, and context from conversation history to enhance agent knowledge and improve future interactions.

## Implementation
Execute the memory extraction task:

1. **Load Memory Task**
   - Read `bmad-agent/tasks/memory-extraction-task.md`
   - Determine extraction scope and filters

2. **Conversation Analysis**
   - Analyze conversation history for key insights
   - Identify important decisions and rationale
   - Extract technical details and constraints
   - Capture user preferences and patterns

3. **Knowledge Categorization**
   Extract and categorize:
   - **Technical Decisions**: Architecture choices, technology selections
   - **Business Logic**: Domain rules, workflow patterns
   - **User Preferences**: Coding styles, process preferences
   - **Lessons Learned**: What worked, what didn't, why
   - **Context Clues**: Project constraints, team dynamics

4. **Memory File Creation**
   Save extracted memories to:
   ```
   .ai/memories/
   ├── session-{date}-{time}.md     # Session-specific memories
   ├── technical-decisions.md       # Technical choice history
   ├── user-preferences.md         # User preference patterns
   └── lessons-learned.md          # Project insights
   ```

## Extraction Scopes

### Session Scope (`--scope=session`)
- Extract from current Claude session only
- Focus on immediate decisions and context
- Good for quick learning from recent interactions

### Thread Scope (`--scope=thread`)
- Extract from entire conversation thread
- Comprehensive history analysis
- Better for major project insights

### Agent-Specific (`--agent=<name>`)
- Filter extractions relevant to specific agent
- Focus on role-specific insights and decisions
- Helps build agent-specific context

## Memory Categories

### Technical Memories
- Architecture decisions and rationale
- Technology stack choices and constraints
- Integration patterns and solutions
- Performance considerations

### Process Memories
- Workflow preferences and patterns
- Communication styles and frequency
- Quality standards and checkpoints
- Problem-solving approaches

### Domain Memories
- Business rules and logic patterns
- User behavior and requirements
- Market insights and competitive analysis
- Success metrics and KPIs

## Quality Extraction
Focus on extracting:
- **Why** decisions were made, not just what
- **Context** that influenced choices
- **Trade-offs** considered and rejected alternatives
- **Patterns** that might apply to future decisions

## Memory Integration
After extraction, consider:
1. **Merge with Knowledge**: Use `/memory-merge` to integrate into agent knowledge
2. **Update Agents**: Run `/update-knowledge` to distribute insights
3. **Validate Accuracy**: Review extracted memories for correctness

## Automatic Triggers
Memory extraction may be triggered:
- At end of major project phases
- When switching between agents
- After complex problem-solving sessions
- Before knowledge updates

## Related Commands
- `/memory-merge` - Merge extracted memories into agent knowledge
- `/update-knowledge` - Distribute knowledge to all agents
- `/memory-status` - Show current agent memory state
- `/core-dump` - Save complete current state