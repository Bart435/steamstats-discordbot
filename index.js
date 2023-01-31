// Getting client intents
const { Client, GatewayIntentBits, Partials, Collection } = require("discord.js");
const { Guilds, GuildMembers, GuildMessages, GuildMessageReactions, MessageContent } = GatewayIntentBits;
const { User, Message, GuildMember, ThreadMember } = Partials;

// Creating the client
const client = new Client({
    intents: [Guilds, GuildMembers, GuildMessages, GuildMessageReactions, MessageContent],
    partials: [User, Message, GuildMember, ThreadMember],
});

// requiring the handlers
const { loadCommands } = require("./src/Handlers/commandHandler");
const { loadEvents } = require("./src/Handlers/eventHandler");

// Adding collections to the client
client.commands = new Collection();
client.config = require("./config.json");

// error checks
client.on("error", (err) => console.log(err));
process.on("unhandledRejection", (reason, p) => console.log(reason, p));
process.on("uncaughtException", (err, origin) => console.log(err, origin));
process.on("uncaughtExceptionMonitor", (err, origin) => console.log(err, origin));
process.on("warning", (warn) => console.log(warn));

// Client login and initialize command & events
client.login(client.config.discord_token)
    .then(() => {
        loadCommands(client);
        loadEvents(client);
    }).catch((err) => console.log(err));
