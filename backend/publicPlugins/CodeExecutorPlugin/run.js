/*
NE SMATRI
YA NE ODETA !
*/

const { execSync } = require('child_process');
const { writeFileSync } = require('fs');

let lang = process.env.LANG;
let code = Buffer.from(process.env.CODE, 'base64').toString().trim();

function exec(cmd) {
    let d = execSync(cmd);
    if (d)
        console.log(d.toString().trim());
}

try {
    switch (lang) {
        case 'js':
            writeFileSync('code.js', code);
            exec('node ./code.js', {
                stdio: ['pipe', 'pipe', 'pipe']
            });
            break;
        case 'c':
            writeFileSync('code.c', code);
            exec('gcc ./code.c', {
                stdio: ['pipe', 'pipe', 'pipe']
            });
            exec('./a.out', {
                stdio: ['pipe', 'pipe', 'pipe']
            });
            break;
        case 'bash':
            writeFileSync('code.sh', code);
            exec('chmod 7777 code.sh', {
                stdio: ['pipe', 'pipe', 'pipe']
            });
            exec('./code.sh', {
                shell: 'bash',
                stdio: ['pipe', 'pipe', 'pipe']
            });
            break;
        case 'cpp':
            writeFileSync('code.cpp', code);
            exec('g++ ./code.cpp', {
                stdio: ['pipe', 'pipe', 'pipe']
            });
            exec('./a.out', {
                stdio: ['pipe', 'pipe', 'pipe']
            });
            break;
        case 'python2':
            writeFileSync('code.py', code);
            exec('python2 ./code.py', {
                stdio: ['pipe', 'pipe', 'pipe']
            });
            break;
        case 'python3':
            writeFileSync('code.py', code);
            exec('python3 ./code.py', {
                stdio: ['pipe', 'pipe', 'pipe']
            });
            break;
        default:
            console.log('Unknown lang!');
    }
}
catch (e) {}
