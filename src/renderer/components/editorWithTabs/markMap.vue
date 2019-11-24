<template>
  <div class="mark-map" ref="markMap">
    <tree class="mind-map" ref="mindMap"
          :data="treeData" node-text="name" layoutType="horizontal" :zoomable="true"
    >
    </tree>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import bus from '../../bus'
import { tree } from 'vued3tree'
const parseMarkdwon = require('markmap/lib/parse.markdown')
const transformHeadings = require('markmap/lib/transform.headings')

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
    treeData: function () {
      const parseOpts = {
        list: false,
        links: false
      }
      const markdown = this.markdown
      // window.console.log('tree: markdown %s', this.markdown)
      var data = transformHeadings(parseMarkdwon(markdown, parseOpts))
      window.console.log('computed treeData root: %s', data.name)
      return data
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
      window.console.log('created: ')
    })
  },
  beforeDestroy () {
    this.viewDestroyed = true
    if (this.commitTimer) clearTimeout(this.commitTimer)

    bus.$off('file-loaded', this.handleFileChange)
    bus.$off('file-changed', this.handleFileChange)
    bus.$emit('file-changed', { id: this.tabId })
    window.console.log('beforeDestroy: ')
  },
  methods: {
    // Another tab was selected - only listen to get changes but don't set history or other things.
    handleFileChange ({ id, markdown }) {
      this.prepareTabSwitch()
      window.console.log('handleFileChange: ')
      this.tabId = id
    },

    // Commit changes from old tab. Problem: tab was already switched, so commit changes with old tab id.
    prepareTabSwitch () {
      if (this.commitTimer) clearTimeout(this.commitTimer)
      window.console.log('prepareTabs: ')
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
