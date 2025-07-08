<script lang="ts">
import * as vue from "vue"

import { inject } from "@/composables/tree"
import { type Node, Over } from "@/types/node"

import icons from "bootstrap-icons/font/bootstrap-icons.json"

export default vue.defineComponent({
	props: {
		node: {
			required: true,
			type: Object as vue.PropType<Node>,
		},
	},

	setup(props) {
		const provider = inject()

		return {
			icons: {
				chevronDown: String.fromCharCode(icons["chevron-down"]),
				chevronRight: String.fromCharCode(icons["chevron-right"]),
				folderOpen: String.fromCharCode(icons["folder2-open"]),
				folder: String.fromCharCode(icons["folder2"]),
				fileEarmark: String.fromCharCode(icons["file-earmark"]),
				checkSquareFill: String.fromCharCode(icons["check-square-fill"]),
				square: String.fromCharCode(icons["square"]),
				dashSquareFill: String.fromCharCode(icons["dash-square-fill"]),
			},

			classes: vue.computed(() => {
				const classes = []

				if (props.node.dd.over === Over.Prev) classes.push("over-prev")
				if (props.node.dd.over === Over.Next) classes.push("over-next")
				if (props.node.dd.over === Over.Nest) classes.push("over-nest")
				if (props.node.dd.dragging) classes.push("dragging")
				if (props.node.dd.prev) classes.push("drop-prev")
				if (props.node.dd.next) classes.push("drop-next")
				if (props.node.dd.nest) classes.push("drop-nest")

				return classes
			}),

			twistyClick: () => {
				provider.twisty(props.node)
			},
			checkClick: () => {
				provider.check(props.node)
			},
			dragstart: (event: DragEvent) => {
				provider.dragstart(event, props.node)
			},
			dragenter: (event: DragEvent) => {
				provider.dragupdate(event, props.node)
			},
			dragover: (event: DragEvent) => {
				provider.dragupdate(event, props.node)
			},
			dragleave: (event: DragEvent) => {
				provider.dragleave(event, props.node)
			},
			drop: (event: DragEvent) => {
				provider.drop(event, props.node)
			},
			dragend: (event: DragEvent) => {
				provider.dragend(event, props.node)
			},
		}
	},
})
</script>

<template lang="pug">
div.node(
	:class="classes",
	:draggable="node.dd.draggable",
	:style="{ '--depth': node.depth }",
	@dragend="dragend",
	@dragenter="dragenter",
	@dragleave="dragleave",
	@dragover="dragover",
	@dragstart="dragstart",
	@drop="drop"
)
	div.node-back
		div.node-back-prev
		div.node-back-next
		div.node-back-marker

	div.node-main
		div.node-main-twisty(
			@click="twistyClick()"
		)
			template(
				v-if="node.twisty == 'opened'"
			) {{ icons.chevronDown }}
			template(
				v-else-if="node.twisty == 'closed'"
			) {{ icons.chevronRight }}

		div.node-main-item(
			@click="twistyClick()"
		)
			template(
				v-if="node.twisty == 'opened'"
			) {{ icons.folderOpen }}
			template(
				v-else-if="node.twisty == 'closed'"
			) {{ icons.folder }}
			template(
				v-else-if="node.twisty == 'none'"
			) {{ icons.fileEarmark }}

		div.node-main-check(
			@click="checkClick()"
		)
			template(
				v-if="node.check == 'checked'"
			) {{ icons.checkSquareFill }}
			template(
				v-else-if="node.check == 'unchecked'"
			) {{ icons.square }}
			template(
				v-else
			) {{ icons.dashSquareFill }}

		div.node-main-name {{ node.name }}
</template>

<style lang="stylus">
@import "../styles/_5_objects.node.styl"

.node
	position: relative
	overflow: clip
	width: 100%
	height: _node_height
	font-size: 18px
	user-select: none
	overflow-clip-margin: 1px

	&:not(.dragging):hover > &-back
		background-color: hsla(0, 0%, 50%, 0.1)

	.dragging > &-back
		background-color: hsla(0, 0%, 50%, 0.2)

	&-back
		position: absolute
		overflow: clip
		width: 100%
		height: 100%
		overflow-clip-margin: 1px

		.drop-prev &-prev
			position: absolute
			background-color: @css { hsla(calc(var(--depth) * 20), 100%, 50%, 0.2) }
			inset: s("0 0 50% calc((var(--depth) + 1) * %s)", _node_size)

		.drop-next &-next
			position: absolute
			background-color: @css { hsla(calc(var(--depth) * 20), 100%, 50%, 0.2) }
			inset: s("50% 0 0 calc((var(--depth) + 1) * %s)", _node_size)

		.drop-nest &-next
			position: absolute
			background-color: @css { hsla(calc((var(--depth) + 1) * 20), 100%, 50%, 0.2) }
			inset: s("50% 0 0 calc((var(--depth) + 2) * %s)", _node_size)

		.over-prev &-marker
			position: absolute
			height: 2px
			background-color: #000
			inset: s("-1px 0 auto calc((var(--depth) + 1) * %s)", _node_size)

		.over-next &-marker
			position: absolute
			height: 2px
			background-color: #000
			inset: s("auto 0 -1px calc((var(--depth) + 1) * %s)", _node_size)

		.over-nest &-marker
			position: absolute
			height: 2px
			background-color: #000
			inset: s("auto 0 -1px calc((var(--depth) + 2) * %s)", _node_size)

	&-main
		position: absolute
		display: grid
		overflow: hidden
		width: 100%
		height: 100%
		white-space: nowrap
		grid-template-columns: s("calc(var(--depth) * %s) %s %s %s 1fr", _node_size, _node_size, _node_size, _node_size)
		grid-template-rows: 100%

		&-twisty
			font-family: bootstrap-icons
			grid-area: 1 / 2
			place-self: center center

		&-item
			color: hsla(_node_hue, 100%, 40%, 1)
			font-family: bootstrap-icons
			grid-area: 1 / 3
			place-self: center center

		&-check
			color: hsla(_node_hue, 100%, 40%, 1)
			font-family: bootstrap-icons
			grid-area: 1 / 4
			place-self: center center

		&-name
			overflow: hidden
			text-overflow: ellipsis
			grid-area: 1 / 5
			place-self: center auto
</style>