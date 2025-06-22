# Personal MBTI Testing Tools

These tools allow you to answer the MBTI questions once and then test system refinements repeatedly without having to re-answer questions through the UI.

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
- Load your saved responses
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

## Files Created

- **`my_responses.json`** - Your saved responses (timestamped)
- Contains your answers to all questions plus metadata

## Use Cases

1. **Development Testing**: After making code changes, run `quick_test.ts` to see how your responses are classified with the new system

2. **System Comparison**: Use `test_refinements.ts` to compare different scoring strategies or calculator configurations

3. **Debugging**: When you get unexpected results, the detailed scoring helps identify which functions are being over/under-weighted

4. **Validation**: Ensure that system improvements don't break your personal classification

## Example Workflow

```bash
# Initial setup - answer questions once
npx tsx src/apps/personality-test/testing/interactive_test.ts

# Make code changes to improve system...

# Test your responses with the improved system
npx tsx src/apps/personality-test/testing/quick_test.ts

# Compare different approaches
npx tsx src/apps/personality-test/testing/test_refinements.ts

# Repeat testing as you refine the system
npx tsx src/apps/personality-test/testing/quick_test.ts
```

## Response File Format

The `my_responses.json` file contains:
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

- `value: true` = chose first option (extroverted)
- `value: false` = chose second option (introverted)

## Notes

- The interactive test shows progress and lets you review questions
- You can re-answer questions anytime by choosing option 2
- The quick test is perfect for rapid iteration during development
- All scores are rounded to avoid floating-point precision errors
