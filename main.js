const electron = require("electron");
const url = require("url");
const path = require("path");
const { Menu } = require("electron/main");
const { app, BrowserWindow, ipcMain, webContents } = electron;

const fs = require("fs");

jsonData = require("./budget.json");
jsonDefine = require("./define.json");

let mainWindow;
let addTask;

taskContents = [];

//SET ENV

// process.env.NODE_ENV = "production";

//knex
var knex = require("knex")({
	client: "sqlite3",
	connection: {
		filename: path.join(__dirname, "data.sqlite3"),
	},
});

// class to make changes to json
class jsonUpdates {
	constructor() {
		this.budget = jsonData.budget;
		this.expenditure = jsonData.expenditure;
		this.food = jsonData.food;
		this.commute = jsonData.commute;
		this.education = jsonData.education;
		this.phonebill = jsonData.phonebill;
		this.otherbills = jsonData.otherbills;
		this.miscellaneous = jsonData.miscellaneous;
		this.experience = jsonData.experience;
		this.level = jsonData.level;

		this.mainFile = {
			budget: this.budget,
			expenditure: this.expenditure,
			food: this.food,
			education: this.education,
			commute: this.commute,
			phonebill: this.phonebill,
			otherbills: this.otherbills,
			miscellaneous: this.miscellaneous,
			experience: this.experience,
			level: this.level,
		};
		let data = JSON.stringify(this.mainFile, null, 2);
		fs.writeFileSync("budget.json", data);
	}
	changesToBudget(bud) {
		this.budget = bud;
		this.mainFile.budget = this.budget;
		let data = JSON.stringify(this.mainFile, null, 2);
		fs.writeFileSync("budget.json", data);
	}
	changesToExpenditure(expen) {
		this.expenditure = expen;
		this.mainFile.expenditure = this.expenditure;
		let data = JSON.stringify(this.mainFile, null, 2);
		fs.writeFileSync("budget.json", data);
	}
	changesToFood(foo) {
		this.food = foo == null ? 0 : foo;
		this.mainFile.food = this.food;
		let data = JSON.stringify(this.mainFile, null, 2);
		fs.writeFileSync("budget.json", data);
	}
	changesToEducation(edu) {
		this.education = edu == null ? 0 : edu;
		this.mainFile.education = this.education;
		let data = JSON.stringify(this.mainFile, null, 2);
		fs.writeFileSync("budget.json", data);
	}
	changesToCommute(com) {
		this.commute = com == null ? 0 : com;
		this.mainFile.commute = this.commute;
		let data = JSON.stringify(this.mainFile, null, 2);
		fs.writeFileSync("budget.json", data);
	}
	changesToPhonebill(pho) {
		this.phonebill = pho == null ? 0 : pho;
		this.mainFile.phonebill = this.phonebill;
		let data = JSON.stringify(this.mainFile, null, 2);
		fs.writeFileSync("budget.json", data);
	}
	changesToOtherbills(ob) {
		this.otherbills = ob == null ? 0 : ob;
		this.mainFile.otherbills = this.otherbills;
		let data = JSON.stringify(this.mainFile, null, 2);
		fs.writeFileSync("budget.json", data);
	}
	changesToMiscellaneous(misc) {
		this.miscellaneous = misc == null ? 0 : misc;
		this.mainFile.miscellaneous = this.miscellaneous;
		let data = JSON.stringify(this.mainFile, null, 2);
		fs.writeFileSync("budget.json", data);
	}
	changesToExperience() {
		this.experience = this.experience + 1.1;
		this.mainFile.experience = this.experience;
		let data = JSON.stringify(this.mainFile, null, 2);
		fs.writeFileSync("budget.json", data);
	}
	changesToExperience0() {
		this.experience = 0;
		this.mainFile.experience = this.experience;
		let data = JSON.stringify(this.mainFile, null, 2);
		fs.writeFileSync("budget.json", data);
	}
	changesToLevel() {
		this.level = this.level + 1;
		this.mainFile.level = this.level;
		let data = JSON.stringify(this.mainFile, null, 2);
		fs.writeFileSync("budget.json", data);
		mainWindow.reload();
	}
	reset() {
		this.budget = 0;
		this.expenditure = 0;
		this.food = 0;
		this.commute = 0;
		this.education = 0;
		this.phonebill = 0;
		this.otherbills = 0;
		this.miscellaneous = 0;
		this.experience = jsonData.experience;
		this.level = jsonData.level;

		this.mainFile = {
			budget: this.budget,
			expenditure: this.expenditure,
			food: this.food,
			education: this.education,
			commute: this.commute,
			phonebill: this.phonebill,
			otherbills: this.otherbills,
			miscellaneous: this.miscellaneous,
			experience: this.experience,
			level: this.level,
		};
		let data = JSON.stringify(this.mainFile, null, 2);
		fs.writeFileSync("budget.json", data);
		knex("expense")
			.del()
			.then(() => {});
	}
}

