#!/usr/bin/env -S deno run --allow-net --allow-env --allow-run --allow-read --allow-import

/**
 * Telegram bot that provides file system access via ls command.
 *
 * WARNING: This bot allows file system access. Only run it in trusted environments
 * and restrict access to authorized users only.
 */

import "https://deno.land/std@0.224.0/dotenv/load.ts";
import { Bot, Context } from "https://deno.land/x/grammy@v1.21.1/mod.ts";

// Get bot token from environment (loaded from .env)
const BOT_TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN");

if (!BOT_TOKEN) {
  console.error("Error: Please set TELEGRAM_BOT_TOKEN environment variable");
  console.error("  export TELEGRAM_BOT_TOKEN='your-bot-token-here'");
  Deno.exit(1);
}

// Optional: Restrict to specific user IDs for security
// Add your Telegram user ID(s) here to restrict access
const ALLOWED_USERS: Set<number> = new Set(); // Empty means all users allowed

// Store current working directory per user
const userCwd: Map<number, string> = new Map();

function isAuthorized(userId: number): boolean {
  if (ALLOWED_USERS.size === 0) return true;
  return ALLOWED_USERS.has(userId);
}

function getCwd(userId: number): string {
  return userCwd.get(userId) || Deno.cwd();
}

// Create bot instance
const bot = new Bot(BOT_TOKEN);

// Start command
bot.command("start", async (ctx: Context) => {
  await ctx.reply(
    `File System Bot (Deno)

Commands:
/ls [path] - List directory contents
/pwd - Show current working directory
/cd <path> - Change directory (for subsequent commands)
/help - Show this help message`
  );
});

// Help command
bot.command("help", async (ctx: Context) => {
  await ctx.reply(
    `Commands:
/ls [path] - List directory contents
/pwd - Show current working directory
/cd <path> - Change directory
/help - Show this help`
  );
});

// ls command
bot.command("ls", async (ctx: Context) => {
  const userId = ctx.from?.id;
  if (!userId || !isAuthorized(userId)) {
    await ctx.reply("Unauthorized.");
    return;
  }

  const args = ctx.match?.toString().trim() || "";
  const path = args || ".";
  const cwd = getCwd(userId);

  try {
    const command = new Deno.Command("ls", {
      args: ["-la", path],
      cwd: cwd,
      stdout: "piped",
      stderr: "piped",
    });

    const { code, stdout, stderr } = await command.output();
    const decoder = new TextDecoder();

    let output = code === 0 ? decoder.decode(stdout) : decoder.decode(stderr);

    // Truncate if too long for Telegram (max 4096 chars)
    if (output.length > 4000) {
      output = output.substring(0, 4000) + "\n... (truncated)";
    }

    if (!output.trim()) {
      output = "(empty directory)";
    }

    await ctx.reply(`\`\`\`\n${output}\n\`\`\``, { parse_mode: "Markdown" });
  } catch (error) {
    await ctx.reply(`Error: ${error instanceof Error ? error.message : String(error)}`);
  }
});

// pwd command
bot.command("pwd", async (ctx: Context) => {
  const userId = ctx.from?.id;
  if (!userId || !isAuthorized(userId)) {
    await ctx.reply("Unauthorized.");
    return;
  }

  const cwd = getCwd(userId);
  await ctx.reply(`\`\`\`\n${cwd}\n\`\`\``, { parse_mode: "Markdown" });
});

// cd command
bot.command("cd", async (ctx: Context) => {
  const userId = ctx.from?.id;
  if (!userId || !isAuthorized(userId)) {
    await ctx.reply("Unauthorized.");
    return;
  }

  const path = ctx.match?.toString().trim();
  if (!path) {
    await ctx.reply("Usage: /cd <path>");
    return;
  }

  const currentCwd = getCwd(userId);

  // Resolve the new path
  let newPath: string;
  if (path.startsWith("/")) {
    newPath = path;
  } else {
    newPath = `${currentCwd}/${path}`.replace(/\/+/g, "/");
  }

  // Normalize path (resolve . and ..)
  try {
    const realPath = await Deno.realPath(newPath);
    const stat = await Deno.stat(realPath);

    if (stat.isDirectory) {
      userCwd.set(userId, realPath);
      await ctx.reply(`Changed directory to:\n\`\`\`\n${realPath}\n\`\`\``, {
        parse_mode: "Markdown",
      });
    } else {
      await ctx.reply(`Not a directory: ${path}`);
    }
  } catch {
    await ctx.reply(`Not a valid directory: ${path}`);
  }
});

// Start the bot
console.log("Bot starting... Press Ctrl+C to stop.");
bot.start();
