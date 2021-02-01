import React, {Component} from 'react';
import MDEditor, { ICommand } from '@uiw/react-md-editor';
import { client } from '@concordant/c-client';

export interface ICMDEdConfig {
    /**
     * An array of ICommand, which, each one, contain a commands property. If no commands are specified, the default will be used. Commands are explained in more details here:
     * https://github.com/uiwjs/react-md-editor/blob/098c0b657300bfbfef83976558ee37f737e842a2/src/commands/index.ts#L20-L29
     */
    commands?: ICommand;
    /**
     * Can be used to make Markdown Editor focus itself on initialization.
     */
    autoFocus?: boolean;
    /**
     * This is reset @uiw/react-markdown-preview settings.
     */
    //TODO: need to install @uiw/react-markdown-preview  previewOptions?: ReactMarkdown.ReactMarkdownProps;
}

/**
 * Interface for Concordant MDEditor properties.
 */
export interface CMDEditorProps {
}

/**
 * Interface for Concordant MDEditor state.
 */
export interface CMDEditorState {
    value: string;
}

/**
 * Concordant session
 * Connection is done to localhost, should probably be changed fepending on the
 * expected deployement.
 */
let session = client.Session.Companion.connect("mdeditor",
    "http://127.0.0.1:4000", "credentials");

/**
 * Concordant collection
 */
let collection = session.openCollection("mdeditorCollection", false);

// Concordant Markdone Editor
// A collaborative version of the MDEditor component
export default class CMDEditor extends Component<CMDEditorProps, CMDEditorState> {
    /**
     * Timer use for refresh
     */
    private timerID!: NodeJS.Timeout;

    /**
     * RGA of chars representing the editor string value
     */ 
    private rga: any;

    /**
     * Default constructor.
     */
    constructor(props: CMDEditorProps) {
        super(props);
        this.rga = collection.open("myrga", "RGA", false, function () {return});
        session.transaction(client.utils.ConsistencyLevel.None, () => {
          this.state = {
            value: this.rga.get().toArray().join(""),
          };
        });
    }

    /**
     * Handler called when there is a change in the underlying MDEditor.
     */
    public valueChanged(value: string | undefined) {
      let valueStr = (typeof value == 'undefined') ? "" : value;
      if (this.state.value === valueStr) return;

      session.transaction(client.utils.ConsistencyLevel.None, () => {
        let minLength = this.state.value.length > valueStr.length ? valueStr.length : this.state.value.length;
        for (let i = 0; i <= minLength; i++) {
          if (this.state.value.charAt(i) !== valueStr.charAt(i) || i === minLength) {
            if (valueStr.length !== minLength) { // insert
              this.rga.insertAt(i, valueStr.charAt(i));
            } else { // delete
              this.rga.removeAt(i);
            }
            break;
          }
        }
        this.setState({
            value: this.rga.get().toArray().join(""),
        });
      });
    }

    /**
     * Called after the component is rendered.
     * It set a timer to refresh cells values.
     */
    componentDidMount() {
        this.timerID = setInterval(
            () => {
                session.transaction(client.utils.ConsistencyLevel.None, () => {
                    this.setState({
                        value: this.rga.get().toArray().join(""),
                    });
                });
            },
            1000
        );
    }

    /**
     * Called when the compenent is about to be removed from the DOM.
     * It remove the timer set in componentDidMount().
     */
    componentWillUnmount() {
        clearInterval(this.timerID);
    }

    /**
     * The function is called when the content of the editor is updated. It
     * returns a React element corresponding to the MDEditor.
     */
    render() {
        const editor = (
            <div className="container">
                <MDEditor
                    value={this.state.value}
                    onChange={this.valueChanged.bind(this)}
                    fullscreen={true}
                />
                <MDEditor.Markdown source={this.state.value} />
            </div>
        );

        return editor;
    }
}
