# Ayzek

[![Greenkeeper badge](https://badges.greenkeeper.io/Creeplays/Ayzek.svg)](https://greenkeeper.io/)

<a target='_blank' rel='nofollow' href='https://app.codesponsor.io/link/aH8TwSzvuyDZ2AxVx9dQWCp6/Creeplays/Ayzek'>
  <img alt='Sponsor' width='888' height='68' src='https://app.codesponsor.io/embed/aH8TwSzvuyDZ2AxVx9dQWCp6/Creeplays/Ayzek.svg' />
</a>

# See it running:
- [Telegram](https://telegram.me/glados_hypervizor_bot)
- [VKontakte](https://vk.com/meteorbot)
- [Discord](https://discord.gg/T7549yC) (Bot name is Meteor-IT, it works bad, but only there, if you run bot on your own server everything will be fine)

# How to run:
## Initial setup:
- Configure bot in `entryPoint.example.js`
- Copy `entryPoint.example.js` to `entryPoint.js`

### Open a terminal and type the following commands:
- `git clone https://github.com/creeplays/framework packages`
- `cd packages&&ln -s @meteor-it dist&&cd ..` (TODO: Use framework packages from NPM)
- `npm install`
- `npm run compile-dev` (Ignore all errors and warnings in console; they will be fixed soon)

### In a new terminal, type:
- `npm run run-dev`

## Next commands:
### In first terminal, type:
- `npm run compile-dev`

### In another terminal, type:
- `npm run run-dev`

# How to write plugins:
- Look at plugins/publicPlugins/FunPlugin and write other plugins in similar directories
- Or, you can read hubot docs and write plugins for them in hubotPlugins

# Features:
- Compatible with multiple plugin formats, such as:
    - Venom bot
    - Hubot plugins
    - Lila
    - Ayzek's very own plugin format (The best one, by default)
- Single process can have multiple Ayzek instances
- Every Ayzek instance can handle multiple API connections
- Powerful plugin system
- Fast asynchronous state management
- Hot plugin replacement (You can edit plugins without restarting the bot)
- Compilable to single standalone JavaScript file

# Supported API's:
| Messenger | Module | Repository |
| - | - | - |
| [Telegram (as bot)](https://telegram.org) | @meteor-it/xbot/api/tg | [Multirepo](https://github.com/Meteor-DEV/Meteor.Framework/xbot/api/tg.ts) |
| [Telegram (as user)](https://telegram.org) | @meteor-it/xbot/api/tgmtproto | [Multirepo](https://github.com/Meteor-DEV/Meteor.Framework/xbot/api/tgmtproto.ts) |
| [Vkontakte](https://vk.com) | @meteor-it/xbot/api/vk | [Multirepo](https://github.com/Meteor-DEV/Meteor.Framework/xbot/api/vk.ts) |
| [Discord](https://discordapp.gg) | @meteor-it/xbot/api/ds | [Multirepo](https://github.com/Meteor-DEV/Meteor.Framework/xbot/api/ds.ts) |

# Roadmap:
- [ ] Better documentation
- [ ] More APIs
- [ ] I18N support with `@meteor-it/templato`
- [ ] Plugin store
- [ ] Upload native plugin support
    - [ ] Waiting for Venom-Bot api stabilization
    - [ ] Implement bindings
- [ ] AyzekSDK upload
    - [X] Ayzek-RED private release
    - [ ] Attachments in websocket API
- [ ] UtilPlugin
    - [ ] Piping command output
