# Telegram File System Bot (@run_ls_bot)

A Telegram bot that provides file system access via command-line operations. Explore the server's file system directly from Telegram.

> **Warning**: This bot allows file system access. Only run in trusted environments with access restricted to authorized users.

## Features

- Browse directories with `ls -la` style output
- Navigate the file system per-user (each user has their own working directory)
- Path validation to prevent directory traversal attacks
- Output truncation for Telegram's message limits

## Requirements

- [Deno](https://deno.land/) runtime
- Telegram bot token from [@BotFather](https://t.me/BotFather)

## Running the Bot

### 1. Install Deno

```bash
curl -fsSL https://deno.land/install.sh | sh
```

### 2. Set your bot token

```bash
export TELEGRAM_BOT_TOKEN='your-bot-token-here'
```

### 3. Run the bot

```bash
./bot.ts
```

Or explicitly with Deno:

```bash
deno run --allow-net --allow-env --allow-run --allow-read bot.ts
```

## Commands

| Command | Description |
|---------|-------------|
| `/start` | Welcome message with available commands |
| `/help` | Display help |
| `/ls [path]` | List directory contents (defaults to current directory) |
| `/pwd` | Show current working directory |
| `/cd <path>` | Change working directory |

## Adding the Bot to a Telegram Chat

### For Private Chats

1. Open Telegram and search for `@run_ls_bot`
2. Click **Start** to begin interacting with the bot
3. Send `/start` to see available commands

### For Group Chats

1. Open the group where you want to add the bot
2. Click the group name to open group info
3. Click **Add Members** (or **Edit** > **Add Members**)
4. Search for `@run_ls_bot` and select it
5. Click **Add** to confirm
6. The bot will now respond to commands in the group

> **Note**: In groups, you may need to mention the bot explicitly (e.g., `/ls@run_ls_bot`) unless the bot has privacy mode disabled.

## Restricting Access

By default, the bot allows all users. To restrict access to specific users, edit the `ALLOWED_USERS` set in `bot.ts`:

```typescript
const ALLOWED_USERS: Set<number> = new Set([
  123456789,  // Your Telegram user ID
  987654321,  // Another authorized user ID
]);
```

To find your Telegram user ID, you can use bots like [@userinfobot](https://t.me/userinfobot).

## License

MIT
