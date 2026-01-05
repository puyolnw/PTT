const fs = require('fs');
const content = fs.readFileSync('lint_output_check.txt', 'utf8');
const lines = content.split('\n');

const fileCounts = {};
let currentFile = '';

lines.forEach(line => {
    // Check if line looks like a file path (absolute or relative)
    if (line.match(/^[a-zA-Z]:\\/) || line.match(/^src\//)) {
        currentFile = line.trim();
        if (!fileCounts[currentFile]) {
            fileCounts[currentFile] = 0;
        }
    } else if (line.includes('warning') && line.includes('jsx-a11y/label-has-associated-control')) {
        if (currentFile) {
            fileCounts[currentFile]++;
        }
    }
});

const sortedFiles = Object.entries(fileCounts)
    .sort(([, a], [, b]) => b - a)
    .filter(([, count]) => count > 0);

console.log("Top file with most warnings:");
if (sortedFiles.length > 0) {
    const [file, count] = sortedFiles[0];
    console.log(`${file}: ${count}`);

    console.log("\nTop 15:");
    sortedFiles.slice(0, 15).forEach(([f, c]) => console.log(`${f}: ${c}`));
} else {
    console.log("No matching warnings found.");
}
