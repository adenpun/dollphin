import { BSON } from "bson";
import merge from "deepmerge";
import { Volume } from "memfs";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
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

    private m_volume: InstanceType<typeof Volume>;

    public constructor(p_options?: Partial<IDollphinOptions>) {
        this.options = merge(Dollphin.DEFAULT_OPTIONS, p_options ?? {});
        if (existsSync(path.resolve(this.options.storingPath, "00")))
            this.m_volume = Volume.fromJSON(
                BSON.deserialize(readFileSync(path.resolve(this.options.storingPath, "00")))
            );
        else this.m_volume = new Volume();
    }

    public createCollection(p_path: string): void {
        this.m_volume.mkdirpSync(path.posix.normalize("/" + p_path));

        this.m_updateDatabase();
        return;
    }

    public deleteDocument(p_path: string): void {
        if (this.m_volume.statSync(path.posix.normalize("/" + p_path)).isFile())
            this.m_volume.rmSync(path.posix.normalize("/" + p_path));

        this.m_updateDatabase();
        return;
    }

    public deleteCollection(p_path: string, options?: IDeleteCollectionOptions): void {
        if (this.m_volume.statSync(path.posix.normalize("/" + p_path)).isDirectory())
            throw new Error("The path isn't a collection!");
        else if (
            options?.force !== true &&
            this.m_volume.readdirSync(path.posix.normalize("/" + p_path)).length === 0
        )
            throw new Error("Collection isn't empty, try setting options.force to true!");
        else
            this.m_volume.rmSync(path.posix.normalize("/" + p_path), {
                recursive: true,
                force: true,
            });

        this.m_updateDatabase();
        return;
    }

    public readDocument<T extends BSON.Document>(p_path: string): T {
        return BSON.deserialize(
            Buffer.from(this.m_volume.readFileSync(path.posix.normalize("/" + p_path)))
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
        this.m_volume.writeFileSync(path.posix.normalize("/" + p_path), data);

        this.m_updateDatabase();
        return;
    }

    private m_updateDatabase() {
        mkdirSync(path.resolve(this.options.storingPath), {
            recursive: true,
        });
        writeFileSync(
            path.resolve(this.options.storingPath, "00"),
            BSON.serialize(this.m_volume.toJSON())
        );

        return;
    }
}
