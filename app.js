import { WebClient } from "@slack/web-api";
import { App } from "@slack/bolt";
import { shuffle } from "./shuffle";
import { accessSecretVersion } from "./gcpUtils";
import { find, store } from "./datastore";

let web;

const app = new App({
  signingSecret:
    process.env.SLACK_SIGNING_SECRET ||
    (await accessSecretVersion("slack-signing-secret")),
  clientId:
    process.env.SLACK_CLIENT_ID ||
    (await accessSecretVersion("slack-client-id")),
  clientSecret:
    process.env.SLACK_CLIENT_SECRET ||
    (await accessSecretVersion("slack-client-secret")),
  stateSecret:
    process.env.SLACK_STATE_SECRET ||
    (await accessSecretVersion("slack-state-secret")),
  scopes: ["commands", "usergroups:read"],
  installationStore: {
    storeInstallation: async (installation) => {
      const kind = "Installation";
      await store(kind, installation.team.id, installation);
    },
    fetchInstallation: async (installQuery) => {
      const kind = "Installation";
      const installation = await find(kind, installQuery.teamId);
      if (installation) {
        web = new WebClient(installation.bot.token);
      }
      return installation;
    },
  },
});

app.command("/shufflet", async ({ command, ack, respond }) => {
  // コマンドリクエストを確認
  await ack();

  const HELP_TEXT = `
:wave: Need some help with /shufflet?

Select 1 member from selected a user group
\`/shufflet [user group]\`
      
Select a selected number of members.
\`/shufflet [user group] [number]\`
`;
  const SUPPORT_LINK = "https://forms.gle/gjCBiuYhohQNPuLe6";
  const SUPPORT_TEXT = `<${SUPPORT_LINK}|Contact Support>`;

  const args = command.text.split(" ");

  if (command.text === "" || args[0] === "help") {
    await respond([HELP_TEXT, SUPPORT_TEXT].join("\n"));
    return;
  }

  const groupName = args[0];
  const takeSize = args[1] || 1;

  const groupId = groupName.replace("<!subteam^", "").split("|")[0];
  const members = await web.usergroups.users
    .list({ usergroup: groupId })
    .then((members) => members.users)
    .catch((e) => {
      console.error(e);
    });
  if (members === undefined) {
    await respond(`User group could not be found.`);
    return;
  }

  // takeSizeに応じてメンバーを取得
  const selectedMembers = shuffle(members).slice(0, takeSize);
  const message =
    selectedMembers.map((m) => `\`<@${m}>\``).join(", ") +
    ` (from \`${groupName}\` by ${command.user_name})`;

  await respond({ response_type: "in_channel", text: message });
});

(async () => {
  // Start your app
  await app.start(process.env.PORT || 3000);
  console.log("⚡️ Bolt app is running!");
})();
