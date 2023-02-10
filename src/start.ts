import {CAC} from "cac";
import {spawn} from "child_process";

export default function registerStartCommand(cli:CAC){
    cli.command('start','启动知音')
        .action(async ()=>{
            const node = spawn('npm', ['run','start:zhin'], { stdio: 'inherit' });
            node.stdout?.on('data', data => process.stdout.push(data));
            node.stderr?.on('data', data => process.stderr.push(data));
            process.stdin?.on('data', data => node.stdin.write(data));
            node.on('close', code => console.log(`child process exited with code ${code}\n`));
        })
}