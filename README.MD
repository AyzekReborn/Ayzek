# Ayzek

# How to run:
TODO

# How to write plugins
TODO

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
    - [ ] Ayzek-RED private release
    - [ ] Attachments in websocket api
- [ ] UtilPlugin
    - [ ] Piping command output

# Usage:
TODO