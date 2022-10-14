import {CAC} from "cac";
import {resolve} from "path";
import {writeFileSync} from 'fs'
import {execSync} from "child_process";
import yaml from 'js-yaml'
import axios from "axios";
import inquirer,{DistinctQuestion} from 'inquirer'
import {hasPackageJson, defaultConfig, basePath, makeDir} from "@/utils";
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
        type:'number',
        message:'请输入登录账号',
        name:'uin'
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
        message:'请输入登录密码'
    },{
        type:'list',
        default:4,
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
                value:3
            },
            {
                name:'iPad',
                value:5
            }
        ]
    },
    {
        type:'number',
        message:'填写机器人拥有者qq，(该qq有操作机器人的所有权限)',
        name:'master',
        default:'1659488338'
    },
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
    }
]
async function getPackages(){
    let total:number=0,result:Package[]=[]
    do{
        const searchResult:Result=await axios.get('https://registry.npmjs.org/-/v1/search?text=zhin+plugin').then(res=>res.data)
        total=searchResult.total
        result.push(...searchResult.objects.map(obj=>obj.package))
    }while (total>result.length)
    console.log(result)
    return result
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
            const {isPwdLogin,...config}=await inquirer.prompt(questions)
            await choosePlugins()
            const mergedConfig=Object.assign({...defaultConfig},config)
            const configPath=resolve(projectPath,'zhin.yaml')
            console.log('配置文件已保存到:'+configPath)
            // 存配置
            writeFileSync(configPath,yaml.dump(mergedConfig),'utf8')
            console.log('正在安装项目依赖')
            // 装项目运行依赖
            execSync(`npm install ${dependencies.join(' ')} --save`,{cwd:projectPath,stdio:[0,1,2]})
            console.log('正在安装开发环境依赖')
            // 装开发依赖
            execSync(`npm install ${devDependencies.join(' ')} --save-dev`,{cwd:projectPath,stdio:[0,1,2]})
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
function onCancel(){
    console.log('终止操作:用户取消')
    process.exit()
}
export async function initProject(projectPath){
    const {confirmInit}=await inquirer.prompt({
        type:'confirm',
        name:'confirmInit',
        message:'未找到package.json,是否为您创建？'
    })
    if(confirmInit){
        execSync('npm init -y',{env:{executePath:projectPath}})
    }else{
        throw new Error('终止操作：请手动初始化package.json后重新执行指令')
    }
}