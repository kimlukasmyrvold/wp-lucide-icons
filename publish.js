const fs = require('fs-extra');
const path = require('path');
const archiver = require('archiver');

fs.readFile(path.join(__dirname, 'wp-lucide-icons.php'), 'utf8', (err, data) => {
    if (err) {
        console.error('Error reading plugin file:', err)
        return
    }

    const versionMatch = data.match(/Version:\s*(\d+\.\d+\.\d+)/)
    if (versionMatch) {
        const version = versionMatch[1];

        fs.ensureDirSync(path.join(__dirname, `releases/v${version}`));
        const output = fs.createWriteStream(path.join(__dirname, `releases/v${version}/wp-lucide-icons.zip`));
        const archive = archiver('zip', {
            zlib: { level: 9 }
        });

        output.on('close', function () {
            console.log(archive.pointer() + ' total bytes');
            console.log('Zip file has been finalized and the output file descriptor has closed.');
        });

        archive.on('error', function (err) {
            throw err;
        });

        archive.pipe(output);

        const foldersToZip = ['css', 'js', 'html'];
        foldersToZip.forEach(folder => {
            archive.directory(folder + '/', folder);
        });


        const filesToZip = ['wp-lucide-icons.php', 'README.md'];
        filesToZip.forEach(file => {
            archive.file(file, { name: path.basename(file) });
        });

        archive.finalize();
    }
    else {
        console.error('Version not found in plugin file.')
    }
});