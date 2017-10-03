import {AyzekPlugin,command} from '../../';
import Logger from '@meteor-it/logger';

const CARDS = [
    ["2", "пик"],
    ["2", "червей"],
    ["2", "бубей"],
    ["2", "крестей"],

    ["3", "пик"],
    ["3", "червей"],
    ["3", "бубей"],
    ["3", "крестей"],

    ["4", "пик"],
    ["4", "червей"],
    ["4", "бубей"],
    ["4", "крестей"],

    ["5", "пик"],
    ["5", "червей"],
    ["5", "бубей"],
    ["5", "крестей"],

    ["6", "пик"],
    ["6", "червей"],
    ["6", "бубей"],
    ["6", "крестей"],

    ["7", "пик"],
    ["7", "червей"],
    ["7", "бубей"],
    ["7", "крестей"],

    ["8", "пик"],
    ["8", "червей"],
    ["8", "бубей"],
    ["8", "крестей"],

    ["9", "пик"],
    ["9", "червей"],
    ["9", "бубей"],
    ["9", "крестей"],

    ["10", "пик"],
    ["10", "червей"],
    ["10", "бубей"],
    ["10", "крестей"],

    ["валет", "пик"],
    ["валет", "червей"],
    ["валет", "бубей"],
    ["валет", "крестей"],

    ["дама", "пик"],
    ["дама", "червей"],
    ["дама", "бубей"],
    ["дама", "крестей"],

    ["король", "пик"],
    ["король", "червей"],
    ["король", "бубей"],
    ["король", "крестей"],

    ["туз", "пик"],
    ["туз", "червей"],
    ["туз", "бубей"],
    ["туз", "крестей"]
];

const NOT_ORDINAL = ['король','валет','дама','туз'];
const END_SCORE=41;

function cardCost(card, scores) {
    let num = card[0];
    if(!NOT_ORDINAL.includes(num)){
        return +num;
    }else if(num==='туз'){
        if(scores>END_SCORE)
            return 1;
        else
            return 11;
    }else{
        return 10;
    }
}

function shuffleCards() {
    let cards=CARDS.slice();
    let counter = cards.length;
    while (counter > 0) {
        let index = Math.floor(Math.random() * counter);
        counter--;
        let temp = cards[counter];
        cards[counter] = cards[index];
        cards[index] = temp;
    }
    return cards;
}

