const electron = require("electron");
const url = require("url");
const path = require("path");
const { Menu } = require("electron/main");
const { app, BrowserWindow, ipcMain, webContents } = electron;

const fs = require("fs");

jsonData = require("./budget.json");

let mainWindow;
let addTask;

taskContents = [];

//knex
var knex = require("knex")({
	client: "sqlite3",
	connection: {
		filename: path.join(__dirname, "data.sqlite3"),
	},
});

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
	console.log("sent");
	sendBudget(jsonData.budget);

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
			mainWindow.reload();
		})
		.catch(function (error) {
			console.error(error);
		});
}

function createAddTask() {
	//create new window
	addTask = new BrowserWindow({
		width: 500,
		height: 700,
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

//catch all values from item:values =============================================================

ipcMain.on("item:values", function (e, item) {
	var insert1 = { task: item[0], points: item[1], time: item[2] };
	addTask.close();
	knex
		.insert(insert1)
		.into("task")
		.then(function (id) {
			updateTasks(taskContents);
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
		});
	knex("sqlite_sequence").where("name", "task").update({ seq: 0 }).then();
});

// end collection of toDelete ===================================================================

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
	console.log(item);
	addExpense.close();
	for (let i = 0; i < amount.length; i++) {
		var insertExpenses = { amount: amount[i], date: date[i], group: group[i] };
		// console.log(insertExpenses);

		knex
			.insert(insertExpenses)
			.into("expense")
			.then(() => {
				console.log("done");
			})
			.catch(function (error) {
				console.error(error);
			});
	}
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

globalBudget = 0;
//catch item:budget
ipcMain.on("item:budget", function (e, item) {
	console.log(item);
	var jsonData = require("./budget.json");
	let monthlyBudget = {
		budget: item,
		expenditure: jsonData.expenditure,
	};
	console.log(item);
	let data = JSON.stringify(monthlyBudget);
	console.log(data);
	fs.writeFileSync("budget.json", data);
	sendBudget(item);
	globalBudget = item;
	addBudget.close();
});

// check for refresh budget

ipcMain.on("restart:budget", function (e, item) {
	sendBudget(globalBudget);
	mainWindow.reload();
});

function sendBudget(budgetData) {
	let s = 0;

	knex("expense")
		.sum("amount as amt")
		.then((amt) => {
			for (var i = 0; i < amt.length; i++) {
				s = amt[i]["amt"];
			}
			console.log("budgetData: ", budgetData);
			let monthlyexpenditure = {
				budget: budgetData,
				expenditure: s,
			};
			let expenData = JSON.stringify(monthlyexpenditure);
			fs.writeFileSync("budget.json", expenData);
		});
}

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
				label: "Clear Items",
				click() {
					mainWindow.webContents.send("item:clear");
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
// var reload = () => {
// 	getCurrentWindow().reload();
// };
