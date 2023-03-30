import { BSON } from "bson";
import merge from "deepmerge";
import { mkdirp, readFile, remove, writeFile } from "fs-extra";
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

export class Dollphin {
    public static readonly DEFAULT_OPTIONS: IDollphinOptions = {
        name: "Dollphin",
        storingPath: "./.dollphin/db",
    };

    public options: IDollphinOptions;

    public constructor(p_options?: Partial<IDollphinOptions>) {
        this.options = merge(Dollphin.DEFAULT_OPTIONS, p_options ?? {});
    }

    public createCollection(p_path: string): Promise<void> {
        return new Promise<void>((resolve) => {
            mkdirp(path.resolve(this.options.storingPath, p_path)).then(() => resolve());
        });
    }

    public deleteDocument(p_path: string): Promise<void> {
        return new Promise<void>((resolve) => {
            remove(path.resolve(this.options.storingPath, p_path)).then(() => resolve());
        });
    }

    public deleteCollection(p_path: string): Promise<void> {
        return new Promise<void>((resolve) => {
            remove(path.resolve(this.options.storingPath, p_path)).then(() => resolve());
        });
    }

    public readDocument<T extends BSON.Document>(p_path: string): Promise<T> {
        return new Promise<T>((resolve) => {
            readFile(path.resolve(this.options.storingPath, p_path)).then((data) =>
                resolve(BSON.deserialize(data) as T)
            );
        });
    }

    public async writeDocument<T extends BSON.Document>(
        p_path: string,
        p_data: T,
        p_options?: IWriteDocumentOptions
    ): Promise<void> {
        let data: Uint8Array;

        if (p_options?.merge) data = BSON.serialize(merge(await this.readDocument(p_path), p_data));
        else data = BSON.serialize(p_data);

        return new Promise<void>((resolve) => {
            writeFile(path.resolve(this.options.storingPath, p_path), data).then(() => resolve());
        });
    }
}

export default Dollphin;
