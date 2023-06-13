import { BasePlugin } from "@h1z1-server/out/servers/ZoneServer2016/managers/pluginmanager.js";
import { ZoneServer2016 } from "@h1z1-server/out/servers/ZoneServer2016/zoneserver.js";
import { ZoneClient2016 as Client } from "@h1z1-server/out/servers/ZoneServer2016/classes/zoneclient";

import axios from 'axios';
import { DamageInfo } from "@h1z1-server/out/types/zoneserver";

export default class ServerPlugin extends BasePlugin {
  public name = "DiscordIntegration";
  public description = "Discord integration tools.";
  public author = "Meme";
  public version = "0.1"

  private playerDeathWebhook!: string;
  private adminCommandWebhook!: string;

  /**
   * This method is called by PluginManager, do NOT call this manually
   * Use this method to set any plugin properties from the values in your config.yaml
  */ 
  public loadConfig(config: any) {
    this.playerDeathWebhook = config.playerDeathWebhook;
    this.adminCommandWebhook = config.adminCommandWebhook;
  }

  public async init(server: ZoneServer2016): Promise<void> {
    console.log("DiscordIntegration initialized.")
    
    this.registerCommandHooks(server);

    this.registerPlayerDeathHook(server);

  }

  registerPlayerDeathHook(server: ZoneServer2016) {
    const logPlayerDeath = server.logPlayerDeath;
    server.logPlayerDeath = (client: Client, damageInfo: DamageInfo) => {
      const sourceClient = server.getClientByCharId(damageInfo.entity);
      const entityName = sourceClient ? sourceClient.character.name : damageInfo.entity;

      const weaponItemDef = server.getItemDefinition(damageInfo.weapon),
      weaponName = weaponItemDef ? weaponItemDef.MODEL_NAME : "undefined";

      this.sendWebhookMessage(this.playerDeathWebhook, `${entityName} has killed ${client.character.name} using ${weaponName}`);
      logPlayerDeath.call(server, client, damageInfo);
    }
  }

  registerCommandHooks(server: ZoneServer2016) {
    const executeCommand = server._packetHandlers.commandHandler.executeCommand;
    server._packetHandlers.commandHandler.executeCommand = (server: ZoneServer2016, client: Client, packet: any) => {
      const hash = packet.data.commandHash,
      command = server._packetHandlers.commandHandler.commands[hash];
      if(command) {
        this.sendCommandWebhook(client, command.name, packet.data.arguments);
      }
      executeCommand.call(server._packetHandlers.commandHandler, server, client, packet);
    }

    
    const executeInternalCommand = server._packetHandlers.commandHandler.executeInternalCommand;
    server._packetHandlers.commandHandler.executeInternalCommand = (server: ZoneServer2016, client: Client, commandName: string, packet: any) => {
      this.sendCommandWebhook(client, commandName, "");
      executeInternalCommand.call(server._packetHandlers.commandHandler, server, client, commandName, packet);
    }
  }

  async sendWebhookMessage(webhookUrl: string, content: string) {
    try {
      await axios.post(webhookUrl, { content });
      console.log('Webhook message sent successfully.');
    } catch (error: any) {
      console.error('Error sending webhook message:', error.message);
    }
  }

  sendCommandWebhook(client: Client, commandName: string, args: string) {
    const message = `\`${client.character.name}: /${commandName} ${args}\``;
    this.sendWebhookMessage(this.adminCommandWebhook, message);
  }

}