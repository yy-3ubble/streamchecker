const mysqlPromise = require("./mysqlPromise");
const Streaming = require('./streaming')

const main = async () => {
    const startTime = Date.now();
    const result = await mysqlPromise('SELECT * FROM users LEFT JOIN online ON users.id = online.user_id');
    for (let i = 0; i < result.length; i++) {
        const streaming = new Streaming(result[i]);
        if (await streaming.checkState()) {
            if (streaming.started_at) {
                streaming.parse();
                await mysqlPromise(
                    'UPDATE online SET title = ?, viewer_count = ?, live_id = ? WHERE user_id = ?',
                    [streaming.title, streaming.viewer_count, streaming.live_id, streaming.user_id]
                );
            } else {
                await mysqlPromise(
                    'UPDATE users SET finished_at = ? WHERE id = ?',
                    [streaming.finished_at, streaming.user_id]
                );
                streaming.parse();
                await mysqlPromise(
                    'INSERT INTO online (user_id, title, viewer_count, live_id, thumbnail_url, started_at) VALUES (?, ?, ?, ?, ?, ?)',
                    [streaming.user_id, streaming.title, streaming.viewer_count, streaming.live_id, streaming.thumbnail_url, streaming.started_at]
                );
            }
        } else {
            if (streaming.started_at) {
                streaming.end();
                await mysqlPromise(
                    'DELETE FROM online WHERE user_id = ?',
                    [streaming.user_id]
                );
                await mysqlPromise(
                    'UPDATE users SET finished_at = ? WHERE id = ?',
                    [streaming.finished_at, streaming.user_id]                    
                );
            }
        }
    }
    const endTime = Date.now();
    console.log(endTime - startTime);
    setTimeout(main, 180000);
};

main();
