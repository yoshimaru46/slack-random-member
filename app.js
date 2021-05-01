const { App } = require("@slack/bolt");
const { WebClient } = require("@slack/web-api");
const { SecretManagerServiceClient } = require("@google-cloud/secret-manager");

/**
 * Returns the secret string from Google Cloud Secret Manager
 * @param {string} name The name of the secret.
 * @return {payload} The string value of the secret.
 */
async function accessSecretVersion(name) {
  const client = new SecretManagerServiceClient();
  const projectId = process.env.PROJECT_ID;
  const [version] = await client.accessSecretVersion({
    name: `projects/${projectId}/secrets/${name}/versions/1`,
  });
  // Extract the payload as a string.
  return version.payload.data.toString("utf8");
}

const token =
  process.env.SLACK_BOT_TOKEN || (await accessSecretVersion("slack-bot-token"));
const signingSecret =
  process.env.SLACK_SIGNING_SECRET ||
  (await accessSecretVersion("slack-signing-secret"));

const web = new WebClient(token);
// Initializes your app with your bot token and signing secret
const app = new App({
  token,
  signingSecret,
});

function shuffle(arr) {
  let n = arr.length;
  let temp, i;

  while (n) {
    i = Math.floor(Math.random() * n--);
    temp = arr[n];
    arr[n] = arr[i];
    arr[i] = temp;
  }
  return arr;
}

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
