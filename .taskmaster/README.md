# Taskmaster Directory

This directory contains Taskmaster configuration and documentation files.

## Structure

- `docs/prd.txt` - Product Requirements Document that Taskmaster can parse to generate tasks
- `tasks/tasks.json` - Generated tasks from Taskmaster

## Usage

Taskmaster MCP functions can be used to:
- Parse PRD files to generate tasks
- Manage and track tasks
- Expand tasks into subtasks
- Update task status and progress

## Integration

The app uses Taskmaster MCP tools via server actions/API routes to:
1. Generate PRDs from subproject notes
2. Generate tasks from PRDs
3. Parse and manage task markdown
