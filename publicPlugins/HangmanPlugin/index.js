import {AyzekPlugin,command} from '../../';
import Random from '@meteor-it/random';
import data from './data.yml';
const DEATH_ERROR_COUNT = data.images.length;

export default class HangmanPlugin extends AyzekPlugin{
    static author='F6CF (Идея взята от бота - тюленя)'
    static description='Бот вас повесит';

    random=new Random();
    @command({names:['visiliza','hangman'], helpMessage:'Висилица'})
    async visiliza(msg,args){
        await msg.sendText(false,'Загадываю слово...');
        let word=this.random.randomArrayElement(data.dictionary.normal);
        msg.state.word=word;
        msg.state.opened=word.replace(/[^ ]/g,'_');
        msg.state.errors=0;
        await msg.sendText(true,'Слово загадано!\nТеперь попробуй угадать отсутствующие буквы: '+word.replace(/[^ ]/g,'_')+'\nПодсказка: буква в сообщении должна быть одна,\nЕсли букв больше одной, то это считается за отгаданное слово!');
        let gameEnd=false;
        let oldMsg=msg;
        while(!gameEnd){
            let waitMsg=oldMsg.chat?oldMsg.chat:oldMsg.user;
            let msg=await waitMsg.waitNew('Запрещено использовать команды во время игры в висилицу!\nДля выхода из игры напиши "выход"');
            if(msg.text.toLowerCase()==='выход')
                return await msg.sendText(true,'Игра закончеа');
            if(msg.text.length>1){
                // Word guess
                if(msg.state.word===msg.text.toLowerCase()){
                    // Guessed
                    return await msg.sendText(true,this.random.randomArrayElement(data.end.success));
                }else{
                    msg.state.errors++;
                    let showWord=checkLoose(msg.state)?msg.state.word:msg.state.opened;
                    await msg.sendText(false,`${data.images[msg.state.errors-1].join('\n')}\nНет, это не ${msg.text}!\n${showWord}`);
                    if(checkLoose(msg.state))
                        return await msg.sendText(true,this.random.randomArrayElement(data.end.fail));
                    continue;
                }
            }else{
                if(msg.state.opened.includes(msg.text.toLowerCase())){
                    // Is already guessed
                    await msg.sendText(true,'Эта буква уже отгадана!');
                }else if(msg.state.word.includes(msg.text.toLowerCase())){
                    // Is contains in real word
                    let letter=msg.text.toLowerCase();
                    msg.state.word.split('').forEach((glt,id)=>{
                        if(!(glt===letter))
                            return;
                        let g=msg.state.opened.split('');
                        g[id]=letter;
                        msg.state.opened=g.join('');
                    });
                    let showWord=checkWin(msg.state)?msg.state.word:msg.state.opened;

                    await msg.sendText(false,`Именно! Это ${msg.text}!\n${showWord}`);
                    if(checkWin(msg.state))
                        return await msg.sendText(true,this.random.randomArrayElement(data.end.success));
                    continue;
                }else{
                    // Wrong letter
                    msg.state.errors++;
                    let showWord=checkLoose(msg.state)?msg.state.word:msg.state.opened;
                    console.log(msg.state.errors);
                    await msg.sendText(false,`${data.images[msg.state.errors-1].join('\n')}\nНет, это не ${msg.text}!\n${showWord}`);
                    if(checkLoose(msg.state))
                        return await msg.sendText(true,this.random.randomArrayElement(data.end.fail));
                    continue;
                }
            }
        }
    }
}

function checkWin(state) {
    return state.word===state.opened;
}
function checkLoose(state) {
    return state.errors>=DEATH_ERROR_COUNT;
}