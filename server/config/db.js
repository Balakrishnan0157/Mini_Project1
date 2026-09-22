const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '..', 'data');
const dbFilePath = path.join(dataDir, 'db.json');

// Ensure data directory exists
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Initial Data Structure
const defaultData = {
  users: [],
  careers: [],
  colleges: [],
  assessments: []
};

// Read database from file
function readDb() {
  try {
    if (!fs.existsSync(dbFilePath)) {
      fs.writeFileSync(dbFilePath, JSON.stringify(defaultData, null, 2), 'utf-8');
      return defaultData;
    }
    const raw = fs.readFileSync(dbFilePath, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading database file:', err);
    return defaultData;
  }
}

// Save database to file atomically
function writeDb(data) {
  try {
    fs.writeFileSync(dbFilePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing database file:', err);
  }
}

// Database helper object
const db = {
  read: readDb,
  write: writeDb,

  getCollection(collectionName) {
    const data = readDb();
    return data[collectionName] || [];
  },

  find(collectionName, filterFn) {
    const list = this.getCollection(collectionName);
    return filterFn ? list.filter(filterFn) : list;
  },

  findOne(collectionName, filterFn) {
    const list = this.getCollection(collectionName);
    return list.find(filterFn) || null;
  },

  insert(collectionName, item) {
    const data = readDb();
    if (!data[collectionName]) data[collectionName] = [];
    
    // Auto-generate numeric ID
    const maxId = data[collectionName].reduce((max, i) => (i.id > max ? i.id : max), 0);
    item.id = maxId + 1;
    item.created_at = new Date().toISOString();

    data[collectionName].push(item);
    writeDb(data);
    return item;
  },

  update(collectionName, filterFn, updateData) {
    const data = readDb();
    if (!data[collectionName]) return null;

    let updatedItem = null;
    data[collectionName] = data[collectionName].map(item => {
      if (filterFn(item)) {
        updatedItem = { ...item, ...updateData, updated_at: new Date().toISOString() };
        return updatedItem;
      }
      return item;
    });

    if (updatedItem) writeDb(data);
    return updatedItem;
  },

  delete(collectionName, filterFn) {
    const data = readDb();
    if (!data[collectionName]) return false;

    const initialLength = data[collectionName].length;
    data[collectionName] = data[collectionName].filter(item => !filterFn(item));

    if (data[collectionName].length !== initialLength) {
      writeDb(data);
      return true;
    }
    return false;
  }
};

module.exports = db;
