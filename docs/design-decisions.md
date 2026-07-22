This document records architectural and design decisions made during the project's development.
The goal is to document why certain solutions were chosen, making future maintenance and refactoring easier.

○ Design decision format: every design decision starts with ○, followed by a description of the decision. After that, there *may* be a "Reasons:" label, followed by bullet points explaining why that decision exists.

Reasons:
- Make scanning easier.

○ Design decisions of the design decision's files (files on the 'docs' folder) are first on this document. 

Reasons:
- These decisions shape this file, which means knowing them makes reading it easier.

○ Diagrams are stored in editable format. Every diagram has a '.drawio' source file.

Reasons:
- Keeping editable sources simplifies long-term maintenance.

○ The data model is designed for multiple users even though the current implementation supports only one board.

Reasons:
- Expanding to multiple users should not require redesigning the data model.
- Development can focus on one feature at a time while preserving future compatibility.

○ API endpoints modify the smallest possible resource (Boards manage board properties, Columns manage column properties, Tasks manage task properties and Child collections are modified through their own endpoints).

Reasons:
- This reduces unnecessary data transfer and keeps the API predictable.

○ Core architecture is prioritized over secondary features.

Reasons:
- Infrastructure improvements benefit every future feature.
- Backend, persistence and deployment are prerequisites for many planned features.

○ Drag operations start only from the drag handle

Reasons
- Prevent accidental drags while editing task contents.
- Allow text selection inside cards.
- Keep buttons clickable without starting a drag operation.
- Improve touch interaction by reducing unintended drags.

○ Drag-and-drop uses dedicated collision zones instead of pointer calculations.

Reasons
- Dedicated top and bottom droppable zones provide deterministic collision detection.
- The implementation is simpler than continuously computing pointer position.
- Utilizing dnd-kit's built-in function provides better maintenance.

○ Local persistence is independent from server persistence. LocalStorage acts as an autosave system, while Backend acts as the synchronized version of the board. If both versions differ, the user can choose which version to restore.

Reasons:
- This protects work against browser crashes or temporary network failures.

○All entities use UUIDs instead of incremental integers.

Reason:
- Avoid collisions.
- Prepare the project for multi-user support.
- Keep identifiers stable even after reordering.

○Columns and Tasks store an explicit `index` field.

Reason:
- Arrays represent storage, while `index` represents visual order.
- This simplifies synchronization with databases and future collaborative editing.

○Collections are modified through resource endpoints whenever possible. (Example: 'POST /columns' instead of 'PUT /board')
Reason:
- Sending only the modified resource reduces unnecessary data transfer and keeps the API closer to REST conventions.

○The current implementation intentionally supports a single board. The data model already supports multiple boards, but the feature is postponed to keep the initial backend simple.

○LocalStorage is considered a temporary persistence layer. The frontend should not depend on it once the backend becomes the primary source of truth.

○The drag-and-drop system uses pointer collision instead of rectangle intersection.

Reason:
- Users expect the mouse position—not the center of the dragged card—to determine insertion.

○Indexes are recomputed after structural operations instead of maintaining sparse indexes.

Reason:
- Predictable ordering.
- Simpler synchronization.