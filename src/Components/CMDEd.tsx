import { client } from '@concordant/c-client';
import React, { Component, createRef } from 'react';
import MDEditor, {commands, ICommand, TextState, TextApi} from "@uiw/react-md-editor";
import Submit1Input from './Submit1Input';
import DiffMatchPatch from 'diff-match-patch';

let domToImage = require("dom-to-image-more");

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
    oldValue: string,
    docName: string,
    rga: any
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
     * Ref to the main div DOM element, required for selection management
     */
    private nodeRef = createRef<HTMLDivElement>();

    public static defaultProps = {
        docName: "Untitled-1",
        placeholder: ""
    }

    /**
     * Default constructor
     */
    constructor(props: CMDEditorProps) {
        super(props);
        let value = "";
        let rga = this.props.collection.open(this.props.docName, "RGA", false, function () {return});
        this.props.session.transaction(client.utils.ConsistencyLevel.None, () => {
            value = rga.get().toArray().join("");
        });
        this.state = {
            value: value,
            oldValue: value,
            docName: this.props.docName,
            rga: rga
        };
    }

    /**
     * This function is called to update the RGA with the new value from the editor
     */
    private updateRGA() {
        if (this.state.value !== this.state.oldValue) {
            const dmp = new DiffMatchPatch.diff_match_patch();
            const diffs = dmp.diff_main(this.state.oldValue, this.state.value);

            this.props.session.transaction(client.utils.ConsistencyLevel.None, () => {
                let idx = 0
                for (let diff of diffs) {
                    switch (diff[0]) {
                        case DiffMatchPatch.DIFF_EQUAL:
                            idx += diff[1].length
                            break;
                        case DiffMatchPatch.DIFF_INSERT:
                            for (let char of diff[1]){
                                this.state.rga.insertAt(idx, char);
                                idx++;
                            }
                            break;
                        case DiffMatchPatch.DIFF_DELETE:
                            for (let i = 0; i < diff[1].length; i++){
                                this.state.rga.removeAt(idx);
                            }
                            break;
                    }
                }
            });
            this.setState({
                oldValue: this.state.value
            })
        }
    }

    /**
     * This function is called to retrieve the current value of the RGA
     */
    private pullValue() {
        let newValue = ""
        this.props.session.transaction(client.utils.ConsistencyLevel.None, () => {
            newValue = this.state.rga.get().toArray().join("")
        });
        if (newValue !== this.state.value) {
            this.valueReceived(newValue)
        }
    }

    /**
     * Handler called when a new remote value is received
     * @param newvalue New value received
     */
    private valueReceived(newValue: string) {
        let textarea = this.nodeRef.current
            ?.getElementsByClassName("w-md-editor-text-input")
            ?.item(0) as HTMLInputElement;

        const dmp = new DiffMatchPatch.diff_match_patch();
        const diffs = dmp.diff_main(this.state.value, newValue);
        let [cursorStart, cursorEnd] = [textarea.selectionStart, textarea.selectionEnd]

        this.setState({
            value: newValue,
            oldValue: newValue
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
     * Every 3 seconds, update the RGA with the editor's value and retrieves remote changes from the RGA
     */
    private routine() {
        this.timerID = setTimeout(
            () => {
                this.updateRGA()
                this.pullValue()
                this.routine()
            },
            3000
        );
    }

    /**
     * Called after the component is rendered.
     * It set a timer to refresh the contents of the editor.
     */
    componentDidMount() {
        let textarea = this.nodeRef.current
            ?.getElementsByClassName("w-md-editor-text-input")
            ?.item(0) as HTMLInputElement;
        textarea.placeholder = this.props.placeholder

        this.routine()
    }

    /**
     * Called when the compenent is about to be removed from the DOM.
     * It remove the timer set in componentDidMount().
     */
    componentWillUnmount() {
        clearInterval(this.timerID);
    }

    /**
     * Handler called when there is a change in the underlying MDEditor.
     */
    public handleChange(value: string | undefined) {
        let valueUI = (typeof value == 'undefined') ? "" : value;
        if (this.state.value === valueUI) return;

        this.setState({
            value: valueUI,
        });
    }

    /**
     * This handler is called when a new document name is submit.
     * @param docName Name of the desired document.
     */
    handleSubmit(docName: string) {
        let value = ""
        let rga = this.props.collection.open(docName, "RGA", false, function () {return});
        this.props.session.transaction(client.utils.ConsistencyLevel.None, () => {
            value = rga.get().toArray().join("");
        });
        this.setState({
            value: value,
            docName: docName,
            rga: rga
        });
    }

    /**
     * The function is called when the content of the editor is updated. It
     * returns a React element corresponding to the MDEditor.
     */
    render() {
        let myToolbar = commands.getCommands()
        myToolbar.push(this.textToImage, this.textToMd)
        return (
            <div ref={this.nodeRef}>
                <div>Current document : {this.state.docName}</div>
                <Submit1Input inputName="Document" onSubmit={this.handleSubmit.bind(this)} /><br />
                <MDEditor
                    value={this.state.value}
                    onChange={this.handleChange.bind(this)}
                    height={500}
                    commands={myToolbar}
                />
            </div>
        );
    }

    private textToImage: ICommand = {
        name: "downloadimg",
        keyCommand: "downloadimg",
        value: "downloadimg",
        buttonProps: { "aria-label": "Download Png Image" },
        icon: (
            <svg width="12" height="12" viewBox="0 0 20 20">
                <path fill="currentcolor" d="M9.958,5.956c-2.577,0-4.667,2.089-4.667,4.667c0,2.577,2.089,4.667,4.667,4.667s4.667-2.09,4.667-4.667
								C14.625,8.045,12.535,5.956,9.958,5.956z M9.958,14.123c-1.933,0-3.5-1.568-3.5-3.5c0-1.933,1.567-3.5,3.5-3.5s3.5,1.567,3.5,3.5
								C13.458,12.555,11.891,14.123,9.958,14.123z M18.124,3.623h-2.916l-0.583-1.167c0,0-0.522-1.167-1.167-1.167h-7
								c-0.645,0-1.167,1.167-1.167,1.167L4.708,3.623H1.792c-0.645,0-1.167,0.522-1.167,1.167v12.832c0,0.645,0.522,1.168,1.167,1.168
								h16.333c0.645,0,1.167-0.523,1.167-1.168V4.789C19.291,4.145,18.769,3.623,18.124,3.623z M18.124,17.039
								c0,0.322-0.261,0.582-0.583,0.582H2.375c-0.323,0-0.583-0.26-0.583-0.582V5.373c0-0.323,0.261-0.583,0.583-0.583h2.954
								C5.316,4.74,5.292,4.695,5.292,4.643l0.933-1.458c0,0,0.418-0.729,0.934-0.729h5.6c0.516,0,0.934,0.729,0.934,0.729l0.934,1.458
								c0,0.052-0.024,0.097-0.038,0.146h2.954c0.322,0,0.583,0.261,0.583,0.583V17.039z"></path>
                </svg>
        ),
        execute: (state: TextState, api: TextApi) => {
            const dom = this.nodeRef.current?.getElementsByClassName("w-md-editor-content")[0];
            if (dom) {
                domToImage.toPng(dom, {bgcolor: "white"}).then((dataUrl: string) => {
                    const link = document.createElement("a");
                    link.download = this.state.docName + ".png";
                    link.href = dataUrl;
                    link.click();
                });
            }
        }
    }
    
    private textToMd: ICommand = {
        name: "downloadmd",
        keyCommand: "downloadmd",
        value: 'downloadmd',
        buttonProps: { "aria-label": "Download Markdown File" },
        icon: (
            <svg width="12" height="12" viewBox="0 0 20 20">
                <path fill="currentcolor" d="M17.206,5.45l0.271-0.27l-4.275-4.274l-0.27,0.269V0.9H3.263c-0.314,0-0.569,0.255-0.569,0.569v17.062
								c0,0.314,0.255,0.568,0.569,0.568h13.649c0.313,0,0.569-0.254,0.569-0.568V5.45H17.206z M12.932,2.302L16.08,5.45h-3.148V2.302z
								 M16.344,17.394c0,0.314-0.254,0.569-0.568,0.569H4.4c-0.314,0-0.568-0.255-0.568-0.569V2.606c0-0.314,0.254-0.568,0.568-0.568
								h7.394v4.55h4.55V17.394z"></path>
            </svg>
        ),
        execute: (state: TextState, api: TextApi) => {
            const link = document.createElement('a');
            link.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(this.state.value));
            link.setAttribute('download', this.state.docName + ".md");
            link.click();
        }
    }
}
