import {AyzekPlugin,command} from '../';

const VERSIONS=[
    {
        "version": "7.1",
        "name": "Nougat",
        "code": "25"
    },
    {
        "version": "7.0",
        "name": "Nougat",
        "code": "24"
    },
    {
        "version": "6.0",
        "name": "Marshmallow",
        "code": "23"
    },
    {
        "version": "5.1",
        "name": "Lollipop",
        "code": "22"
    },
    {
        "version": "5.0",
        "name": "Lollipop",
        "code": "21"
    },
    {
        "version": "4.4-4.4.4",
        "name": "KitKat",
        "code": "19"
    },
    {
        "version": "4.3.x",
        "name": "Jelly Bean",
        "code": "18"
    },
    {
        "version": "4.2.x",
        "name": "Jelly Bean",
        "code": "17"
    },
    {
        "version": "4.1.x",
        "name": "Jelly Bean",
        "code": "16"
    },
    {
        "version": "4.0.3-4.0.4",
        "name": "Ice Cream Sandwich",
        "code": "15"
    },
    {
        "version": "4.0.1-4.0.2",
        "name": "Ice Cream Sandwich",
        "code": "14"
    },
    {
        "version": "3.2.x",
        "name": "Honeycomb",
        "code": "13"
    },
    {
        "version": "3.1",
        "name": "Honeycomb",
        "code": "12"
    },
    {
        "version": "3.0",
        "name": "Honeycomb",
        "code": "11"
    },
    {
        "version": "2.3.7",
        "name": "Gingerbread 2.3.3 -",
        "code": "10"
    },
    {
        "version": "2.3.2",
        "name": "Gingerbread 2.3 -",
        "code": "9"
    },
    {
        "version": "2.2.x",
        "name": "Froyo",
        "code": "8"
    },
    {
        "version": "2.1",
        "name": "Eclair",
        "code": "7"
    },
    {
        "version": "2.0.1",
        "name": "Eclair",
        "code": "6"
    },
    {
        "version": "2.0",
        "name": "Eclair",
        "code": "5"
    },
    {
        "version": "1.6",
        "name": "Donut",
        "code": "4"
    },
    {
        "version": "1.5",
        "name": "Cupcake",
        "code": "3"
    },
    {
        "version": "1.1",
        "name": "(no code name)",
        "code": "2"
    },
    {
        "version": "1.0",
        "name": "(no code name)",
        "code": "1"
    }
].map(e=>{
    e.code=+e.code;
    return e;
});

export default class AndroidPlugin extends AyzekPlugin {
    static description = 'Утилиты для Android Разработки';
    static author = 'F6CF';

    @command({
        names: ['a2v'],
        helpMessage: 'Получить версию из api'
    })
    async a2v(msg, args) {
        let ve=args[0];
        let v=VERSIONS.filter(v=>v.code===+ve)[0];
        if(v){
            msg.sendText(true,`Версия: ${v.version} (${v.name})`);
        }else{
            msg.sendText(true,'Такой версии API не существует!');
        }
    }
    @command({
        names: ['v2a'],
        helpMessage: 'Получить api из версии'
    })
    async v2a(msg, args) {
        let ve=args[0];
        let v=VERSIONS.filter(v=>v.version.includes(ve))[0];
        if(v){
            msg.sendText(true,`${v.name} - ${v.code}`);
        }else{
            msg.sendText(true,'Такой версии не существует!');
        }
    }
}