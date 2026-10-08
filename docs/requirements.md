# NAI Membership System Requirements

## 1. Project Overview

The NAI Membership System helps the Najah AI Society collect student membership requests and track membership payments

Students submit their names and university IDs through a public registration form. Association administrators use a protected dashboard to find students and confirm payment at the membership desk

## 2. Technology Decisions

- Backend: Django
- Frontend: React
- The database choice will be documented in the database design task
- The first version focuses on registration and in-person payment tracking

## 3. User Roles

### Student

Students can:
- Open the public membership form
- Submit their full name and university ID
- See whether their request was submitted successfully

Students do not need an account or password in the MVP

### Administrator

Administrators can:
- Sign in to the admin dashboard
- View the student list
- Search by student name or university ID
- Filter students by membership status
- Confirm payment for a student
- View when payment was confirmed and which administrator confirmed it

Only authorized administrators can view student records or change payment status

## 4. Student Registration

### Required fields

| Field | Requirement |
| --- | --- |
| Full name | Required, trimmed, and stored as the student entered it |
| University ID | Required, validated, and unique |

### Registration behavior

1. A student submits their full name and university ID
2. The system validates both fields
3. The system checks whether the university ID is already registered
4. If validation succeeds, the system creates a student record with the `Pending Payment` status
5. The student sees a clear success message

### Validation behavior

- Missing fields return a clear field-level validation message
- A duplicate university ID is rejected with a clear message
- The backend must enforce university ID uniqueness even if the frontend also checks it
- The system must not create a second student record when a duplicate is submitted

## 5. Membership and Payment Status

The MVP uses these statuses:

- `Pending Payment`: registration is complete, but an administrator has not confirmed payment
- `Active Member`: an administrator has confirmed that the student paid at the membership desk

Payment is recorded manually by an administrator. Online payment processing is out of scope for the MVP

## 6. Payment Confirmation

When an administrator confirms payment, the system must:

- Change the student's status from `Pending Payment` to `Active Member`
- Store the confirmation date and time
- Store the administrator who confirmed the payment
- Prevent the same payment from being confirmed more than once
- Ask for confirmation before applying the status change
- Show a success or error message after the action

The system should keep payment confirmation details available for review

## 7. Administrator Dashboard

The dashboard should provide:

- Total number of registered students
- Number of active members
- Number of students pending payment
- A searchable student list
- Filters for membership status
- A clear action to confirm payment for pending students

Search should support both student name and university ID

## 8. Security and Privacy

- All administrator pages and management APIs require authentication
- Student registration is public, but student records are private
- Passwords for administrator accounts must be stored using secure password hashing
- Secrets and database credentials must be stored in environment variables
- The API must validate input on the backend
- Errors must not reveal secrets, stack traces, or private student data
- Only the minimum student information needed for membership management should be collected

## 9. MVP Scope

### Included

- Public student registration with full name and university ID
- Duplicate university ID prevention
- Administrator authentication
- Student list, search, and status filtering
- Manual payment confirmation
- Payment confirmation timestamp and administrator audit information
- Basic dashboard counts
- Clear success and validation messages

### Not included in the MVP

- Student accounts or student passwords
- Online payment processing
- Email or SMS verification
- Event attendance tracking
- Membership card or QR code
- Spreadsheet export
- Multiple administrator permission levels

These features may be considered in later tasks after the core workflow is working

## 10. Main Workflows

### Student workflow

1. Open the membership page
2. Enter full name and university ID
3. Submit the form
4. Receive a confirmation that the request was recorded
5. Pay in person at the association desk

### Administrator workflow

1. Sign in to the dashboard
2. Search by student name or university ID
3. Check that the result matches the student
4. Confirm payment after receiving payment at the desk
5. Verify the student's status is now `Active Member`

## 11. Task 1 Completion Criteria

- The user roles and permissions are defined
- Student registration rules are defined
- Duplicate university ID behavior is defined
- Payment confirmation behavior is defined
- The MVP scope is agreed upon
- The requirements are detailed enough to begin database design and API planning
