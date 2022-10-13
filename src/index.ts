import {cac,CAC} from "cac";
import {resolve} from 'path'
import {existsSync} from 'fs'
import registerInitCommand from "@/init";
import registerStartCommand from "@/start";
import registerPluginCommand from "@/plugin";
const cli:CAC=cac('zhin')
    .version(require('../package.json').version)
registerInitCommand(cli)
registerStartCommand(cli)
registerPluginCommand(cli)
cli.help()
cli.parse()
