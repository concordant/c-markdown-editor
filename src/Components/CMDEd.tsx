import { client } from '@concordant/c-client';
import React, { Component, createRef } from 'react';
import MDEditor from '@uiw/react-md-editor';
import Submit1Input from './Submit1Input';
import DiffMatchPatch from 'diff-match-patch';

/**
 * Interface for Concordant MDEditor properties.
 */
export interface CMDEditorProps {
    session: any,
    collection: any,
    docName: string,
    placeholder: string
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

    /**
     * Ref to the main div DOM element, required for selection management
     */
    private nodeRef = createRef<HTMLDivElement>();

    public static defaultProps = {
        docName: "Untitled-1",
        placeholder: ""
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

        this.setState({
            value: valueUI
        });

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
        });
    }

    /**
     * Handler called when a new remote value is received.
     * @param newvalue New value received
     */
    private valueReceived(newvalue: string) {
        let textarea = this.nodeRef.current
            ?.getElementsByClassName("w-md-editor-text-input")
            ?.item(0) as HTMLInputElement;

        const dmp = new DiffMatchPatch.diff_match_patch();
        const diffs = dmp.diff_main(this.state.value, newvalue);
        var cursorStart = textarea.selectionStart
        var cursorEnd = textarea.selectionEnd

        this.setState({
            value: newvalue,
        });

        if (cursorStart === null || cursorEnd === null) {
            return
        }

        let idx = 0
        for (let diff of diffs) {
            switch (diff[0]) {
                case DiffMatchPatch.DIFF_EQUAL:
                    idx += diff[1].length
                    break;
                case DiffMatchPatch.DIFF_INSERT:
                    if (idx <= cursorStart) {
                        // Insertion before the selected text:
                        // Move the cursor forward
                        cursorStart += diff[1].length
                        cursorEnd += diff[1].length
                    } else if (idx < cursorEnd) {
                        // Insertion in the selected text
                        // Deselect and put the cursor at the beginning of the previously selected text
                        cursorEnd = cursorStart
                    }
                    idx += diff[1].length
                    break;
                case DiffMatchPatch.DIFF_DELETE:
                    if (idx <= cursorStart) {
                        if (idx + diff[1].length <= cursorStart) {
                            // Deletion before the selected text:
                            // Move the cursor backward
                            cursorStart -= diff[1].length
                            cursorEnd -= diff[1].length
                        } else {
                            // Deletion starts before the selected text but selected text is affected:
                            // Deselect and put the cursor at the beginning of the deletion
                            [cursorStart, cursorEnd] = [idx, idx]
                        }
                    } else if (idx < cursorEnd) {
                        // Deletion starts in the selected text
                        // Deselect and put the cursor at the beginning of the previously selected text
                        cursorEnd = cursorStart
                    }
                    break;
            }
            if (idx > cursorEnd) {
                break
            }
        }
        [textarea.selectionStart, textarea.selectionEnd] = [cursorStart, cursorEnd]
    }

    /**
     * Called after the component is rendered.
     * It set a timer to refresh the contents of the editor.
     */
    componentDidMount() {
        this.timerID = setInterval(
            () => {
                this.props.session.transaction(client.utils.ConsistencyLevel.None, () => {
                    let newvalue = this.rga.get().toArray().join("");
                    if (newvalue !== this.state.value) {
                        this.valueReceived(newvalue)
                    }
                });
            },
            1000
        );
        let textarea = this.nodeRef.current
            ?.getElementsByClassName("w-md-editor-text-input")
            ?.item(0) as HTMLInputElement;
        textarea.placeholder = this.props.placeholder
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
            <div ref={this.nodeRef}>
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
