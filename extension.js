const vscode = require('vscode');
const config = require('./config')

function activate(context) {
	context.subscriptions.push(vscode.workspace.onWillSaveTextDocument(() => {
		const orgName = config.orgs
		const repoName = vscode.workspace.name

		const categories = {
			go: [],
			self: {
				usecase: [],
				domain: [],
				grpc: [],
				nsq: [],
				http: [],
				lib: [],
				enum: [],
			},
			self_etc: [],
			sister: {
				tdk: [],
				proto: [],
			},
			sister_etc: [],
			third_party: [],
		}

		// get import lines
		const currentWindow = vscode.window.activeTextEditor.document.getText()
		const importRegex = /import \(([^)]+)\)/;
		const importsMatch = currentWindow.match(importRegex)
		const imports = (importsMatch[1] || '').split('\n').filter(line => line.trim() != '')

		// push import line to respective categories
		imports.forEach(line => {
			// skip comment
			if (line.startsWith('\t//')) return

			// local repo
			if (line.includes(`${orgName}/${repoName}`)) {
				for (const category in categories.self) {
					if (line.includes(category)) return categories.self[category].push(line)
				}

				return categories.self_etc.push(line)
			}

			// sister repo (same orgs)
			if (line.includes(orgName)) {
				for (const category in categories.sister) {
					if (line.includes(category)) return categories.sister[category].push(line)
				}

				return categories.sister_etc.push(line)
			}

			// built in and third party
			if (line.includes('github')) return categories.third_party.push(line)
			if (line.includes('.')) return categories.third_party.push(line)

			categories.go.push(line)
		})

		// import name adapter
		const import_name_map = {
			go: '',
			self_etc: 'other',
			sister_etc: `other ${orgName} repo`,
		}

		// get categories string recursively
		const processCategory = (name, category) => {
			let result = ''

			// control recursive flows
			if (!category) return
			if (category instanceof Object)
				Object.entries(category).forEach(([key, value]) => result += processCategory(key, value))
			if (!(category instanceof Array)) return result
			if (!category.length) return result

			// get import name
			const importName = import_name_map[name] != null ? import_name_map[name] : name
			if (importName) result += `\t//${importName}\n`

			category.forEach(el => result += `${el}\n`)
			return result + '\n'
		}

		// get new import lines
		const newImportLines = processCategory('', categories).replace(/\n$/, "") // remove last new line
		const result = `import (\n${newImportLines})`
		const lines = currentWindow.split('\n')
		const startIndex = lines.findIndex(el => el.includes('import ('))
		const endIndex = lines.findIndex((el, i) => el.includes(')') && i > startIndex)

		// edit & save workspace
		const edit = new vscode.WorkspaceEdit()
		const range = new vscode.Range(startIndex, 0, endIndex, Number.MAX_VALUE)
		edit.replace(vscode.window.activeTextEditor.document.uri, range, result)
		vscode.workspace.applyEdit(edit).then(vscode.window.activeTextEditor.document.save)
	}))
}

function deactivate() { }

module.exports = {
	activate,
	deactivate
}