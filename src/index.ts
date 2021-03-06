import { html, render } from 'lit-html';
import { classMap } from 'lit-html/directives/class-map';
import  './style.css';

// XXX:これの役割はなに
type TaskId = number

interface Task {
    id: TaskId
    title: string
    done?: boolean
}
interface State {
    tasks: Task[]
    inputText: string
}

let count = 0
const uid = () => count++

// パラメータの渡し方
const TaskItem = (
    task: Task,
    onCheck: (checked:boolean) => void,
    onClickRemove: () => void
) => html`
    <div class=${classMap({ task: true, done: task.done })}>
    <input
    type="checkbox"
    @change=${e => onCheck(e.currentTarget.checked)}
    .checked=${task.done}
    />
    <div class="title">${task.title}</div>
    <div class="remove" @click=${onClickRemove}>x</div>
</div>
`

// 配列
const TaskList = (
  tasks: Task[],
  onCheck: (id: TaskId, checked: boolean) => void,
  onClickRemove: (id: TaskId) => void
) => html`
  <div class="task-list">
    ${tasks.map(t =>
      TaskItem(t, checked => onCheck(t.id, checked), () => onClickRemove(t.id))
    )}
  </div>
`

// イベントハンドリング @イベント名
const NewTask = (
    inputText: string,
    onInput: (value: string) => void,
    onKeyPress: (e: KeyboardEvent) => void
) => html`
<div class="new-task">
    <input
    type="text"
    .value=${inputText}
    @input=${e => onInput(e.currentTarget.value)}
    @keypress=${onKeyPress}
    placeholder="what you want to do?"
    />
</div>
`

// コンポーネントの定義(ネストもして別コンポーネントも埋め込める)
const App = () => html`
<div>
    <h1>TODO</h1>
    ${NewTask(
      store().inputText,
      inputText => store({ inputText }),
      e => {
        if (e.key === "Enter") {
          const state = store()
          store({
            tasks: [...state.tasks, { title: state.inputText, id: uid() }],
            inputText: ""
          })
        }
      }
    )}
    ${TaskList(
      store().tasks,
      (id, done) =>
        store({
          tasks: store().tasks.map(t => (t.id === id ? { ...t, done } : t))
        }),
      id => store({ tasks: store().tasks.filter(t => t.id !== id) })
    )}
  </div>
`

// Singe State Tree

const renderApp = () => render(App(), document.body)

let store: (update?: any) => State

const createStore = <T>(initialState: T) => {
  let data = initialState

  return (update: any = null) => {
    if (update) {
      data = { ...data, ...update }
      renderApp()
    }
    return data
  }
}

store = createStore({
  tasks: [],
  selectedTasks: [],
  inputText: ""
})

renderApp()
