import { Worker, isMainThread, workerData } from "worker_threads";
import { fileURLToPath } from "url";
import { Dollphin } from "../dist/index.mjs";
import path from "path";

const database = new Dollphin({
    storingPath: path.resolve(path.dirname(fileURLToPath(import.meta.url)), ".dollphin", "db"),
    autoWrite: false,
    fs: "fs",
});

if (isMainThread) {
    database.createCollection("test/");

    // database.updateDatabase();

    let workers = [];

    for (let i = 0; i < 4; i++) {
        let worker = new Worker(fileURLToPath(import.meta.url), {
            workerData: {
                index: i,
            },
        });
        // workers.push(worker);
    }
} else {
    console.log(workerData.index);
    for (let i = workerData.index * 1000; i < workerData.index * 1000 + 1000; i++) {
        database.writeDocument("test/" + i, {
            index: i,
            indexString: i.toString(),
        });
    }
    database.updateDatabase();
}
