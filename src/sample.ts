import { type Node, Display, Twisty, Check, Over } from "@/types/node"

type Data = {
	id: string
	children?: Data[]
}

function gen1(size: number, prefix: string = ""): Data[] {
	const children: Data[] = []
	for (let i = 1; i <= size; i++) {
		children.push({ id: `${prefix}${i}` })
	}
	return children
}

function gen2(level: number, limit: number, prefix: string = ""): Data[] {
	if (limit < level) {
		return []
	}
	return [
		{
			id: `${prefix}1`,
			children: gen2(level + 1, limit, `${prefix}1-`),
		},
		{
			id: `${prefix}2`,
		},
	]
}

function gen3(level: number, limit: number, prefix: string = ""): Data[] {
	if (limit < level) {
		return []
	}
	return [
		{
			id: `${prefix}1`,
		},
		{
			id: `${prefix}2`,
			children: gen3(level + 1, limit, `${prefix}2-`),
		},
	]
}

const sample: Data = {
	id: "root",
	children: [
		{
			id: "A",
			children: gen1(9, "A-"),
		},
		{
			id: "B",
			children: gen2(1, 9, "B-"),
		},
		{
			id: "C",
			children: gen3(1, 9, "C-"),
		},
	],
}

function traverse(data: Data, callback: (data: Data, path: string[]) => void): void {
	const stack: [number, Data][] = [[0, data]]
	const path: string[] = []

	while (0 < stack.length) {
		const [depth, current] = stack.pop()!

		while (depth < path.length) {
			path.pop()
		}
		path.push(current.id)

		callback(current, path)

		for (const child of (current.children ?? []).toReversed()) {
			stack.push([path.length, child])
		}
	}
}

export function root(): Node {
	const map: Map<string, Node> = new Map()

	traverse(sample, (data, path) => {
		const node: Node = {
			id: data.id,
			name: data.id,

			depth: path.length - 1,
			parent: null,
			children: data.children ? [] : null,

			display: Display.Show,
			twisty: data.children ? Twisty.Opened : Twisty.None,
			check: Check.Unchecked,

			dd: {
				over: Over.None,
				draggable: false,
				dragging: false,
				prev: false,
				next: false,
				nest: false,
			},
		}
		map.set(node.id, node)

		const parent = map.get(path.at(-2) ?? "")
		if (parent && Array.isArray(parent.children)) {
			node.parent = parent
			node.dd.draggable = true
			parent.children.push(node)
		}
	})

	return map.get(sample.id)!
}
