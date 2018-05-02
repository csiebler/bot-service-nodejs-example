var restify = require('restify');
var builder = require('botbuilder');
var botbuilder_azure = require("botbuilder-azure");
require('dotenv').config();

const BOT_STATE_TABLE = process.env.BOT_STATE_TABLE;
const STORAGE_ACCOUNT_CONNECTION = process.env.STORAGE_ACCOUNT_CONNECTION;

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
    console.log('%s listening to %s', server.name, server.url);
});

// Create chat connector for communicating with the Bot Service
var connector = new builder.ChatConnector({
    appId: process.env.MicrosoftAppId,
    appPassword: process.env.MicrosoftAppPassword,
    openIdMetadata: process.env.BotOpenIdMetadata
});

// Listen for messages from users 
server.post('/api/messages', connector.listen());

var azureTableClient = new botbuilder_azure.AzureTableClient(BOT_STATE_TABLE, STORAGE_ACCOUNT_CONNECTION);
var tableStorage = new botbuilder_azure.AzureBotStorage({ gzipData: false }, azureTableClient);

// Create your bot with a function to receive messages from the user
var bot = new builder.UniversalBot(connector);
bot.set('storage', tableStorage);

bot.dialog('/', [
    function (session) {
        session.send("Hello, my name is bot-service-nodejs-example!");
        builder.Prompts.text(session, "What is your name?");        
    },
    function (session, reply) {
        let name = reply.response;
        session.send(`Hello ${name}, nice to meet you!`);
    },
    function (session) {
        // loop forever
        session.replaceDialog('/');
    }
]);