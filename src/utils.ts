import path, {resolve} from "path";
import {existsSync, mkdirSync, readFileSync, writeFileSync} from "fs";
import yaml from "js-yaml";
import {ChildProcess} from "child_process";
export const basePath=process.cwd()
export function hasPackageJson(projectPath){
    return existsSync(resolve(projectPath,'package.json'))
}
export const defaultConfig={
    adapters:{
        icqq:{
            bots:[]
        }
    },
    plugins:{
        help: null,
        config: null,
        daemon: null,
        login: null,
        logs: null,
        plugin: null,
        status: null,
        watcher:basePath
    },
    log_level:'info',
    plugin_dir:path.join(basePath,'plugins'),
    data_dir:path.join(basePath,'data'),
    delay:{
        prompt:60000
    }
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
