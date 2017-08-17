import {
    AyzekPlugin,
    command,
    middleware
}
from '../';
import XPress from '@meteor-it/xpress';
import AJSON from '@meteor-it/ajson';
import {
    addSupport as wsSupport
}
from '@meteor-it/xpress/support/ws';

import {
    hashCode,
    djb2Code,
    sdbmCode,
    loseCode
}
from '@meteor-it/utils';

let chatClients = {};
let tokenChatMap = new Map();

function hashToken(text) {
    // body...
    return `${hashCode(text).toString(36)}:${djb2Code(text).toString(36)}:${sdbmCode(text).toString(36)}:${loseCode(text).toString(36)}`;

}
export default class YourOwnPlugin extends AyzekPlugin {
    static description = 'Плагин для создания ваших плагинов';

    @middleware({
        event: 'pre'
    })
    async pre(msg) {
        let chatToken = msg.chat ? hashToken(msg.chat.cid) : hashToken(msg.user.uid);
        if (!tokenChatMap.has(chatToken)) {
            tokenChatMap.set(chatToken, msg.chat ? msg.chat : msg.user);
        }
        if (chatClients[chatToken])
            chatClients[chatToken].forEach(client => {
                client.send(AJSON.stringify({
                    text: msg.text,
                    chatToken,
                    sender: {
                        firstName: msg.user.firstName,
                        lastName: msg.user.lastName,
                        uid: msg.user.uid
                    },
                    chat: msg.chat ? {
                        title: msg.chat.title,
                        cid: msg.chat.cid
                    } : null,
                    replyTo: msg.replyTo ? {
                        text: msg.replyTo.text,
                        sender: {
                            firstName: msg.replyTo.sender.firstName,
                            lastName: msg.replyTo.sender.lastName,
                            uid: msg.replyTo.sender.uid
                        }
                    } : null
                }));
            });
        return true;
    }

    server;
    async init() {
        let app = new XPress('ayzeksdk');
        app.onListen(wsSupport);
        app.on('WS /:code', (req, socket) => {
            let code = (req.params.code);
            if (!chatClients[code])
                chatClients[code] = [socket];
            else
                chatClients[code].push(socket);
            console.log(code);
            socket.on('message', msg => {
                console.log(msg);
                if (!tokenChatMap.has(code))
                    return;
                console.log(msg);
                try {
                    console.log(msg);
                    msg = JSON.parse(msg);
                    tokenChatMap.get(code).sendText(false, msg.text);
                }
                catch (e) {
                    console.log(msg);
                    socket.close();
                }
            });
            socket.on('close', () => {
                chatClients[code] = chatClients[code].filter(client => client !== socket);
            });
        });
        this.server = await app.listenHttp('0.0.0.0', 1488);
    }

    async deinit() {
        this.server.close();
    }
    @command({
        names: ['yoplugintoken'],
        helpMessage: 'Получить токен для подключения своего плагина'
    })
    async yop(msg, args) {
        let code = msg.chat ? hashToken(msg.chat.cid) : hashToken(msg.user.uid);
        await msg.sendText(true, `Инструментарий AyzekSDK готов к подключению!\nТокен для подключения: ${code}\nНе знаете что с ним делать? Прочитайте инструкцию на сайте бота: http://ayzek.f6cf.pw/sdk`);
    }
}
