<template>
  <div class="mark-map" ref="markMap">
    <tree class="mind-map" ref="mindMap"
        :data="tree" node-text="name" layoutType="horizontal" :zoomable="true"
    >
    </tree>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import bus from '../../bus'
import { tree } from 'vued3tree'
// const viewMindmap = require('markmap/lib/view.mindmap')
const parseMarkdwon = require('markmap/lib/parse.markdown')
const transformHeadings = require('markmap/lib/transform.headings')
// import * as d3 from 'markmap/node_modules/d3'
// import 'markmap/lib/d3-flextree'
export default {
  components: {
    tree
  },
  props: {
    markdown: String
  },
  computed: {
    ...mapState({
      theme: state => state.preferences.theme,
      markMap: state => state.preferences.markMap,
      currentFile: state => state.editor.currentFile
    }),
    tree: function () {
      const parseOpts = {
        list: false,
        links: false
      }
      window.console.log('tree: markdown %s', this.markdown)
      return transformHeadings(parseMarkdwon(this.markdown, parseOpts))
    }
  },
  data () {
    return {
      contentState: null,
      editor: null,
      commitTimer: null,
      viewDestroyed: false,
      tabId: null
    }
  },
  created () {
    this.$nextTick(() => {
      const { pathname } = this.currentFile
      bus.$on('file-loaded', this.handleFileChange)
      bus.$on('file-changed', this.handleFileChange)
      this.tabId = pathname
    })
  },
  beforeDestroy () {
    this.viewDestroyed = true
    if (this.commitTimer) clearTimeout(this.commitTimer)

    bus.$off('file-loaded', this.handleFileChange)
    bus.$off('file-changed', this.handleFileChange)
    bus.$emit('file-changed', { id: this.tabId })
  },
  methods: {
    transformMarkdown (markdown) {
      this.tree = transformHeadings(parseMarkdwon(markdown))
    },

    treeData () {
      const markdown = this.markdown
      return transformHeadings(parseMarkdwon(markdown))
    },

    // Another tab was selected - only listen to get changes but don't set history or other things.
    handleFileChange ({ id, markdown }) {
      this.prepareTabSwitch()
      // this.transformMarkdown(markdown)
      // window.console.log('handleFileChange: markdown %s', markdown)
      // window.console.log('handleFileChange: tree %s', this.tree)
      // window.console.log('handleFileChange: treeData %s', this.treeData())
      this.tabId = id
    },

    // Commit changes from old tab. Problem: tab was already switched, so commit changes with old tab id.
    prepareTabSwitch () {
      if (this.commitTimer) clearTimeout(this.commitTimer)
      // window.console.log('prepareTabs: markdown %s', this.markdown)
      // window.console.log('prepareTabs: text %s', this.text)
      if (this.tabId) {
        // this.$store.dispatch('LISTEN_FOR_CONTENT_CHANGE', { id: this.tabId, pathname })
        this.tabId = null // invalidate tab id
      }
    }
  }
}
</script>

<style>
    .mark-map {
        height: calc(100vh - var(--titleBarHeight));
        box-sizing: border-box;
        overflow: auto;
    }
    .mark-map .mind-map {
        margin: 25px;
        width: 90%;
        height: 90%;
    }
</style>
