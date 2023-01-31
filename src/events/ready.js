module.exports = {
    name: "ready",
    once: true,
    execute(client) {
        console.log('\x1b[34m%s\x1b[0m', '[author] bart435');
        console.log('\x1b[32m%s\x1b[0m', '[discord] connected');
    },
};