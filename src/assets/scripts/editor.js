var app = new Vue({
  el: '#app',
  data: function () {
    return {
      title: 'Markdown to WeChat Article',
      aboutOutput: '',
      output: '',
      source: '',
      editorThemes: ['base16-light', 'monokai'],
      currentEditorTheme: 'base16-light',
      editor: null,
      builtinFonts: [
        { label: '衬线', value: 'serif', fonts: "Optima-Regular, Optima, PingFangSC-light, PingFangTC-light, 'PingFang SC', Cambria, Cochin, Georgia, Times, 'Times New Roman', serif" },
        { label: '无衬线', value: 'sans-serif', fonts: "Roboto, Oxygen, Ubuntu, Cantarell, PingFangSC-light, PingFangTC-light, 'Open Sans', 'Helvetica Neue', sans-serif" }
      ],
      currentFont: {
        label: '', value: ''
      },
      aboutDialogVisible: false,
      todos: window.customizeText,
      styleApp:{
        width:'375px'
      }
    }
  },
  mounted() {
    var self = this
    this.editor = CodeMirror.fromTextArea(document.getElementById('editor'), {
      lineNumbers: false,
      lineWrapping: true,
      styleActiveLine: true,
      theme: this.currentEditorTheme,
      mode: 'text/x-markdown',
    });
    this.editor.on("change", function (cm, change) {
      self.refresh()
    })
    this.currentFont = this.builtinFonts[0]
    this.wxRenderer = new WxRenderer({
      theme: defaultTheme,
      fonts: this.currentFont.fonts
    })
    // axios({
    //   method: 'get',
    //   url: './assets/default-content.md',
    // }).then(function (resp) {
    //   self.editor.setValue(resp.data)
    // })
  },
  methods: {
    renderWeChat: function (source) {
      var output = marked(source, { renderer: this.wxRenderer.getRenderer() })
      if (this.wxRenderer.hasFootnotes()) {
        output += this.wxRenderer.buildFootnotes()
      }
      return output
    },
    themeChanged: function () {
      this.editor.setOption('theme', this.currentEditorTheme)
    },
    fontChanged: function (fonts) {
      this.wxRenderer.setOptions({
        fonts: fonts
      })
      this.refresh()
    },
    refresh: function () {
      this.output = this.renderWeChat(this.editor.getValue())
    },
    copy: function () {
      var clipboardDiv = document.getElementById('output')
      clipboardDiv.focus();
      window.getSelection().removeAllRanges();
      var range = document.createRange();
      range.setStartBefore(clipboardDiv.firstChild);
      range.setEndAfter(clipboardDiv.lastChild);
      window.getSelection().addRange(range);

      try {
        if (document.execCommand('copy')) {
          this.$message({
            message: '已复制到剪贴板', type: 'success'
          })
        } else {
          this.$message({
            message: '未能复制到剪贴板，请全选后右键复制', type: 'warning'
          })
        }
      } catch (err) {
        this.$message({
          message: '未能复制到剪贴板，请全选后右键复制', type: 'warning'
        })
      }
    },
    addText: function (str, position, random) {
      if (position === 'after' && random) {
        this.editor.setValue(this.editor.getValue() + str.replace('###', Math.floor((Math.random() * random))))
      } else if (position === 'before' && random) {
        this.editor.setValue(str.replace('###', Math.floor((Math.random() * random))) + this.editor.getValue())
      } else if (position === 'after') {
        this.editor.setValue(this.editor.getValue() + str)
      } else if (position === 'before') {
        this.editor.setValue(str + this.editor.getValue())
      }
    },
    changeApp(app){
      switch (app){
        case 1:
        this.styleApp = {width:'320px'}
        break
        case 2:
        this.styleApp = {width:'375px'}
        break
        case 3:
        this.styleApp = {width:'414px'}
        break
      }
    }
  }
})