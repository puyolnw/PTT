const fs = require('fs');
const path = require('path');

// อ่าน package.json
const pkgPath = path.join(__dirname, '../package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));

// เพิ่ม version 0.01
const currentVersion = parseFloat(pkg.version);
const newVersion = (currentVersion + 0.01).toFixed(2);

// อัปเดต version
pkg.version = newVersion;

// เขียนกลับไฟล์ package.json
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');

// แสดงผล
console.log(`\n✅ Version bumped: ${currentVersion} → ${newVersion}\n`);

// สร้างหรืออัปเดตไฟล์ version.json (สำหรับเก็บข้อมูลเพิ่มเติม)
const versionInfoPath = path.join(__dirname, '../public/version.json');
const versionInfo = {
  version: newVersion,
  lastUpdate: new Date().toISOString(),
  buildTime: new Date().toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' })
};

fs.writeFileSync(versionInfoPath, JSON.stringify(versionInfo, null, 2) + '\n');

process.exit(0);

