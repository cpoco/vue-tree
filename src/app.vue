<script lang="ts">
import * as vue from "vue"

import { provide } from "@/composables/tree"
import { root } from "@/sample"

import ghost, { type GhostInstance } from "@/ui/ghost.vue"
import node from "@/ui/node.vue"

export default vue.defineComponent({
	components: {
		ghost,
		node,
	},

	setup() {
		const ghost = vue.useTemplateRef<GhostInstance>("ghost")

		const provider = provide()
		provider.data.root = root()

		vue.onMounted(() => {
			if (ghost.value) {
				provider.data.ghost = ghost.value.ghost
			}
		})

		return {
			list: provider.list,
		}
	},
})
</script>

<template lang="pug">
ghost(
	ref="ghost"
)
transition-group
	node(
		v-for="v in list",
		:key="v.id",
		:node="v"
	)
</template>

<style lang="stylus">
@import "./styles/_3_generic.styl"
@import "./styles/_4_elements.styl"
@import "./styles/_5_objects.node.styl"

.v-move
	transition: transform 100ms

.v-enter-from
.v-leave-to
	height: 0

.v-enter-active
.v-leave-active
	transition: height 100ms

.v-enter-to
.v-leave-from
	height: _node_height
</style>