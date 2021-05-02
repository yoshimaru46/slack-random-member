import { WebClient } from "@slack/web-api";
import { App } from "@slack/bolt";
import { shuffle } from "./shuffle";
import { accessSecretVersion, find, store } from "./gcpUtils";

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
      await store(installation.team.id, installation);
    },
    fetchInstallation: async (installQuery) => {
      const installation = await find(installQuery.teamId);
      if (installation) {
        web = new WebClient(installation.bot.token);
      }
      return installation;
    },
  },
});

app.command("/random", async ({ command, ack, respond }) => {
  // コマンドリクエストを確認
  await ack();

  if (command.text === "") {
    await respond(
      "Please enter in the following format, `/random [@user-group-name] [number] `"
    );
    return;
  }

  const args = command.text.split(" ");
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
  const message = selectedMembers.map((m) => `\`<@${m}>\``).join(", ");

  await respond({ response_type: "in_channel", text: message });
});

(async () => {
  // Start your app
  await app.start(process.env.PORT || 3000);
  console.log("⚡️ Bolt app is running!");
})();
