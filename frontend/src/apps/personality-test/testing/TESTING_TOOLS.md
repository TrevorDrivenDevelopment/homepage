# Personal MBTI Testing Tools

These tools allow you to answer the MBTI questions once and then test system refinements repeatedly without having to re-answer questions through the UI. Now includes deterministic testing for all 16 MBTI types!

## Quick Start

### 1. Answer Questions Once
```bash
npx tsx src/apps/personality-test/testing/interactive_test.ts
```
This will:
- Present all 40 questions interactively
- Save your responses to `my_responses.json`
- Run initial calculations

### 2. Quick Testing (Deterministic)
```bash
npx tsx src/apps/personality-test/testing/quick_test.ts
```
This will:
- Let you choose between your personal responses or test specific MBTI types
- Load saved responses
- Run them through the current system
- Show detailed results including function scores

### 3. Test System Refinements
```bash
npx tsx src/apps/personality-test/testing/test_refinements.ts
```
This will:
- Load your saved responses
- Test different calculator configurations
- Compare scoring strategies
- Help validate system improvements

### 4. Generate Deterministic Type Patterns
```bash
npx tsx src/apps/personality-test/testing/generate_deterministic.ts
```
This will:
- Create response patterns for all 16 MBTI types
- Save them to `deterministic-types/` folder
- Enable testing specific type classifications

### 5. Batch Test All Types
```bash
npx tsx src/apps/personality-test/testing/batch_test_types.ts
```
This will:
- Test all 16 deterministic patterns
- Show overall system accuracy across types
- Identify problematic classifications

## Files Created

- **`my_responses.json`** - Your personal responses (timestamped)
- **`deterministic-types/`** - Folder containing response patterns for each MBTI type
  - `intj_responses.json`, `intp_responses.json`, etc.
  - `index.json` - Index of all generated types

## Use Cases

1. **Development Testing**: After making code changes, run `quick_test.ts` to see how your responses are classified with the new system

2. **System Validation**: Use `batch_test_types.ts` to ensure the system correctly identifies all 16 types

3. **Specific Type Testing**: Use `quick_test.ts` option 2 to test how well the system handles specific MBTI patterns

4. **System Comparison**: Use `test_refinements.ts` to compare different scoring strategies or calculator configurations

5. **Debugging**: When you get unexpected results, the detailed scoring helps identify which functions are being over/under-weighted

## Example Workflow

```bash
# Initial setup - answer questions once
npx tsx src/apps/personality-test/testing/interactive_test.ts

# Generate deterministic patterns for validation
npx tsx src/apps/personality-test/testing/generate_deterministic.ts

# Test overall system accuracy
npx tsx src/apps/personality-test/testing/batch_test_types.ts

# Make code changes to improve system...

# Test your personal responses with the improved system
npx tsx src/apps/personality-test/testing/quick_test.ts

# Test specific types that had issues
npx tsx src/apps/personality-test/testing/quick_test.ts
# Choose option 2, then enter problematic type like "INTP"

# Compare different approaches
npx tsx src/apps/personality-test/testing/test_refinements.ts
```

## Quick Test Options

When running `quick_test.ts`, you'll see:

1. **Your personal responses** - Test your saved answers
2. **Test a specific MBTI type** - Enter any type (INTP, ENFJ, etc.)
3. **List all available types** - See all 16 deterministic patterns

## Response File Formats

### Personal Responses (`my_responses.json`)
```json
{
  "timestamp": "2025-06-22T21:45:00.000Z",
  "responses": [
    { "questionIndex": 0, "value": true },
    { "questionIndex": 1, "value": false },
    ...
  ],
  "questionTexts": ["Question 1 text...", ...]
}
```

### Deterministic Type Responses
```json
{
  "timestamp": "2025-06-22T22:00:00.000Z",
  "type": "INTP",
  "description": "The Thinker - Logical, analytical, and curious minds",
  "responses": [...],
  "questionTexts": [...]
}
```

## Notes

- The interactive test shows progress and lets you review questions
- You can re-answer questions anytime by choosing option 2
- The quick test is perfect for rapid iteration during development
- Deterministic patterns help validate system accuracy across all types
- All scores are rounded to avoid floating-point precision errors
- Batch testing reveals systematic biases in classification logic
