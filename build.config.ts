import { defineBuildConfig } from "unbuild";
import pkg from "./package.json";

export default defineBuildConfig({
    declaration: true,
    dependencies: Object.keys(pkg.dependencies),
    devDependencies: Object.keys(pkg.devDependencies),
    failOnWarn: false,
});
