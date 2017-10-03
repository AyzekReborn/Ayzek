import {pluginator,AyzekPlugin,command,middleware} from '../../';
import {File,Location} from '@meteor-it/xbot';
import XPress from '@meteor-it/xpress';
import {emit} from '@meteor-it/xrest';
import {readFile} from '@meteor-it/fs';
import {cityNames, cityStations, cityCount} from './data.json';

const CONDITIONS = {
    "Sunny": "Солнечно",
    "Clear": "Ясно",
    "Partly Cloudy": "Переменная облачность",
    "Cloudy": "Облачно",
    "Overcast": "Пасмурно",
    "Mist": "Дымка",
    "Patchy rain nearby": "Местами дождь",
    "Patchy snow nearby": "Местами снег",
    "Patchy sleet nearby": "Местами дождь со снегом",
    "Patchy freezing drizzle nearby": "Местами замерзающая морось",
    "Thundery outbreaks in nearby": "Местами грозы",
    "Blowing snow": "Поземок",
    "Blizzard": "Метель",
    "Fog": "Туман",
    "Freezing fog": "Переохлажденный туман",
    "Patchy light drizzle": "Местами слабая морось",
    "Light drizzle": "Слабая морось",
    "Freezing drizzle": "Замерзающая морось",
    "Heavy freezing drizzle": "Сильная замерзающая морось",
    "Patchy light rain": "Местами небольшой дождь",
    "Light rain": "Небольшой дождь",
    "Moderate rain at times": "Временами умеренный дождь",
    "Moderate rain": "Умеренный дождь",
    "Heavy rain at times": "Временами сильный дождь",
    "Heavy rain": "Сильный дождь",
    "Light freezing rain": "Слабый переохлажденный дождь",
    "Moderate or heavy freezing rain": "Умеренный или сильный переохлажденный дождь",
    "Light sleet": "Небольшой дождь со снегом",
    "Moderate or heavy sleet": "Умеренный или сильный дождь со снегом",
    "Patchy light snow": "Местами небольшой снег",
    "Light snow": "Небольшой снег",
    "Patchy moderate snow": "Местами умеренный снег",
    "Moderate snow": "Умеренный снег",
    "Patchy heavy snow": "Местами сильный снег",
    "Heavy snow": "Сильный снег",
    "Ice pellets": "Ледяной дождь",
    "Light rain shower": "Небольшой ливневый дождь",
    "Moderate or heavy rain shower": "Умеренный или сильный ливневый дождь",
    "Torrential rain shower": "Сильные ливни",
    "Light sleet showers": "Небольшой ливневый дождь со снегом",
    "Moderate or heavy sleet showers": "Умеренные или сильные ливневые дожди со снегом",
    "Light snow showers": "Небольшой снег",
    "Moderate or heavy snow showers": "Умеренный или сильный снег",
    "Light showers of ice pellets": "Небольшой ледяной дождь",
    "Moderate or heavy showers of ice pellets": "Умеренный или сильный ледяной дождь",
    "Patchy light rain in area with thunder": "В отдельных районах местами небольшой дождь с грозой",
    "Moderate or heavy rain in area with thunder": "В отдельных районах умеренный или сильный дождь с грозой",
    "Patchy light snow in area with thunder": "В отдельных районах местами небольшой снег с грозой",
    "Moderate or heavy snow in area with thunder": "В отдельных районах умеренный или сильный снег с грозой"
}

export default class WeatherPlugin extends AyzekPlugin{
    static description='Просмотр погоды с возможностью подписки';
    @command({names:['weather'], helpMessage:'Получить погоду в заданном месте'})
    async weather(msg,args){
        let city=args.join(' ').toLowerCase();
        if(!cityNames[city])
            return await msg.sendText(true,'Город не найден. Попробуй ввести его название на английском языке (Наша база пополняется регулярно, но она всё ещё не знает названия всех городов мира)');
        msg.sendText(false,'Просчёт данных...');
        await new Promise((res)=>setTimeout(res,4000));
        let {body} = await emit(`GET http://api.apixu.com/v1/forecast.json?key=632bf6e8d0394c87b9a220424173107&q=${encodeURIComponent(cityNames[city])}&days=10`);
        let weather=`Прогноз погоды\n`;
        weather+=`Сейчас: `;
        weather+=this.convertWeather(body.current);
        body.forecast.forecastday.forEach(forecast=>{
            weather+=`${forecast.date.replace(/-/g,'/')}: `;
            weather+=this.convertWeather(forecast.day);
        });
        console.log(JSON.stringify(body));

        await msg.sendText(true,weather);
    }
    @command({names:['weatherdb'], helpMessage:'Получить информацию о базе данных'})
    async weatherdb(msg,params){
        return await msg.sendText(true,`На данный момент бот умеет получать информацию с ${cityStations} погодных станций, расположенных в ${cityCount} городах со всего мира`);
    }
    convertWeather(weather){
        if(weather.avgtemp_c)
            weather.temp_c=weather.avgtemp_c;
        if(weather.avgtemp_f)
            weather.temp_f=weather.avgtemp_f;
        if(weather.maxwind_kph)
            weather.wind_kph=weather.maxwind_kph;
        if(weather.maxwind_mph)
            weather.wind_mph=weather.maxwind_mph;
        return `${CONDITIONS[weather.condition.text]}\n`
        +`Температура: ${weather.temp_c.toString().replace('.',',')}C${weather.feelslike_c?` (${weather.feelslike_c.toString().replace('.',',')}C)`:''}\n`
        +`Ветер${weather.wind_dir?(' '+weather.wind_dir.replace(/N/g,'С').replace(/E/g,'В').replace(/S/g,'Ю').replace(/W/g,'З')):''} ${weather.wind_mph.toString().replace('.',',')}М/с (${weather.wind_kph.toString().replace('.',',')}Км/ч)\n`
    }
}