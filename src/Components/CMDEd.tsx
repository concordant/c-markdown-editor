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

let CONFIG = require('../config.json');

/**
 * Concordant session
 * Connection is done to localhost, should probably be changed fepending on the
 * expected deployement.
 */
let session = client.Session.Companion.connect(CONFIG.dbName, CONFIG.serviceUrl, CONFIG.credentials);

/**
 * Concordant collection
 */
let collection = session.openCollection("mdeditorCollection", false);

/**
 * Concordant Markdone Editor, a collaborative version of the MDEditor component
 **/
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
        this.state = {
            value: "",
        };
        this.rga = collection.open("myrga", "RGA", false, function () {return});
        session.transaction(client.utils.ConsistencyLevel.None, () => {
            this.setState({
                value: this.rga.get().toArray().join(""),
            });
        });
    }

    /**
     * Handler called when there is a change in the underlying MDEditor.
     */
    public valueChanged(value: string | undefined) {
        let valueUI = (typeof value == 'undefined') ? "" : value;
        if (this.state.value === valueUI) return;

        session.transaction(client.utils.ConsistencyLevel.None, () => {
            let maxLength = this.state.value.length < valueUI.length ? valueUI.length : this.state.value.length;
            let isOpInsert = maxLength === valueUI.length;
            let nAppliedOp = 0;
            for (let i = 0; i < maxLength; i++) {
                let idxUI = isOpInsert ? i : i - nAppliedOp;
                let idxRGA = isOpInsert ? i - nAppliedOp : i;
                if (idxUI >= valueUI.length || idxRGA >= this.state.value.length || this.state.value.charAt(idxRGA) !== valueUI.charAt(idxUI)) {
                    if (isOpInsert) { // insert
                        this.rga.insertAt(idxUI, valueUI.charAt(idxUI));
                    } else { // delete
                        this.rga.removeAt(idxUI);
                    }
                    nAppliedOp++;
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
