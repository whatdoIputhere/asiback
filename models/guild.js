const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const guildSchema = new Schema({
    guildID: {
        type: String,
        required: true
    },
    authors: {
        type: Array,
        required: false,
    },
    storeMessagesEnabled: {
        type: Boolean,
        required: false,
        default: false
    },
})

module.exports = mongoose.model("guild", guildSchema, "guild")