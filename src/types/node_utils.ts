import { type Node, Display, Check, Twisty } from "@/types/node"

// ツリー表示順でトラバース
export function traverse(node: Node | null, callback: (node: Node, path: string[]) => void): void {
	if (node == null) {
		return
	}

	const stack: [number, Node][] = [[0, node]]
	const path: string[] = []

	while (0 < stack.length) {
		const [depth, current] = stack.pop()!

		while (depth < path.length) {
			path.pop()
		}
		path.push(current.id)

		callback(current, path)

		if (current.children) {
			for (let i = current.children.length - 1; 0 <= i; i--) {
				stack.push([path.length, current.children[i]!])
			}
		}
	}
}

// 親方向にトラバース
export function traverseParent(node: Node | null, callback: (node: Node) => void): void {
	let current = node
	while (current) {
		callback(current)
		current = current.parent
	}
}

type Position = {
	parent: Node
	index: number
}

// 指定ノードの切り取り
// 成功時は元親ノードと元位置を返す
export function cut(node: Node): Position | null {
	if (node.parent == null || node.parent.children == null) {
		return null
	}

	const index = node.parent.children.indexOf(node)
	if (index < 0) {
		return null
	}

	const originalParent = node.parent

	node.parent.children.splice(index, 1)
	node.parent = null

	return {
		parent: originalParent,
		index: index,
	}
}

// 指定ノードの前に追加
// 成功時は更新された親ノードと位置を返す
export function joinPrev(siblings: Node, node: Node): Position | null {
	if (siblings.parent == null || siblings.parent.children == null) {
		return null
	}

	const index = siblings.parent.children.indexOf(siblings)
	if (index < 0) {
		return null
	}

	siblings.parent.children.splice(index, 0, node)
	node.parent = siblings.parent

	const depth = siblings.parent.depth
	traverse(siblings.parent, (v, p) => {
		v.depth = depth + p.length - 1
	})

	return {
		parent: siblings.parent,
		index: index,
	}
}

// 指定ノードの後に追加
// 成功時は更新された親ノードと位置を返す
export function joinNext(siblings: Node, node: Node): Position | null {
	if (siblings.parent == null || siblings.parent.children == null) {
		return null
	}

	const index = siblings.parent.children.indexOf(siblings)
	if (index < 0) {
		return null
	}

	siblings.parent.children.splice(index + 1, 0, node)
	node.parent = siblings.parent

	const depth = siblings.parent.depth
	traverse(siblings.parent, (v, p) => {
		v.depth = depth + p.length - 1
	})

	return {
		parent: siblings.parent,
		index: index + 1,
	}
}

// 指定ノードの子に追加
// 成功時は更新された親ノードと位置を返す
export function joinNest(parent: Node, node: Node, index: number = 0): Position | null {
	if (parent.children == null) {
		return null
	}

	parent.children.splice(index, 0, node)
	node.parent = parent

	const depth = parent.depth
	traverse(parent, (v, p) => {
		v.depth = depth + p.length - 1
	})

	return {
		parent: parent,
		index: index,
	}
}

export function updateDisplay(children: Node[] | null, display: Display): void {
	if (children == null) {
		return
	}

	for (const node of children) {
		traverse(node, (v) => {
			if (display == Display.Hide) {
				v.display = Display.Hide
			} else if (v.parent && v.parent.twisty == Twisty.Opened && v.parent.display == Display.Show) {
				v.display = Display.Show
			}
		})
	}
}

export function updateCheck(children: Node[] | null, check: Check): void {
	if (children == null) {
		return
	}

	for (const node of children) {
		traverse(node, (v) => {
			v.check = check
		})
	}
}

export function updateCheckParent(node: Node | null): void {
	if (node == null) {
		return
	}

	traverseParent(node, (v) => {
		if (v.children == null || v.children.length == 0) {
			return
		}

		let all = 0
		let cnt = 0
		let ind = 0

		for (const vv of v.children) {
			all++
			if (vv.check == Check.Checked) {
				cnt++
			} else if (vv.check == Check.Indeterminate) {
				ind++
			}
		}

		if (all == cnt) {
			v.check = Check.Checked
		} else if (cnt == 0 && ind == 0) {
			v.check = Check.Unchecked
		} else {
			v.check = Check.Indeterminate
		}
	})
}
