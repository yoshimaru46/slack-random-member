import { SecretManagerServiceClient } from "@google-cloud/secret-manager";

/**
 * Returns the secret string from Google Cloud Secret Manager
 * @param {string} name The name of the secret.
 * @param {number} version The version of the secret.
 * @return {payload} The string value of the secret.
 */
export const accessSecretVersion = async (name, version = 1) => {
  const client = new SecretManagerServiceClient();
  const projectId = process.env.PROJECT_ID;
  const [version] = await client.accessSecretVersion({
    name: `projects/${projectId}/secrets/${name}/versions/${version}`,
  });
  // Extract the payload as a string.
  return version.payload.data.toString("utf8");
};
