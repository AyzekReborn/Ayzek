import Ayzek from './';
import XBotApiVk from '@meteor-it/xbot/api/vk';
import XBotApiTg from '@meteor-it/xbot/api/tg';
import Logger from '@meteor-it/logger';
import NodeLogger from '@meteor-it/logger/receivers/node';
import {createClient} from 'then-redis';
import ClassicPluginSystem from './pluginSystems/ClassicPluginSystem';
import HubotPluginSystem from './pluginSystems/HubotPluginSystem';

let redis = createClient();

const ayzek = new Ayzek();
// Everything in "ayzek.shared" is shared between other plugins
ayzek.shared.redis = redis;

async function start() {
    // Initialize apis
    const vkApi = new XBotApiVk();
    await vkApi.auth([
        'VK TOKEN 1',
        'VK TOKEN 2',
        'VK TOKEN 3',
        'VK TOKEN 4',
        'VK TOKEN 5'
    ]);

    const tgApi = new XBotApiTg();
    await tgApi.auth('TG TOKEN 1');

    // To make bot receive messages from these apis
    ayzek.attachApi(vkApi);
    ayzek.attachApi(tgApi);

    // From "publicPlugins"
    ayzek.addPluginLoader(new ClassicPluginSystem('openPlugins',
        () => require.context(__dirname + '/publicPlugins', false, /Plugin\/index\.js$/),
        (acceptor, getContext) => module.hot.accept(getContext().id, acceptor)));
    // Hubot plugins from "hubotPlugins"
    ayzek.addPluginLoader(new HubotPluginSystem('hubotPlugins',
        () => require.context(__dirname + '/hubotPlugins', false, /\.js$/),
        (acceptor, getContext) => module.hot.accept(getContext().id, acceptor)));
}
start();
