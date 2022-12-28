var express = require('express');
const guild = require("../models/guild");
var router = express.Router();

router.get('/:guildID', (req, res) => {
    guild.find({ guildID: req.params.guildID }).then(result => {
        if (result != null) {
            res.status(200).send(result);
        }
        else {
            res.status(400).send('guild not found');
        }
    });
});

// initial check when bot starts, creates guilds that are not in the database and deletes guilds that the bot is not in
router.post('/check/', (req, res) => {
    if (req.body != null) {
        guild.find()
            .then((guildsList) => {
                let guildsListIds = [];
                guildsList.forEach(guild => {
                    guildsListIds.push(guild.guildID);
                });

                const guildsToCreate = req.body.filter(x => !guildsListIds.includes(x));
                const guildsToDelete = guildsListIds.filter(x => !req.body.includes(x));

                guildsToCreate.forEach(guildId => {
                    guild.create({ guildID: guildId, messages: [], storeMessagesEnabled: false }).then(() => { console.log(`${guildId} created`); }).catch(err => console.log(err));
                });
                guildsToDelete.forEach(guildId => {
                    guild.deleteOne({ guildID: guildId }).then(() => { console.log(`${guildId} deleted`); }).catch(err => console.log(err))
                });

                const finalGuildsList = guildsList.concat(guildsToCreate).filter(x => !guildsToDelete.includes(x));
                res.status(200).send(finalGuildsList);
            })
            .catch(err => {
                console.log(err);
                res.status(400).send('error finding guilds');
            });
    }
    else {
        res.status(400).send('empty body');
    }
});

// store messages in database if storeMessagesEnabled is true
router.post('/storemessages/:guildId', (req, res) => {
    var query = { guildID: req.params.guildId };
    if (req.body != null) {
        guild.find(query)
            .then((result) => {
                let foundGuild = result[0];
                let authorExists;

                req.body.forEach(messageAuthor => {
                    authorExists = false;
                    messageAuthor.author.messages.reverse();
                    foundGuild.authors.forEach(authorObject => {
                        let author = authorObject.author;
                        if (author.id == messageAuthor.author.id) {
                            authorExists = true;
                            messageAuthor.author.messages.forEach(msg => {
                                author.messages.push(msg);
                            });
                        }
                    });
                    if (!authorExists) {
                        foundGuild.authors.push(messageAuthor)
                    }
                });
                foundGuild.markModified('authors');
                foundGuild.save();
                res.status(200).send('messages stored for guild' + req.params.guildId);
            })
            .catch(err => {
                console.log(err);
                res.status(400).send('error finding ' + req.params.guildId);
            });
    }
    else {
        res.status(400).send('empty body')
    }
});

// create guild when bot joins a new guild
router.post('/createguild/:guildId', (req, res) => {
    if (req.body != null) {
        guild.create({
            guildID: req.params.guildId,
            messages: [],
            storeMessagesEnabled: false
        }).then(() => {
            res.status(200).send(`Bot joined ${req.params.guildId}, guild added to db`);
        }).catch(err => {
            console.log(err);
            res.status(400).send(`Bot joined ${req.params.guildId}, but couldn't add guild to db`);
        });
    }
});

// enable/disable store messages
router.put('/updatestoremessagesenabled/:guildId', (req, res) => {
    var query = { guildID: req.params.guildId };
    guild.findOne(query).then((result) => {
        result.storeMessagesEnabled = !result.storeMessagesEnabled;
        result.save();
        res.status(200).send(`storeMessagesEnabled for ${req.params.guildId} updated to ${result.storeMessagesEnabled}`);
    }).catch(err => {
        console.log(err);
        res.status(400).send(`storeMessagesEnabled for ${req.params.guildId} couldn't be updated`);
    });
});

// delete guild by guildID
router.delete('/deleteguild/:guildId', (req, res) => {
    var query = { guildID: req.params.guildId };

    guild.deleteOne(query)
        .then(() => {
            res.status(200).send(`bot kicked from ${req.params.guildId} so it was deleted`);
        })
        .catch(err => {
            res.status(400).send(`bot kicked from ${req.params.guildId} but couldn't be deleted`);
            console.log(err)
        });
});


router.put('/deletemessages/:guildId', (req, res) => {
    var query = { guildID: req.params.guildId };
    guild.updateOne(query, { authors: [] })
        .then(() => {
            res.status(200).send(`all messages from ${req.params.guildId} deleted`);
        })
        .catch(err => {
            console.log(err);
            res.status(200).send(`couldn't delete messages from, ${req.params.guildId}`);
        });
});

module.exports = router;
