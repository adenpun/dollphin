import { fileURLToPath } from "url";
import { Dollphin } from "../dist/index.mjs";
import path from "path";

const database = new Dollphin({
    storingPath: path.resolve(path.dirname(fileURLToPath(import.meta.url)), ".dollphin", "db"),
});

try {
    console.log(database.readDocument("users/1"));
} catch {}

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

console.log(database.readDocument("users/1"));
console.log(database.readDocument("users/2"));

database.writeDocument(
    "users/2",
    {
        age: 42,
    },
    { merge: true }
);

console.log(database.readDocument("users/2"));
