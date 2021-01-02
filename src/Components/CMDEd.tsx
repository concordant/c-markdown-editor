import React, { useMemo, useState } from "react";
import { createEditor, Node, Element as SlateElement } from "slate";
import { Slate, Editable, withReact } from "slate-react";

//const DEFAULT_VALUE: string = "Welcome to Concordant Mardown Editor!";

export interface ICMDEdConfig {
  /**
   * Can be used to make Markdown Editor focus itself on initialization.
   */
  autoFocus?: boolean;
}
export interface CMDEdProps {
  value?: string; // set a default value (or DEFAULT_VALUE is unbefined)
}

export interface CMDEdState {
  value: string;
  //uid: number;
  //timestamp: number;
}



export default function CMDEd(props: CMDEdProps) {
  const editor = useMemo(() => withReact(createEditor()), []);
  const [value, setValue] = useState<Node[]>([
    {
      type: "paragraph",
      children: [{ text: "A line of text in a paragraph" }],
    },
  ]);

  return (
    <Slate
      editor={editor}
      value={value}
      onChange={(newValue) => setValue(newValue)}
    >
      <Editable />
    </Slate>
  );
}
/*
class CMDEd2 extends Component<CMDEdProps, CMDEdState> {
  private i: number = 0;

  constructor(props: CMDEdProps) {
    super(props);
    this.state = {
      value:
        typeof this.props.value === "undefined"
          ? DEFAULT_VALUE
          : this.props.value,
    };
  }

  public valueChanged(value: string | undefined) {
    console.log(this.i++ + ":" + value);
    value = typeof value === "undefined" ? DEFAULT_VALUE : value;
    this.setState({
      value: value,
    });
  }

  render() {

    const cmdeditor = <div className="mded-container"></div>;

    return cmdeditor;
  }
}
*/
