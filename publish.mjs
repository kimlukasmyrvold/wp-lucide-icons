/**
 * Usage: Call this script with pluginSlug as argument, example: `node publish.mjs plugin-name`
 * Version: 2.2.0-custom
 * Changelog:
 *  1.0.0: initial
 *  2.0.0: Now outputs as /releases/{pluginSlug}-{version}.zip, with pluginSlug as root folder inside zip. Instead of /releases/{version}/{pluginSlug}.zip, with all files directly inside
 *  2.1.0: Ignore files matched by ignoreRules (gitignore patterns). *~ skips editor backups. pathsToZip is one include list of files and folders. The main plugin file is prepended before zipping.
 *  2.2.0-custom: Also writes {pluginSlug}-lite-{version}.zip. The lite zip omits bundled icon files and defines WP_ICONS__LITE.
 */

import fs from "fs-extra";
import path from "path";
import { ZipArchive } from "archiver";
import ignore from "ignore";

const rootDir = import.meta.dirname;
const pluginSlug = process.argv[2] ? process.argv[2].split(".")[0] : "";

const ignoreRules = ["src/languages/*~"];

const liteIgnoreRules = [
    ...ignoreRules,
    "src/includes/Icons/Catalogs/**/*.php",
    "!src/includes/Icons/Catalogs/**/index.php",
];

const pathsToZip = [
    "src/assets/css",
    "src/assets/js",
    "src/includes",
    "src/languages",
    "src/templates",
    "build",
    "vendor",
    "config",
    "licenses",
    "bootstrap.php",
    "uninstall.php",
    "src/functions.php",
    "readme.txt",
    "LICENSE",
];

function assertLiteIgnore(ignored) {
    const samples = [
        ["src/includes/Icons/Catalogs/lucide/default.php", true],
        ["src/includes/Icons/Catalogs/lucide/index.php", false],
        ["src/includes/Icons/Catalogs/phosphor/regular.php", true],
        ["src/includes/Icons/Catalogs/phosphor/index.php", false],
        ["src/includes/Icons/Cdn/CdnCatalog.php", false],
        ["src/languages/wpicons-en_US.l10n.php", false],
    ];

    for (const [file, shouldIgnore] of samples) {
        if (ignored.ignores(file) !== shouldIgnore) {
            throw new Error(`Lite ignore mismatch for ${file}`);
        }
    }
}

function litePluginSource(source) {
    const nameFrom = "Plugin Name:         WP Icons\n";
    const nameTo = "Plugin Name:         WP Icons Lite\n";
    const descriptionFrom =
        "Description:         Adds icon elements to place on pages, uses icons from Lucide Icons, Material Icons and other various icon libraries. Integrates with some WordPress themes like Flatsome.";
    const descriptionTo =
        "Description:         Adds icon elements to place on pages. Icons are downloaded from npm and cached on this site. Integrates with some WordPress themes like Flatsome.";
    const defineFrom = "define('WP_ICONS__URL', plugin_dir_url(__FILE__));\n";
    const defineTo =
        "define('WP_ICONS__URL', plugin_dir_url(__FILE__));\ndefine('WP_ICONS__LITE', true);\n";

    if (
        !source.includes(nameFrom) ||
        !source.includes(descriptionFrom) ||
        !source.includes(defineFrom)
    ) {
        throw new Error(
            "Could not patch the lite plugin file. The main plugin header changed.",
        );
    }

    return source
        .replace(nameFrom, nameTo)
        .replace(descriptionFrom, descriptionTo)
        .replace(defineFrom, defineTo);
}

function writeZip({ filepath, pluginContents, rules }) {
    const ignored = ignore().add(rules);

    return new Promise((resolve, reject) => {
        const output = fs.createWriteStream(path.join(rootDir, filepath));
        const archive = new ZipArchive({ zlib: { level: 9 } });

        const fail = (err) => {
            reject(err);
        };

        output.on("close", () => {
            console.log(archive.pointer() + " total bytes");
            console.log(`Zip file done, outputted to: ${filepath}`);
            resolve();
        });
        output.on("error", fail);
        archive.on("error", fail);
        archive.pipe(output);

        const root = `${pluginSlug}/`;
        const accept = (folder) => (entry) => {
            let relative = path.posix.join(folder, entry.name.replace(/\\/g, "/"));
            if (entry.stats && entry.stats.isDirectory()) {
                relative += "/";
            }
            return ignored.ignores(relative) ? false : entry;
        };

        if (pluginContents != null) {
            archive.append(pluginContents, { name: `${root}${pluginSlug}.php` });
        } else {
            archive.file(`${pluginSlug}.php`, { name: `${root}${pluginSlug}.php` });
        }

        for (const entry of pathsToZip) {
            if (ignored.ignores(entry)) {
                continue;
            }
            const isDirectory = fs.statSync(path.join(rootDir, entry)).isDirectory();
            if (isDirectory) {
                archive.directory(`${entry}/`, `${root}${entry}`, accept(entry));
                continue;
            }
            archive.file(entry, { name: `${root}${entry}` });
        }

        archive.finalize();
    });
}

const pluginPath = path.join(rootDir, `${pluginSlug}.php`);
const source = fs.readFileSync(pluginPath, "utf8");
const versionMatch = source.match(
    /Version:\s*(\d+\.\d+\.\d+(?:-[a-zA-Z0-9]+(?:\.[a-zA-Z0-9]+)*)?)/,
);

if (!pluginSlug || !versionMatch) {
    throw new Error("Version or filename not found.");
}

assertLiteIgnore(ignore().add(liteIgnoreRules));

const version = versionMatch[1];
const folder = "releases";
fs.ensureDirSync(path.join(rootDir, folder));

await writeZip({
    filepath: `${folder}/${pluginSlug}-${version}.zip`,
    pluginContents: null,
    rules: ignoreRules,
});

await writeZip({
    filepath: `${folder}/${pluginSlug}-lite-${version}.zip`,
    pluginContents: litePluginSource(source),
    rules: liteIgnoreRules,
});