class jsonDefines {
	constructor() {
		this.term = jsonDefine.terms;
		this.define = jsonDefine.define;

		this.defineFile = {
			terms: this.term,
			define: this.define,
		};
	}
	changes(t, d) {
		this.term = t;
		this.define = d;
		this.defineFile.terms = this.term;
		this.defineFile.define = this.define;
		let data = JSON.stringify(this.defineFile);
		fs.writeFileSync("define.json", data);
		mainWindow.reload();
	}
}

defineJsonChanges = new jsonDefines();
allJsonChanges = new jsonUpdates();

class whichWindow {
	showTasks() {
		mainWindow.reload();
		mainWindow.webContents.on("did-finish-load", () => {
			mainWindow.webContents.send("whichWindow", "tasks");
		});
	}
	showExpenses() {
		mainWindow.reload();
		mainWindow.webContents.on("did-finish-load", () => {
			mainWindow.webContents.send("whichWindow", "expenses");
		});
	}
	showDefine() {
		mainWindow.reload();
		mainWindow.webContents.on("did-finish-load", () => {
			mainWindow.webContents.send("whichWindow", "define");
		});
	}
}

function updateRecur() {
	let arr = [];
	knex
		.select("value", "time")
		.from("recur")
		.then((rec) => {
			for (var i = 0; i < rec.length; i++) {
				arr.push(rec[i]);
			}
			mainWindow.webContents.on("did-finish-load", () => {
				mainWindow.webContents.send("item:recur", arr);
			});
		})
		.catch(function (error) {
			console.error(error);
		});
}

let switchWindow = new whichWindow();

//listen for the app to be ready

app.on("ready", function () {
	//create new window
	mainWindow = new BrowserWindow({
		width: 1100,
		webPreferences: { nodeIntegration: true },
		show: false,
	});
	mainWindow.maximize();
	mainWindow.loadURL(
		url.format({
			pathname: path.join(__dirname, "mainWindow.html"),
			protocol: "file:",
			slashes: true,
		})
	);

	// send data to mainWindow from here
	updateTasks(taskContents);
	updateRecur();
	groupExpenses();

	//Quit app when closed
	mainWindow.on("closed", function () {
		app.quit();
	});

	//BUild menu from template
	const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
	//Insert menu
	Menu.setApplicationMenu(mainMenu);
});

function updateTasks(arr) {
	arr = [];
	knex
		.select("task", "time")
		.from("task")
		.then((task) => {
			for (var i = 0; i < task.length; i++) {
				arr.push(task[i]);
			}
			mainWindow.webContents.on("did-finish-load", () => {
				mainWindow.webContents.send("item:task", arr);
			});
		})
		.catch(function (error) {
			console.error(error);
		});
}

function createAddTask() {
	//create new window
	addTask = new BrowserWindow({
		width: 500,
		height: 400, // earlier with points 700
		title: "Add Task",
		slashes: true,
		webPreferences: { nodeIntegration: true },
	});
	addTask.loadURL(
		url.format({
			pathname: path.join(__dirname, "templates/addTask.html"),
			protocol: "file:",
			slashes: true,
		})
	);
	// Garbage collection
	addTask.on("close", function () {
		addTask = null;
	});
	addTask.setMenuBarVisibility(false);
}

// level stuff
ipcMain.on("change:exp:0-&&-level:+1", function (e, item) {
	allJsonChanges.changesToExperience0();
	allJsonChanges.changesToLevel();
});

//catch all values from item:values =============================================================

ipcMain.on("item:values", function (e, item) {
	var insert1 = { task: item[0], time: item[1] }; // points: item[1],
	addTask.close();
	knex
		.insert(insert1)
		.into("task")
		.then(function (id) {
			updateTasks(taskContents);
			switchWindow.showTasks();
		})
		.catch(function (error) {
			console.error(error);
		});
});
// end collection for adding tasks =============================================================

//catch item:toDelete to delete =================================================================
ipcMain.on("item:toDelete", function (e, item) {
	knex("task")
		.where("task", item)
		.del()
		.then(() => {
			updateTasks(taskContents);
			allJsonChanges.changesToExperience();
			switchWindow.showTasks();
		});
});

// end collection of toDelete ===================================================================

// catch item:toDeleteList to delete from recur

ipcMain.on("item:toDeleteList", function (e, item) {
	knex("recur")
		.where("value", item)
		.del()
		.then(() => {
			updateRecur();
			allJsonChanges.changesToExperience();
			switchWindow.showExpenses();
		});
	knex("sqlite_sequence").where("name", "task").update({ seq: 0 }).then();
});

