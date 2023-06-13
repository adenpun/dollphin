import * as path from "https://deno.land/std@0.190.0/path/mod.ts";
import * as fs from "https://deno.land/std@0.190.0/fs/mod.ts";
import { BSON } from "npm:bson@5.3.0";

const __filename = path.fromFileUrl(import.meta.url);
const __dirname = path.dirname(__filename);

interface Config {
    // inMemory: boolean;
    saveDir: string;
}

interface Change {
    path: string;
    data: Uint8Array;
}

export class Dollphin {
    public readonly config: Config;

    private locks: Record<string, boolean> = {};
    private vfs: Record<string, Uint8Array> = {};

    public constructor(config: Config) {
        this.config = config;
    }

    public async writeFile(path: string, data: Uint8Array): Promise<void> {
        this.vfs[path] = data;
    }

    public async writeToDisk() {
        const tmp = await Deno.makeTempFile();
        const tmpFile = await Deno.open(tmp, { write: true });
        await tmpFile.write(BSON.serialize(this.vfs));
        tmpFile.close();
        await fs.ensureDir(this.config.saveDir);
        await Deno.rename(tmp, path.resolve(this.config.saveDir, "save"));
    }
}

if (import.meta.main) {
    console.log("Dollphin Database :)");
    const dollphinInstance = new Dollphin({
        saveDir: "./test/",
    });
    await dollphinInstance.writeFile(
        "/path/to/something",
        new TextEncoder().encode("testing data")
    );
    // dollphinInstance.writeFile("/path/to/something", new TextEncoder().encode("testing data2"));
    await dollphinInstance.writeToDisk();
}
