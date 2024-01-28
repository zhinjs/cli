import {CAC} from "cac";
import * as fs from 'fs'
import * as os from 'os'
import {NodeSSH} from "node-ssh";
import archiver from 'archiver'
import * as process from "process";
import path from "path";
import {removeDir,copyDir,fsp} from "@/utils";
const ssh = new NodeSSH()

interface Config {
    host: string
    uname: string
    key:string
    upass: string
    direct: string

}
const projectPath=path.dirname(process.cwd())
const projectName=process.cwd().replace(`${projectPath}${path.sep}`,'')
const distDir=path.join(projectPath,`${projectName}_dist`)
const startDeploy = async (config:Config) => {
    const output = fs.createWriteStream(path.join(projectPath,`${projectName}_dist.zip`));
    const archive = archiver('zip', {
        zlib: { level: 3 },
    }).on('error', (err) => {
        throw err;
    });
    output.on('close', async (err) => {
        if (err) {
            console.log('打包项目文件失败:', err);
            return;
        }
        console.log('项目压缩包已制作完成，开始上传...');
        await uploadFile(config);
        await removeDir(distDir)
        await fsp.unlink(path.join(projectPath,`${projectName}_dist.zip`))
        process.exit(0)
    });
    output.on('end', () => {
        console.log('Data has been drained');
    });
    console.log('正在制作项目压缩包');
    archive.pipe(output);
    await createDistFile()
    archive.directory(distDir, projectName);
    await archive.finalize();
    await deleteDistFile()
}
async function createDistFile(){
    await fsp.mkdir(distDir,{recursive:true})
    await copyDir(process.cwd(),distDir,'node_modules')
}
async function deleteDistFile(){
    await removeDir(distDir)
}
async function uploadFile(config: Config) {
    if(!config.upass && await fsp.exists(config.key)) config.key=await fsp.readFile(config.key,{encoding:'utf8'})
    await ssh.connect({
        host: config.host,
        username: config.uname,
        privateKey: config.upass ? undefined : config.key,
        password: config.upass ? config.upass : undefined
    }).catch((err) => {
        console.log('连接远程服务器失败:', err);
        process.exit(0);
    })
    console.log('登录远程服务器成功');
    // 为避免第一次时报错，尝试建一下文件夹
    await ssh.execCommand(`mkdir ${config.direct}`).catch(()=>{})
    // 给服务器上的项目做个备份，避免部署失败时，文件丢失
    await backupProject(config)
    // 上传网站的发布包至configs中配置的远程服务器的指定地址
    await ssh.putFile(path.join(projectPath,`${projectName}_dist.zip`), `zhin.zip`).catch((err) => {
        console.log('上传项目压缩包失败，请发送错误信息到zhin群获取解答:', err);
        process.exit(0);
    });
    console.log('上传项目压缩包成功,开始部署...');
    await remoteStart(config);// 上传成功后触发远端脚本
}
async function backupProject(config:Config){
    await ssh.execCommand(`cp -r ${config.direct} ${config.direct+'_backup'}`)
}
async function restoreProject(config:Config){
    await ssh.execCommand(`mv ${config.direct+"_backup"} ${config.direct}`)
}
const remoteStart = async (config: Config) => {
    let result=await ssh.execCommand(`unzip zhin.zip`)
    if (!result.stderr) {
        console.log('解压项目文件成功!');
    } else {
        console.log('解压项目文件失败，请发送错误信息到zhin群获取解答:', result);
        await ssh.execCommand(`rm zhin.zip && rm -rf ${config.direct}`)
        await restoreProject(config)
        process.exit(0);
    }
    result=await ssh.execCommand('npm install', {cwd: config.direct})
    if (result.code===0) {
        console.log('已安装项目依赖!');
    } else {
        console.log('安装依赖失败，请发送错误信息到zhin群获取解答:', result);
        await ssh.execCommand(`rm zhin.zip && rm -rf ${config.direct}`)
        await restoreProject(config)
        process.exit(0);
    }
    result=await ssh.execCommand('pm2 start npm --name zhin -- run start:zhin', {cwd: config.direct})
    if (!result.stderr) {
        console.log('zhin已使用pm2在服务器启动成功!');
    } else {
        console.log('使用pm2启动zhin失败，请发送错误信息到zhin群获取解答:', result);
        await ssh.execCommand(`rm zhin.zip && rm -rf ${config.direct}`)
        await restoreProject(config)
        process.exit(0);
    }
    await ssh.execCommand(`rm -rf zhin.zip rm -rf ${config.direct+"_backup"}`)
    ssh.dispose()
};
export default function registerDeployCommand(cli: CAC) {
    cli.command('deploy <remoteAddr>', '部署zhin到远程服务器')
        .option('-u,--uname [uname]', '登录用户名', {default: 'root'})
        .option('-p,--upass [upass]', '登录密码，不填则使用秘钥登录')
        .option('-k,--key [key]','登录秘钥文件路径，默认：~/.ssh/{remoteArr}.pem')
        .option('-d,--direct [direct]', '部署到指定目录，默认：~/{projectName}')
        .action(async (remoteArr, options) => {
            await startDeploy({
                host:remoteArr,
                uname:options.u||options.uname,
                key:options.k||options.key||path.resolve(os.homedir(),'.ssh',`${remoteArr}.pem`),
                upass:options.p||options.upass,
                direct:options.d||options.direct||projectName,
            })
        })
}
