const cp = require('child_process');

cp.exec('find . -name "node_modules" -prune -exec rm -rf \'{}\' +');
