import React from "react";

interface ISubmit1InputProps {
  onSubmit: (docName: string) => void;
  inputName: string;
}

interface ISubmit1InputState {
  value: string;
}

class Submit1Input extends React.Component<
  ISubmit1InputProps,
  ISubmit1InputState
> {
  constructor(props: ISubmit1InputProps) {
    super(props);
    this.state = { value: "" };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  /**
   * onChange event handler
   * @param event handled
   */
  handleChange(event: React.ChangeEvent<HTMLInputElement>): void {
    this.setState({ value: event.target.value });
  }

  handleSubmit(event: React.FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    this.props.onSubmit(this.state.value);
  }

  render(): JSX.Element {
    return (
      <form onSubmit={this.handleSubmit}>
        <label>
          {this.props.inputName} :
          <input value={this.state.value} onChange={this.handleChange} />
        </label>
        <input type="submit" value={"Change " + this.props.inputName} />
      </form>
    );
  }
}

export default Submit1Input;
