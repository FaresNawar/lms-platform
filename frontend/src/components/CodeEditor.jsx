import CodeMirror from '@uiw/react-codemirror'
import { html } from '@codemirror/lang-html'
import { javascript } from '@codemirror/lang-javascript'
import { python } from '@codemirror/lang-python'
import { oneDark } from '@codemirror/theme-one-dark'

// course.language decides which syntax rules the editor understands
const languages = {
  web: [html()],
  javascript: [javascript()],
  python: [python()],
}

export default function CodeEditor({ value, onChange, language }) {
  return (
    <div className="h-full overflow-hidden text-sm">
      <CodeMirror
        value={value}
        onChange={onChange}
        theme={oneDark}
        extensions={languages[language] ?? []}
        height="100%"
        style={{ height: '100%' }}
      />
    </div>
  )
}