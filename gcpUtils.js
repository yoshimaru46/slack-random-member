import { SecretManagerServiceClient } from "@google-cloud/secret-manager";
import { Datastore } from "@google-cloud/datastore";

/**
 * Returns the secret string from Google Cloud Secret Manager
 * @param {string} name The name of the secret.
 * @return {payload} The string value of the secret.
 */
export const accessSecretVersion = async (name) => {
  const client = new SecretManagerServiceClient();
  const projectId = process.env.PROJECT_ID;
  const [version] = await client.accessSecretVersion({
    name: `projects/${projectId}/secrets/${name}/versions/1`,
  });
  // Extract the payload as a string.
  return version.payload.data.toString("utf8");
};

// Creates a client
const datastore = new Datastore();
const kind = "Installation";

export const store = async (id, data) => {
  const taskKey = datastore.key([kind, id]);
  const task = {
    key: taskKey,
    data,
  };
  await datastore.save(task);
};

export const find = async (id) => {
  const taskKey = datastore.key([kind, id]);
  return await datastore.get(taskKey).then((entity) => entity[0]);
};
