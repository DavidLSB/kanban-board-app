Application Architecture

![Application Architecture](./diagrams/Application%20Architecture.png)

Data Model

![Data Model](./diagrams/Data%20Model.png)

○Task's properties:
•id
•title
•description
•index

○Column's properties:
•id
•title
•index
•tasks[]

○Board's properties:
•id
•title
•columns[]

○User's properties:
•id
•username
•passwordHash
•boards[]
•createdAt
•updatedAt

## Collection Resources

Besides the main entities, the API exposes two collection resources.

These resources represent the complete collection of child entities. They cannot be created or deleted directly because their lifecycle depends on their parent resource.

### Column Collection

Represents every column belonging to a board.

Properties:
- color: Default color applied to every column in the board.

If an individual column defines its own color, it overrides the collection color.

### Task Collection

Represents every task belonging to a column.

Properties:
- color: Default color applied to every task in the column.

If an individual task defines its own color, it overrides the collection color.