# Ayzek

[![Greenkeeper badge](https://badges.greenkeeper.io/Creeplays/Ayzek.svg)](https://greenkeeper.io/)

# How to run:
## Initial:
- Configure bot in `entryPoint.example.js`
- Copy `entryPoint.example.js` to `entryPoint.js`

### In first terminal:
- `git clone https://github.com/creeplays/framework packages`
- `cd packages&&ln -s @meteor-it dist&&cd ..`
- `npm install -g make-zaebis`
- `npm install`
- `make-zaebis watch -t bot` (Ignore all errors in console)

### In second terminal:
- `cd output/development/bot`
- `node main.bot.js`

## Next runs:
### In first terminal:
- `make-zaebis watch -t bot`

### In second terminal:
- `cd output/development/bot`
- `node main.bot.js`

# How to write plugins
Look at plugins/publicPlugins/FunPlugin and write other plugin in similar dir
Or read hubot docs, and write plugins for them in hubotPlugins

# Features:
- Compatable with multiple plugin formats
    - Venom bot
    - Hubot plugins
    - Lila
    - Ayzek very own plugin format (The best one, by default)
- Single process can have multiple ayzek instances
- Every ayzek instance can handle multiple api connections
- Powerfull plugin system
- Fast async state management
- Hot plugin replacement (You can edit plugins without restarting bot)
- Compilable to single standalone js file

# Supported api's:
| Messanger | Module | Repository |
| - | - | - |
| [Telegram (as bot)](https://telegram.org) | @meteor-it/xbot/api/tg | [Multirepo](https://github.com/Meteor-DEV/Meteor.Framework/xbot/api/tg.ts) |
| [Telegram (as user)](https://telegram.org) | @meteor-it/xbot/api/tgmtproto | [Multirepo](https://github.com/Meteor-DEV/Meteor.Framework/xbot/api/tgmtproto.ts) |
| [Vkontakte](https://vk.com) | @meteor-it/xbot/api/vk | [Multirepo](https://github.com/Meteor-DEV/Meteor.Framework/xbot/api/vk.ts) |
| [Discord](https://discordapp.gg) | @meteor-it/xbot/api/ds | [Multirepo](https://github.com/Meteor-DEV/Meteor.Framework/xbot/api/ds.ts) |

# Roadmap:
- [ ] Better docs
- [ ] More apis
- [ ] I18N support with `@meteor-it/templato`
- [ ] Plugin store
- [ ] Upload native plugin support
    - [ ] Waiting for Venom-Bot api stabilization
    - [ ] Implement bindings
- [ ] AyzekSDK upload
    - [X] Ayzek-RED private release
    - [ ] Attachments in websocket api
- [ ] UtilPlugin
    - [ ] Piping command output