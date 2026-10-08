# Team AI Agent Rules

Use these rules whenever an AI agent helps with this repository

## Project Context

- This is the NAI Membership System for the Najah AI Society
- The backend uses Django
- The frontend uses React
- Read `docs/requirements.md` before changing system behavior
- Keep the MVP focused on student registration and in-person membership payment tracking
- Students register with their full name, major, university ID, and WhatsApp number
- Students do not have login accounts in the MVP
- Administrators sign in to manage student records and confirm payments

## How to Work in This Repository

- Understand the existing code and file structure before editing
- Make small changes that solve the requested task
- Follow the patterns already used in the project
- Do not add a new library or framework without a clear reason
- Do not invent product requirements or silently change agreed behavior
- If a requirement is unclear, describe the uncertainty and suggest a simple option
- Keep code readable so a teammate can explain how it works
- Avoid unnecessary abstractions, duplicated code, and overly clever solutions
- Never claim that code was tested when it was not tested
- Do not put passwords, API keys, tokens, or private student data in source files
- Validate important data on the backend, even when the frontend also validates it
- Protect administrator pages and management APIs with authentication
- Do not expose private student records in public responses

## Comments in Code

- Write code comments in English
- Use simple, natural wording that a student on the team can understand
- Use sentence case and a small amount of capitalization
- Do not end code comments with a period
- Add comments only when they explain why a decision was made or clarify a non-obvious part
- Do not comment on every line or repeat what the code already says
- Keep comments inside the relevant code file and close to the code they explain

### Comment examples

Good:

```python
# Keep university IDs unique so a student cannot register twice
```

Good:

```javascript
// Show the payment action only for students who are still pending
```

Avoid:

```python
# THIS FUNCTION CREATES A STUDENT.
```

Avoid comments that only restate the next line:

```python
# Set the name
student.name = name
```

## Before Finishing a Task

- Review the final changes for consistency with the requirements
- Run the relevant checks when possible
- Report which files changed and which checks were run
- Mention any unfinished part or blocker clearly
- Keep commit messages short and specific
