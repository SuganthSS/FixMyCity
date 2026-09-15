---
trigger: glob
---

WORKFLOW RULES

For every task:

1. First analyze the existing implementation.

2. Create a detailed implementation plan containing:
   - Objective
   - Files to modify
   - Files that must NOT be modified
   - Architecture impact
   - Security considerations
   - Risks
   - Self-review checklist

3. Show the implementation plan and file diff preview.

4. Wait for my review.

5. Only after I reply:

Proceed

execute the approved plan.

6. Do not ask for additional confirmations for:
   - Terminal commands
   - Package installations
   - File creation
   - File modifications
   - Folder creation
   - Safe development operations

7. Stop and ask for review if:
   - The architecture changes significantly
   - Database schema changes are required
   - Existing APIs must change
   - Existing routes must change
   - A destructive operation is required
   - An unexpected error requires a different approach

8. Before applying changes, perform a self-review:
   - Security review
   - Type safety review
   - Dependency review
   - Backward compatibility review

9. After implementation:

Run verification:
   - npm install (if required)
   - npx tsc --noEmit
   - Existing test suite (if available)

10. If verification passes:

git add .
git commit -m "<meaningful commit message>"
git push origin <current-branch>

11. Do not push if:
   - Build fails
   - TypeScript fails
   - Tests fail

12. After execution provide:
   - Files changed
   - Commands executed
   - Verification results
   - Commit hash
   - Branch name
   - Push status
   - Errors (if any)