// end catch item:toDeleteList

function createAddExpense() {
	addExpense = new BrowserWindow({
		title: "Add Expense",
		slashes: true,
		webPreferences: { nodeIntegration: true },
		height: 600,
		width: 800,
	});
	addExpense.loadURL(
		url.format({
			pathname: path.join(__dirname, "templates/addExpense.html"),
			protocol: "file:",
			slashes: true,
		})
	);
	// Garbage collection
	addExpense.on("close", function () {
		addExpense = null;
	});
	addExpense.setMenuBarVisibility(false);
}

// catch item:expenses from addExpenses.html
ipcMain.on("item:expenses", function (e, item) {
	let amount = item.amount;
	let date = item.date;
	let group = item.group;
	// console.log(item);
	addExpense.close();
	for (let i = 0; i < amount.length; i++) {
		var insertExpenses = { amount: amount[i], date: date[i], group: group[i] };
		// console.log(insertExpenses);

		knex
			.insert(insertExpenses)
			.into("expense")
			.then(() => {
				// console.log("done");
			})
			.catch(function (error) {
				console.error(error);
			});
	}
	groupExpenses();
});

// add budget

function createAddBudget() {
	addBudget = new BrowserWindow({
		title: "Add Expense",
		slashes: true,
		webPreferences: { nodeIntegration: true },
		height: 300,
		width: 400,
	});
	addBudget.loadURL(
		url.format({
			pathname: path.join(__dirname, "templates/addBudget.html"),
			protocol: "file:",
			slashes: true,
		})
	);
	// Garbage collection
	addBudget.on("close", function () {
		addBudget = null;
	});
	addBudget.setMenuBarVisibility(false);
}

//catch item:budget
ipcMain.on("item:budget", function (e, item) {
	allJsonChanges.changesToBudget(item);
	groupExpenses();
	addBudget.close();
});

// check for refresh budget

ipcMain.on("restart:budget", function (e, item) {
	// groupExpenses();
	// mainWindow.reload();
	switchWindow.showExpenses();
});

// =======================

// reset all expenses
ipcMain.on("resetAll", function (e, item) {
	allJsonChanges.reset();
});

// Edit the different group expenses

function groupExpenses() {
	// expenditure
	knex("expense")
		.sum("amount as amt")
		.then((amt) => {
			for (var i = 0; i < amt.length; i++) {
				s = amt[i]["amt"];
			}
			allJsonChanges.changesToExpenditure(s);
		});

	// food
	knex("expense")
		.sum("amount as famt")
		.where({ group: "Food" })
		.then((famt) => {
			for (var i = 0; i < famt.length; i++) {
				f = famt[i]["famt"];
			}
			allJsonChanges.changesToFood(f);
		});

	// Education
	knex("expense")
		.sum("amount as eamt")
		.where({ group: "Education" })
		.then((eamt) => {
			for (var i = 0; i < eamt.length; i++) {
				e = eamt[i]["eamt"];
			}
			allJsonChanges.changesToEducation(e);
		});

	// Commute
	knex("expense")
		.sum("amount as camt")
		.where({ group: "Commute" })
		.then((camt) => {
			// console.log(camt);
			for (var i = 0; i < camt.length; i++) {
				c = camt[i]["camt"];
			}
			allJsonChanges.changesToCommute(c);
		});

	// Phone Bill
	knex("expense")
		.sum("amount as pamt")
		.where({ group: "Phone Bill" })
		.then((pamt) => {
			// console.log(camt);
			for (var i = 0; i < pamt.length; i++) {
				p = pamt[i]["pamt"];
			}
			allJsonChanges.changesToPhonebill(p);
		});

	// Other Bills
	knex("expense")
		.sum("amount as oamt")
		.where({ group: "Other Bills" })
		.then((oamt) => {
			// console.log(camt);
			for (var i = 0; i < oamt.length; i++) {
				o = oamt[i]["oamt"];
			}
			allJsonChanges.changesToOtherbills(o);
		});

	// Miscellaneous
	knex("expense")
		.sum("amount as mamt")
		.where({ group: "Miscellaneous" })
		.then((mamt) => {
			// console.log(camt);
			for (var i = 0; i < mamt.length; i++) {
				m = mamt[i]["mamt"];
			}
			allJsonChanges.changesToMiscellaneous(m);
		});
}

