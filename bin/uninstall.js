const modules = [
  '../profile',
  '../strategy/map',
  '../strategy/force',
  '../strategy/faction'
];

async function run(){
  console.log("Uninstall started");
  for(let i in modules){
    let mod = require(modules[i]);
    try{
      await mod.uninstall();
    } catch(e){
      console.log(e);
    }

  }
  console.log("Uninstall complete");
}

run();