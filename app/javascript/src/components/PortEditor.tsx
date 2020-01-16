import * as React from "react";
import { DefaultPortModel } from "storm-react-diagrams";
import { StateConsumer, ApplicationState, PortMetaContent } from "../Store";
import { get } from "lodash";
import { clone } from "../clone";

import './PortEditor.css'

interface PortEditorProps {
  port: DefaultPortModel
  removeChoice: () => void
  updateChoice: () => void
}

interface PortEditorStateProps {
  state: ApplicationState
  updateState(state: Readonly<ApplicationState>): Readonly<ApplicationState>
}

interface PortEditorState {
  optionsOpen: boolean
  thisPortMeta: PortMetaContent
}

class PortEditor extends React.Component<PortEditorProps & PortEditorStateProps, PortEditorState> {
  constructor(props: PortEditorProps & PortEditorStateProps) {
    super(props);

    let { state, port } = props

    this.state = {
      optionsOpen: false,
      thisPortMeta: clone(get(state, `portMeta.${port.id}`) || {})
    }
  }

  render() {
    const { port, removeChoice, updateChoice } = this.props
    const { optionsOpen, thisPortMeta: { showIfItems, itemChanges, playerStats } } = this.state

    return <>
      <li>
        <input
          defaultValue={port.label}
          onChange={updateChoice}
        />{' '}
        <button onClick={this.optionsButtonClick}>
          {optionsOpen ? '>' : 'v'}
        </button>
        <button onClick={removeChoice}>
          Delete
        </button>
      </li>

      {optionsOpen && <>
        <li>
          <div>
            <b>Show If</b>

            <table className="attributeTable">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Has It?</th>
                  <th></th>
                </tr>
              </thead>

              <tbody>
                {showIfItems && showIfItems.map((showIf, i) => (
                  <tr key={i}>
                    <td>
                      <select value={showIf.name} onChange={this.selectShowIf.bind(this, i)}>
                        <option key="-1"></option>
                        {this.possibleModifiers(showIf.name).map((item, i) => (
                          <option key={i} value={item}>{item}</option>
                        ))}
                      </select>
                    </td>
                    <td><a onClick={this.toggleShowIf.bind(this, i)}>{showIf.hasIt ? "✔️" : "X"}</a></td>
                    <td><a onClick={this.removeShowIf.bind(this, i)}>remove</a></td>
                  </tr>
                ))}
              </tbody>
            </table>
            <a onClick={this.addShowIf.bind(this)}>+</a>
          </div>
        </li>
        <li>
          <div>
            <b>Items</b>

            <table className="attributeTable">
              <thead>
                <tr>
                  <th>Add/Remove</th>
                  <th>Item</th>
                </tr>
              </thead>

              <tbody>
                {itemChanges && itemChanges.map((itemChange, i) => (
                  <tr key={itemChange.name}>
                    <td>
                      <select value={itemChange.action} onChange={this.toggleItemChange.bind(this, i)}>
                        <option key="add" value="add">Add</option>
                        <option key="remove" value="remove">Remove</option>
                      </select>
                    </td>
                    <td>
                      <input
                        onBlur={this.setItemChange.bind(this, i)}
                        defaultValue={itemChange.name}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <a onClick={this.addItemChanges.bind(this)}>+</a>
          </div>
        </li>

        <li>
          <div>
            <b>Stats</b>

            <table className="attributeTable">
              <thead>
                <tr>
                  <th>Stat</th>
                  <th></th>
                  <th>#</th>
                </tr>
              </thead>
              <tbody>
                {playerStats && playerStats.map((playerStat, i) => (
                  <tr key={playerStat.name}>
                    <td>
                      <input
                        onBlur={this.setPlayerStatName.bind(this, i)}
                        defaultValue = {playerStat.name}
                      />
                    </td>
                    <td>
                      <select value={playerStat.action} onChange={this.togglePlayerStats.bind(this, i)}>
                        <option key="add" value="add">+</option>
                        <option key="remove" value="remove">-</option>
                      </select>
                    </td>
                    <td>
                      <input
                        onBlur={this.setPlayerStatValue.bind(this, i)}
                        defaultValue={(playerStat.value) ? playerStat.value.toString() : ""}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>

            </table>
            <a onClick={this.addPlayerStats.bind(this)}>+</a>
          </div>
        </li>
      </>
      }
    </>
  }

  optionsButtonClick = () => {
    this.setState(prevState => ({ optionsOpen: !prevState.optionsOpen }))
  }

  selectShowIf = (index: number, e: React.ChangeEvent<HTMLSelectElement>) => {
    let newShowIfItems = clone(this.state.thisPortMeta.showIfItems || [])
    newShowIfItems[index].name = e.target.value

    this.state.thisPortMeta.showIfItems = newShowIfItems
    this.savePortMeta()
  }

  toggleShowIf = (index: number, e: React.MouseEvent) => {
    e.preventDefault()

    let newShowIfItems = clone(this.state.thisPortMeta.showIfItems || [])
    newShowIfItems[index].hasIt = !newShowIfItems[index].hasIt

    this.state.thisPortMeta.showIfItems = newShowIfItems
    this.savePortMeta()
  }

  removeShowIf = (index: number, e: React.MouseEvent) => {
    e.preventDefault()

    let newShowIfItems = clone(this.state.thisPortMeta.showIfItems || [])
    newShowIfItems.splice(index, 1)

    this.state.thisPortMeta.showIfItems = newShowIfItems
    this.savePortMeta()
  }

  addShowIf = (e: React.MouseEvent) => {
    e.preventDefault()

    let newShowIfItems = clone(this.state.thisPortMeta.showIfItems || [])
    newShowIfItems.push({name: "", hasIt: true})

    this.state.thisPortMeta.showIfItems = newShowIfItems
    this.savePortMeta()
  }

  addItemChanges = (e: React.MouseEvent) => {
    e.preventDefault()

    let newItemChanges = clone(this.state.thisPortMeta.itemChanges || [])
    newItemChanges.push({name: "", hasIt: true})

    this.state.thisPortMeta.itemChanges = newItemChanges
    this.savePortMeta()
  }

  setItemChange = (index: number, e: React.FocusEvent<HTMLInputElement>) => {
    let newItemChanges = clone(this.state.thisPortMeta.itemChanges || [])
    newItemChanges[index].name = e.target.value

    this.state.thisPortMeta.itemChanges = newItemChanges
    this.savePortMeta()
  }

  toggleItemChange = (index: number, e: React.ChangeEvent<HTMLSelectElement>) => {
    e.preventDefault()

    let newItemChanges = clone(this.state.thisPortMeta.itemChanges || [])
    newItemChanges[index].action = e.target.value

    this.state.thisPortMeta.itemChanges = newItemChanges
    this.savePortMeta()
  }

  addPlayerStats = (e: React.MouseEvent) => {
    e.preventDefault()

    let newPlayerStats = clone(this.state.thisPortMeta.playerStats || [])
    newPlayerStats.push({name: "",  value: undefined })

    this.state.thisPortMeta.playerStats = newPlayerStats
    this.savePortMeta()
  }

  setPlayerStatName = (index: number, e: React.FocusEvent<HTMLInputElement>) => {
    let newPlayerStats = clone(this.state.thisPortMeta.playerStats || [])
    newPlayerStats[index].name = e.target.value

    this.state.thisPortMeta.playerStats = newPlayerStats
    this.savePortMeta()
  }
  setPlayerStatValue = (index: number, e: React.FocusEvent<HTMLInputElement>) => {
    let newPlayerStats = clone(this.state.thisPortMeta.playerStats || [])
    newPlayerStats[index].value = e.target.value

    this.state.thisPortMeta.playerStats = newPlayerStats
    this.savePortMeta()
  }
  
  togglePlayerStats = (index: number, e: React.ChangeEvent<HTMLSelectElement>) => {
    e.preventDefault()

    let newPlayerStats = clone(this.state.thisPortMeta.playerStats || [])
    newPlayerStats[index].action = e.target.value

    this.state.thisPortMeta.playerStats = newPlayerStats
    this.savePortMeta()
  }

  savePortMeta = () => {
    const { thisPortMeta } = this.state
    const { state, updateState, port } = this.props

    let newPortMeta: PortMetaContent = clone(thisPortMeta)

    // Remove empty showIf conditions
    if (newPortMeta.showIfItems) {
      newPortMeta.showIfItems = newPortMeta.showIfItems.filter(showIf => {
        return !!showIf.name
      })
    }

    // Clone here and elsewhere so we get immutable objects in global state
    updateState({
      ...state,
      portMeta: {
        ...state.portMeta,
        [port.id]: newPortMeta
      }
    })
  }

  possibleModifiers: (c:string) => string[] = (current) => {
    let { portMeta } = this.props.state
    let { thisPortMeta } = this.state

    let toReturn: string[] = []

    for (let key in portMeta) {
      let changes = portMeta[key].itemChanges || []

      changes.forEach((change) => {
        if (change.action === "add" && toReturn.indexOf(change.name) === -1) {
          toReturn.push(change.name)
        }
      })
    }

    let existing = (thisPortMeta.showIfItems || []).map((showIf) => {
      return showIf.name
    })

    return toReturn.filter((name) => {
      return name === current || (existing.indexOf(name) === -1)
    })
  }
}

export default (props: PortEditorProps) => <StateConsumer>
  {({ state, updateState }) =>
    <PortEditor
      {...props}
      state={state}
      updateState={updateState}
    />
  }
</StateConsumer>
