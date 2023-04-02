import { BSON, ObjectId } from "bson";
import merge from "deepmerge";
import { Volume } from "memfs";
import { randomUUID } from "node:crypto";
import fs, { existsSync, readFileSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

interface IDollphinOptions {
    /** Name of the database */
    name: string;
    /** Path to data */
    storingPath: string;
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
    };

    public options: IDollphinOptions;
    public fs: InstanceType<typeof Volume>;

    private m_updatingDb: boolean = false;

    public constructor(p_options?: Partial<IDollphinOptions>) {
        this.options = merge(Dollphin.DEFAULT_OPTIONS, p_options ?? {});
        if (existsSync(path.resolve(this.options.storingPath, "0"))) {
            let deserialized = BSON.deserialize(
                readFileSync(path.resolve(this.options.storingPath, "0"))
            );

            Object.keys(deserialized).forEach((k) => {
                deserialized[k] = BSON.serialize(deserialized[k]).toString();
            });

            this.fs = Volume.fromJSON(deserialized);
        } else this.fs = new Volume();
    }

    public createCollection(p_path: string): void {
        this.fs.mkdirSync(path.posix.normalize("/" + p_path), { recursive: true });

        return;
    }

    public deleteDocument(p_path: string): void {
        if (this.fs.statSync(path.posix.normalize("/" + p_path)).isFile())
            this.fs.rmSync(path.posix.normalize("/" + p_path));

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

        return;
    }

    public readCollection(p_path: string): string[] {
        return this.fs.readdirSync(path.posix.normalize("/" + p_path)) as string[];
    }

    public readDocument<T extends BSON.Document>(p_path: string): T {
        return BSON.deserialize(
            this.fs.readFileSync(path.posix.normalize("/" + p_path)) as Uint8Array
        ) as T;
    }

    public writeDocument<T extends BSON.Document>(
        p_path: string,
        p_data: T,
        p_options?: IWriteDocumentOptions
    ): void {
        let data: Uint8Array;

        if (p_options?.merge)
            data = BSON.serialize(
                merge(this.readDocument(p_path), { ...p_data, _id: new ObjectId() })
            );
        else data = BSON.serialize({ ...p_data, _id: new ObjectId() });
        this.fs.writeFileSync(path.posix.normalize("/" + p_path), data, {
            encoding: "buffer",
        });

        return;
    }

    public toJSON(): Record<string, any> {
        let json: Record<string, any> = this.fs.toJSON();

        Object.keys(json).forEach((k) => {
            json[k] = this.readDocument(k);
        });

        return json;
    }

    public toBSON(): BSON.Document {
        return BSON.serialize(this.toJSON());
    }

    public updateDatabase(): void {
        let json = this.toJSON();

        console.log(BSON.calculateObjectSize(json));

        mkdir(path.resolve(this.options.storingPath), {
            recursive: true,
        }).then(() => {
            writeFile(path.resolve(this.options.storingPath, "0"), BSON.serialize(json));
        });

        return;
    }
}