class BlackJackGame {
    logger=new Logger('bjgame');
    constructor(user,chat){
        this.exclusive=true;
        this.user=user;
        this.chat=chat;
        this.gameContext=chat.state.bjGameContext;
        if(!this.gameContext){
            this.newGameContext();
        }else{
            this.stack=this.gameContext.stack;
            this.userstack=this.gameContext.user;
            this.benderstack=this.gameContext.bender;
        }
    }
    generateStack(){
        this.stack = shuffleCards();
    }
    takeCards(){
        if(this.stack.length>0)
            this.userstack.push(this.stack.pop());
        if(this.stack.length>0&&this.getBenderScores()<20)
            this.benderstack.push(this.stack.pop());
    }
    newGameContext(){
        this.generateStack();
        this.benderstack=[];
        this.userstack=[];
        this.takeCards();
        this.takeCards();
        if(!this.gameContext){
            this.gameContext={
                gamers : {},
                botBets:[],
                userBets:[],
                stack : this.stack,
                bender:this.benderstack,
                user:this.userstack,
                sessionStarted:true
            };
        }else{
            this.gameContext.stack=this.stack;
            this.gameContext.bender=this.benderstack;
            this.gameContext.user=this.userstack;
            this.paybackUsers();
            this.gameContext.botBets=[];
            this.gameContext.userBets=[];
            this.gameContext.sessionStarted=true;
        }
    }
    getWinOrLooseText(win){
        let tbot=this.totalOnBot();
        let tuser=this.totalOnUser();
        let ratio=0;
        if(tuser>0)
            ratio=tbot/tuser;
        let text=`Ставки:\nНа бота: ${tbot}\nНа вас: ${tuser}\n\n`;
        text+=`У бота - ${this.getBenderScores()} очков\nУ нас - ${this.getUserScores()} очков`;
        this.refundUsers(win);
        this.gameContext.botBets=[];
        this.gameContext.userBets=[];
        if(win){
            text+='\n\nМы победили!';
        }else{
            text+='\n\nПобедил бот D:';
        }
        return text;
    }
    generateMessage(finish=false){
        let text='';
        if(!finish){
            let tbot=this.totalOnBot();
            let tuser=this.totalOnUser();
            let ratio=0;
            if(tuser>0)
                ratio=tbot/tuser;
            text+=`Ставки:\nНа бота: ${tbot}\nНа вас: ${tuser}\n\n`;
            text+=`${this.benderstack.length} карт(ы) у бота\n${this.userstack.length} карт(ы) у вас: \n`;
            let userScores=this.getUserScores();
            let cardText=[];
            for(let card of this.userstack){
                cardText.push(`${card[0]} ${card[1]} (Цена: ${cardCost(card,userScores)})`);
            }
            text+=cardText.join('\n');
            text+='\n\n';
            text+='Очков: '+userScores;
            if(this.getUserScores()>=END_SCORE||finish)
                text+='\n\n';
        }
        if(this.getUserScores()>=END_SCORE)
            finish=true;
        if(finish){
            this.gameContext.sessionStarted=false;
            if(this.getUserScores()>END_SCORE)
                return `${text}${this.getWinOrLooseText(true)}`;
            if(this.getBenderScores()>END_SCORE)
                return `${text}${this.getWinOrLooseText(false)}`;
            if(this.getUserScores()>this.getBenderScores())
                return `${text}${this.getWinOrLooseText(true)}`;
            else
                return `${text}${this.getWinOrLooseText(false)}`;
        }
        return text;
    }
    getScores(stack){
        let cost=0;
        for(let card of stack)
            cost+=cardCost(card,0);
        let res=0;
        for(let card of stack)
            res+=cardCost(card,cost);
        return res;
    }
    getUserScores(){
        return this.getScores(this.userstack);
    }
    isStarted(){
        return this.gameContext.sessionStarted;
    }
    getBenderScores(){
        return this.getScores(this.benderstack);
    }
    saveContext(){
        this.chat.state.bjGameContext=this.gameContext;
    }
    processBetOnUser(uid,bet){
        if(!this.hasMoney(uid))
            this.addMoney(5000,uid);
        if(this.getMoney(uid)<bet)
            bet=this.getMoney(uid);
        if(bet===0)
            return 'Да вы банкрот, батенька, пиздуйте из казино';
        this.betOnUser(bet,uid);
        this.decreaseMoney(bet,uid);
        return `Ставка в размере ${bet} крон на нас принята`;
    }
    processBetOnBot(uid,bet){
        if(!this.hasMoney(uid))
            this.addMoney(5000,uid);
        if(this.getMoney(uid)<bet)
            bet=this.getMoney(uid);
        if(bet===0)
            return 'Да вы банкрот, батенька, пиздуйте из казино';
        this.betOnBot(bet,uid);
        this.decreaseMoney(bet,uid);
        return `Ставка в размере ${bet} крон на бота принята`;
    }
    hasMoney(uid){
        if(uid in this.gameContext.gamers)
            return true;
        return false;
    }
    getMoney(uid){
        return this.gameContext.gamers[uid].money;
    }
    addMoney(num,uid){
        this.logger.log(`Adding money ${num} to ${uid}`);
        if(uid in this.gameContext.gamers)
            this.gameContext.gamers[uid].money+=num;
        else
            this.gameContext.gamers[uid]={money:num};
    }
    decreaseMoney(num,uid){
        this.gameContext.gamers[uid].money-=num;
    }
    betOnBot(num,uid){
        this.gameContext.botBets.push([uid,num]);
    }
    betOnUser(num,uid){
        this.gameContext.userBets.push([uid,num]);
    }
    getDeposit(uid){
        if(!this.hasMoney(uid)){
            this.addMoney(5000,uid);
        }
        return `У вас на счету ${this.getMoney(uid)} крон`;
    }
    totalOnBot(){
        let num=0;
        for(let bet of this.gameContext.botBets)
            num+=bet[1];
        return num;
    }
    totalOnUser(){
        let num=0;
        for(let bet of this.gameContext.userBets)
            num+=bet[1];
        return num;
    }
    paybackUsers(){
        for(let it of this.gameContext.botBets)
            this.addMoney(it[1],it[0]);
        for(let it of this.gameContext.userBets)
            this.addMoney(it[1],it[0]);
    }
    refundUsers(weWin){
        this.logger.log('Refund');
        let utotal=this.totalOnUser();
        let btotal=this.totalOnBot();
        let k=0;
        if(weWin){
            if(utotal===0)
                k=0;
            else
                k=btotal/utotal;
            this.logger.log(`Ration = ${k}`);
            for(let it of this.gameContext.userBets)
                this.addMoney(it[1]+it[1]*k,it[0]);
        }else{
            if(btotal===0)
                k=0;
            else
                k=utotal/btotal;
            this.logger.log(`Ration = ${k}`);
            for(let it of this.gameContext.botBets)
                this.addMoney(it[1]+it[1]*k,it[0]);
        }
        let a=this.gameContext.botBets.length+this.gameContext.userBets.length;
        if(a===1){
            for(let it of this.gameContext.userBets)
                this.addMoney(it[1]*0.25,it[0]);
            for(let it of this.gameContext.botBets)
                this.addMoney(it[1]*0.25,it[0]);
        }
    }
}

