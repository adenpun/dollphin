import { BSON } from "bson";
import merge from "deepmerge";
import { Volume } from "memfs";
import fs, { existsSync, readFileSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

interface IDollphinOptions {
    /** Name of the database */
    name: string;
    /** Path to data */
    storingPath: string;
    fs?: "fs" | "vfs" | "both";
    autoWrite?: boolean;
}

interface IWriteDocumentOptions {
    merge?: boolean;
}

interface IDeleteCollectionOptions {
    force?: boolean;
}

export class Dollphin {
    public static readonly DEFAULT_OPTIONS: IDollphinOptions = {
        name: "Dollphin",
        storingPath: "./.dollphin/db",
        fs: "both",
        autoWrite: true,
    };

    public options: IDollphinOptions;
    public fs: typeof fs;

    private m_updatingDb: boolean = false;

    public constructor(p_options?: Partial<IDollphinOptions>) {
        this.options = merge(Dollphin.DEFAULT_OPTIONS, p_options ?? {});
        if (this.options.fs === "fs") this.fs = fs;
        else if (existsSync(path.resolve(this.options.storingPath, "0")))
            this.fs = Volume.fromJSON(
                BSON.deserialize(readFileSync(path.resolve(this.options.storingPath, "0")))
            ) as any;
        else this.fs = new Volume() as any;
    }

    public createCollection(p_path: string): void {
        this.fs.mkdirSync(path.posix.normalize("/" + p_path), { recursive: true });

        if (this.options.autoWrite) this.updateDatabase();
        return;
    }

    public deleteDocument(p_path: string): void {
        if (this.fs.statSync(path.posix.normalize("/" + p_path)).isFile())
            this.fs.rmSync(path.posix.normalize("/" + p_path));

        if (this.options.autoWrite) this.updateDatabase();
        return;
    }

    public deleteCollection(p_path: string, options?: IDeleteCollectionOptions): void {
        if (this.fs.statSync(path.posix.normalize("/" + p_path)).isDirectory())
            throw new Error("The path isn't a collection!");
        else if (
            options?.force !== true &&
            this.fs.readdirSync(path.posix.normalize("/" + p_path)).length === 0
        )
            throw new Error("Collection isn't empty, try setting options.force to true!");
        else
            this.fs.rmSync(path.posix.normalize("/" + p_path), {
                recursive: true,
                force: true,
            });

        if (this.options.autoWrite) this.updateDatabase();
        return;
    }

    public readCollection(p_path: string): string[] {
        return this.fs.readdirSync(path.posix.normalize("/" + p_path));
    }

    public readDocument<T extends BSON.Document>(p_path: string): T {
        return BSON.deserialize(
            Buffer.from(this.fs.readFileSync(path.posix.normalize("/" + p_path)))
        ) as T;
    }

    public writeDocument<T extends BSON.Document>(
        p_path: string,
        p_data: T,
        p_options?: IWriteDocumentOptions
    ): void {
        let data: Uint8Array;

        if (p_options?.merge) data = BSON.serialize(merge(this.readDocument(p_path), p_data));
        else data = BSON.serialize(p_data);
        this.fs.writeFileSync(path.posix.normalize("/" + p_path), data);

        if (this.options.autoWrite) this.updateDatabase();
        return;
    }

    public updateDatabase(): void {
        if (this.m_updatingDb === true) throw new Error("Database is currently being updated.");
        if (this.options.fs === "vfs" || this.options.fs === "both") {
            this.m_updatingDb = true;
            // if () throw new Error("Database is currently being updated.");
            fs.accessSync(path.resolve(this.options.storingPath));
            mkdir(path.resolve(this.options.storingPath), {
                recursive: true,
            }).then(() => {
                writeFile(
                    path.resolve(this.options.storingPath, "0"),
                    BSON.serialize((this.fs as any).toJSON())
                ).then(() => {
                    this.m_updatingDb = false;
                });
            });
        }

        return;
    }
}
