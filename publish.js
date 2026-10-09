const fs = require("fs-extra");
const path = require("path");
const archiver = require("archiver");

fs.readFile(path.join(__dirname, process.argv[2]), "utf8", (err, data) => {
    if (err) {
        console.error("Error reading plugin file:", err);
        return;
    }

    const filename = process.argv[2].split(".")[0];
    const versionMatch = data.match(
        /Version:\s*(\d+\.\d+\.\d+(?:-[a-zA-Z0-9]+(?:\.[a-zA-Z0-9]+)*)?)/,
    );
    if (versionMatch && filename) {
        const version = versionMatch[1];

        fs.ensureDirSync(path.join(__dirname, `releases/v${version}`));
        const output = fs.createWriteStream(
            path.join(__dirname, `releases/v${version}/${filename}.zip`),
        );
        const archive = archiver("zip", {
            zlib: { level: 9 },
        });

        output.on("close", function () {
            console.log(archive.pointer() + " total bytes");
            console.log(
                "Zip file has been finalized and the output file descriptor has closed.",
            );
        });

        archive.on("error", function (err) {
            throw err;
        });

        archive.pipe(output);

        const foldersToZip = [
            "src/assets/css",
            "src/assets/js",
            "src/includes",
            "src/languages",
            "src/templates",
            "build",
            "vendor",
        ];
        foldersToZip.forEach((folder) => {
            archive.directory(folder + "/", folder);
        });

        const filesToZip = [process.argv[2], "bootstrap.php", "uninstall.php"];
        filesToZip.forEach((file) => {
            archive.file(file, { name: file });
        });

        archive.finalize();
    } else {
        console.error("Version or filename not found.");
    }
});
