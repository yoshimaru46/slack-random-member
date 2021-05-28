import { Datastore } from "@google-cloud/datastore";

// Creates a client
const datastore = new Datastore();

export const store = async (kind, id, data) => {
  const taskKey = datastore.key([kind, id]);
  const task = {
    key: taskKey,
    data,
  };
  await datastore.save(task);
};

export const find = async (kind, id) => {
  const taskKey = datastore.key([kind, id]);
  return await datastore.get(taskKey).then((entity) => entity[0]);
};
