# **App Name**: CheckMapper

## Core Features:

- Check Review Queue: Display a table listing all documents from the checks collection, with columns for Sender Name, Status, Mapped To, and Confidence. Clicking a row navigates to the Check Detail View.
- Check Detail View: Display all data for a single check, including senderName, status, mappedTenant, suggestionReason (if isSuggestion is true), and mappingConfidence. Allows users to update the check's status and mapping.
- Tenant Management: Display a table of all tenants. Includes functionality to add, edit, and delete tenants.
- Internal Mappings Management: Display a table of all internal mappings. Includes functionality to add, edit, and delete mappings.
- Suggested Mapping Reasoning: When 'isSuggestion' is true, prominently display the 'suggestionReason' and 'mappingConfidence' score from the checks collection.

## Style Guidelines:

- Primary color: Dark emerald green (#006A4D), evoking professionalism and trust.
- Background color: Desaturated emerald green (#E0F7F0), a light backdrop that maintains a connection with the brand identity.
- Accent color: Lime green (#69BE28) to highlight important actions.
- Font pairing: 'Inter' (sans-serif) for both headlines and body, providing a modern, neutral and machined feel.
- Use simple, clear icons for actions such as editing, deleting, and adding entries.
- Use a clean, tabular layout for displaying lists of checks, tenants and mappings, ensuring data is easily scannable.
- Subtle transitions when updating data or navigating between views to give the app a polished feel.