import deepmerge from "deepmerge";
import { BSON } from "BSON";
import { Worker, isMainThread, workerData, parentPort } from "worker_threads";
import { fileURLToPath } from "url";
import { Dollphin } from "../dist/index.mjs";
import path from "path";
import { writeFileSync } from "fs";

const database = new Dollphin({
    storingPath: path.resolve(path.dirname(fileURLToPath(import.meta.url)), ".dollphin", "db"),
});

database.createCollection("extreme");

for (let i = 0; i < 1000; i++) {
    database.writeDocument(`extreme/${Math.random() + i}`, {
        data: Math.random().toString(),
        number: i,
    });
}

database.updateDatabase();
