import { Dollphin } from "../dist/index.mjs";

const database = new Dollphin();

(async () => {
    await database.createCollection("users");
    await database.writeDocument("users/1", {
        firstName: "John",
        lastName: "David",
        age: 18,
    });
    await database.writeDocument("users/2", {
        firstName: "David",
        lastName: "Lee",
        age: 52,
    });

    console.log(await database.readDocument("users/1"));
    console.log(await database.readDocument("users/2"));

    // Change a field
    await database.writeDocument(
        "users/2",
        {
            age: 42,
        },
        { merge: true }
    );

    console.log(await database.readDocument("users/2"));
})();
