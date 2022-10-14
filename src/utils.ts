import path, {resolve} from "path";
import {existsSync, mkdirSync, readFileSync, writeFileSync} from "fs";
import yaml from "js-yaml";
export const basePath=process.cwd()
export function hasPackageJson(){
    return existsSync(resolve(basePath,'package.json'))
}
export const defaultConfig={
    uin:1472558369,
    password: '你的密码',
    plugins:{},
    log_level:'info',
    plugin_dir:path.join(basePath,'plugins'),
    data_dir:path.join(basePath,'data'),
    delay:{},
    logConfig:{
        appenders: {
            console:{type:'console'},
            zhin: {
                type:'file',
                filename:path.join(basePath,'logs.log')
            }
        },
        categories:{
            zhin:{
                appenders:['console','zhin'],
                level:'info'
            }
        }
    },
}
export function makeDir(dirDesc:string){
    if(existsSync(dirDesc)) throw new Error('文件夹已存在')
    mkdirSync(dirDesc)
}
export function saveTo(filePath:string,content:string){
    if(existsSync(filePath)) throw new Error('文件已存在')
    writeFileSync(filePath,content,"utf8")
}
export function replace(template:string,[key,value]:[string,string]):string{
    return template.replace(new RegExp(`{{${key}}}`,'gm'),value)
}
export function readConfig():Config{
    const configPath=resolve(process.cwd(),'zhin.yaml')
    if(!existsSync(configPath)) throw new Error('未找到配置文件，请确实是否正确初始化了zhin')
    return yaml.load(readFileSync(configPath,'utf8'))
}
export type Config=Partial<typeof defaultConfig>