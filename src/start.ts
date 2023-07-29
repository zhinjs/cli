import {CAC} from "cac";
import {spawn} from "child_process";

export default function registerStartCommand(cli:CAC){
    cli.command('start','启动知音')
        .option('-d,--dev','开发模式')
        .action(async (options)=>{
            const cp = spawn('npm', ['run',options?.d||options?.dev?'dev':'start'], { stdio: 'inherit' });
            cp.stdout?.on('data', data => process.stdout.push(data));
            cp.stderr?.on('data', data => process.stderr.push(data));
            process.stdin?.on('data', data => cp.stdin?.write(data));
            cp.on('close', code => console.log(`child process exited with code ${code}\n`));
        })
}
