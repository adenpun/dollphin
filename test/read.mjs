import { fileURLToPath } from "url";
import { Dollphin } from "../dist/index.mjs";
import path from "path";

const database = new Dollphin({
    storingPath: path.resolve(path.dirname(fileURLToPath(import.meta.url)), ".dollphin", "db"),
});

console.log(database.readCollection("test").length);
