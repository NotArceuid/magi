import { dev } from "$app/environment";

export interface ConsoleCommand {
  name: string;
  description: string;
  execute: (args: string[]) => void;
}

export class ConsoleCommandManager {
  private commands = new Map<string, ConsoleCommand>();

  registerCommand(command: ConsoleCommand) {
    this.commands.set(command.name.toLowerCase(), command);
  }

  executeCommand(input: string): string {
    if (!dev)
      return "no cheating broo";

    const [cmd, ...args] = input.trim().split(' ');
    const command = this.commands.get(cmd.toLowerCase());

    if (!command) {
      return `Unknown command: ${cmd}. Type 'help' for available commands.`;
    }

    try {
      command.execute(args);
      return `Executed: ${cmd} ${args.join(' ')}`;
    } catch (error: any) {
      return `Error executing ${cmd}: ${error.message}`;
    }
  }

  getHelp(): string {
    let help = 'Available commands:\n';
    this.commands.forEach((cmd, name) => {
      help += `  ${name} - ${cmd.description}\n`;
    });
    return help;
  }

  getAllCommands(): ConsoleCommand[] {
    return Array.from(this.commands.values());
  }
}
