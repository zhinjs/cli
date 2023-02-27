import path, {resolve} from "path";
import {existsSync, mkdirSync, readFileSync, writeFileSync} from "fs";
import yaml from "js-yaml";
import fs from "fs";
import {promisify} from "util";
export const basePath=process.cwd()
export function hasPackageJson(projectPath){
    return existsSync(resolve(projectPath,'package.json'))
}
export async function copyDir(src:string, dest:string,ignore:string) {
    const files = await fsp.readdir(src);
    for(const item of files){
        const itemPath = path.join(src, item);
        const itemStat = await fsp.stat(itemPath);// 获取文件信息
        const savedPath =path.join(dest, item);
        if (itemStat.isFile()) {
            await fsp.copyFile(itemPath,savedPath);
        } else if (itemStat.isDirectory()) {
            if(ignore && item===ignore) {
                continue;
            }
            await fsp.mkdir(savedPath, {recursive: true});
            await copyDir(itemPath, savedPath,ignore);
        }
    }
}
export async function removeDir(dirPath){
    if(!fs.existsSync(dirPath)) return
    const fileStat=await fsp.stat(dirPath)
    if(fileStat.isFile()) return
    const files=await fsp.readdir(dirPath)
    for(const file of files){
        const subDir=path.join(dirPath,file)
        const stat=await fsp.stat(path.join(dirPath,file))
        if(stat.isDirectory()){
            await removeDir(subDir)
        }else{
            fsp.unlink(subDir)
        }
    }
    await fsp.rmdir(dirPath)
}

export const fsp=Object.fromEntries(Object.keys(fs).map(key=>{
    return [
        key,
        typeof fs[key]==='function'?promisify(fs[key]):fs[key]
    ]
}))
export const defaultConfig={
    adapters:{
        icqq:{
            bots:[]
        }
    },
    plugins:{
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
