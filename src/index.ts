import {cac,CAC} from "cac";
import registerInitCommand from "@/init";
import registerStartCommand from "@/start";
import registerNewPluginCommand from "@/new";
import {registerBuildPluginCommand} from "@/build";
import {registerPubPluginCommand} from "@/pub";
const cli:CAC=cac('zhin')
    .version(require('../package.json').version)
registerInitCommand(cli)
registerStartCommand(cli)
registerNewPluginCommand(cli)
registerBuildPluginCommand(cli)
registerPubPluginCommand(cli)
cli.help()
cli.parse()