// Recurring expenses
function createAddRepeat() {
	addRepeat = new BrowserWindow({
		title: "Add Recurring Expenses",
		slashes: true,
		webPreferences: { nodeIntegration: true },
		height: 400,
		width: 600,
	});
	addRepeat.loadURL(
		url.format({
			pathname: path.join(__dirname, "templates/addRepeat.html"),
			protocol: "file:",
			slashes: true,
		})
	);
	// Garbage collection
	addRepeat.on("close", function () {
		addBudget = null;
	});
	addRepeat.setMenuBarVisibility(false);
}

ipcMain.on("item:recur", function (e, item) {
	addRepeat.close();
	var insert1 = { value: item[0], time: item[1] };
	let cols = ["value", "time"];
	knex
		.insert(insert1)
		.into("recur")
		.then(function (id) {
			updateRecur();
			switchWindow.showExpenses();
		})
		.catch(function (error) {
			console.error(error);
		});
});

// Dinitions

function currentdefinitions(t, d) {
	let ter = jsonDefine.terms;
	let def = jsonDefine.define;

	let currentDict = {};

	for (let i = 0; i < t.length; i++) {
		ter.push(t[i]);
		def.push(d[i]);
	}
	currentDict["terms"] = ter;
	currentDict["define"] = def;
	return currentDict;
}

ipcMain.on("dict:definitions", function (e, item) {
	let terms = item.term;
	let definitions = item.define;

	let currentDict = currentdefinitions(terms, definitions);
	defineJsonChanges.changes(currentDict.terms, currentDict.define);
	switchWindow.showDefine();
});

function deleteTableRow(ind) {
	let terms = jsonDefine.terms;
	let definitions = jsonDefine.define;

	terms.splice(ind, 1);
	definitions.splice(ind, 1);

	newDict = {};
	newDict["terms"] = terms;
	newDict["define"] = definitions;
	return newDict;
}

ipcMain.on("whichRowToDelete", function (e, item) {
	let currentDict = deleteTableRow(item);
	defineJsonChanges.changes(currentDict.terms, currentDict.define);
	switchWindow.showDefine();
});

// end definitions

function generateCSV() {
	let tempData = [];
	var data = [];
	// ["S.No", "Amount", "Date", "Group"]
	knex
		.select("amount", "date", "group")
		.from("expense")
		.then((csv) => {
			for (let i = 0; i < csv.length; i++) {
				tempData.push(csv[i]);
			}
			for (let i = 0; i < tempData.length; i++) {
				// console.log(tempData[i].amount);`
				arr = [i + 1, tempData[i].amount, tempData[i].date, tempData[i].group];
				data.push(arr);
			}

			function download_csv() {
				var csv2 = "S.No, Amount, Date, Group\n";
				data.forEach(function (row) {
					csv2 += row.join(",");
					csv2 += "\n";
				});
				return csv2;
			}
			let csv3 = download_csv();
			console.log(csv3);
			fs.writeFileSync("expenses.csv", csv3);
		})
		.catch(function (error) {
			console.error(error);
		});
}
ipcMain.on("download", (e, item) => {
	generateCSV();
});
// Create Menu Template

const mainMenuTemplate = [
	{
		label: "File",
		submenu: [
			{
				label: "Github Repo",
				click() {
					require("electron").shell.openExternal(
						"https://github.com/Rishi-Bidani/PlanGO"
					);
				},
			},
			{
				label: "Quit",
				accelerator: process.platform == "darwin" ? "command+Q" : "Ctrl+Q",
				click() {
					app.quit();
				},
			},
		],
	},
	{
		label: "Tasks",
		submenu: [
			{
				label: "Add Task",
				click() {
					createAddTask();
				},
				accelerator: process.platform == "darwin" ? "command+T" : "Ctrl+T",
			},
		],
	},
	{
		label: "Expenses",
		submenu: [
			{
				label: "Add Expenses",
				click() {
					createAddExpense();
				},
				accelerator: process.platform == "darwin" ? "command+E" : "Ctrl+E",
			},
			{
				label: "Add Budget",
				click() {
					createAddBudget();
				},
				accelerator: process.platform == "darwin" ? "command+B" : "Ctrl+B",
			},
			{
				label: "Add Recurring",
				click() {
					createAddRepeat();
				},
				accelerator: process.platform == "darwin" ? "command+P" : "Ctrl+P",
			},
		],
	},
];

// If mac, add empty object to menu => to push file to second

if (process.platform == "darwin") {
	mainMenuTemplate.unshift({}); // adds {} to starting of array
}

// Add developer tools item if not in production

if (process.env.NODE_ENV != "production") {
	mainMenuTemplate.push({
		label: "Developer Tools",
		submenu: [
			{
				label: "Toggle Devtools",
				accelerator: process.platform == "darwin" ? "command+I" : "Ctrl+I",

				click(item, focusedWindow) {
					focusedWindow.toggleDevTools();
				},
			},
			{
				role: "reload",
			},
		],
	});
}
