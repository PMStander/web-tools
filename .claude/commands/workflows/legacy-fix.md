# Legacy Module Remediation Workflow

Take over and fix a problematic existing module with multiple issues.

## Usage
```
/legacy-fix <module-name>
```

Example:
```
/legacy-fix user-management
/legacy-fix billing-system
/legacy-fix report-generator
```

## Purpose
Systematically address a problematic existing module with broken functionality, technical debt, and multiple issues.

## Workflow Steps

### Phase 1: Issue Documentation
1. **Analyst** - Analyze Legacy Module
   ```
   /analyst-legacy-analysis <module-name>
   ```
   - Document current issues, broken functionality, and technical debt
   - Catalog all known problems and user complaints
   - Save to `docs/modules/{module-name}/legacy-analysis.md`

2. **QA** - Create Comprehensive Test Plan
   ```
   /qa-legacy-test-plan <module-name>
   ```
   - Create comprehensive test plan to identify all defects
   - Include functional, integration, and regression testing
   - Save to `docs/modules/{module-name}/defect-test-plan.md`

3. **QA** - Execute Tests
   ```
   /qa-run-legacy-tests <module-name>
   ```
   - Execute tests to catalog all broken functionality
   - Document test results and failure patterns
   - Prioritize issues by severity and impact

### Phase 2: Architecture Assessment
4. **Architect** - Document Current Architecture
   ```
   /architect-legacy-architecture <module-name>
   ```
   - Map existing architecture and identify structural problems
   - Document technical debt and architectural issues
   - Save to `docs/modules/{module-name}/current-architecture.md`

5. **PM** - Create Remediation PRD
   ```
   /pm-remediation-prd <module-name>
   ```
   - Document remediation requirements and priorities
   - Create roadmap for fixes and improvements
   - Save to `docs/modules/{module-name}/remediation-prd.md`

### Phase 3: Knowledge Integration
6. **BMAD** - Update Agent Knowledge
   ```
   /update-module-knowledge <module-name>
   ```
   - Update agents with module knowledge and issues
   - Create remediation-specific context
   - Document known problems and constraints

### Phase 4: Remediation Planning
7. **SM** - Document Sharding
   ```
   /sm-remediation-sharding <module-name>
   ```
   - Break down remediation work into manageable pieces
   - Create prioritized fix epics
   - Save to `docs/modules/{module-name}/remediation-epics/`

8. **SM** - Create First Remediation Story
   ```
   /sm-remediation-story <module-name>
   ```
   - Create first remediation story (highest priority fixes)
   - Focus on critical broken functionality
   - Save to `docs/modules/{module-name}/stories/remediation-1.1.story.md`

### Phase 5: Implementation & Validation
9. **Dev** - Implement Fixes
   ```
   /dev-implement-fixes <module-name>
   ```
   - Implement fixes and improvements
   - Follow incremental, testable approach
   - Address technical debt systematically

10. **QA** - Validate Fixes
    ```
    /qa-validate-fixes <module-name>
    ```
    - Validate fixes and run regression testing
    - Ensure fixes don't break other functionality
    - Update test results and status

11. **DevOps** - Deploy Fixes
    ```
    /devops-deploy-fixes <module-name>
    ```
    - Deploy fixes to appropriate environments
    - Monitor for new issues or regressions

## Special Considerations

### Priority Guidelines
- **Start with critical issues**: Fix broken core functionality first
- **Document everything**: Catalog all issues before starting fixes
- **Incremental approach**: Fix issues in small, testable chunks
- **Regression testing**: Ensure fixes don't break other functionality

### Common Issue Types
- **Data cleanup**: Address dummy data and placeholder content
- **User experience**: Prioritize user-facing issues (popups, forms, navigation)
- **Technical debt**: Plan for architectural improvements alongside bug fixes
- **Integration problems**: Fix broken API calls and data flows

### Success Metrics
- Reduction in user-reported issues
- Improved test coverage and pass rates
- Reduced technical debt scores
- Better performance metrics

## Iterative Process
This workflow may need to be repeated multiple times:
1. Fix highest priority issues first
2. Re-run tests to identify remaining issues
3. Create new remediation stories for next iteration
4. Continue until module meets quality standards

## Related Commands
- `/competitive-analysis` - Use competitor research to guide improvements
- `/module-dev` - Add new features after remediation
- `/qa-regression-suite` - Run comprehensive regression testing