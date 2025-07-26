const { exec } = require('child_process');
const cron = require('node-cron');
const fs = require('fs');
const path = require('path');
const archiver = require('archiver');
const mongoose = require('mongoose');
const logger = require('../utils/logger');
const env = require('../../sms-server/config/env');

const backupDir = path.join(__dirname, 'backups');
const backupRetentionDays = 7;

if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
}

const performBackup = async () => {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = path.join(backupDir, `st-andrews-sms-backup-${timestamp}.archive`);
    const dumpDir = path.join(backupDir, `dump-${timestamp}`);

    logger.info(`Starting backup process at ${new Date().toLocaleTimeString('en-GB', { timeZone: 'GMT' })}`);

    // Create dump directory
    if (!fs.existsSync(dumpDir)) {
      fs.mkdirSync(dumpDir);
    }

    // Execute mongodump
    const mongodumpCmd = `mongodump --uri="${env.MONGODB_URI}" --out="${dumpDir}"`;
    await new Promise((resolve, reject) => {
      exec(mongodumpCmd, (error, stdout, stderr) => {
        if (error) return reject(error);
        logger.info('Database dump completed', { stdout });
        resolve();
      });
    });

    // Compress the dump
    const output = fs.createWriteStream(backupFile);
    const archive = archiver('zip', { zlib: { level: 9 } });
    output.on('close', () => {
      logger.info(`Backup archived to ${backupFile}, size: ${archive.pointer()} bytes`);
    });
    archive.on('error', (err) => {
      throw err;
    });
    archive.pipe(output);
    archive.directory(dumpDir, false);
    archive.finalize();

    // Clean up old backups
    const files = fs.readdirSync(backupDir).filter(file => file.startsWith('st-andrews-sms-backup-') && file.endsWith('.archive'));
    files.sort((a, b) => {
      return fs.statSync(path.join(backupDir, b)).mtime - fs.statSync(path.join(backupDir, a)).mtime;
    }).slice(backupRetentionDays).forEach(file => {
      fs.unlinkSync(path.join(backupDir, file));
      logger.info(`Deleted old backup: ${file}`);
    });

    // Remove temporary dump directory
    fs.rmSync(dumpDir, { recursive: true, force: true });
  } catch (error) {
    logger.error('Backup process failed', { error: error.message, stack: error.stack });
  }
};

// Schedule daily backup at 2:00 AM GMT
cron.schedule('0 2 * * *', performBackup, { timezone: 'GMT' });

// Manual backup trigger
if (require.main === module) {
  performBackup().then(() => process.exit(0)).catch(() => process.exit(1));
}

module.exports = { performBackup };