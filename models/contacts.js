const fs = require("fs/promises");
const path = require("path");
const dbPath = path.join(__dirname, "contacts.json");
const { v4: uuidv4 } = require("uuid");

const listContacts = async () => {
  try {
    const getAllContactsPromise = await fs.readFile(dbPath, "utf-8");
    const parsedContacts = JSON.parse(getAllContactsPromise);
    return parsedContacts;
  } catch (error) {
    console.log("error: ", error);
  }
};

const getContactById = async (contactId) => {
  const contacts = await listContacts();
  const result = contacts.find((el) => el.id === contactId);
  if (!result) {
    return null;
  }
  return result;
};

const removeContact = async (contactId) => {
  const allContacts = await listContacts();
  const index = allContacts.findIndex((el) => el.id === contactId);
  if (index === -1) {
    return null;
  }
  const deletedContact = allContacts.splice(index, 1);
  await fs.writeFile(dbPath, JSON.stringify(allContacts, null, 2));
  return deletedContact;
};

async function addContact(body) {
  try {
    const getContacts = await listContacts();
    const modifiedContacts = JSON.stringify(
      [...getContacts, { id: uuidv4(), ...body }],
      null,
      2
    );
    return await fs.writeFile(dbPath, modifiedContacts, "utf-8");
  } catch (error) {
    console.log("error: ", error);
  }
}

const updateContact = async (contactId, body) => {
  const allContacts = await listContacts();
  const index = allContacts.findIndex((el) => el.id === contactId);
  if (index === -1) {
    return null;
  }
  allContacts[index] = { ...body, id: contactId };
  await fs.writeFile(dbPath, JSON.stringify(allContacts, null, 2));
  return allContacts[index];
};

module.exports = {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
};
