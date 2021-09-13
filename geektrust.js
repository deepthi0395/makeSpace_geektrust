const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());
const dbPath = path.join(__dirname, "towers.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();

//middle ware for valid time or not
const isValidTime = (request, response, next) => {
  const { start_time, end_time } = request.body;
  const parseOfStartTime = parseFloat(start_time);
  const parseOfEndTime = parseFloat(end_time);

  // if start time is greater than end time
  if (parseOfEndTime - parseOfStartTime <= 0) {
    response.send("INCORRECT_INPUT");
  } else {
    const accessTheStartMin = start_time.toString().split(".")[1];
    const accessTheEndMin = end_time.toString().split(".")[1];
    //to check time time is 15 min interval or not
    if (
      (accessTheStartMin === "15" ||
        accessTheStartMin === "30" ||
        accessTheStartMin === "00" ||
        accessTheStartMin === "45" ||
        accessTheStartMin === "0") &&
      (accessTheEndMin === "0" ||
        accessTheEndMin === "00" ||
        accessTheEndMin === "15" ||
        accessTheEndMin === "30" ||
        accessTheEndMin === "45")
    ) {
      //to check buffer time
      if (
        (parseOfStartTime === 09.0 && parseOfEndTime === 09.15) ||
        (parseOfStartTime === 13.15 && parseOfEndTime === 13.45) ||
        (parseOfStartTime === 18.45 && parseOfEndTime === 19.0) ||
        parseOfStartTime === 09.0 ||
        parseOfStartTime === 13.15 ||
        parseOfStartTime === 18.45
      ) {
        response.send(" NO_VACANT_ROOM(Buffer Time)");
      } else {
        next();
      }
    } else {
      //console.log(accessTheStartMin);
      response.send("INCORRECT_INPUT(15)");
    }
  }
};

// middle ware for valid persons or not
const isValidPersons = (request, response, next) => {
  const { person } = request.body;
  if (person >= 2 && person <= 20) {
    next();
  } else {
    response.send("NO_VACANT_ROOM");
  }
};

app.post(
  "/bookMeetingRoom/",
  isValidTime,
  isValidPersons,
  async (request, response) => {
    const { start_time, end_time, person } = request.body;
    //console.log(end_time);
    let available = request.query.check_available;
    console.log(available);
    //if user want to book meeting hall
    if (available === "book") {
      //if persons are b/w 2 to 3
      if (person >= 2 && person <= 3) {
        //checking in the db if in that time meeting hall booked or not
        const isValidQueryFor2to3Persons = `select * from timings_avalibality 
        where start_time = ${start_time} and  end_time = ${end_time} and towers_id = 1 ;`;
        const availabilityStatusFor2to3persons = await db.get(
          isValidQueryFor2to3Persons
        );
        //if meeting hall is vacant
        if (availabilityStatusFor2to3persons === undefined) {
          //response.send("C-cave Booked");
          //inserting data to the db
          const insertToC_caveQuery = `INSERT INTO timings_avalibality (start_time , end_time , avalibility ,person , towers_id) 
            VALUES (${start_time} , ${end_time} , "Booked" , ${person} , 1) ;`;
          const InsertDataToDataBase = await db.run(insertToC_caveQuery);
          response.send(`C-Cave Booked ${start_time} ${end_time} ${person}`);
        }
      }

      if (person >= 2 && person <= 7) {
        const isValidQueryFor2to7Persons = `select * from timings_avalibality 
        where start_time =  ${start_time} and  end_time = ${end_time} and  towers_id = 2 ;`;
        const availabilityStatusFor2to7persons = await db.get(
          isValidQueryFor2to7Persons
        );
        if (availabilityStatusFor2to7persons === undefined) {
          const insertToD_towerQuery = `INSERT INTO timings_avalibality (start_time , end_time , avalibility ,person , towers_id) 
            VALUES (${start_time} , ${end_time} , "Booked" , ${person} , 2) ;`;
          const InsertDataToDataBase = await db.run(insertToD_towerQuery);
          console.log(InsertDataToDataBase);
          //console.log(insertToC_caveQuery);
          response.send(`D_tower Booked ${start_time} ${end_time} ${person}`);
        }
      }
      if (person >= 2 && person <= 20) {
        const isValidQueryFor2to20Persons = `select * from timings_avalibality 
        where start_time = ${start_time} and end_time = ${end_time} and towers_id = 3  ;`;
        const availabilityStatusFor2to20persons = await db.get(
          isValidQueryFor2to20Persons
        );
        if (availabilityStatusFor2to20persons === undefined) {
          //response.send("G-Mansion Booked");
          const insertToG_mansionQuery = `INSERT INTO timings_avalibality (start_time , end_time , avalibility ,person , towers_id) 
            VALUES (${start_time} , ${end_time} , "Booked" , ${person} , 3) ;`;
          const InsertDataToDataBase = await db.run(insertToG_mansionQuery);
          response.send(`G-mansion Booked ${start_time} ${end_time} ${person}`);
        } else {
          response.send("No Vacancy");
        }
      } else {
        response.send("No Vacancy");
      }
    }
    // to know the vacancy of the meeting halls
    else if (available === "vacancy") {
      const checkingTheVacancyQuery = `select * from timings_avalibality 
        where start_time = ${start_time}  and end_time = ${end_time};`;
      const bookedDetails = await db.all(checkingTheVacancyQuery);
      //console.log(bookedDetails);
      const bookedTowers = [];
      for (let tower of bookedDetails) {
        bookedTowers.push(tower.towers_id);
      }
      //console.log(`${bookedTowers} booked Towers`);
      const total_towers = [1, 2, 3];
      let unique1 = total_towers.filter((o) => bookedTowers.indexOf(o) === -1);
      let unique2 = bookedTowers.filter((o) => total_towers.indexOf(o) === -1);
      const vacancyTower = unique1.concat(unique2);
      //console.log(`${vacancyTower} unique tower`);
      const towerNames = [];
      for (let i = 0; i < vacancyTower.length; i++) {
        const vacancyTowerQuery = `select towers.name
       from towers INNER JOIN timings_avalibality ON 
       towers.id = timings_avalibality.towers_id
        where towers_id = ${vacancyTower[i]} ORDER BY towers_id ;`;
        const vacancy = await db.get(vacancyTowerQuery);
        //console.log(vacancy);
        towerNames.push(vacancy);
      }
      if (towerNames.length > 1) {
        response.send(towerNames);
      } else {
        response.send("NO Vacancy");
      }
    }
  }
);
