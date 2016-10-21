import * as React from "react";

import {LogProps} from "./LogPanelComponent";
import {ExtensionCategory} from "../api/ExtensionCategory";
import {observer} from "mobx-react";
import {ALL_LOG_LEVELS_CATEGORY} from "../api/ExtensionLogMessage";
import {messageProcessor} from "../index";
import {ExtensionMessageContentJSON, ExtensionMessageJSON, ExtensionRequestChangeLogLevelJSON} from "typescript-logging";

@observer
export class LogPanelTreeComponent extends React.Component<LogProps,{applyRecursive: boolean}> {

  constructor(props: LogProps) {
    super(props);

    this.state = {applyRecursive: true};

    this.changeLogLevel = this.changeLogLevel.bind(this);
  }

  render() {
    return (
      <div id="logPanelTreeComponent">
        <span style={{verticalAlign: 'middle'}}>Recurse: <input value="Recurse" checked={this.state.applyRecursive} type="checkbox" onChange={() => this.changeRecursive()} /></span>
        {
          this.props.model.rootCategories.map((value: ExtensionCategory) => {
            return <ul><LogCategoryComponent category={value} changeLogLevel={this.changeLogLevel} /></ul>;
          })
        }
      </div>
    );
  }

  changeLogLevel(cat: ExtensionCategory, logLevel: string): void {
    const currentState = this.state.applyRecursive;
    const content = {
      type: 'request-change-loglevel',
      value: {
        categoryId: cat.id,
        logLevel: logLevel,
        recursive: currentState
      }
    } as ExtensionMessageContentJSON<ExtensionRequestChangeLogLevelJSON>;
    const msg = {
      from: 'tsl-extension',
      data: content
    } as ExtensionMessageJSON<ExtensionRequestChangeLogLevelJSON>;

    messageProcessor.sendMessageToLoggingFramework(msg);
  }

  private changeRecursive() {
    this.setState({applyRecursive: !this.state.applyRecursive});
    console.log("Current state=" + this.state.applyRecursive);
  }
}

interface LogCategoryProps {

  category: ExtensionCategory;

  changeLogLevel: (cat: ExtensionCategory, logLevel: string) => void;
}

@observer
class LogCategoryComponent extends React.Component<LogCategoryProps,{}> {

  constructor(props: LogCategoryProps) {
    super(props);
  }

  render(): JSX.Element {
    return (
      <li>
        {this.props.category.name}
        <select value={this.props.category.logLevel} onChange={e => this.onSelectLogLevel(e)}>
          {
            ALL_LOG_LEVELS_CATEGORY.map((level: string) => {
              return <option value={level}>{level}</option>
            })
          }
        </select>
        <ul>
        {
          this.props.category.children.map((child : ExtensionCategory) => {
            return <LogCategoryComponent category={child} changeLogLevel={this.props.changeLogLevel} />;
          })
        }
        </ul>
      </li>
    );
  }

  private onSelectLogLevel(e: React.FormEvent<HTMLSelectElement>): void {
    this.props.changeLogLevel(this.props.category, e.currentTarget.value);
  }

}