# Status of C-Markdown Editor

16 April 2021

This is an alpha version of a collaborative text editor. Its aim is to provide an example of a collaborative application leveraging the Concordant vision. Features, performance, and user-friendliness have been secondary considerations.

## Limitations due to the editing engine

It is currently based upon the [react-md-editor](https://github.com/JedWatson/react-md-editor) text-editing engine, which has some limitations:

- It has separate input panel (left) and rendering panel (right), considered not user-friendly.
- It uses a sequential HTML model, where input comes from the user and computes output, which is not well adapted to the collaborative model with concurrent input streams.

In order to fix these limitations, we plan to replace it with a single-panel editing engine with an active DOM model, e.g., [crdt-md-editor](https://github.com/ilyasToumlilt/crdt-md-editor).

## Implementation-related limitations

This implementation uses the alpha version of the Concordant platform, and inherits from its limitations (documented in [Concordant client STATUS.md](https://gitlab.inria.fr/concordant/software/c-client/-/blob/master/STATUS.md)). This leads to more limitations:

- Altough interactive performance is good, it degrades badly for larger documents (note that deleted characters remain in the document state as tombstones). This will be fixed by enabling support for delta propagation.

## Bugs

We are aware of the following bugs:

- Responsiveness degrades for large documents.

We are working actively on fixing the bugs.
