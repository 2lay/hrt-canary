const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const db = new sqlite3.Database(path.join(__dirname, '../../canary.db'));

// initialize database
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS canary_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        event_type TEXT NOT NULL,
        message TEXT NOT NULL
    )`);
});

// function to clean up old records (older than 1 week)
function cleanupOldRecords() {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    db.run('DELETE FROM canary_history WHERE timestamp < ?',
        oneWeekAgo.toISOString(),
        (err) => {
            if (err) {
                console.error('Error cleaning up old records:', err);
            }
        }
    );
}

// run cleanup daily
setInterval(cleanupOldRecords, 24 * 60 * 60 * 1000);

// add a new event to history
function addHistoryEvent(eventType, message) {
    return new Promise((resolve, reject) => {
        db.run('INSERT INTO canary_history (event_type, message) VALUES (?, ?)',
            [eventType, message],
            (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            }
        );
    });
}

// get history events (most recent first)
function getHistory(limit = 10) {
    return new Promise((resolve, reject) => {
        db.all(`
            SELECT timestamp, event_type, message 
            FROM canary_history 
            ORDER BY timestamp DESC 
            LIMIT ?`,
            [limit],
            (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            }
        );
    });
}

module.exports = {
    addHistoryEvent,
    getHistory
}; 
