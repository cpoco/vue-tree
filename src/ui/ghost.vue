<script lang="ts">
import * as vue from "vue"

import { inject } from "@/composables/tree"

const ghostComponent = vue.defineComponent({
	setup() {
		const ghost = vue.useTemplateRef<HTMLElement>("ghost")
		const provider = inject()

		return {
			ghost,
			name: vue.computed(() => {
				return provider.data.drag?.name ?? ""
			}),
		}
	},
})

export default ghostComponent
export type GhostInstance = InstanceType<typeof ghostComponent>
</script>

<template lang="pug">
div.ghost(
	ref="ghost"
) {{ name }}
</template>

<style lang="stylus">
_width = 200px
_height = 32px

.ghost
	position: absolute
	top: (_height * -1)
	left: 0
	overflow: hidden
	padding: 0 (_height / 2)
	width: _width
	height: _height
	border-radius: (_height / 2)
	background-color: #000
	color: #fff
	text-overflow: ellipsis
	line-height: _height
</style>