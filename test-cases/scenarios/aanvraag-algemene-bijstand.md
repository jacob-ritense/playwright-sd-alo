# Algemene Bijstand Aanvraag Test Scenario

## Overview
This test scenario verifies the basic flow of creating and processing a algemene bijstand application in the GZAC Sociaal Domein system.

## Prerequisites
1. Environment Setup:
   - GZAC Sociaal Domein running on localhost:4200
   - Valid local credentials in .env.properties
   - API configuration properly set up

2. Test Data:
   - Automatically generated using faker.js
   - Last name will be randomly generated for unique identification

## Test Steps

### 1. Create Request
```typescript
// Example code for reference
await createVerzoek(lastName, apiTestRequestFile, apiRequestConfigFile, infra);
```
- System creates a new request via API
- Verify request creation success

### 2. Login and Navigation
```typescript
// Example steps
await login(page);
await navigateToCases(page);
```
- Login with local credentials
- Navigate to "Algemene Bijstand aanvraag" cases section
- Verify successful navigation

### 3. Case Processing
```typescript
// Example steps
await searchForCases(page, lastName);
await openCase(page, lastName);
```
- Navigate to "Alle dossiers"
- Verify case is there and accessible
- Open the case

### 4. 
- Wait for "Opvoeren dienst in Socrates" task
- Click on and complete the "Opvoeren dienst in Socrates" task
