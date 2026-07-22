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