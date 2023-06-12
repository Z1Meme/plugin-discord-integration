import { BasePlugin } from "@h1z1-server/out/servers/ZoneServer2016/managers/pluginmanager.js";
import { ZoneServer2016} from "@h1z1-server/out/servers/ZoneServer2016/zoneserver.js";
import { ZoneClient2016 as Client } from "@h1z1-server/out/servers/ZoneServer2016/classes/zoneclient";

export default class ServerPlugin extends BasePlugin {
  public name = "Plugin Template";
  public description = "This is a template for an h1z1-server plugin.";
  public author = "H1emu";
  public version = "0.1";

  private chatTextMessage!: string;

  /**
   * This method is called by PluginManager, do NOT call this manually
   * Use this method to set any plugin properties from the values in your config.yaml
  */ 
  public loadConfig(config: any) {
    this.chatTextMessage = config.chatTextMessage;
  }
  
  public async init(server: ZoneServer2016): Promise<void> {

    // an example of how to override the default behavior of any public ZoneServer2016 function
    const sendChatText = server.sendChatText;
    server.sendChatText = (client: Client, message: string, clearChat?: boolean) => {
      server.sendAlert(client, this.chatTextMessage);
      sendChatText.call(server, client, message, clearChat);
    }
  }

}