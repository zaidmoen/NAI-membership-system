# NAI Membership System — Requirements Specification

**Document status:** MVP requirements draft  
**Project:** NAI Membership System  
**Frontend:** React  
**Backend:** Django  
**Purpose:** Define the first release before database and API design

## 1. Purpose

The NAI Membership System records student requests to join the Najah AI Society and helps authorized association administrators track membership payments collected in person

A student submits a full name, major, university ID, and WhatsApp number through a public form. The record remains pending until an administrator confirms that payment was received at the association desk

This document describes the agreed MVP behavior. It does not prescribe detailed implementation choices such as the database engine, API framework, or deployment platform

## 2. Goals and Non-Goals

### Goals

- Make student membership registration quick and simple
- Prevent duplicate registrations for the same university ID
- Help administrators find students during in-person membership collection
- Show which students are waiting to pay and which are active members
- Keep a record of who confirmed a payment and when

### Non-Goals for the MVP

- Collect online payments
- Create student login accounts
- Verify identity through email or SMS
- Track event attendance
- Issue membership cards or QR codes
- Export reports to spreadsheets
- Manage multiple administrator permission levels

## 3. People and Permissions

### Student

A student can:
- Open the public membership form
- Submit a full name, major, university ID, and WhatsApp number
- Receive confirmation that the request was recorded, or a useful validation message

A student does not need a password or account in the MVP. Students cannot browse, search, or view other student records

### Administrator

An authenticated administrator can:
- Open the management dashboard
- View registered student records
- Search by full name, university ID, or WhatsApp number
- Filter records by membership status
- Confirm that an in-person payment was received
- View the payment confirmation time and the administrator who recorded it

Administrator account creation and credential reset procedures are implementation and operations decisions to define before deployment

## 4. Core Data Requirements

The database design task should support the following information

### Student record

| Information | Requirement |
| --- | --- |
| Student record ID | A unique internal identifier |
| Full name | Required text, trimmed before saving |
| Major | Required text describing the student's field of study |
| University ID | Required text and unique across student records |
| WhatsApp number | Required contact number, stored as text |
| Membership status | One of the statuses defined in Section 6 |
| Registration date and time | Set by the system when the record is created |
| Payment confirmation date and time | Empty until payment is confirmed |
| Confirmed by administrator | Empty until payment is confirmed |

The university ID should be stored as text rather than a number so leading zeroes are preserved. The exact university ID format and length have not yet been confirmed

### Administrator record

The system must identify the administrator who performed a payment confirmation. The administrator account implementation and required profile fields will be decided during technical design

## 5. Functional Requirements

### FR-01 — Public registration form

The system must provide a public form with exactly four required student fields:
- Full name
- Major
- University ID
- WhatsApp number

The MVP form must not ask students for a password, email address, or payment details

### FR-02 — Registration validation

Before creating a record, the system must:
- Reject a missing or whitespace-only full name
- Reject a missing or whitespace-only major
- Reject a missing or whitespace-only university ID
- Reject a missing, whitespace-only, or invalid WhatsApp number
- Trim leading and trailing whitespace from submitted values
- Normalize the WhatsApp number by removing spaces, hyphens, and parentheses
- Reject a university ID that already exists
- Return a clear message that identifies the problem without revealing private student record details

The backend must enforce validation. Frontend validation may improve usability but does not replace backend validation

### FR-03 — Registration result

When the submission is valid and the university ID is new, the system must:
- Create one student record
- Set the initial membership status to `pending_payment`
- Set the registration date and time automatically
- Show a clear success message to the student

If the same university ID is submitted more than once, the system must not create another record

### FR-04 — Administrator authentication

The system must require authentication before an administrator can access student records or management actions

A public student registration request must not grant access to the admin dashboard or its data

### FR-05 — Student list

The dashboard must display registered students with, at minimum:
- Full name
- Major
- University ID
- WhatsApp number
- Membership status
- Registration date
- Payment confirmation date when available
- Available administrator action

The interface must make pending and active records easy to distinguish

### FR-06 — Student search

An administrator must be able to search using:
- A full or partial student name
- A university ID
- A WhatsApp number

The results must show enough information for the administrator to confirm that the correct student was found

### FR-07 — Status filtering

An administrator must be able to display:
- All students
- Students with pending payment
- Active members

