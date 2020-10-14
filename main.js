const electron = require("electron");
const url = require("url");
const path = require("path");
const { Menu } = require("electron/main");
const { app, BrowserWindow, ipcMain, webContents } = electron;

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

	updateTasks(taskContents);

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
			pathname: path.join(__dirname, "addTask.html"),
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
	console.log(item);
	knex("task")
		.where("task", item)
		.del()
		.then(() => {
			updateTasks(taskContents);
		});
});

// end collection of toDelete ===================================================================

// Create Menu Template

const mainMenuTemplate = [
	{
		label: "File",
		submenu: [
			{
				label: "Add Item",
				click() {
					createAddTask();
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
