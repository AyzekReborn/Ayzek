import {
  AyzekPlugin,
  command
}
from '../../';

let rooms={};

export default class TicTacToePlugin extends AyzekPlugin {
    static description = 'Крестики - нолики';
    @command({
        names: ['tttmp'],
        helpMessage: 'Начать мультиплеер игру'
    })
    async tttmp(msg, args) {
        let awail=Object.values(rooms).filter(room=>room.haveSpace());
        if(awail.length>0){
            awail[0].join(msg,msg.user);
        }else{
            let name=Math.random().toString(36).substr(2);
            rooms[name]=new Room(name);
            await rooms[name].join(msg,msg.user);
        }
    }
}

// This code was written in 2014 year, i known javascript only a bit...
class Room {
    pl1u;
    pl1f;
    pl2u;
    pl2f;
    name;
    field = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];

    constructor(name) {
        this.name = name;
    }

    haveSpace() {
        return !(this.pl1f && this.pl2f);
    }

    destroy() {
        delete rooms[this.name];
    }

    logout(p) {
        if (this.isSameChat()) {
            this.callBoth((p == 1 ? this.pl1u : this.pl2u).getFullName() + ' покинул игру.');
        } else {
            Promise.all([this.getMsg(p).sendText(true, 'Ты покинул игру.'), this.getMsg(p == 1 ? 2 : 1).sendText(true, 'Соперник покинул игру.')]);

        }
        this.destroy();
    }

    async turn(p) {
        await this.sendField(p);
        await this.getMsg(p).sendText(false, 'Введи свой ход (гор верт)');
        let message = await this.getUser(p).waitNew('Ты не можешь вызывать другие команды пока идёт игра!\nЧто бы сделать ход введи клетку по горизонтали и клетку по вертикали через пробел!');
        let text = message.text;
        if (text == '') {
            this.logout(p);
            return true;
        }
        let coords = text.split(' ');
        if (coords.length != 2) {
            this.logout(p);
            return true;
        }
        let x;
        let y;
        try {
            x = parseInt(coords[0],0);
            y = parseInt(coords[1],0);
            if (isNaN(x) || isNaN(y))
                throw 'd';
            if (x > 3 || x < 1 || y > 3 || y < 1)
                throw 'd';
            x--;
            y--;
        } catch (e) {
            this.logout(p);
            return true;
        }
        if (this.field[x][y] != 0) {
            this.getMsg(p).sendText(false, 'Клетка занята!');
            return 2;
        }
        this.field[x][y] = p;
        let winner = this.getWinner();
        if (winner != 0) {
            this.winner(winner);
            return true;
        } else {
            return false;
        }
    }

    async winner(p) {
        await this.sendField(0);
        if (p == -1) {
            await this.callBoth('Ничья!');
        } else if (this.isSameChat()) {
            await this.callBoth(this.getUser(p).getFullName() + ' победил!');
        } else {
            await Promise.all([this.getMsg(p).sendText(true, 'Ты победил!'), this.getMsg(p == 1 ? 2 : 1).sendText(true, 'Ты проиграл...')]);
        }
        this.destroy();
    }

    getWinner() {
        function cmp3(a, b, c) {
            return a == b && b == c && c == a;
        }

        let field = this.field;
        if (cmp3(field[0][0], field[0][1], field[0][2])) {
            if (field[0][0] != 0)
                return field[0][0];
        }
        if (cmp3(field[1][0], field[1][1], field[1][2])) {
            if (field[1][0] != 0)
                return field[1][0];
        }
        if (cmp3(field[2][0], field[2][1], field[2][2])) {
            if (field[2][0] != 0)
                return field[2][0];
        }
        if (cmp3(field[0][0], field[1][0], field[2][0])) {
            if (field[0][0] != 0)
                return field[0][0];
        }
        if (cmp3(field[0][1], field[1][1], field[2][1])) {
            if (field[0][1] != 0)
                return field[0][1];
        }
        if (cmp3(field[0][2], field[1][2], field[2][2])) {
            if (field[0][2] != 0)
                return field[0][2];
        }
        if (cmp3(field[0][0], field[1][1], field[2][2])) {
            if (field[0][0] != 0)
                return field[0][0];
        }
        if (cmp3(field[2][0], field[1][1], field[0][2])) {
            if (field[2][0] != 0)
                return field[2][0];
        }
        if (field[0][0] != 0 && field[0][1] != 0 && field[0][2] != 0 &&
            field[1][0] != 0 && field[1][1] != 0 && field[1][2] != 0 &&
            field[2][0] != 0 && field[2][1] != 0 && field[2][2] != 0)
            return -1;
        return 0;
    }

    getMsg(p) {
        if (p == 1)
            return this.pl1f;
        if (p == 2)
            return this.pl2f;
    }

    getUser(p){
        if(p===1)
            return this.pl1u;
        else
            return this.pl2u;
    }

    async turn1() {
        let fin = await this.turn(1);
        if (fin == 2) {
            setTimeout(()=>this.turn1(), 1);
            return;
        }
        if (!fin)setTimeout(()=>this.turn2(), 1);
    }

    async turn2() {
        let fin = await this.turn(2);
        if (fin == 2) {
            setTimeout(()=>this.turn2(), 1);
            return;
        }
        if (!fin)setTimeout(()=>this.turn1(), 1);
    }

    async sendField(pl) {
        let N1 = '1⃣';
        let N2 = '2⃣';
        let N3 = '3⃣';
        let N0 = '🔳';

        let NX = '❎';//Krestik
        let ND = '🅾';//Nolik
        let NE = '📄';//Empty

        let o = '';
        o += `${N0}${N1}${N2}${N3}\n`;
        // Line drawing
        for (let l = 0; l < 3; l++) {
            o += l == 0 ? N1 : l == 1 ? N2 : N3;
            // Row drawing
            for (let i = 0; i < 3; i++){
                o += `${this.field[i][l] == 0 ? NE : this.field[i][l] == 1 ? NX : ND}`;
            }
            o+='\n';
        }
        if (pl == 1)
            await this.pl1f.sendText(false, o);
        else if (pl == 2)
            await this.pl2f.sendText(false, o);
        else if (pl == 0)
            await this.callBoth(o);
        else throw "Wrong player with id " + pl;
    }

    async onJoin() {
        if (!this.haveSpace()) {
            await this.callBoth('Начинаем игру!\n' + `Крестики: ${this.pl1u.getFullName()}\nНолики: ${this.pl2u.getFullName()}`);
            this.turn1();
        }
    }

    isSameChat() {
        if (this.pl1f.chat && this.pl2f.chat)
            if (this.pl1f.chat.cid == this.pl2f.chat.cid)
                return true;
        return false;
    }

    async callBoth(msg) {
        if (this.isSameChat()) {
            await this.pl1f.sendText(false, msg);
            return;
        }
        await Promise.all([this.pl1f.sendText(false, msg), this.pl2f.sendText(false, msg)]);
    }

    async join(msg, user) {
        if (!this.pl1f) {
            this.pl1f = msg;
            this.pl1u = user;
            await msg.sendText(false, 'Ожидание второго игрока...');
        } else if (!this.pl2f) {
            this.pl2f = msg;
            this.pl2u = user;
            await msg.sendText(false, 'Ожидание сервера...');
        }
        await this.onJoin();
    }
}
