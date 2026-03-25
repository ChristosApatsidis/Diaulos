## Account types

- Admin
- User
- Viwer

## Permissions by account type

| Permissions        | Admin | User | Viewer |
| ------------------ | ----- | ---- | ------ |
| View content       | ✅    | ✅   | ✅     |
| Create content     | ✅    | ✅   | ❌     |
| Edit content       | ✅    | ✅\* | ❌     |
| Edit own content   | ✅    | ✅   | ❌     |
| Delete content     | ✅    | ❌   | ❌     |
| Delete own content | ✅    | ✅   | ❌     |

\*The user can edit content only if the content was created by the company belongs.

## User Registration and Organizational Assignment

Every user account is registered with the battalion, company, and platoon it belongs to. With this information every user can edit content only if it was created within their assigned comany.

## Database

- users
- sessions
- accounts

## User schema

- name
- email
- username
- displayUsername
- password
- branch
- rank
- specialty
- subordinateUnit

### Username validator

Allow only alphanumeric characters, underscores, and hyphens

### Display username validator

> By default the displayed username is the same as username
