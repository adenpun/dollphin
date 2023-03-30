import { defineBuildConfig } from "unbuild";

export default defineBuildConfig({
    declaration: true,
    externals: ["bson"],
    failOnWarn: false,
});
