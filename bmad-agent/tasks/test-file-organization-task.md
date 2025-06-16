# Test File Organization Task

## Overview
This task ensures all test files are properly organized in the `docs/tests/` directory instead of cluttering the project root. It provides instructions for creating, moving, and organizing test files according to BMAD standards.

## CRITICAL RULE: Test File Location

**ALL test files MUST be placed in `docs/tests/` directory, NOT in project root**

## Standard Test Directory Structure

```
docs/
└── tests/
    ├── unit/           # Unit tests - testing individual functions/methods
    ├── integration/    # Integration tests - testing component interactions
    ├── e2e/           # End-to-end tests - testing complete user flows
    ├── performance/   # Performance and load tests
    ├── fixtures/      # Test data and fixtures
    ├── mocks/         # Mock objects and services
    └── helpers/       # Test utilities and helper functions
```

## File Naming Conventions

### Python Test Files
- Pattern: `test_*.py`
- Example: `test_user_authentication.py`
- Location: `docs/tests/unit/test_user_model.py`

### JavaScript/TypeScript Test Files
- Patterns: `*.test.js`, `*.spec.js`, `*.test.ts`, `*.spec.ts`
- Examples: `userAuth.test.js`, `api.spec.ts`
- Location: `docs/tests/integration/userAuth.test.js`

### React Component Tests
- Patterns: `*.test.tsx`, `*.spec.tsx`
- Example: `LoginForm.test.tsx`
- Location: `docs/tests/unit/components/LoginForm.test.tsx`

## Execution Instructions

### Phase 1: Audit Existing Test Files

1. **Scan project root** for misplaced test files:
   - Look for: `test_*.py`, `*.test.*`, `*.spec.*`
   - Identify any test files in root directory
   - List all test files that need relocation

### Phase 2: Create Test Directory Structure

```bash
# Create standard test directories
mkdir -p docs/tests/{unit,integration,e2e,performance,fixtures,mocks,helpers}
```

### Phase 3: Move Existing Test Files

1. **For each test file in root**:
   - Determine test type (unit, integration, e2e)
   - Move to appropriate subdirectory
   - Update any import paths in the test file
   - Update references to the test file

2. **Update test runners and configurations**:
   - Jest config: Update `testMatch` patterns
   - Pytest config: Update test discovery paths
   - Package.json: Update test script paths

### Phase 4: Configure Test Runners

#### Jest Configuration (JavaScript/TypeScript)
```javascript
// jest.config.js
module.exports = {
  testMatch: [
    '**/docs/tests/**/*.test.[jt]s?(x)',
    '**/docs/tests/**/*.spec.[jt]s?(x)'
  ],
  testPathIgnorePatterns: ['/node_modules/']
};
```

#### Pytest Configuration (Python)
```ini
# pytest.ini
[pytest]
testpaths = docs/tests
python_files = test_*.py
python_classes = Test*
python_functions = test_*
```

#### Package.json Scripts
```json
{
  "scripts": {
    "test": "jest --config jest.config.js",
    "test:unit": "jest docs/tests/unit",
    "test:integration": "jest docs/tests/integration",
    "test:e2e": "jest docs/tests/e2e"
  }
}
```

### Phase 5: Update Documentation

1. **Update project documentation** to reflect new test locations
2. **Add test location instructions** to contributing guidelines
3. **Update any CI/CD pipelines** to use new test paths

## Migration Script Example

```bash
#!/bin/bash
# migrate-tests.sh - Move test files to docs/tests/

# Create directory structure
mkdir -p docs/tests/{unit,integration,e2e,performance,fixtures,mocks,helpers}

# Move Python test files
find . -maxdepth 1 -name "test_*.py" -exec mv {} docs/tests/unit/ \;

# Move JavaScript/TypeScript test files
find . -maxdepth 1 -name "*.test.js" -o -name "*.spec.js" \
     -o -name "*.test.ts" -o -name "*.spec.ts" \
     -exec mv {} docs/tests/unit/ \;

# Move React component test files
find . -maxdepth 1 -name "*.test.tsx" -o -name "*.spec.tsx" \
     -exec mv {} docs/tests/unit/ \;

echo "Test files migrated to docs/tests/"
```

## Integration with Agents

### For Dev Agent
When creating new tests:
```
Create unit test for user authentication function
Location: docs/tests/unit/test_user_auth.py
```

### For QA Agent
When implementing test plans:
```
Implement integration tests for API endpoints
Location: docs/tests/integration/api.test.js
```

## Command Integration

Add to commands or use directly:
```
*test-organize - Organize all test files into docs/tests/ structure
*test-migrate - Move existing tests from root to proper directories
*test-create {type} {name} - Create new test file in correct location
```

## Benefits of This Organization

1. **Clean Project Root**: No test file clutter in main directory
2. **Clear Test Categories**: Easy to find and run specific test types
3. **Better CI/CD Integration**: Clear paths for different test stages
4. **Consistent Structure**: All projects follow same test organization
5. **Easy Test Discovery**: Test runners can target specific directories

## Enforcement Rules

1. **Pre-commit Hook**: Check for test files in root and reject
2. **Code Review**: Flag any PRs with tests in wrong location
3. **Agent Instructions**: All agents must follow this structure
4. **Documentation**: Clear guidelines in contributing docs

## Common Mistakes to Avoid

1. **Don't place test files in root** - Always use docs/tests/
2. **Don't mix test types** - Keep unit, integration, e2e separate
3. **Don't forget imports** - Update paths after moving files
4. **Don't skip test runner config** - Update Jest/Pytest configs

## Success Criteria

- [ ] No test files in project root
- [ ] All tests organized by type in docs/tests/
- [ ] Test runners configured for new paths
- [ ] CI/CD pipelines updated
- [ ] Documentation reflects new structure
- [ ] All agents following new convention