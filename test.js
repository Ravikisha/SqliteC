const { spawn } = require('child_process');

function runScript(commands) {
  return new Promise((resolve, reject) => {
    const process = spawn('./db', [], { stdio: ['pipe', 'pipe', 'pipe'] });
    let rawOutput = '';

    process.stdout.on('data', (data) => {
      rawOutput += data.toString();
    });

    process.stderr.on('data', (data) => {
      console.error(`stderr: ${data}`);
      reject(data.toString());
    });

    process.on('close', (code) => {
      resolve(rawOutput.split('\n').filter(line => line.trim() !== ''));
    });

    commands.forEach(command => {
      process.stdin.write(`${command}\n`);
    });
    process.stdin.end();
  });
}

describe('Database', () => {
  it('inserts and retrieves a row', async () => {
    const result = await runScript([
      'insert 1 user1 person1@example.com',
      'select',
      '.exit'
    ]);

    expect(result).toEqual([
      'db > Executed.',
      'db > (1, user1, person1@example.com)',
      'Executed.',
      'db > '
    ]);
  });
});
