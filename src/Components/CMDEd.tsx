import React, {Component} from 'react';
import MDEditor from '@uiw/react-md-editor';

const DEFAULT_VALUE: string = "Connecting to service...";

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