// Helper classes for database
const sqlite3 = require('sqlite3').verbose();

class DatabaseHelper{
  constructor(databaseFile){
    this.db = new sqlite3.Database(databaseFile);
  }

  run(sql){
    let obj = this;
    return new Promise(function(resolve, reject){
        obj.db.get(sql, function(err, row){
            if(err){
                console.log("Err " + err);
                reject(err);
            }
            resolve(row);
        });
    });
  }

  selectRow(sql){
    let obj = this;
    return new Promise(function(resolve, reject){
        obj.db.get("SELECT " + sql, function(err, row){
            if(err){
                reject(err);
            }
            resolve(row);
        });
    });
  }

  select(sql){
    let obj = this;
    return new Promise(function(resolve, reject){
        obj.db.all("SELECT " + sql, function(err, rows){
            if(err){
                reject(err);
            }
            resolve(rows);
        });
    });
  }

  insert(sql, rows){
    let obj = this;
    return new Promise(function(resolve, reject){
      let stmt = obj.db.prepare("INSERT " + sql);
      try{
        for(let i in rows){
          let row = rows[i];
          stmt.run(row);  
        }
      } catch(err){
        reject(err);
      }
      stmt.finalize();
      resolve();
    });
  }

  insertOrReplace(sql, rows){
    let obj = this;
    return new Promise(function(resolve, reject){
      let stmt = obj.db.prepare("INSERT OR REPLACE " + sql);
      try{
        for(let i in rows){
          let row = rows[i];
          stmt.run(row);  
        }
      } catch(err){
        reject(err);
      }
      resolve();
    });
  }

  delete(sql, args){
    let obj = this;
    return new Promise(function(resolve, reject){
      obj.db.run("DELETE " + sql, args, function(err) {
        if (err) {
          reject(err);
        }
        resolve();
      });
    });
  }

  update(sql, row){
    let obj = this;
    return new Promise(function(resolve, reject){
      obj.db.run("UPDATE " + sql, row, function(err) {
        if (err) {
          reject(err);
        }
        resolve();
      });
    });
  }
}

class DatabaseTable{
  constructor(settings){
    this.db = new DatabaseHelper(settings.path);
    this.tableName = settings.name;
    this.columns = settings.columns;
  }

  async install(){
    let obj = this;
    let query = `CREATE TABLE IF NOT EXISTS ${obj.tableName} (\n `;
    query += obj.columns.join(", \n\t") + "\n)";

    console.log(`Installing ${obj.tableName}`);
    await obj.db.run(query);
  }

  async uninstall(){
    let obj = this;
    console.log(`Uninstalling ${obj.tableName}`);
    return obj.db.run(`DROP TABLE IF EXISTS ${obj.tableName}`);
  }
}

class DatabaseSchema{
  constructor(settings){
    let obj = this;
    this.tables = [];
    for(let i in settings.tables){
      let tableSettings = settings.tables[i];
      tableSettings.path = settings.path;
      obj.tables.push(new DatabaseTable(tableSettings));
    }
  }

  async install(){
    let obj = this;
    for(let i in obj.tables){
      let table = obj.tables[i];
      await table.install();
    }
  }

  async uninstall(){
    let obj = this;
    for(let i in obj.tables){
      let table = obj.tables[i];
      await table.uninstall();
    }
  }
}

module.exports = {
  Db: DatabaseHelper,
  DbTable: DatabaseTable,
  DbSchema: DatabaseSchema
}