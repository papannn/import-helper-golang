// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "tokopedia-import-helper" is now active!');

	context.subscriptions.push(vscode.workspace.onWillSaveTextDocument(() => {
		console.log("AAAA")
		let import_filter = {
			"usecase": "github.com/tokopedia/gamification-engine/usecase",
			"domain": "github.com/tokopedia/gamification-engine/domain",
			"lib": "github.com/tokopedia/gamification-engine/pkg/lib",
			"enum": "github.com/tokopedia/gamification-engine/common/enums",
		}
		let hasil_return = {
			"": [],
			"usecase": [],
			"domain": [],
			"lib": [],
			"other": [],
			"enum": []
		}
		// console.log("Test")
		const multilineImportsGroupRegex = /import \(([^)]+)\)/;
		// console.log(multilineImportsGroupRegex)
		let text = vscode.window.activeTextEditor.document.getText()
		let start = 0
		for (let line in text.split('\n')){
			console.log(text.split('\n')[line])
			if(text.split('\n')[line].includes('import (')){
				break;
			}
			start++;
		}
		let end = start
		for (var line of text.split('\n').slice(start)) {
			if (line.includes(')')) {
			  break;
			}
			end++;
		  }
		console.log(start)
		console.log(end)
		let range = new vscode.Range(start, 0, end, Number.MAX_VALUE)
		
		let importsMatch = text.match(multilineImportsGroupRegex)
		// console.log(importsMatch)
		let hasil = importsMatch[1].split('\n').filter(line => line.trim() != '');
		hasil.forEach((ele) => {
			let flag = false
			Object.entries(import_filter).forEach(([key, val]) => {
				// console.log(key); // the name of the current key.
				// console.log(val); // the value of the current key.
				if(ele.includes('//')){
					flag = true
				}
				
				if (!flag && ele.includes(val)){
					hasil_return[key].push(ele)
					flag = true
				}
				
			  });
			if(!flag){
				console.log("WAKARAI")
				console.log(ele)
				if(!ele.includes("github")) {
					hasil_return[''].push(ele);
				}else {
					hasil_return['other'].push(ele)
				}
			}
		})
		console.log(importsMatch)
		// console.log("COBA")
		let import_returns = "import (\n"

		// console.log(hasil)
		console.log(hasil_return)
		Object.entries(hasil_return).forEach(([key, val]) => {
			if(hasil_return[key].length !== 0){
				if(key !== "")
					import_returns += '\t//' + key + '\n'
				hasil_return[key].forEach(element => {
					import_returns += element + '\n';
				});
				import_returns += '\n'
			}
		})
		import_returns = import_returns.substr(0,import_returns.length-1);
		import_returns += ")"
		let edit = new vscode.WorkspaceEdit()
		edit.replace(vscode.window.activeTextEditor.document.uri, range, import_returns)
		vscode.workspace.applyEdit(edit).then(vscode.window.activeTextEditor.document.save)
		console.log(import_returns)
		// vscode.workspace.applyEdit()
	}))
	// The command has been defined in the package.json file
	// Now provide the implementation of the command with  registerCommand
	// The commandId parameter must match the command field in package.json
	// let disposable = vscode.commands.registerCommand('tokopedia-import-helper.helloWorld', function () {
	// 	// The code you place here will be executed every time your command is executed
	// 	// Display a message box to the user
	// 	vscode.window.showInformationMessage('Hello World!!! from tokopedia-import-helper!');
	// });

	// context.subscriptions.push(ini);
	// context.subscriptions.push(disposable);
	// vscode.workspace.onDidChangeConfiguration();
}

// this method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}
