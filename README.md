# 🕊️ hrt canary bot

hey! this is a discord bot that keeps an eye on canary messages for a few specific hrt homebrewers. it might work with other canaries too but i haven't tested it. i personally use it to watch astrovials' canary.

## 🌟 cool stuff it does

- 🔍 checks canary status automatically (so you don't have to)
- 📅 figures out when canaries were last updated
- 🚨 lets you know when stuff changes or gets old
- 📊 shows you what happened before with some fancy page buttons
- 💾 data is stored in sqlite and retained for a week
- 🎨 pretty discord messages
- 🔐 verifies canary pgp signatures

## 🛠️ commands

- `/check` - make it manually check the canary 
- `/status` - see what's up with the canary
- `/history [limit]` - look at old canary history (up to 25 entries)

## 🔧 how to set it up

1. download/clone the code
2. install dependencies:
   ```bash
   pnpm install
   ```
3. copy `.env.example` to `.env` and fill in your values:

4. turn it on:
   ```bash
   # if you're using linux, you can use pm2 to run it in the background and start on boot:
   npm install -g pm2
   pm2 start src/bot.js --name "canary-bot"
   pm2 save
   pm2 startup

   # or just run it directly:
   pnpm start
   ```

## ⚙️ changing stuff

- checks once a day at noon (you can change this with `CRON_SCHEDULE` in `.env`)
- retains data for a week
- looks at astrovials.com/canary.txt (change with `CANARY_URL` in `.env`)

## 🎨 what the colors mean

- 🟢 `#7eed87` - everything's good! canary is happy and working
- 🟡 `#ede07e` - hmm something changed, might wanna check that out
- 🔴 `#f07878` - uh oh! either something broke or the canary is super old
- 🎀 `#F5A9B8` - just pretty pink for all the menu stuff

## 🚀 stuff i might add later

if people actually care about this, i might:
- let it work on lots of servers
- let you choose when to get warnings
- make a website to control it
- watch multiple canaries at once

## ⚠️ btw

this is just my personal thing for watching canaries at the moment. 

if you wanna use it or help make it better, just let me know by making an issue or starring it!

## 📝 license

unlicense "license" (do whatever but don't sue me lol)
