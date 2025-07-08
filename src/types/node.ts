export enum Display {
	Show = "show",
	Hide = "hide",
}

export enum Twisty {
	None = "none",
	Opened = "opened",
	Closed = "closed",
}

export enum Check {
	Checked = "checked",
	Unchecked = "unchecked",
	Indeterminate = "indeterminate",
}

export enum Over {
	None = "none",
	Prev = "prev",
	Next = "next",
	Nest = "nest",
}

export interface Node {
	id: string
	name: string

	depth: number
	parent: Node | null
	children: Node[] | null

	display: Display
	twisty: Twisty
	check: Check

	/** ドラッグ＆ドロップ情報 */
	dd: DragAndDrop
}

interface DragAndDrop {
	/** ドロップオーバー状態 */
	over: Over
	/** ドラッグ可能か */
	draggable: boolean
	/** ドラッグ中か（子ノードも含む） */
	dragging: boolean
	/** 前にドロップ可能か */
	prev: boolean
	/** 後にドロップ可能か */
	next: boolean
	/** 子にドロップ可能か */
	nest: boolean
}
