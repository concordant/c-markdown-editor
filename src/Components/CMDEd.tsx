import React, {Component} from 'react';
import MDEditor, { ICommand } from '@uiw/react-md-editor';

const DEFAULT_VALUE: string = "Connecting to service...";

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
export interface CMDEdProps {
    value?: string // set a default value (or DEFAULT_VALUE is unbefined)
}

export interface CMDEdState {
    value: string;
    //uid: number;
    //timestamp: number;
}

export default class CMDEd extends Component<CMDEdProps, CMDEdState> {

    private i: number = 0;

    constructor(props: CMDEdProps) {
        super(props);
        this.state = {
            value: (typeof this.props.value === 'undefined') ? DEFAULT_VALUE : this.props.value, 
        };
    }

    public valueChanged(value: string | undefined) {
        console.log(this.i++ + ":" + value);
        value = (typeof value === 'undefined') ? DEFAULT_VALUE : value;
        this.setState({
            value: value,
        });
    }

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