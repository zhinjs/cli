import {CAC} from "cac";
import {resolve} from "path";
import {writeFileSync} from 'fs'
import {execSync} from "child_process";
import yaml from 'js-yaml'
import axios from "axios";
import inquirer,{DistinctQuestion} from 'inquirer'
import {hasPackageJson, defaultConfig, basePath, makeDir, saveTo, hasJsonConfig} from "@/utils";
interface AuthorInfo{
    name:string
    username:string
    email:string
}
interface LinkInfo{
    bugs:string
    homepage:string
    npm:string
    repository:string
}
export interface AvatarInfo{
    large:string
    medium:string
    small:string
}
interface PublisherInfo{
    avatars:AvatarInfo
    name:string
}

interface Package{
    author:AuthorInfo
    description:string
    keywords:string[]
    links:LinkInfo
    maintainers:Pick<AuthorInfo, 'username'|'email'>
    name:string
    publisher:PublisherInfo
    scope:string
    version:string
}
interface Obj{
    package:Package,
    flags:any[]
}
interface Result{
    objects:Obj[]
    total:number
}
const dependencies=['zhin']
const devDependencies=['@types/koa','tsc-alias','typescript','tsconfig-paths']
const questions:DistinctQuestion[]=[
    {
        type:'input',
        message:'定义插件存放目录(基于项目根目录的相对路径)',
        default:'plugins',
        name:'plugin_dir'
    },{
        type:'input',
        message:'定义数据存放目录(基于项目根目录的相对路径)',
        default:'data',
        name:'data_dir'
    },{
        type:'list',
        message:'选择适配器',
        default:'icqq',
        name:'adapter',
        choices:[
            {
                name:'icqq(内置)，已完成开发',
                value:'icqq'
            }
        ]
    }
]
const onebotQuestions:DistinctQuestion[]=[
    {
        type:'list',
        message:'请选择通信方式',
        name:'type',
        choices:[
            {
                name:'HTTP（接受事件有延迟）',
                value:'http'
            },
            {
                name:'Webhook（发起动作有延迟）',
                value:'webhook'
            },
            {
                name:'Websocket',
                value:'ws'
            },
            {
                name:'WebsocketReverse',
                value:'ws_reverse'
            },
        ]
    },
    {
        type:'input',
        name:'url',
        when:(answers)=>['http','ws'].includes(answers.type),
        message:'请输入服务端连接地址'
    },
    {
        type:'input',
        name:'self_id',
        when:(answers)=>['http','ws'].includes(answers.type),
        message:'请输入机器人唯一标识'
    },
    {
        type:'number',
        name:'get_events_interval',
        when:(answers)=>['http'].includes(answers.type),
        message:'请输入轮询事件间隔时间（毫秒）',
        default:3000
    },
    {
        type:'number',
        name:'events_buffer_size',
        when:(answers)=>['http'].includes(answers.type),
        message:'请输入事件缓冲区大小',
        default:10,
    },
    {
        type:'number',
        name:'timeout',
        when:(answers)=>['http'].includes(answers.type),
        message:'请输入请求超时时间（毫秒）',
        default:60000,
    },
    {
        type:'input',
        name:'path',
        when:(answers)=>['webhook','ws_reverse'].includes(answers.type),
        message:'请输入服务监听路径(/开头)',
        default:(answers)=>answers.type==='webhook'?'/onebot/webhook':'/onebot/ws/12'
    },
    {
        type:'input',
        name:'self_id_key',
        when:(answers)=>['webhook','ws_reverse'].includes(answers.type),
        message:'请输入机器人唯一标识键名',
        default:'self_id'
    },
    {
        type:'input',
        name:'get_actions_path',
        when:(answers)=>['webhook','ws_reverse'].includes(answers.type),
        message:'请输入协议端可获取动作的请求路径(基于服务监听路径)',
        default:'/get_latest_actions'
    },
    {
        type:'input',
        name:'access_token',
        when:(answers)=>['http','ws'].includes(answers.type),
        message:'请输入access_token(如果有)'
    },
]
const icqqQuestions:DistinctQuestion[]=[
    {
        type:'number',
        message:'请输入机器人登录qq',
        name:'self_id'
    },{
        type:'confirm',
        name:'isPwdLogin',
        default:true,
        message:'是否使用密码登陆'
    }, {
        type:'password',
        when:(answers)=>answers.isPwdLogin,
        name:'password',
        default:'',
        message:'请输入机器人登录密码'
    },{
        type:'list',
        default:5,
        message:'请选择登录协议',
        name:'platform',
        choices:[
            {
                name:'安卓手机',
                value:1
            },
            {
                name:'安卓平板',
                value:2
            },
            {
                name:'安卓手表',
                value:3
            },
            {
                name:'macos',
                value:4
            },
            {
                name:'iPad',
                value:5
            }
        ]
    },
    {
        type:'number',
        message:'填写机器人主人qq，(一般是你自己的qq)',
        name:'master',
        default:1659488338
    }
]
async function getPackages(){
    let total:number=0,result:Package[]=[]
    try{
        do{
            const searchResult:Result=await axios.get('https://registry.npmjs.org/-/v1/search?text=zhin+plugin').then(res=>res.data)
            total=searchResult.total
            result.push(...searchResult.objects.map(obj=>obj.package))
        }while (total>result.length)
    }catch {}
    return result
}
function getConfigJson(projectPath:string){
    let configJsonName=hasJsonConfig(projectPath)
    if(!configJsonName){
        configJsonName='tsconfig.json'
        saveTo(resolve(projectPath,configJsonName),JSON.stringify({
            "compilerOptions": {
                "jsx": "preserve",
                "jsxFactory": "h",
                "jsxFragmentFactory": "Element.Fragment",
                "jsxInject": "import { h, Element } from 'zhin';"
            }
        },null,4))
    }
    return {
        path:resolve(projectPath,configJsonName),
        value:require(resolve(projectPath,configJsonName))
    }
}
export default function registerInitCommand(cli:CAC){
    cli.command('init [projectName]','初始化zhin')
        .action(async (projectName)=>{
            let projectPath=basePath
            if(projectName){
                await makeDir(projectName)
                projectPath+=`/${projectName}`
            }
            if(!hasPackageJson(projectPath)){
                await initProject(projectPath)
            }
            const packageJson=require(resolve(projectPath,'package.json'))
            const configJson=getConfigJson(projectPath)
            if(!packageJson.scripts) packageJson.scripts={
                "start:zhin":"start-zhin"
            };
            else{
                packageJson.scripts['start:zhin']="start-zhin"
            }
            configJson.value.compilerOptions={
                ...configJson.value.compilerOptions,
                "jsx": "preserve",
                "jsxFactory": "h",
                "jsxFragmentFactory": "Element.Fragment",
                "jsxInject": "import { h, Element } from 'zhin';"
            }
            saveTo(configJson.path,JSON.stringify(configJson.value,null,4))
            saveTo(resolve(projectPath,'package.json'),JSON.stringify(packageJson,null,4))
            const {adapter,...config}=await inquirer.prompt(questions)
            if(adapter==='icqq'){
                const {isPwdLogin,...firstConfig}=await inquirer.prompt(icqqQuestions)
                config.adapters={
                    icqq:{
                        bots:[firstConfig]
                    }
                }
            }else if(adapter==='onebot'){
                const {...firstConfig}=await inquirer.prompt(onebotQuestions)
                config.adapters={
                    onebot:{
                        bots:[firstConfig]
                    }
                }
            }
            await choosePlugins()
            const mergedConfig=Object.assign({...defaultConfig},config)
            const configPath=resolve(projectPath,'zhin.yaml')
            console.log('配置文件已保存到:'+configPath)
            // 存配置
            writeFileSync(configPath,yaml.dump(mergedConfig),'utf8')
            console.log('正在安装项目依赖')
            // 装项目运行依赖
            execSync(`npm install ${dependencies.join(' ')} --save`,{cwd:projectPath})
            console.log('正在安装开发环境依赖')
            // 装开发依赖
            execSync(`npm install ${devDependencies.join(' ')} --save-dev`,{cwd:projectPath})
            // 建插件目录
            makeDir(resolve(projectPath,config.plugin_dir))
            console.log(`zhin初始化完成,请使用以下命令启动zhin`)
            if(projectName){
                console.log(`cd ${projectName}`)
            }
            console.log(`zhin start`)
        })
}
async function choosePlugins(){
    const canInstallList=await getPackages()
    const choices=canInstallList.map((pkg,i)=>{
        return {
            title:`${i+1} ${pkg.name}@${pkg.version} (${pkg.description})`,
            value:`${pkg.name}@${pkg.version}`
        }
    })
    const {plugins}=await inquirer.prompt([{
        type:'checkbox',
        name:'plugins',
        message:'选择官方插件进行安装',
        choices
    }])
    for (const plugin of plugins){
        if(plugin.startsWith('@zhinjs/plugin-database')){
            // todo 让用户自行选择使用什么数据库
            devDependencies.push('mysql2')
        }
        dependencies.push(plugin)
    }
}
export async function initProject(projectPath){
    const {confirmInit}=await inquirer.prompt({
        type:'confirm',
        name:'confirmInit',
        message:'未找到package.json,是否为您创建？'
    })
    if(confirmInit){
        execSync('npm init -y',{cwd:projectPath})
    }else{
        throw new Error('终止操作：请手动初始化package.json后重新执行指令')
    }
}
