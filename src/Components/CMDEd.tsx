import { client } from '@concordant/c-client';
import React, { Component } from 'react';
import MDEditor from '@uiw/react-md-editor';
import Submit1Input from './Submit1Input';
import DiffMatchPatch from 'diff-match-patch';

/**
 * Interface for Concordant MDEditor properties.
 */
export interface CMDEditorProps {
    session: any,
    collection: any,
    docName: string
}

/**
 * Interface for Concordant MDEditor state.
 */
export interface CMDEditorState {
    value: string,
    docName: string
}

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

    public static defaultProps = {
        docName: "Untitled-1"
    }

    /**
     * Default constructor.
     */
    constructor(props: CMDEditorProps) {
        super(props);
        let value = "";
        this.rga = this.props.collection.open(this.props.docName, "RGA", false, function () {return});
        this.props.session.transaction(client.utils.ConsistencyLevel.None, () => {
            value = this.rga.get().toArray().join("");
        });
        this.state = {
            value: value,
            docName: this.props.docName
        };
    }

    /**
     * Handler called when there is a change in the underlying MDEditor.
     */
    public valueChanged(value: string | undefined) {
        let valueUI = (typeof value == 'undefined') ? "" : value;
        if (this.state.value === valueUI) return;

        const dmp = new DiffMatchPatch.diff_match_patch();
        const diffs = dmp.diff_main(this.state.value, valueUI);

        this.props.session.transaction(client.utils.ConsistencyLevel.None, () => {
            let idx = 0
            for (let diff of diffs) {
                switch (diff[0]) {
                    case DiffMatchPatch.DIFF_EQUAL:
                        idx += diff[1].length
                        break;
                    case DiffMatchPatch.DIFF_INSERT:
                        for (let char of diff[1]){
                            this.rga.insertAt(idx, char);
                            idx++;
                        }
                        break;
                    case DiffMatchPatch.DIFF_DELETE:
                        for (var i = 0; i < diff[1].length; i++){
                            this.rga.removeAt(idx);
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
                this.props.session.transaction(client.utils.ConsistencyLevel.None, () => {
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
     * This handler is called when a new document name is submit.
     * @param docName Name of the desired document.
     */
    handleSubmit(docName: string) {
        let value = ""
        this.rga = this.props.collection.open(docName, "RGA", false, function () {return});
        this.props.session.transaction(client.utils.ConsistencyLevel.None, () => {
            value = this.rga.get().toArray().join("");
        });
        this.setState({value: value, docName: docName});
    }

    /**
     * The function is called when the content of the editor is updated. It
     * returns a React element corresponding to the MDEditor.
     */
    render() {
        return (
            <div>
                <div>Current document : {this.state.docName}</div>
                <Submit1Input inputName="Document" onSubmit={this.handleSubmit.bind(this)} /><br />
                <MDEditor
                    value={this.state.value}
                    onChange={this.valueChanged.bind(this)}
                    height={500}
                />
            </div>
        );
    }
}
