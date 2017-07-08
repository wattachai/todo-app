## API Summary

operation|HTTP method|Request Body|Parameters|Recursive
---|---|---|---|---
show todos|GET|-|completed, parent|-
create todo|POST|{value, parent}|-|-
mark todo as completed|PUT|{id}|-|on all children
delete todo|DELETE|{id}|-|on all children

- Since the API is utilizing HTTP method, there is only one URI: /api/todos
- All request and response bodies are formatted as JSON.

## TODO
- atomic save for recursive update/delete
- better input validation
 * middleware of mongoose of .pre('save'...)