The system must show an informative empty state when no records match the selected search or filter

### FR-08 — Confirm in-person payment

For a student with `pending_payment` status, an administrator must be able to record that payment was received in person

When confirmed, the system must:
- Change the status to `active_member`
- Set the payment confirmation date and time
- Record the authenticated administrator who performed the action
- Show a success message and updated status

The system must reject a second confirmation for a student who is already active. If two administrators attempt to confirm the same record at nearly the same time, only one confirmation may be recorded

The confirmation action records the association's manual confirmation. It does not process or verify a bank or online transaction

### FR-09 — Dashboard totals

The dashboard must show:
- Total registered students
- Students pending payment
- Active members

The counts must match the student records shown by the corresponding filters

## 6. Membership Status and State Changes

The MVP has two membership statuses:

| Stored value | Meaning |
| --- | --- |
| `pending_payment` | The student registered, but an administrator has not confirmed payment |
| `active_member` | An administrator confirmed that the student paid in person |

Allowed status change in the normal MVP workflow:

`pending_payment` → `active_member`

A payment reversal or correction workflow is not defined in this MVP. It must be agreed upon before implementing an option to undo a confirmation

## 7. Main User Workflows

### Student registration

1. The student opens the public membership page
2. The student enters a full name, major, university ID, and WhatsApp number
3. The student submits the form
4. The system validates the values and checks for an existing university ID
5. If valid, the system creates a pending record and confirms submission
6. The student pays in person at the association desk

### Administrator payment confirmation

1. The administrator signs in
2. The administrator searches by name, university ID, or WhatsApp number
3. The administrator checks the result against the student at the desk
4. After receiving payment, the administrator confirms it
5. The system records the administrator and confirmation time
6. The student appears as an active member

## 8. Exceptional and Boundary Cases

- **Duplicate registration:** Do not create a second student record. Show a message asking the student to contact the association team
- **Invalid form:** Keep the submitted values where appropriate and identify the missing or invalid field
- **No search result:** Show a clear no-results message
- **Already active:** Do not allow payment confirmation again
- **Unauthenticated admin request:** Deny access to the record or action
- **Concurrent confirmation attempts:** Record one successful status transition only
- **Unexpected server error:** Show a general error message and keep technical details out of the public response

## 9. Non-Functional Requirements

### NFR-01 — Security

- Protect all student list, search, detail, and payment-management operations with administrator authentication
- Enforce authorization in the backend, not only by hiding frontend controls
- Never store administrator passwords in plain text
- Keep credentials, secret keys, and database connection details out of source control
- Avoid exposing student records in public registration responses

### NFR-02 — Data integrity

- Enforce university ID uniqueness at the database level
- Apply payment status changes and confirmation details as one consistent operation
- Store timestamps consistently and display them in the agreed local timezone

### NFR-03 — Usability

- Keep the public form short and understandable
- Make the payment confirmation action clear and require a confirmation step before saving
- Use plain success, validation, and error messages
- Support Arabic right-to-left presentation in the student and administrator interfaces

### NFR-04 — Maintainability

- Keep Django backend responsibilities separate from React interface responsibilities
- Use clear names for models, fields, API operations, and statuses
- Document setup and environment configuration before the system is handed to another developer

## 10. Acceptance Criteria

Task 1 is complete when:
- Student and administrator roles are defined
- Required registration fields and validation behavior are specified
- Duplicate university ID behavior is specified
- Membership statuses and normal status transition are specified
- Payment audit information is specified
- Dashboard search, filtering, and totals are specified
- Security, privacy, and data integrity expectations are documented
- MVP exclusions and unresolved decisions are visible to the team
- The specification is detailed enough to begin database and API design

## 11. Decisions to Confirm Before Implementation

These items are intentionally left open rather than assumed:
1. What exact format and length does the university use for student IDs?
2. What is the membership fee, and does the system need to record its amount or currency?
3. Who creates administrator accounts, and how are forgotten credentials handled?
4. Should an administrator be able to correct an accidental payment confirmation? If yes, should the correction require a reason and be recorded in an audit log?
5. Which database engine and Django API approach will the team use?

## 12. MVP Delivery Boundary

The first usable release is complete when a student can submit a valid registration, an administrator can securely find that student, and the administrator can confirm in-person payment with a recorded time and identity. The student list and dashboard totals must reflect the resulting status correctly
