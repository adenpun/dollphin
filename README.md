# Dollphin

A super basic database. This package can store some BSON documents.

```typescript
import { Dollphin } from "dollphin";

const database = new Dollphin();

database.createCollection("users");
database.writeDocument("users/1", {
    firstName: "John",
    lastName: "David",
    age: 18,
});
database.writeDocument("users/2", {
    firstName: "David",
    lastName: "Lee",
    age: 52,
});

console.log(database.readDocument("users/1")); // { firstName: 'John', lastName: 'David', age: 18 }
console.log(database.readDocument("users/2")); // { firstName: 'David', lastName: 'Lee', age: 52 }

// Change a field
database.writeDocument(
    "users/2",
    {
        age: 42,
    },
    { merge: true }
);

console.log(database.readDocument("users/2")); // { firstName: 'David', lastName: 'Lee', age: 42 }
```
