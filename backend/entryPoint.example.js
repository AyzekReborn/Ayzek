import Ayzek from './';
import XBotApiVk from '@meteor-it/xbot/api/vk';
import XBotApiTg from '@meteor-it/xbot/api/tg';
import Logger from '@meteor-it/logger';
import NodeLogger from '@meteor-it/logger/receivers/node';
import {createClient} from 'then-redis';
import {WebpackPluginLoader} from '@meteor-it/plugin-loader';
Logger.addReceiver(new NodeLogger());

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

    // To load plugins from "plugins" dir
    ayzek.addPluginLoader(new WebpackPluginLoader('webpack',
        () => require.context(__dirname + '/plugins', false, /Plugin\.js$/),
        (acceptor, getContext) => module.hot.accept(getContext().id, acceptor)));
}
start();