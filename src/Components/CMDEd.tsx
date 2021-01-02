import React, {Component} from 'react';

const DEFAULT_VALUE: string = "Connecting to service...";

export interface ICMDEdConfig {
    /**
     * Can be used to make Markdown Editor focus itself on initialization.
     */
    autoFocus?: boolean;
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
                
            </div>
        );

        return editor;
    }
}