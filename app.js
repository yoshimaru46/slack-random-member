import { WebClient } from "@slack/web-api";
import { App } from "@slack/bolt";
import { shuffle } from "./shuffle";
import { accessSecretVersion } from "./gcpUtils";

const database = {};

// TODO
let token = 'hoge'

const web = new WebClient(token);

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
  scopes: ["commands"],
  installationStore: {
    storeInstallation: async (installation) => {
      // 実際のデータベースに保存するために、ここのコードを変更
      database[installation.team.id] = installation;
      console.log("!!!");
      console.dir(database, { depth: 5 });
    },
    fetchInstallation: async (installQuery) => {
      return database[installQuery.teamId];
    },
  },
});

app.command("/random", async ({ command, ack, respond }) => {
  // コマンドリクエストを確認
  await ack();

  if (command.text === "") {
    await respond(`/random [@グループ名] [数] の形式で入力してください！`);
    return;
  }

  const args = command.text.split(" ");
  const groupName = args[0];
  const takeSize = args[1] || 1;

  const groupId = groupName.replace("<!subteam^", "").split("|")[0];
  const members = await web.usergroups.users
    .list({ usergroup: groupId })
    .then((members) => members.users)
    .catch((_e) => {
      // noop
    });
  if (members === undefined) {
    await respond(`グループが見つかりませんでした`);
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
