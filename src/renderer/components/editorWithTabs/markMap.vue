<template>
  <div class="mark-map" ref="markMap">
      <svg class="svg-mindmap" ref="svgMindMap" id="mindmap"></svg>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import bus from '../../bus'
import * as d3 from 'markmap/node_modules/d3'
import 'markmap/lib/d3-flextree'
const viewMindmap = require('markmap/lib/view.mindmap')
const parseMarkdwon = require('markmap/lib/parse.markdown')
const transformHeadings = require('markmap/lib/transform.headings')

export default {
  props: {
    markdown: String
  },
  computed: {
    ...mapState({
      theme: state => state.preferences.theme,
      markMap: state => state.preferences.markMap,
      currentFile: state => state.editor.currentFile
    })
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
      this.showMarkmap(this.markdown)
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
    showMarkmap (markdown) {
      // TODO: clear svg
      // const markdown = this.markdown
      d3.json('static/preference.json', function (error, text) {
        if (error) {
          throw error
        }

        if (markdown === '') {
          return
        }
        console.log('markdown %s', markdown)

        // console.log('markdown %s', markdown)
        const data = transformHeadings(parseMarkdwon(markdown))
        viewMindmap('svg#mindmap', data, {
          autoFit: true,
          preset: 'colorful', // or default
          linkShape: 'diagonal' // or bracket
        })
      })
    },

    // Another tab was selected - only listen to get changes but don't set history or other things.
    handleFileChange ({ id, markdown }) {
      this.prepareTabSwitch()
      this.showMarkmap(markdown)
      this.tabId = id
    },

    // Commit changes from old tab. Problem: tab was already switched, so commit changes with old tab id.
    prepareTabSwitch () {
      if (this.commitTimer) clearTimeout(this.commitTimer)
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
    .mark-map .svg-mindmap {
        width: 90%;
        height: 90%;
    }
</style>