const chatGames=new Map();

export default class BlackJackPlugin extends AyzekPlugin{
    static author = 'F6CF';
    static description = 'Блэкджек (Хотя скорее пародия на него)';

    @command({
        names: ['bjstart'],
        helpMessage: 'Начать игру'
    })
    async bjstart(msg, args) {
        if(!msg.isChat)
            return msg.sendText(true,'Играть можно только в чатах!');
        let game=chatGames.get(msg.chat.cid);
        if(!game)
            game=new BlackJackGame(msg.user,msg.chat);
        game.newGameContext();
        let text=game.generateMessage();
        game.saveContext();
        msg.sendText(true,text);
        chatGames.set(msg.chat.cid,game);
    }
    @command({
        names: ['mydeposit'],
        helpMessage: 'Получить свой депозит'
    })
    async deposit(msg,args){
        if(!msg.isChat)
            return msg.sendText(true,'Играть можно только в чатах!');
        if(!chatGames.has(msg.chat.cid))
            return msg.sendText(true,'В этом чате игра не идёт!');
        let game=chatGames.get(msg.chat.cid);
        let text=game.getDeposit(msg.user.uid);
        game.saveContext();
        msg.sendText(true,text);
    }
    @command({
        names:['card'],
        helpMessage:'Карту'
    })
    async card(msg,args){
        if(!msg.isChat)
            return msg.sendText(true,'Играть можно только в чатах!');
        if(!chatGames.has(msg.chat.cid))
            return msg.sendText(true,'В этом чате игра не идёт!');
        let game=chatGames.get(msg.chat.cid);
        if(!game.isStarted())
            return msg.sendText(true,'Игра законена!');
        if(game.gameContext.botBets.map(e=>e[0]).includes(msg.user.uid))
            return msg.sendText(true,'Вы поставили на бота, не мешайте игре');
        game.takeCards();
        let text=game.generateMessage();
        game.saveContext();
        msg.sendText(true,text);
    }
    @command({
        names:['bjstop'],
        helpMessage:'Остановить игру'
    })
    async stop(msg,args){
        if(!msg.isChat)
            return msg.sendText(true,'Играть можно только в чатах!');
        if(!chatGames.has(msg.chat.cid))
            return msg.sendText(true,'В этом чате игра не идёт!');
        let game=chatGames.get(msg.chat.cid);
        if(!game.isStarted())
            return msg.sendText(true,'Игра законена!');
        if(game.gameContext.botBets.map(e=>e[0]).includes(msg.user.uid))
            return msg.sendText(true,'Вы поставили на бота, не мешайте игре');
        let text=game.generateMessage(true);
        game.saveContext();
        msg.sendText(true,text);
    }
    @command({
        names:['betbot'],
        helpMessage:'Сделать ставку на бота'
    })
    async betbot(msg,args){
        if(!msg.isChat)
            return msg.sendText(true,'Играть можно только в чатах!');
        if(!chatGames.has(msg.chat.cid))
            return msg.sendText(true,'В этом чате игра не идёт!');
        let game=chatGames.get(msg.chat.cid);
        if(!game.isStarted())
            return msg.sendText(true,'Игра законена!');
        if(game.gameContext.botBets.map(e=>e[0]).includes(msg.user.uid))
            return msg.sendText(true,'Вы поставили на бота, не мешайте игре');
        let bet=parseInt(args[0],10);
        if(isNaN(bet))
            return msg.sendText(true,'Ты не ввёл валидную ставку!');
        bet=Math.abs(bet);
        this.logger.log(`Bet on bot ${bet}`);
        let text=game.processBetOnBot(msg.user.uid,bet);
        game.saveContext();
        msg.sendText(true,text);
    }
    @command({
        names:['betus'],
        helpMessage:'Сделать ставку на нас'
    })
    async betUs(msg,args){
        if(!msg.isChat)
            return msg.sendText(true,'Играть можно только в чатах!');
        if(!chatGames.has(msg.chat.cid))
            return msg.sendText(true,'В этом чате игра не идёт!');
        let game=chatGames.get(msg.chat.cid);
        if(!game.isStarted())
            return msg.sendText(true,'Игра законена!');
        if(game.gameContext.botBets.map(e=>e[0]).includes(msg.user.uid))
            return msg.sendText(true,'Вы поставили на бота, не мешайте игре');
        let bet=parseInt(args[0],10);
        if(isNaN(bet))
            return msg.sendText(true,'Ты не ввёл валидную ставку!');
        bet=Math.abs(bet);
        this.logger.log(`Bet on us ${bet}`);
        let text=game.processBetOnUser(msg.user.uid,bet);
        game.saveContext();
        msg.sendText(true,text);
    }

}