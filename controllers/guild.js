var express = require('express');
const guild = require("../models/guild");
var router = express.Router();

router.get('/:guildID', (req, res) => {
    guild.find({ guildID: req.params.guildID }).then(result => {
        if (result != null) {
            res.status(200).send(result);
        }
        else {
            guild.create({ guildID: req.params.guildID, messages: [] })
                .then(() => {
                    res.status(200).send("Guild not found and created")
                })
                .catch((err) => {
                    console.log(err)
                    res.status(400).send("Guild not found and could not be created")
                })

        }
    })
});

router.post('/:guildId', (req, res) => {
    var query = { guildId: req.params.guildId };

    if (req.body != null) {
        guild.find(query).then((result) => {
            if (result.length > 0) {
                saveMessages(result, req, res);
            }
            else {
                guild.create({
                    guildID: req.params.guildId,
                    authors: []
                })
                    .then((createdGuild) => {
                        saveMessages([createdGuild], req, res);
                    })
                    .catch((err) => {
                        console.log(err)
                        res.status(400).send("Guild not found and could not be created")
                    })
            }
        });
    }
    else {
        res.status(400).send("Body sem valores")
    }
});

function saveMessages(result, req, res) {
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
    res.status(200).send('Saved with success');
}


router.put('/deletemessages/:guildId', (req, res) => {
    var query = { guildId: req.params.guildId };
    console.log(req.params);
    guild.updateOne(query, { authors: [] }).then((guild) => {
        console.log(guild);
        res.status(200).send("Mensagens removidas com sucesso");
    });

});

module.exports = router;
