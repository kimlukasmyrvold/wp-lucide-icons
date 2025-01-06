const fs = require('fs');
const path = require('path');
const archiver = require('archiver');
const { sign } = require('node-signpdf');

const output = fs.createWriteStream(path.join(__dirname, 'releases/wp-lucide-icons.zip'));
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
