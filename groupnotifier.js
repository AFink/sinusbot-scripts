registerPlugin({
    name: 'Groupnotifier',
    version: '1.0.0',
    description: 'Notifies an user if he receives or gets a role removed.',
    author: 'Andreas Fink <andreas@andreasfink.xyz>',
    backends: ['ts3', 'discord'],
    requiredModules: [],
    vars: [{
        name: 'text',
        title: 'Variables usable in Messages: %clientname% = name of the changed user; %rolename% name of the added/removed role.',
    }, {
        type: "array",
        name: 'groups',
        title: "ServerGroupConfig",
        vars: [{
                name: 'servergroup',
                title: 'Servergroup',
                type: 'number'
            }, {
                name: 'addMessageType',
                title: 'Add-Message-Type',
                type: 'select',
                options: ['off', 'chat', 'poke']
            }, {
                name: 'addMessageText',
                title: 'Add-Message-Text',
                type: 'multiline',
                conditions: [{
                    field: 'addMessageType',
                    value: 1
                }],
            }, {
                name: 'addMessageText',
                title: 'Add-Message-Text',
                type: 'string',
                conditions: [{
                    field: 'addMessageType',
                    value: 2
                }],
            }, {
                name: 'removeMessageType',
                title: 'Remove-Message-Type',
                type: 'select',
                options: ['off', 'chat', 'poke']
            }, {
                name: 'removeMessageText',
                title: 'Remove-Message-Text',
                type: 'multiline',
                conditions: [{
                    field: 'removeMessageType',
                    value: 1
                }],
            }, {
                name: 'removeMessageText',
                title: 'Remove-Message-Text',
                type: 'multiline',
                conditions: [{
                    field: 'removeMessageType',
                    value: 2
                }],
            }, {
                name: 'whiteBlackListOption',
                title: 'Choose the type of the following list',
                type: 'select',
                options: ["no white/blacklist", "whitelist", "blacklist"],
                placeholder: 'false',
                default: "no white/blacklist"
            },
            {
                type: "array",
                name: 'whiteBlackList',
                title: "Group IDs to whitelist",
                default: [],
                conditions: [{
                    field: 'whiteBlackListOption',
                    value: 1
                }],
                vars: [{
                    name: 'id',
                    title: 'Enter Group ID',
                    type: 'number',
                    placeholder: '0'

                }]
            },
            {
                type: "array",
                name: 'whiteBlackList',
                title: "Group IDs to blacklist",
                default: [],
                conditions: [{
                    field: 'whiteBlackListOption',
                    value: 2
                }],
                vars: [{
                    name: 'id',
                    title: 'Enter Group ID',
                    type: 'number',
                    placeholder: '0'

                }]
            },
        ]
    }, ]
}, (_, config) => {
    const engine = require('engine');
    const backend = require('backend');
    const event = require('event');

    engine.log("Sinusbot Group Notifier loaded.");


    function parseVariables(event, type, msg) {
        let text = msg;
        text = text.replace('%clientname%', event.client.name());
        text = text.replace('%rolename%', event.serverGroup.name());
        return text;
    }


    function sendMessage(event, type, conf) {
        let msg = "";
        switch (type) {
            case "add":
                msg = parseVariables(event, type, conf.addMessageText);
                switch (conf.addMessageType) {
                    case "1":
                        event.client.chat(msg);
                        break;
                    case "2":
                        event.client.chat(msg);
                        break;
                    default:
                        break;
                }
                break;
            case "remove":
                msg = parseVariables(event, type, conf.removeMessageText);
                switch (conf.removeMessageType) {
                    case "1":
                        event.client.chat(msg);
                        break;
                    case "2":
                        event.client.poke(msg);
                        break;
                    default:
                        break;
                }
                break;
            default:
                break;
        }
    }

    function handleEvent(event, type) {
        let conf = config.groups.find(x => x.servergroup == event.serverGroup.id());
        if (conf) {
            if (conf.whiteBlackListOption) {
                if (conf.whiteBlackList) {
                    var found = event.client.getServerGroups().some(function (g) {
                        var found = false;
                        for (var i = 0; i < conf.whiteBlackList.length; i++) {
                            if (conf.whiteBlackList[i].id == g.id()) {
                                found = true;
                                break;
                            }
                        }
                        return found;
                    });
                    if (conf.whiteBlackListOption == 1 && !found) {
                        return console.log(`not sending message to ${event.client.name()} because of whitelist`);
                    }
                    if (conf.whiteBlackListOption == 2 && found) {
                        return console.log(`not sending message to ${event.client.name()} because of blacklist`);
                    }
                }
            }
            sendMessage(event, type, conf);
        }
    }

    function init() {
        event.on('serverGroupAdded', (event) => handleEvent(event, 'add'));
        event.on('serverGroupRemoved', (event) => handleEvent(event, 'remove'));
    }

    if (backend.isConnected()) {
        init();
    } else {
        event.on("connect", () => init());
    }
});