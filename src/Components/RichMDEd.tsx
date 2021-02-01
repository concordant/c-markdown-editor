import React, { useState } from "react";
import { Node } from "slate";
import CannerEditor from "canner-slate-editor";

export interface RichMDEdProps {
  value?: string; // set a default value (or DEFAULT_VALUE is unbefined)
}

/**
 * An init value for the demo
 */
const initialValue = [
  {
    type: "paragraph",
    children: [
      {
        text:
          'The editor gives you full control over the logic you can add. For example, it\'s fairly common to want to add markdown-like shortcuts to editors. So that, when you start a line with "> " you get a blockquote that looks like this:',
      },
    ],
  },
  {
    type: "block-quote",
    children: [{ text: "A wise quote." }],
  },
  {
    type: "paragraph",
    children: [
      {
        text:
          'Order when you start a line with "## " you get a level-two heading, like this:',
      },
    ],
  },
  {
    type: "heading-two",
    children: [{ text: "Try it out!" }],
  },
  {
    type: "paragraph",
    children: [
      {
        text:
          'Try it out for yourself! Try starting a new line with ">", "-", or "#"s.',
      },
    ],
  },
];

export default function RichMDEd(props: RichMDEdProps) {
  const [value, setValue] = useState<Node[]>(initialValue);
  return (
    <div style={{ margin: "20px" }}>
      <CannerEditor value={value} onChange={(value) => setValue(value)} />
    </div>
  );
}
