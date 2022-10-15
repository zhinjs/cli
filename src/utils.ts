import path, {resolve} from "path";
import {existsSync, mkdirSync, readFileSync, writeFileSync} from "fs";
import yaml from "js-yaml";
import {ChildProcess} from "child_process";
export const basePath=process.cwd()
export function hasPackageJson(projectPath){
    return existsSync(resolve(projectPath,'package.json'))
}
export const defaultConfig={
    uin:1472558369,
    password: '你的密码',
    plugins:{
        help: null,
        daemon: null,
        watcher:basePath
    },
    log_level:'info',
    plugin_dir:path.join(basePath,'plugins'),
    data_dir:path.join(basePath,'data'),
    delay:{},
    logConfig:{
        appenders: {
            consoleOut:{
                type: 'console'
            },
            saveFile: {
                type:'file',
                filename:path.join(process.cwd(),'logs.log')
            }
        },
        categories: {
            zhin: {
                appenders: ['consoleOut', 'saveFile'],
                level: 'info'
            }
        }
    },
}
export function makeDir(dirDesc:string){
    if(existsSync(dirDesc)) throw new Error(`文件夹(${dirDesc})已存在`)
    mkdirSync(dirDesc)
}
export function saveTo(filePath:string,content:string){
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

export async function promisify(cp:ChildProcess){
    return new Promise((res)=>{
        cp.stdout.on('data',(data)=>console.log(data))
        cp.stderr.on('data',(data)=>console.error(data))
        cp.on('exit',res)
    })
}