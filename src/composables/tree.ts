import * as vue from "vue"

import { type Node, Display, Twisty, Check, Over } from "@/types/node"
import {
	traverse,
	updateDisplay,
	updateCheck,
	updateCheckParent,
	cut,
	joinPrev,
	joinNext,
	joinNest,
} from "@/types/node_utils"

type Data = {
	/** ツリーのルートノード */
	root: Node | null
	/** ドラッグ中のノード */
	drag: Node | null
	/** ドラッグ中のノードの表示用要素 */
	ghost: HTMLElement | null
}

function setup() {
	const data = vue.reactive<Data>({
		root: null,
		drag: null,
		ghost: null,
	})

	const list = vue.computed<Node[]>(() => {
		if (data.root == null) {
			return []
		}

		const list: Node[] = []
		traverse(data.root, (node) => {
			if (node.display == Display.Hide) {
				return
			}
			list.push(node)
		})
		return list
	})

	const twisty = (node: Node) => {
		switch (node.twisty) {
			case Twisty.Opened:
				node.twisty = Twisty.Closed
				updateDisplay(node.children, Display.Hide)
				break
			case Twisty.Closed:
				node.twisty = Twisty.Opened
				updateDisplay(node.children, Display.Show)
				break
		}
	}

	const check = (node: Node) => {
		switch (node.check) {
			case Check.Checked:
				node.check = Check.Unchecked
				updateCheck(node.children, Check.Unchecked)
				updateCheckParent(node.parent)
				break
			case Check.Unchecked:
			case Check.Indeterminate:
				node.check = Check.Checked
				updateCheck(node.children, Check.Checked)
				updateCheckParent(node.parent)
				break
		}
	}

	// dragstart
	// 引数はドラッグノード
	const dragstart = (event: DragEvent, node: Node) => {
		if (!node.dd.draggable) {
			event.preventDefault() // ドラッグ不可
			return
		}

		data.drag = node

		// ゴースト設定
		if (data.ghost != null && event.dataTransfer != null) {
			const rect = data.ghost.getBoundingClientRect()
			event.dataTransfer.setDragImage(data.ghost, rect.width / 2, rect.height / 2)
		}

		// ドラッグ中のノードの更新
		traverse(data.drag, (v) => {
			v.dd.dragging = true
			v.dd.prev = false
			v.dd.next = false
			v.dd.nest = false
		})
		// ドラッグ中以外のノードの更新
		traverse(data.root, (v) => {
			if (v.dd.dragging) {
				return
			}
			v.dd.prev = v.parent != null
			v.dd.next = v.parent != null && v.twisty != Twisty.Opened
			v.dd.nest = v.twisty == Twisty.Opened
		})
	}

	// dragenter dragover
	// 引数はドロップノード
	const dragupdate = (event: DragEvent, node: Node) => {
		event.preventDefault()

		const current = event.currentTarget as HTMLElement | null
		if (current == null) {
			return
		}

		const rect = current.getBoundingClientRect()
		const center = rect.top + rect.height / 2

		node.dd.over = Over.None
		// 上半分にオーバー
		if (event.clientY < center) {
			// ドロップ可能か
			if (node.dd.prev) {
				node.dd.over = Over.Prev
			}
		}
		// 下半分にオーバー
		else {
			// ドロップ可能か
			if (node.dd.next) {
				node.dd.over = Over.Next
			}
			// ドロップ可能か
			else if (node.dd.nest) {
				node.dd.over = Over.Nest
			}
		}
	}

	// dragleave
	// 引数はドロップノード
	const dragleave = (event: DragEvent, node: Node) => {
		event.preventDefault()

		node.dd.over = Over.None
	}

	// drop
	// 引数はドロップノード
	const drop = (event: DragEvent, node: Node) => {
		event.preventDefault()

		if (data.drag == null || node.dd.over == Over.None) {
			return
		}

		// 移動
		let src = null
		let dst = null
		switch (node.dd.over) {
			case Over.Prev:
				src = cut(data.drag)
				dst = joinPrev(node, data.drag)
				break
			case Over.Next:
				src = cut(data.drag)
				dst = joinNext(node, data.drag)
				break
			case Over.Nest:
				src = cut(data.drag)
				dst = joinNest(node, data.drag)
				break
		}
		if (src == null || dst == null) {
			return
		}
		updateCheckParent(src.parent)
		updateCheckParent(dst.parent)
	}

	// dragend
	// 引数はドラッグノード
	// キャンセル時も呼ばれる
	const dragend = (_event: DragEvent, _node: Node) => {
		data.drag = null

		traverse(data.root, (v) => {
			v.dd.over = Over.None
			v.dd.dragging = false
			v.dd.prev = false
			v.dd.next = false
			v.dd.nest = false
		})
	}

	return {
		data,
		list,

		twisty,
		check,

		dragstart,
		dragupdate,
		dragleave,
		drop,
		dragend,
	}
}

const KEY: vue.InjectionKey<ReturnType<typeof setup>> = Symbol("TreeProvider")

export function provide(): ReturnType<typeof setup> {
	const v = setup()
	vue.provide(KEY, v)
	return v
}

export function inject(): ReturnType<typeof setup> {
	return vue.inject(KEY)!
}
