# Email Verification Template

This directory contains email templates for Keycloak email verification.

## Structure

- `txt` - Plain text email content
- `html` - HTML version for preview
- `subject` - Subject line template

## Variables Available

In Keycloak email templates, you have access to:

- `${user.email}` - User's email address
- `${user.firstName}` - User's first name
- `${user.lastName}` - User's last name
- `${link}` - Verification link
- `${linkExpiration}` - Link expiration time
- `${realmName}` - Name of the realm
