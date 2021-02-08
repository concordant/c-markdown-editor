import { client } from '@concordant/c-client';
import React, { Component } from 'react';
import MDEditor from '@uiw/react-md-editor';

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
        let value = "";
        this.rga = collection.open("myrga", "RGA", false, function () {return});
        session.transaction(client.utils.ConsistencyLevel.None, () => {
            value = this.rga.get().toArray().join("");
        });
        this.state = {
            value,
        };
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
        return (
            <div>
                <MDEditor
                    value={this.state.value}
                    onChange={this.valueChanged.bind(this)}
                    height={500}
                />
            </div>
        );
    }
}
